-- Porch: profiles, links, clicks.
-- "Automatically expose new tables" is off in this project, so every privilege below is granted explicitly.
-- Visitors (anon) never read tables directly: they go through public_page() and record_click().

-- ---------------------------------------------------------------------------------------------------------------
-- Shared rules. Keep in sync with src/lib/themes.ts and src/lib/usernames.ts.
-- ---------------------------------------------------------------------------------------------------------------

create function public.is_pro_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in ('haint', 'marigold', 'plum', 'moss', 'sunday')
$$;

create function public.is_known_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in ('clapboard', 'dusk', 'paper', 'haint', 'marigold', 'plum', 'moss', 'sunday')
$$;

create function public.is_reserved_username(name text) returns boolean
language sql immutable set search_path = '' as $$
  select lower(name) in (
    'about', 'account', 'admin', 'api', 'app', 'auth', 'billing', 'blog', 'dashboard', 'demo', 'editor', 'help',
    'home', 'login', 'logout', 'onboarding', 'porch', 'pricing', 'privacy', 'r', 'settings', 'signin', 'signup',
    'static', 'support', 'terms', 'www', '_next'
  )
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Null until chosen (Google sign-ups pick one during onboarding).
  username text unique
    check (username ~ '^[a-z0-9_.]{3,30}$' and not public.is_reserved_username(username)),
  display_name text not null default '' check (char_length(display_name) <= 60),
  bio text not null default '' check (char_length(bio) <= 160),
  avatar_url text check (char_length(avatar_url) <= 500),
  theme_id text not null default 'clapboard' check (public.is_known_theme(theme_id)),
  -- Written only by the Stripe webhook (service role). Users cannot update these columns.
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  url text not null check (url ~* '^https?://[^\s]+$' and char_length(url) <= 2048),
  position integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index links_user_position_idx on public.links (user_id, position);

create table public.clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  referrer_host text check (char_length(referrer_host) <= 255),
  country text check (char_length(country) <= 2)
);
create index clicks_user_created_idx on public.clicks (user_id, created_at);

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.clicks enable row level security;

-- ---------------------------------------------------------------------------------------------------------------
-- Privileges and policies
-- ---------------------------------------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant all on public.profiles, public.links, public.clicks to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select on public.profiles to authenticated;
grant update (username, display_name, bio, avatar_url, theme_id) on public.profiles to authenticated;
create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select, insert, delete on public.links to authenticated;
grant update (title, url, position, enabled) on public.links to authenticated;
create policy "Users read their own links" on public.links
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own links" on public.links
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own links" on public.links
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own links" on public.links
  for delete to authenticated using ((select auth.uid()) = user_id);

-- clicks: no grants to anon/authenticated; written by record_click(), read by get_click_stats().

-- ---------------------------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- A profile row for every new account. The username comes from sign-up metadata when it is valid and free.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  wanted text := lower(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''));
begin
  if wanted is not null and (
    wanted !~ '^[a-z0-9_.]{3,30}$'
    or public.is_reserved_username(wanted)
    or exists (select 1 from public.profiles where username = wanted)
  ) then
    wanted := null;
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    wanted,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pro themes need Pro. Only checked when the theme changes, so a downgrade never blocks other edits.
create function public.enforce_theme_plan() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.theme_id is distinct from old.theme_id
     and public.is_pro_theme(new.theme_id)
     and new.plan <> 'pro' then
    raise exception 'The % theme needs Pro', new.theme_id using errcode = 'P0001', hint = 'pro_theme';
  end if;
  return new;
end;
$$;

create trigger profiles_theme_plan before update on public.profiles
  for each row execute function public.enforce_theme_plan();

-- Free plan: at most 5 links. Locks the profile row so two parallel inserts cannot both slip under the limit.
create function public.enforce_link_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  owner_plan text;
  link_count integer;
begin
  select plan into owner_plan from public.profiles where id = new.user_id for update;
  if owner_plan = 'pro' then
    return new;
  end if;

  select count(*) into link_count from public.links where user_id = new.user_id;
  if link_count >= 5 then
    raise exception 'The free plan allows 5 links' using errcode = 'P0001', hint = 'link_limit';
  end if;
  return new;
end;
$$;

create trigger links_limit before insert on public.links
  for each row execute function public.enforce_link_limit();

-- ---------------------------------------------------------------------------------------------------------------
-- Functions called from the app
-- ---------------------------------------------------------------------------------------------------------------

