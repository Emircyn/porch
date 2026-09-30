-- Adds the Ocean Breeze theme (Pro). Keep in sync with scripts/import-page-themes.mjs.

create or replace function public.is_pro_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in (
    'bubblegum', 'neo-brutalism', 'cyberpunk', 'kodama-grove', 'sunset-horizon', 'vintage-paper', 'claymorphism',
    'starry-night', 'ocean-breeze'
  )
$$;

create or replace function public.is_known_theme(theme_id text) returns boolean
language sql immutable set search_path = '' as $$
  select theme_id in (
    'vercel', 'clean-slate', 'caffeine',
    'bubblegum', 'neo-brutalism', 'cyberpunk', 'kodama-grove', 'sunset-horizon', 'vintage-paper', 'claymorphism',
    'starry-night', 'ocean-breeze'
  )
$$;
