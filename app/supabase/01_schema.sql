-- =============================================================
-- Thirakku — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- All tables in the public schema.
-- =============================================================

-- ── helpers ──────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 1. stations ───────────────────────────────────────────────
-- Coordinates verified manually against OpenStreetMap before use.
create table if not exists stations (
  id          serial primary key,
  name        text    not null,
  name_ml     text,                         -- Malayalam name
  code        text    not null unique,      -- e.g. "CLT", "ERS"
  lat         numeric(9,6) not null,
  lng         numeric(9,6) not null,
  is_sample   boolean not null default true -- rule 8: label sample data
);

-- ── 2. trains ─────────────────────────────────────────────────
create table if not exists trains (
  id          serial primary key,
  number      text    not null unique,      -- e.g. "16629"
  name        text    not null,
  name_ml     text,
  route_id    integer not null,             -- corridor identifier (1 = Kannur→Kozhikode, 2 = Thrissur→Ernakulam)
  is_sample   boolean not null default true
);

-- ── 3. route_stops ────────────────────────────────────────────
-- Ordered list of stations per corridor.
create table if not exists route_stops (
  route_id    integer not null,
  station_id  integer not null references stations(id),
  stop_order  integer not null,            -- 1 = first station
  primary key (route_id, station_id)
);

create index if not exists idx_route_stops_route on route_stops(route_id, stop_order);

-- ── 4. timetable ──────────────────────────────────────────────
-- Hand-entered scheduled arrival/departure per train per station.
-- Rule 9: never scraped from IRCTC/PRS/UTS.
create table if not exists timetable (
  id              serial primary key,
  train_id        integer not null references trains(id),
  station_id      integer not null references stations(id),
  scheduled_arr   time,                    -- null for the first stop
  scheduled_dep   time,                    -- null for the last stop
  day_offset      integer not null default 0, -- 0 = same day as origin departure
  unique (train_id, station_id)
);

create index if not exists idx_timetable_train on timetable(train_id);

-- ── 5. reports ────────────────────────────────────────────────
-- One report per device per train per travel_date. No photo stored.
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  train_id      integer not null references trains(id),
  station_id    integer not null references stations(id),
  level         integer not null check (level between 1 and 4),
  -- 1=Seats free, 2=Standing, 3=Packed, 4=Couldn't board
  photo_level   integer check (photo_level between 1 and 4), -- AI estimate, null if failed
  photo_match   text check (photo_match in ('agree','close','differ','unverified')),
  location_ok   boolean not null default false,
  device_hash   text    not null,          -- anonymous device ID, not personal
  travel_date   date    not null,
  created_at    timestamptz not null default now(),
  weight        numeric(4,3) not null default 0.5, -- computed at blend time
  is_sample     boolean not null default false,
  unique (device_hash, train_id, travel_date)   -- one report per device per train per day
);

create index if not exists idx_reports_train_date on reports(train_id, travel_date, created_at desc);
create index if not exists idx_reports_station    on reports(station_id, created_at desc);

-- ── 6. volunteer_logs ─────────────────────────────────────────
create table if not exists volunteer_logs (
  id              uuid primary key default gen_random_uuid(),
  station_id      integer not null references stations(id),
  train_id        integer not null references trains(id),
  level           integer not null check (level between 1 and 4),
  platform_count  integer,                 -- approximate headcount at platform
  logged_at       timestamptz not null default now(),
  notes           text,
  is_sample       boolean not null default false
);

create index if not exists idx_vlogs_train on volunteer_logs(train_id, logged_at desc);

-- ── 7. trust_scores ───────────────────────────────────────────
create table if not exists trust_scores (
  device_hash text    primary key,
  score       numeric(4,3) not null default 0.5, -- bounded [0.1, 1.0]
  samples     integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ── 8. forecasts ──────────────────────────────────────────────
create table if not exists forecasts (
  id              serial primary key,
  train_id        integer not null references trains(id),
  day_type        text not null check (day_type in ('weekday','weekend','special')),
  time_slot       text not null,           -- e.g. "07:00-08:00"
  predicted_level integer not null check (predicted_level between 1 and 4),
  sample_count    integer not null default 0,
  is_early_estimate boolean not null default true, -- rule: label thin data
  updated_at      timestamptz not null default now(),
  unique (train_id, day_type, time_slot)
);

-- ── 9. forecast_checks ────────────────────────────────────────
create table if not exists forecast_checks (
  id              serial primary key,
  train_id        integer not null references trains(id),
  check_date      date    not null,
  predicted_level integer not null,
  actual_level    integer,                 -- null until actual reports arrive
  unique (train_id, check_date)
);

-- ── 10. special_days ─────────────────────────────────────────
create table if not exists special_days (
  date    date primary key,
  label   text not null                   -- e.g. "Onam", "Exam day", "Holiday"
);

-- ── 11a. petitions ────────────────────────────────────────────
create table if not exists petitions (
  id            serial primary key,
  corridor      text not null,            -- e.g. "Kannur-Kozhikode"
  trains_cited  text[],                   -- array of train numbers mentioned
  message       text not null,
  created_at    timestamptz not null default now()
);

-- ── 11b. signatures ───────────────────────────────────────────
create table if not exists signatures (
  id          uuid primary key default gen_random_uuid(),
  petition_id integer not null references petitions(id),
  device_hash text,                       -- anonymous
  email       text,                       -- optional, not required
  created_at  timestamptz not null default now(),
  unique (petition_id, device_hash)       -- one signature per device per petition
);

create index if not exists idx_signatures_petition on signatures(petition_id);

-- =============================================================
-- Row-level security: readers see aggregates, never raw rows.
-- Individual report rows are hidden from anon; only summaries
-- are exposed via API layer.
-- =============================================================
alter table reports        enable row level security;
alter table volunteer_logs enable row level security;
alter table trust_scores   enable row level security;
alter table signatures     enable row level security;

-- Public read for non-sensitive tables
create policy "Public stations read"   on stations   for select using (true);
create policy "Public trains read"     on trains     for select using (true);
create policy "Public route_stops read"on route_stops for select using (true);
create policy "Public timetable read"  on timetable  for select using (true);
create policy "Public forecasts read"  on forecasts  for select using (true);
create policy "Public forecast_checks read" on forecast_checks for select using (true);
create policy "Public special_days read"    on special_days    for select using (true);
create policy "Public petitions read"  on petitions  for select using (true);

-- Aggregate-only for reports: anon can never read individual rows
-- (only the service-role key used server-side can see raw reports)
create policy "No anon read on reports"
  on reports for select
  using (false);

create policy "Insert reports (anon)"
  on reports for insert
  with check (true);

-- Volunteer logs: insert allowed, read restricted
create policy "No anon read on volunteer_logs"
  on volunteer_logs for select
  using (false);

create policy "Insert volunteer_logs"
  on volunteer_logs for insert
  with check (true);

-- Trust scores: server-side only
create policy "No anon trust read"
  on trust_scores for select
  using (false);

-- Signatures: public count but not individual rows
create policy "No anon signature read"
  on signatures for select
  using (false);

create policy "Insert signature (anon)"
  on signatures for insert
  with check (true);
