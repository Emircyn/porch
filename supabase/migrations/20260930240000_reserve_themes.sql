-- /themes/<id> is now the theme preview, so nobody can take "themes" as a page name.
-- Keep in sync with src/lib/usernames.ts.

create or replace function public.is_reserved_username(name text) returns boolean
language sql immutable set search_path = '' as $$
  select lower(name) in (
    'about', 'account', 'admin', 'api', 'app', 'auth', 'billing', 'blog', 'dashboard', 'demo', 'editor', 'help',
    'home', 'login', 'logout', 'onboarding', 'porch', 'pricing', 'privacy', 'r', 'settings', 'signin', 'signup',
    'static', 'support', 'terms', 'themes', 'www', '_next'
  )
$$;
