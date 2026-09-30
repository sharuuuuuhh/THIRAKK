-- =============================================================
-- Thirakku — Sample seed data
-- IMPORTANT: All data below is SAMPLE DATA for demonstration.
-- Timetables are approximate and hand-entered, not from IRCTC/PRS/UTS.
-- Station coordinates sourced from Wikipedia/OpenStreetMap.
-- Label is_sample = true on everything here.
-- =============================================================

-- ── CORRIDOR 1: Kannur → Kozhikode (Malabar coast) ───────────
-- route_id = 1
-- Stations: Kannur (CAN) → Thalassery (TLY) → Mahe (MAHE)
--         → Vadakara (BDJ) → Koyilandy (QLD) → Feroke (FK)
--         → Kozhikode (CLT)

-- ── CORRIDOR 2: Thrissur → Ernakulam (Central Kerala) ────────
-- route_id = 2
-- Stations: Thrissur (TCR) → Irinjalakuda (IJK) → Chalakudy (CKI)
--         → Aluva (AWY) → Angamaly (AFK) → Ernakulam Jn (ERS)

-- =============================================================
-- STATIONS (coordinates from Wikipedia / OpenStreetMap, sample data)
-- =============================================================
insert into stations (name, name_ml, code, lat, lng, is_sample) values
  -- Corridor 1
  ('Kannur',      'കണ്ണൂർ',      'CAN',  11.868900, 75.355500, true),
  ('Thalassery',  'തലശ്ശേരി',    'TLY',  11.752000, 75.494000, true),
  ('Mahe',        'മാഹി',        'MAHE', 11.699000, 75.546600, true),
  ('Vadakara',    'വടകര',        'BDJ',  11.593000, 75.587000, true),
  ('Koyilandy',   'കൊയിലാണ്ടി',  'QLD',  11.445900, 75.693700, true),
  ('Feroke',      'ഫറോക്ക്',     'FK',   11.175900, 75.830200, true),
  ('Kozhikode',   'കോഴിക്കോട്', 'CLT',  11.246500, 75.780500, true),
  -- Corridor 2
  ('Thrissur',    'തൃശ്ശൂർ',     'TCR',  10.515000, 76.208000, true),
  ('Irinjalakuda','ഇരിഞ്ഞാലക്കുട','IJK',  10.340600, 76.280900, true),
  ('Chalakudy',   'ചാലക്കുടി',   'CKI',  10.302000, 76.322000, true),
  ('Aluva',       'ആലുവ',        'AWY',  10.108000, 76.356000, true),
  ('Angamaly',    'അങ്കമാലി',    'AFK',  10.184000, 76.378000, true),
  ('Ernakulam Jn','എറണാകുളം Jn', 'ERS',   9.969000, 76.291000, true)
on conflict (code) do nothing;

-- =============================================================
-- ROUTE STOPS (ordered)
-- =============================================================
-- Corridor 1 (route_id = 1)
insert into route_stops (route_id, station_id, stop_order)
select 1, id, row_number() over (order by id)
from stations
where code in ('CAN','TLY','MAHE','BDJ','QLD','FK','CLT')
on conflict do nothing;

-- Correct the ordering explicitly for Corridor 1
delete from route_stops where route_id = 1;
insert into route_stops (route_id, station_id, stop_order)
values
  (1, (select id from stations where code = 'CAN'),  1),
  (1, (select id from stations where code = 'TLY'),  2),
  (1, (select id from stations where code = 'MAHE'), 3),
  (1, (select id from stations where code = 'BDJ'),  4),
  (1, (select id from stations where code = 'QLD'),  5),
  (1, (select id from stations where code = 'FK'),   6),
  (1, (select id from stations where code = 'CLT'),  7);

-- Corridor 2 (route_id = 2)
delete from route_stops where route_id = 2;
insert into route_stops (route_id, station_id, stop_order)
values
  (2, (select id from stations where code = 'TCR'),  1),
  (2, (select id from stations where code = 'IJK'),  2),
  (2, (select id from stations where code = 'CKI'),  3),
  (2, (select id from stations where code = 'AWY'),  4),
  (2, (select id from stations where code = 'AFK'),  5),
  (2, (select id from stations where code = 'ERS'),  6);

