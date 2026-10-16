# TASKS.md

This checklist originated as the prototype roadmap. Checked items must reflect the current implementation, not the original demo plan. Some original claims were removed because they were not implemented or could not be represented honestly.

## Step 1: Setup and seed data
- [x] Create the project, install dependencies, set up Tailwind and environment variables
- [x] Create the Supabase tables from `docs/ARCHITECTURE.md` (trains, stations, route_stops, timetable, reports, volunteer_logs, trust_scores, forecasts, forecast_checks, special_days, petitions, signatures)
- [x] Seed two corridors with about 8 to 10 trains each, hand-entered, labelled as sample data
- [x] Verify station coordinates on a map before using them

Done when: the app runs, the tables exist, and sample trains and stations load.

## Step 2: Route picker and live map
- [x] Screen 1: choose From and To, remember the last route
- [x] Screen 2: map with one coloured line per stretch between stations
- [x] Grey for no recent data, plus a one-line legend
- [x] Tap a stretch to see level, confidence, and report count

Done when: the map shows colours for a seeded corridor, and grey where there is no data.

## Step 3: Passenger report flow
- [x] Screen 3: pick level (Seats free, Standing, Packed) and a small "Couldn't board" link
- [x] Optional live camera interaction; image remains local and is not analyzed or uploaded
- [x] Safety and privacy lines on the camera screen
- [x] Location check at the moment of reporting
- [ ] On-device face blur or image analysis (not available)
- [x] Crowd level can be reviewed before submitting
- [x] Enforce one report per account per train per India calendar day
- [x] Confirmation identifies the submission as unverified

Done when: a report can be sent from a phone and the map colour updates live.

## Step 4: Crowd report display
- [x] Recent passenger reports are shown as unverified
- [x] Sample data is identified separately from passenger reports
- [ ] Trust scoring, volunteer weighting, and photo-based confidence (not available)
- [x] Reports failing the location check are not counted

Done when: disagreeing or bad reports change the result less than trusted, matching ones.

## Step 5: Forecast and better option
- [ ] Forecasts, alternative train recommendations, reminders, and accuracy tracking (not available)

Done when: a packed train shows a lighter alternative, or says none exists.

## Step 6: Impact dashboard and petition
- [ ] Verified evidence dossier or official railway petition service (not available)
- [ ] Forecast accuracy metrics (not available)

Done when: the petition message is generated from real or clearly labelled sample data.

## Step 7 (stretch): Malayalam and polish
- [x] English and Malayalam text for every screen, toggle always visible
- [x] Empty, loading, offline, and error states from `docs/DESIGN.md`
- [x] Accessibility pass: labels, contrast, text size

## Step 8 (stretch, prototype): Platform camera look-ahead
- [ ] People counting and crowd prediction (not available)

## Step 9 (stretch, prototype): On-train mode
- [ ] Continuous location tracking or passenger counting (not available)

## Release readiness
- [x] Sample reports are labelled
- [x] Apply the database security and shared report rate-limit migrations on the target Supabase project (reported complete)
- [ ] Configure production auth redirects and Google provider if used
- [ ] Verify on a real deployment that no image or raw location is persisted
- [ ] Complete a mobile release review