-- Everything a public page needs in one round trip. Free plans show the first 5 enabled links and a free theme,
-- which is also what a lapsed Pro page falls back to.
create function public.public_page(page_username text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'username', p.username,
    'displayName', p.display_name,
    'bio', p.bio,
    'avatarUrl', p.avatar_url,
    'themeId', case when p.plan <> 'pro' and public.is_pro_theme(p.theme_id) then 'clapboard' else p.theme_id end,
    'links', coalesce((
      select jsonb_agg(jsonb_build_object('id', l.id, 'title', l.title, 'url', l.url) order by l.position, l.created_at)
      from (
        select id, title, url, position, created_at
        from public.links
        where user_id = p.id and enabled
        order by position, created_at
        limit case when p.plan = 'pro' then null else 5 end
      ) l
    ), '[]'::jsonb)
  )
  from public.profiles p
  where p.username = lower(page_username)
$$;

-- Counts a click and returns where to send the visitor. No cookies, no IP stored.
create function public.record_click(click_link_id uuid, click_referrer_host text default null, click_country text default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  target record;
begin
  select id, user_id, url into target from public.links where id = click_link_id and enabled;
  if not found then
    return null;
  end if;

  insert into public.clicks (link_id, user_id, referrer_host, country)
  values (target.id, target.user_id, left(click_referrer_host, 255), left(upper(click_country), 2));
  return target.url;
end;
$$;

create function public.username_available(name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select lower(name) ~ '^[a-z0-9_.]{3,30}$'
    and not public.is_reserved_username(name)
    and not exists (select 1 from public.profiles where username = lower(name) and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'))
$$;

-- Saves a drag-and-drop order in one call.
create function public.reorder_links(link_ids uuid[]) returns void
language sql security invoker set search_path = '' as $$
  update public.links l
  set position = o.ord::integer
  from unnest(link_ids) with ordinality as o (id, ord)
  where l.id = o.id and l.user_id = (select auth.uid())
$$;

-- Pro-only analytics for the signed-in user, grouped per day (UTC) and per link.
create function public.get_click_stats(days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  since timestamptz;
  span integer := least(greatest(coalesce(days, 30), 1), 365);
begin
  if uid is null then
    raise exception 'Sign in to see stats' using errcode = '42501';
  end if;
  if (select plan from public.profiles where id = uid) <> 'pro' then
    raise exception 'Click stats need Pro' using errcode = 'P0001', hint = 'pro_required';
  end if;

  since := date_trunc('day', now() at time zone 'utc') at time zone 'utc' - make_interval(days => span - 1);

  return jsonb_build_object(
    'total', (select count(*) from public.clicks where user_id = uid and created_at >= since),
    'daily', (
      select jsonb_agg(jsonb_build_object('day', d.day::date, 'clicks', coalesce(c.clicks, 0)) order by d.day)
      from generate_series(since, date_trunc('day', now() at time zone 'utc') at time zone 'utc', interval '1 day') as d (day)
      left join (
        select date_trunc('day', created_at at time zone 'utc') at time zone 'utc' as day, count(*) as clicks
        from public.clicks
        where user_id = uid and created_at >= since
        group by 1
      ) c on c.day = d.day
    ),
    'perLink', coalesce((
      select jsonb_agg(jsonb_build_object('linkId', l.id, 'title', l.title, 'clicks', coalesce(c.clicks, 0))
                       order by coalesce(c.clicks, 0) desc, l.position)
      from public.links l
      left join (
        select link_id, count(*) as clicks
        from public.clicks
        where user_id = uid and created_at >= since
        group by link_id
      ) c on c.link_id = l.id
      where l.user_id = uid
    ), '[]'::jsonb)
  );
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default; take it back and hand out only what each role needs.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.public_page(text) to anon, authenticated;
grant execute on function public.record_click(uuid, text, text) to anon, authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.reorder_links(uuid[]) to authenticated;
grant execute on function public.get_click_stats(integer) to authenticated;
grant execute on all functions in schema public to service_role;
-- Check constraints and triggers call these while running as the invoking role.
grant execute on function public.is_pro_theme(text), public.is_known_theme(text), public.is_reserved_username(text)
  to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Avatars: public read, each user writes only inside a folder named after their user id.
-- ---------------------------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Users upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users replace their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Upserting (replacing an avatar) also needs to read the existing object.
create policy "Users read their own avatar objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
