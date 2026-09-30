# TASKS.md

Build in this order. Do one step at a time, then stop and show the result. Steps 1 to 6 make a complete project on their own. Steps 7 to 9 are stretch.

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

## Step 3: Report flow with required photo
- [x] Screen 3: pick level (Seats free, Standing, Packed) and a small "Couldn't board" link
- [x] Screen 4: live camera only, time stamp, blur faces on the device
- [x] Safety and privacy lines on the camera screen
- [x] Location check at the moment of reporting
- [x] Send the blurred photo to the vision model, get an estimate, delete the photo
- [x] Review screen: match, or mismatch with keep, change, or retake
- [x] Enforce one report per device per train per day
- [x] Screen 5: sent confirmation with the level now shown

Done when: a report can be sent from a phone and the map colour updates live.

## Step 4: Blending, trust score, and confidence
- [x] Weighted blend of recent signals with recency decay (see section 7 of the architecture)
- [x] Trust score per device, bounded, updated from agreement
- [x] Volunteer entry form (Screen 9) with the highest weight
- [x] Confidence line: for example "Packed, high confidence, 9 reports, 9 photos, 1 volunteer"
- [x] Reports failing the location check are not counted

Done when: disagreeing or bad reports change the result less than trusted, matching ones.

## Step 5: Forecast and better option
- [x] Day one baseline: same train, same time, last day, labelled "early estimate"
- [x] Weighted average over past days, weekdays compared with weekdays, special days separate
- [x] Blend toward the route average when samples are few
- [x] Adjust with the last hour of live reports
- [x] Screen 6: better option card and "Remind me"
- [x] Daily check: compare yesterday's forecast with actual reports and store the match rate

Done when: a packed train shows a lighter alternative, or says none exists.

## Step 6: Impact dashboard and petition
- [x] Screen 7: percent Packed this week, worst trains, peak hours, forecast accuracy
- [x] Screen 8: petition with the data attached, public signature count
- [x] Shareable report card

Done when: the petition message is generated from real or clearly labelled sample data.

## Step 7 (stretch): Malayalam and polish
- [x] English and Malayalam text for every screen, toggle always visible
- [x] Empty, loading, offline, and error states from `docs/DESIGN.md`
- [x] Accessibility pass: labels, contrast, text size

## Step 8 (stretch, prototype): Platform camera look-ahead
- [x] People counting on a permitted sample video, showing count and density
- [x] Convert density to a crowd level and show a predicted stretch ahead
- [x] Label clearly as a prototype on sample footage

## Step 9 (stretch, prototype): On-train mode
- [x] Location while the page stays open, match to a train using the timetable
- [x] Count matched users as a soft signal
- [x] Label clearly as a prototype, with the web limits stated

## Before the demo
- [x] Pre-load realistic sample reports so the map is not empty, and label them
- [x] Run the 3-minute demo end to end on a real phone
- [x] Record a fallback video in case the venue network is slow
- [x] Check that no photo or raw location is stored anywhere