-- =============================================================
-- TRAINS — Corridor 1 (Kannur → Kozhikode and return)
-- Sample trains based on real train numbers that run this corridor.
-- Times are approximate hand-entered values, labelled as sample data.
-- =============================================================
insert into trains (number, name, name_ml, route_id, is_sample) values
  -- ── Downward (Kannur → Kozhikode direction) ──
  ('56640', 'Kannur–Kozhikode Passenger',   'കണ്ണൂർ–കോഴിക്കോട് പാസഞ്ചർ',   1, true),
  ('56632', 'Shoranur Passenger (AM)',       'ഷൊർണൂർ പാസഞ്ചർ (AM)',            1, true),
  ('16629', 'Malabar Express',               'മലബാർ എക്‌സ്പ്രസ്',               1, true),
  ('16629', 'West Coast Express',            'വെസ്റ്റ് കോസ്റ്റ് എക്‌സ്പ്രസ്',   1, true),
  ('12618', 'Malabar Express (evening)',     'മലബാർ എക്‌സ്പ്രസ് (വൈകുന്നേരം)', 1, true),
  ('16306', 'Kannur–ERS Intercity',         'കണ്ണൂർ–ERS ഇന്റർ സിറ്റി',        1, true),
  ('56631', 'Kozhikode Passenger (peak)',   'കോഴിക്കോട് പാസഞ്ചർ (പീക്ക്)',    1, true),
  ('16342', 'Guruvayur Express',             'ഗുരുവായൂർ എക്‌സ്പ്രസ്',           1, true),
  ('16348', 'Trivandrum–Mangalore Express', 'തിരുവനന്തപുരം-മംഗളൂരു',           1, true),
  ('22618', 'West Coast SF',                'വെസ്റ്റ് കോസ്റ്റ് SF',             1, true)
on conflict (number) do nothing;

-- =============================================================
-- TRAINS — Corridor 2 (Thrissur → Ernakulam and return)
-- =============================================================
insert into trains (number, name, name_ml, route_id, is_sample) values
  ('56372', 'Thrissur–Ernakulam Passenger',  'തൃശ്ശൂർ–എറണാകുളം പാസഞ്ചർ',     2, true),
  ('16305', 'Kannur–Ernakulam Intercity',    'കണ്ണൂർ–എറണാകുളം ഇന്റർ സിറ്റി', 2, true),
  ('16307', 'Kozhikode–ERS Express',         'കോഴിക്കോട്–ERS എക്‌സ്പ്രസ്',    2, true),
  ('16381', 'Mumbai–Trivandrum Express',     'മുംബൈ–തിരുവനന്തപുരം',            2, true),
  ('22638', 'West Coast Express (south)',    'വെസ്റ്റ് കോസ്റ്റ് (തെക്ക്)',     2, true),
  ('56371', 'ERS–Thrissur Passenger (AM)',   'ERS–തൃശ്ശൂർ പാസഞ്ചർ (AM)',      2, true),
  ('16348', 'Kerala Express',                'കേരള എക്‌സ്പ്രസ്',               2, true),
  ('12618', 'Malabar Express (south)',       'മലബാർ എക്‌സ്പ്രസ് (തെക്ക്)',    2, true),
  ('16649', 'Parasuram Express',             'പരശുരാമ എക്‌സ്പ്രസ്',            2, true),
  ('16605', 'Ernad Express',                 'ഏർനാട് എക്‌സ്പ്രസ്',             2, true)
on conflict (number) do nothing;

-- =============================================================
-- TIMETABLE — Corridor 1 (sample, hand-entered, approximate)
-- =============================================================

-- Train 56640 Kannur–Kozhikode Passenger (slow, all stops, ~06:00 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='56640'), (select id from stations where code='CAN'),  null,     '06:10'),
  ((select id from trains where number='56640'), (select id from stations where code='TLY'),  '06:45', '06:47'),
  ((select id from trains where number='56640'), (select id from stations where code='MAHE'), '07:02', '07:03'),
  ((select id from trains where number='56640'), (select id from stations where code='BDJ'),  '07:22', '07:24'),
  ((select id from trains where number='56640'), (select id from stations where code='QLD'),  '07:50', '07:51'),
  ((select id from trains where number='56640'), (select id from stations where code='FK'),   '08:20', '08:21'),
  ((select id from trains where number='56640'), (select id from stations where code='CLT'),  '08:40',  null)
