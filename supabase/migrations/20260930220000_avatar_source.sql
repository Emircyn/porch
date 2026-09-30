-- A profile photo must come from the owner's own folder in the avatars bucket (or the bundled demo images),
-- so nobody can point their page at a tracking pixel or someone else's picture through the API.

create function public.check_avatar_source() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.avatar_url is not null
     and new.avatar_url is distinct from old.avatar_url
     and new.avatar_url not like '%/storage/v1/object/public/avatars/' || new.id::text || '/%'
     and new.avatar_url not like '/demo/%' then
    raise exception 'Profile photos must be uploaded to Porch' using errcode = 'P0001', hint = 'avatar_source';
  end if;
  return new;
end;
$$;

create trigger profiles_avatar_source before update on public.profiles
  for each row execute function public.check_avatar_source();
