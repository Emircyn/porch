-- get_click_stats() also returns where clicks came from (referrer host) and which countries, top 5 each.

create or replace function public.get_click_stats(days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  since timestamptz;
  span integer := least(greatest(coalesce(days, 30), 1), 365);
  total bigint;
begin
  if uid is null then
    raise exception 'Sign in to see stats' using errcode = '42501';
  end if;
  if (select plan from public.profiles where id = uid) <> 'pro' then
    raise exception 'Click stats need Pro' using errcode = 'P0001', hint = 'pro_required';
  end if;

  since := date_trunc('day', now() at time zone 'utc') at time zone 'utc' - make_interval(days => span - 1);
  select count(*) into total from public.clicks where user_id = uid and created_at >= since;

  return jsonb_build_object(
    'total', total,
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
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('host', r.host, 'clicks', r.clicks) order by r.clicks desc)
      from (
        select referrer_host as host, count(*) as clicks
        from public.clicks
        where user_id = uid and created_at >= since
        group by referrer_host
        order by count(*) desc
        limit 5
      ) r
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('code', r.country, 'clicks', r.clicks) order by r.clicks desc)
      from (
        select country, count(*) as clicks
        from public.clicks
        where user_id = uid and created_at >= since and country is not null
        group by country
        order by count(*) desc
        limit 5
      ) r
    ), '[]'::jsonb)
  );
end;
$$;
