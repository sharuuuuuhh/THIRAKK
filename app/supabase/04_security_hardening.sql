-- Apply after 01_schema.sql. Safe to run more than once.
-- Enable RLS on every application table so future grants cannot expose rows.
alter table stations enable row level security;
alter table trains enable row level security;
alter table route_stops enable row level security;
alter table timetable enable row level security;
alter table reports enable row level security;
alter table volunteer_logs enable row level security;
alter table trust_scores enable row level security;
alter table forecasts enable row level security;
alter table forecast_checks enable row level security;
alter table special_days enable row level security;
alter table petitions enable row level security;
alter table signatures enable row level security;

drop policy if exists "Public stations read" on stations;
drop policy if exists "Public trains read" on trains;
drop policy if exists "Public route_stops read" on route_stops;
drop policy if exists "Public timetable read" on timetable;
drop policy if exists "Public forecasts read" on forecasts;
drop policy if exists "Public forecast_checks read" on forecast_checks;
drop policy if exists "Public special_days read" on special_days;
drop policy if exists "Public petitions read" on petitions;
drop policy if exists "No anon read on reports" on reports;
drop policy if exists "Insert reports (anon)" on reports;
drop policy if exists "No anon read on volunteer_logs" on volunteer_logs;
drop policy if exists "Insert volunteer_logs" on volunteer_logs;
drop policy if exists "No anon trust read" on trust_scores;
drop policy if exists "No anon signature read" on signatures;
drop policy if exists "Insert signature (anon)" on signatures;

create policy "Public stations read" on stations for select to anon, authenticated using (true);
create policy "Public trains read" on trains for select to anon, authenticated using (true);
create policy "Public route_stops read" on route_stops for select to anon, authenticated using (true);
create policy "Public timetable read" on timetable for select to anon, authenticated using (true);
create policy "Public forecasts read" on forecasts for select to anon, authenticated using (true);
create policy "Public forecast_checks read" on forecast_checks for select to anon, authenticated using (true);
create policy "Public special_days read" on special_days for select to anon, authenticated using (true);
create policy "Public petitions read" on petitions for select to anon, authenticated using (true);

-- Reports, signatures, volunteer logs, and trust scores are server-only.
-- The server uses the service role after validating the user's access token.
