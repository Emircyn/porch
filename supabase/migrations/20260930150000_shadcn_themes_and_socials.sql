-- Public pages now use shadcn themes imported from tweakcn (scripts/import-page-themes.mjs),
-- and profiles get a row of social icons.

create or replace function public.is_pro_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in (
    'bubblegum', 'neo-brutalism', 'cyberpunk', 'kodama-grove', 'sunset-horizon', 'vintage-paper', 'claymorphism'
  )
$$;

create or replace function public.is_known_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in (
    'vercel', 'clean-slate', 'caffeine',
    'bubblegum', 'neo-brutalism', 'cyberpunk', 'kodama-grove', 'sunset-horizon', 'vintage-paper', 'claymorphism'
  )
$$;

-- Old theme ids are gone; everyone starts again on the default free theme.
alter table public.profiles disable trigger profiles_theme_plan;
update public.profiles set theme_id = 'vercel' where not public.is_known_theme(theme_id);
alter table public.profiles enable trigger profiles_theme_plan;
alter table public.profiles alter column theme_id set default 'vercel';

-- Social icons: [{ "platform": "instagram", "url": "https://..." }], at most 8.
alter table public.profiles
  add column socials jsonb not null default '[]'::jsonb
  check (jsonb_typeof(socials) = 'array' and jsonb_array_length(socials) <= 8);
grant update (socials) on public.profiles to authenticated;

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