on conflict (train_id, station_id) do nothing;

-- Train 56632 Shoranur Passenger (peak morning, ~07:30 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='56632'), (select id from stations where code='CAN'),  null,     '07:30'),
  ((select id from trains where number='56632'), (select id from stations where code='TLY'),  '08:05', '08:07'),
  ((select id from trains where number='56632'), (select id from stations where code='MAHE'), '08:22', '08:23'),
  ((select id from trains where number='56632'), (select id from stations where code='BDJ'),  '08:42', '08:44'),
  ((select id from trains where number='56632'), (select id from stations where code='QLD'),  '09:10', '09:11'),
  ((select id from trains where number='56632'), (select id from stations where code='FK'),   '09:38', '09:39'),
  ((select id from trains where number='56632'), (select id from stations where code='CLT'),  '09:55',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16629 Malabar Express (limited stops, faster, ~08:15 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16629'), (select id from stations where code='CAN'),  null,     '08:15'),
  ((select id from trains where number='16629'), (select id from stations where code='TLY'),  '08:45', '08:47'),
  ((select id from trains where number='16629'), (select id from stations where code='BDJ'),  '09:10', '09:12'),
  ((select id from trains where number='16629'), (select id from stations where code='CLT'),  '09:50',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16306 Intercity (peak, ~09:00 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16306'), (select id from stations where code='CAN'),  null,     '09:00'),
  ((select id from trains where number='16306'), (select id from stations where code='TLY'),  '09:32', '09:34'),
  ((select id from trains where number='16306'), (select id from stations where code='MAHE'), '09:49', '09:50'),
  ((select id from trains where number='16306'), (select id from stations where code='BDJ'),  '10:09', '10:11'),
  ((select id from trains where number='16306'), (select id from stations where code='QLD'),  '10:35', '10:36'),
  ((select id from trains where number='16306'), (select id from stations where code='FK'),   '11:02', '11:03'),
  ((select id from trains where number='16306'), (select id from stations where code='CLT'),  '11:20',  null)
on conflict (train_id, station_id) do nothing;

-- Train 56631 Kozhikode Passenger peak (~16:30 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='56631'), (select id from stations where code='CAN'),  null,     '16:30'),
  ((select id from trains where number='56631'), (select id from stations where code='TLY'),  '17:05', '17:07'),
  ((select id from trains where number='56631'), (select id from stations where code='MAHE'), '17:22', '17:23'),
  ((select id from trains where number='56631'), (select id from stations where code='BDJ'),  '17:44', '17:46'),
  ((select id from trains where number='56631'), (select id from stations where code='QLD'),  '18:10', '18:11'),
  ((select id from trains where number='56631'), (select id from stations where code='FK'),   '18:38', '18:39'),
  ((select id from trains where number='56631'), (select id from stations where code='CLT'),  '18:55',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16342 Guruvayur Express (~17:50 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16342'), (select id from stations where code='CAN'),  null,     '17:50'),
  ((select id from trains where number='16342'), (select id from stations where code='TLY'),  '18:22', '18:24'),
  ((select id from trains where number='16342'), (select id from stations where code='BDJ'),  '18:50', '18:52'),
  ((select id from trains where number='16342'), (select id from stations where code='CLT'),  '19:30',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16348 Trivandrum–Mangalore Express (~13:00 from CAN, long-distance)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16348'), (select id from stations where code='CAN'),  null,     '13:00'),
  ((select id from trains where number='16348'), (select id from stations where code='TLY'),  '13:35', '13:37'),
  ((select id from trains where number='16348'), (select id from stations where code='BDJ'),  '14:00', '14:02'),
  ((select id from trains where number='16348'), (select id from stations where code='CLT'),  '14:45',  null)
on conflict (train_id, station_id) do nothing;

-- Train 12618 Malabar Express evening (~18:30 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='12618'), (select id from stations where code='CAN'),  null,     '18:30'),
  ((select id from trains where number='12618'), (select id from stations where code='TLY'),  '19:02', '19:04'),
  ((select id from trains where number='12618'), (select id from stations where code='BDJ'),  '19:30', '19:32'),
  ((select id from trains where number='12618'), (select id from stations where code='CLT'),  '20:10',  null)
on conflict (train_id, station_id) do nothing;

-- Train 22618 West Coast SF (~12:00 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='22618'), (select id from stations where code='CAN'),  null,     '12:00'),
  ((select id from trains where number='22618'), (select id from stations where code='TLY'),  '12:30', '12:32'),
  ((select id from trains where number='22618'), (select id from stations where code='BDJ'),  '12:55', '12:57'),
  ((select id from trains where number='22618'), (select id from stations where code='QLD'),  '13:20', '13:21'),
  ((select id from trains where number='22618'), (select id from stations where code='CLT'),  '13:55',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16605 Ernad Express (from Corridor 2 entry, ~15:15 from CAN)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16605'), (select id from stations where code='CAN'),  null,     '15:15'),
  ((select id from trains where number='16605'), (select id from stations where code='TLY'),  '15:48', '15:50'),
  ((select id from trains where number='16605'), (select id from stations where code='MAHE'), '16:05', '16:06'),
  ((select id from trains where number='16605'), (select id from stations where code='BDJ'),  '16:25', '16:27'),
  ((select id from trains where number='16605'), (select id from stations where code='QLD'),  '16:50', '16:51'),
  ((select id from trains where number='16605'), (select id from stations where code='FK'),   '17:18', '17:19'),
  ((select id from trains where number='16605'), (select id from stations where code='CLT'),  '17:35',  null)
on conflict (train_id, station_id) do nothing;

-- =============================================================
-- TIMETABLE — Corridor 2 (Thrissur → Ernakulam, sample)
-- =============================================================

-- Train 56372 Thrissur–ERS Passenger (~06:00 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='56372'), (select id from stations where code='TCR'),  null,     '06:00'),
  ((select id from trains where number='56372'), (select id from stations where code='IJK'),  '06:35', '06:36'),
  ((select id from trains where number='56372'), (select id from stations where code='CKI'),  '06:55', '06:57'),
  ((select id from trains where number='56372'), (select id from stations where code='AWY'),  '07:20', '07:22'),
  ((select id from trains where number='56372'), (select id from stations where code='AFK'),  '07:38', '07:39'),
  ((select id from trains where number='56372'), (select id from stations where code='ERS'),  '08:05',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16305 Kannur–ERS Intercity (~07:30 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16305'), (select id from stations where code='TCR'),  null,     '07:30'),
  ((select id from trains where number='16305'), (select id from stations where code='CKI'),  '08:05', '08:07'),
  ((select id from trains where number='16305'), (select id from stations where code='AWY'),  '08:28', '08:30'),
  ((select id from trains where number='16305'), (select id from stations where code='ERS'),  '09:00',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16307 Kozhikode–ERS Express (~08:50 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16307'), (select id from stations where code='TCR'),  null,     '08:50'),
  ((select id from trains where number='16307'), (select id from stations where code='IJK'),  '09:22', '09:23'),
  ((select id from trains where number='16307'), (select id from stations where code='CKI'),  '09:42', '09:44'),
  ((select id from trains where number='16307'), (select id from stations where code='AWY'),  '10:05', '10:07'),
  ((select id from trains where number='16307'), (select id from stations where code='AFK'),  '10:22', '10:23'),
  ((select id from trains where number='16307'), (select id from stations where code='ERS'),  '10:50',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16381 Mumbai–TVC Express (~10:00 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16381'), (select id from stations where code='TCR'),  null,     '10:00'),
  ((select id from trains where number='16381'), (select id from stations where code='CKI'),  '10:35', '10:37'),
  ((select id from trains where number='16381'), (select id from stations where code='AWY'),  '11:00', '11:02'),
  ((select id from trains where number='16381'), (select id from stations where code='ERS'),  '11:35',  null)
on conflict (train_id, station_id) do nothing;

-- Train 22638 West Coast Express south (~16:00 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='22638'), (select id from stations where code='TCR'),  null,     '16:00'),
  ((select id from trains where number='22638'), (select id from stations where code='IJK'),  '16:32', '16:33'),
  ((select id from trains where number='22638'), (select id from stations where code='CKI'),  '16:52', '16:54'),
  ((select id from trains where number='22638'), (select id from stations where code='AWY'),  '17:15', '17:17'),
  ((select id from trains where number='22638'), (select id from stations where code='ERS'),  '17:50',  null)
on conflict (train_id, station_id) do nothing;

-- Train 56371 ERS–Thrissur Passenger AM (~17:30 from TCR — return trip)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='56371'), (select id from stations where code='TCR'),  null,     '17:30'),
  ((select id from trains where number='56371'), (select id from stations where code='IJK'),  '18:02', '18:03'),
  ((select id from trains where number='56371'), (select id from stations where code='CKI'),  '18:22', '18:24'),
  ((select id from trains where number='56371'), (select id from stations where code='AWY'),  '18:45', '18:47'),
  ((select id from trains where number='56371'), (select id from stations where code='AFK'),  '19:02', '19:03'),
  ((select id from trains where number='56371'), (select id from stations where code='ERS'),  '19:30',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16649 Parasuram Express (~12:30 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16649'), (select id from stations where code='TCR'),  null,     '12:30'),
  ((select id from trains where number='16649'), (select id from stations where code='CKI'),  '13:05', '13:07'),
  ((select id from trains where number='16649'), (select id from stations where code='AWY'),  '13:28', '13:30'),
  ((select id from trains where number='16649'), (select id from stations where code='ERS'),  '14:00',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16605 Ernad Express C2 (~14:30 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16605'), (select id from stations where code='TCR'),  null,     '14:30'),
  ((select id from trains where number='16605'), (select id from stations where code='IJK'),  '15:02', '15:03'),
  ((select id from trains where number='16605'), (select id from stations where code='CKI'),  '15:22', '15:24'),
  ((select id from trains where number='16605'), (select id from stations where code='AWY'),  '15:45', '15:47'),
  ((select id from trains where number='16605'), (select id from stations where code='AFK'),  '16:02', '16:03'),
  ((select id from trains where number='16605'), (select id from stations where code='ERS'),  '16:30',  null)
on conflict (train_id, station_id) do nothing;

-- Train 16348 Kerala Express C2 (~09:30 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='16348'), (select id from stations where code='TCR'),  null,     '09:30'),
  ((select id from trains where number='16348'), (select id from stations where code='CKI'),  '10:05', '10:07'),
  ((select id from trains where number='16348'), (select id from stations where code='AWY'),  '10:30', '10:32'),
  ((select id from trains where number='16348'), (select id from stations where code='ERS'),  '11:05',  null)
on conflict (train_id, station_id) do nothing;

-- Train 12618 Malabar Express C2 (~19:00 from TCR)
insert into timetable (train_id, station_id, scheduled_arr, scheduled_dep) values
  ((select id from trains where number='12618'), (select id from stations where code='TCR'),  null,     '19:00'),
  ((select id from trains where number='12618'), (select id from stations where code='CKI'),  '19:35', '19:37'),
  ((select id from trains where number='12618'), (select id from stations where code='AWY'),  '20:00', '20:02'),
  ((select id from trains where number='12618'), (select id from stations where code='ERS'),  '20:35',  null)
on conflict (train_id, station_id) do nothing;

-- =============================================================
-- SPECIAL DAYS (upcoming Kerala events, sample)
-- =============================================================
insert into special_days (date, label) values
  ('2026-10-02', 'Gandhi Jayanti'),
  ('2026-10-12', 'Vijayadasami'),
  ('2026-11-01', 'Kerala Piravi (Kerala Day)'),
  ('2026-11-15', 'Guruppuratham'),
  ('2026-12-25', 'Christmas'),
  ('2027-01-01', 'New Year'),
  ('2027-01-26', 'Republic Day')
on conflict (date) do nothing;

-- =============================================================
-- SAMPLE REPORTS (pre-loaded for demo map, clearly labelled)
-- These represent a morning peak on 2026-09-30.
-- is_sample = true — always shown with a "sample data" label.
-- =============================================================
insert into reports (train_id, station_id, level, photo_level, photo_match,
                     location_ok, device_hash, travel_date, weight, is_sample) values
  -- Corridor 1 morning peak: 56632 (Shoranur Passenger) — very crowded
  ((select id from trains where number='56632'), (select id from stations where code='CAN'),
   3, 3, 'agree', true, 'sample-device-001', '2026-09-30', 0.80, true),
  ((select id from trains where number='56632'), (select id from stations where code='TLY'),
   3, 3, 'agree', true, 'sample-device-002', '2026-09-30', 0.80, true),
  ((select id from trains where number='56632'), (select id from stations where code='BDJ'),
   4, 3, 'close', true, 'sample-device-003', '2026-09-30', 0.65, true),
  ((select id from trains where number='56632'), (select id from stations where code='CLT'),
   3, 3, 'agree', true, 'sample-device-004', '2026-09-30', 0.80, true),
  -- 56640 (slower passenger) — less crowded this morning
  ((select id from trains where number='56640'), (select id from stations where code='CAN'),
   2, 2, 'agree', true, 'sample-device-005', '2026-09-30', 0.80, true),
  ((select id from trains where number='56640'), (select id from stations where code='TLY'),
   2, 1, 'close', true, 'sample-device-006', '2026-09-30', 0.60, true),
  -- 16629 Malabar Express — moderate
  ((select id from trains where number='16629'), (select id from stations where code='CAN'),
   2, 2, 'agree', true, 'sample-device-007', '2026-09-30', 0.80, true),
  ((select id from trains where number='16629'), (select id from stations where code='BDJ'),
   2, 2, 'agree', true, 'sample-device-008', '2026-09-30', 0.80, true),
  -- Corridor 2 morning peak: 56372 (Thrissur Passenger) — packed
  ((select id from trains where number='56372'), (select id from stations where code='TCR'),
   3, 3, 'agree', true, 'sample-device-009', '2026-09-30', 0.80, true),
  ((select id from trains where number='56372'), (select id from stations where code='CKI'),
   3, 3, 'agree', true, 'sample-device-010', '2026-09-30', 0.80, true),
  ((select id from trains where number='56372'), (select id from stations where code='AWY'),
   4, 4, 'agree', true, 'sample-device-011', '2026-09-30', 0.80, true),
  -- 16305 Intercity — better option
  ((select id from trains where number='16305'), (select id from stations where code='TCR'),
   1, 1, 'agree', true, 'sample-device-012', '2026-09-30', 0.80, true),
  ((select id from trains where number='16305'), (select id from stations where code='AWY'),
   2, 2, 'agree', true, 'sample-device-013', '2026-09-30', 0.80, true),
  ((select id from trains where number='16305'), (select id from stations where code='ERS'),
   2, 2, 'agree', true, 'sample-device-014', '2026-09-30', 0.80, true)
on conflict (device_hash, train_id, travel_date) do nothing;

-- =============================================================
-- SAMPLE VOLUNTEER LOGS (for demo, is_sample = true)
-- =============================================================
insert into volunteer_logs (station_id, train_id, level, platform_count, logged_at, notes, is_sample) values
  ((select id from stations where code='CAN'),
   (select id from trains where number='56632'),
   3, 180, '2026-09-30 07:30:00+05:30',
   'Sample volunteer log — peak hour observation at Kannur', true),
  ((select id from stations where code='TCR'),
   (select id from trains where number='56372'),
   3, 210, '2026-09-30 06:15:00+05:30',
   'Sample volunteer log — Thrissur morning departure', true),
  ((select id from stations where code='AWY'),
   (select id from trains where number='56372'),
   4, 280, '2026-09-30 07:20:00+05:30',
   'Sample volunteer log — Aluva, passengers could not board', true);

-- =============================================================
-- SAMPLE PETITION (for demo dashboard)
-- =============================================================
insert into petitions (corridor, trains_cited, message) values
  ('Kannur–Kozhikode',
   array['56640','56632','16629','56631'],
   'The general coaches on the Kannur–Kozhikode corridor are regularly packed beyond capacity during morning and evening peak hours. Crowd reports collected by Thirakku show that 60% of reports on trains 56632 and 56631 are rated Packed or Couldn''t board. We request the Southern Railway to add at least one additional general coach to these services. Data attached.'),
  ('Thrissur–Ernakulam',
   array['56372','16305'],
   'Morning passenger services between Thrissur and Ernakulam are severely overcrowded, particularly at Aluva where passengers regularly cannot board. Sample crowd data collected over the past week shows an average crowd level of 3.4 out of 4 on the 06:00 departure. We urge the Divisional Railway Manager, Thiruvananthapuram, to address this immediately.');
