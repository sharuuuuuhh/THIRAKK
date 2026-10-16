-- Shared report submission rate limit. Apply after 04_security_hardening.sql.
-- Keys are HMACs of authenticated account IDs; raw IDs and IP addresses are not stored.
create table if not exists public.report_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (bucket_key, window_start)
);

alter table public.report_rate_limits enable row level security;
revoke all on public.report_rate_limits from public, anon, authenticated;

create or replace function public.consume_report_rate_limit(p_key text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if p_key is null or length(p_key) <> 64 then
    raise exception 'Invalid rate-limit key';
  end if;

  -- Fixed one-minute windows; callers cannot choose a larger limit or window.
  current_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / 60) * 60);

  insert into public.report_rate_limits (bucket_key, window_start, request_count)
  values (p_key, current_window, 1)
  on conflict (bucket_key, window_start)
  do update set request_count = public.report_rate_limits.request_count + 1
  returning request_count into current_count;

  -- Keep the table bounded without retaining raw account identifiers.
  if random() < 0.01 then
    delete from public.report_rate_limits
    where window_start < current_window - interval '1 day';
  end if;

  return current_count <= 10;
end;
$$;

revoke all on function public.consume_report_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_report_rate_limit(text) to service_role;
