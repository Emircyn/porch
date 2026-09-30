-- Featured links (a big card instead of a button) and a way for visitors to report a page.

alter table public.links
  add column layout text not null default 'classic' check (layout in ('classic', 'featured'));
grant update (layout) on public.links to authenticated;

create or replace function public.public_page(page_username text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'username', p.username,
    'displayName', p.display_name,
    'bio', p.bio,
    'avatarUrl', p.avatar_url,
    'socials', p.socials,
    'themeId', case when p.plan <> 'pro' and public.is_pro_theme(p.theme_id) then 'vercel' else p.theme_id end,
    'links', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', l.id, 'title', l.title, 'url', l.url, 'layout', l.layout)
        order by l.position, l.created_at
      )
      from (
        select id, title, url, layout, position, created_at
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

-- Reports: written only through report_page(), read only with the service role.
create table public.reports (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('phishing', 'impersonation', 'spam', 'adult', 'other')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
grant all on public.reports to service_role;
grant usage, select on all sequences in schema public to service_role;

create function public.report_page(page_username text, report_reason text, report_details text default null)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  target uuid;
begin
  select id into target from public.profiles where username = lower(page_username);
  if target is null then
    return false;
  end if;
  insert into public.reports (profile_id, reason, details)
  values (target, report_reason, nullif(btrim(left(report_details, 500)), ''));
  return true;
end;
$$;

revoke execute on function public.report_page(text, text, text) from public;
grant execute on function public.report_page(text, text, text) to anon, authenticated, service_role;
