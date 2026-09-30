-- The public demo account: anyone can log in and look around, nobody can change it.
-- Only the seed script (service role) writes to it. The app also keeps its editor in local demo mode.

alter table public.profiles add column is_demo boolean not null default false;

create function public.protect_demo_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and old.is_demo then
    raise exception 'The demo account is read-only' using errcode = 'P0001', hint = 'demo';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_demo before update on public.profiles
  for each row execute function public.protect_demo_profile();

-- Runs as the caller (not security definer) so current_user is the API role; the demo user can read its own
-- profile under RLS, and nobody else can reach the demo's links in the first place.
create function public.protect_demo_links() returns trigger
language plpgsql set search_path = '' as $$
declare
  owner uuid := coalesce(new.user_id, old.user_id);
begin
  if current_user = 'authenticated' then
    if exists (select 1 from public.profiles where id = owner and is_demo) then
      raise exception 'The demo account is read-only' using errcode = 'P0001', hint = 'demo';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

-- Named to sort before links_limit: Postgres runs triggers alphabetically, and the demo check should win.
create trigger links_demo_guard before insert or update or delete on public.links
  for each row execute function public.protect_demo_links();

-- The reorder RPC runs as the caller, so the links trigger above covers it too.
