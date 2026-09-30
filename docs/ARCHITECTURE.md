# Architecture: Thirakku (working name)

Technical design for the passenger-powered train crowd map. Read with `PRD.md` and `DESIGN.md`.

---

## 1. Principles

1. **Many signals, one honest answer.** No single signal has to be perfect. Blend them and show confidence.
2. **Grey over guessing.** No recent data means no colour.
3. **Privacy by design.** Blur faces on the device, delete photos after analysis, store only what is needed.
4. **Simple first.** Weighted averages before machine learning. Explainable to judges and users.
5. **Cut from the bottom.** Core flow works end to end before any stretch feature.

---

## 2. System overview

```
 Passenger phone (web, mobile-first)
   |  level + live photo (faces blurred on device) + location check
   v
 Web frontend (React or Next.js)  <----  live updates  ----+
   |                                                        |
   v                                                        |
 API layer (Next.js routes or FastAPI)                      |
   |-- Report service ----> Photo analysis (vision model) --+
   |-- Trust service                                        |
   |-- Blend service  ----> Crowd level per train + stretch |
   |-- Forecast service --> Tomorrow's level + suggestion   |
   |-- Impact service  ---> Dashboard + petition            |
   v                                                        |
 Database and realtime (Supabase: Postgres + Realtime) -----+
   ^
   |-- Volunteer entry form
   |-- Seed data (timetables, stations, special days)
   |-- Phase 2: on-train matching, camera counting service
```

---

## 3. Components

| Component | Responsibility |
|---|---|
| **Frontend** | Route picker, map, report flow, camera capture, suggestions, dashboard, petition. Mobile-first. English and Malayalam. |
| **Map layer** | Draws one coloured line per stretch between stations. Leaflet with OpenStreetMap (free) or Google Maps if billing is available. |
| **Report service** | Validates and stores reports. Enforces one report per device per train per day. |
| **Photo analysis** | Takes the blurred photo, estimates the crowd level, returns a level and confidence, then the photo is deleted. |
| **Location check** | Confirms the device is near the route or station at the moment of reporting. Stores only the matched station. |
| **Trust service** | Maintains a score per device and updates it from agreement with photos, volunteers, and other riders. |
| **Blend service** | Combines recent weighted signals into a crowd level per train and stretch, plus a confidence line. |
| **Forecast service** | Predicts crowd per train, day type, and time slot. Produces the better-option suggestion. |
| **Impact service** | Aggregates the dashboard numbers and builds the petition message. |
| **Volunteer form** | Admin-friendly input for ground-truth logs. |

---

## 4. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React or Next.js, Tailwind | Fast to build, mobile-first, strong web-dev fit |
| Map | Leaflet + OpenStreetMap | Free, no billing, enough for coloured lines and markers |
| Backend | Next.js API routes, or FastAPI if Python is easier for vision | One repo or a small second service |
| Database and realtime | Supabase (Postgres + Realtime) | Live badge updates with little setup |
| Vision | A hosted vision model API for the photo estimate | No training needed, quick to integrate |
| Face blur | In-browser, before upload | Privacy by design, no raw faces leave the phone |
| Charts | Recharts | Simple dashboard charts |
| Hosting | Vercel for the frontend, Render or Supabase functions for the backend | Free tiers |

---

## 5. Data model

### trains
| Field | Notes |
|---|---|
| id | Primary key |
| number | For example an express or passenger number (sample data in the demo) |
| name | Display name |
| route_id | Links to a corridor |

### stations
| Field | Notes |
|---|---|
| id | Primary key |
| name | Station name |
| code | Short code |
| lat, lng | Coordinates. Verify against a map before use. |

### route_stops
| Field | Notes |
|---|---|
| route_id, station_id | Composite key |
| order | Position along the corridor |

### timetable
| Field | Notes |
|---|---|
| train_id, station_id | Composite key |
| scheduled_time | Seeded by hand for the demo corridors |

### reports
| Field | Notes |
|---|---|
| id | Primary key |
| train_id, station_id | What and where |
| level | 1 Seats free, 2 Standing, 3 Packed, 4 Couldn't board |
| photo_level | The AI estimate, or null if analysis failed |
| photo_match | Agree, close, differ, or unverified |
| location_ok | True if near route at report time |
| device_hash | Random ID from the device, not personal |
| travel_date | Used with train and device for the one-report rule |
| created_at | Timestamp |
| weight | Computed at blend time |

Unique rule: one report per device per train per day. The photo is never stored here.

### volunteer_logs
| Field | Notes |
|---|---|
| id, station_id, train_id | Identity and context |
| level, platform_count | Ground-truth inputs |
| logged_at | Timestamp |

### trust_scores
| Field | Notes |
|---|---|
| device_hash | Primary key |
| score | Starts neutral, bounded |
| samples | How many reports shaped it |

### forecasts
| Field | Notes |
|---|---|
| train_id, day_type, time_slot | Key |
| predicted_level | Weighted estimate |
| sample_count | For the "early estimate" label |
| updated_at | Timestamp |

### forecast_checks
| Field | Notes |
|---|---|
| train_id, date | Key |
| predicted_level, actual_level | For the accuracy score |

### special_days
| Field | Notes |
|---|---|
| date | Primary key |
| label | Holiday, exam, festival |

### petitions and signatures
| Field | Notes |
|---|---|
| petition: corridor, trains_cited, message, created_at | The request |
| signature: petition_id, device_hash or email, created_at | One per person |

---

## 6. Core flows

### 6.1 Report flow
1. User chooses train and level.
2. The camera opens live. The photo is captured, time-stamped, and faces are blurred on the device.
3. The location is checked against the route.
4. The blurred photo goes to the vision model, which returns a level estimate.
5. The app compares the tap with the estimate and shows the review screen. On a mismatch, the user may keep, change, or retake.
6. The report is saved with its photo match and location result. The photo is deleted.
7. The blend for that train and stretch is recomputed and pushed live to everyone watching.

If photo analysis fails, the report is saved as unverified and carries a lower weight.

### 6.2 Blend flow (one answer per train and stretch)
1. Gather signals from the last 30 to 45 minutes.
2. Give each signal a weight (see section 7).
3. Average by weight. Newer signals count more.
4. Map the result to a colour and a label.
5. Attach a confidence line from counts and agreement.
6. If there are no recent signals, return grey.

A report at a station describes the crowd on the stretch after that station. Reports at the next station back it up.

### 6.3 Forecast flow
1. Take past reports for the same train, day type, and time slot.
2. Weight recent days more.
3. Pull toward the route average when samples are few.
4. Adjust with live reports from the last hour and with crowding at earlier stations.
5. Attach the sample count and a label.

### 6.4 Better-option flow
Compare the user's train with later trains in a short window. Suggest one that is clearly lighter and does not add too much delay. The two limits are tunable settings.

---

## 7. Weights and rules (starting values, tune in testing)

| Signal | Relative weight |
|---|---|
| Volunteer log | Highest |
| Report with matching photo and location check | High |
| Report from a trusted device, photo close | Medium |
| Report with a photo that differs | Low |
| Report with unverified photo | Low |
| Report failing the location check | Not counted |

Weight is also scaled by the reporter's trust score and by how recent the report is (exponential decay over roughly 20 minutes).

### Confidence labels
| Label | Rule of thumb |
|---|---|
| High | Several recent reports agree, with at least one volunteer or matching photos |
| Medium | A few recent reports, mostly agreeing |
| Low | One or two reports, or reports that disagree |
| No data | Grey. Nothing recent. |

### Trust score updates
- Up when a report agrees with its photo, a volunteer log, or most other riders on the same train.
- Down when it repeatedly disagrees or fails location checks.
- New devices start neutral. The score is bounded so nobody gains or loses unlimited weight.

---

## 8. Prediction design

### Day one (only the last day's data)
Predict "same train, same time as last day". Label it "early estimate".

### With more days
- Weighted average over past days for the same train and time slot, recent days heavier.
- Separate weekday, weekend, and special-day groups.
- Blend with the route's typical level using a fixed pseudo-count, so one or two reports cannot swing the result.
- Adjust by the live signal: if the last hour runs higher than usual, raise the forecast. If earlier stations are already crowded, raise later ones.

### Accuracy check
Each day, compare yesterday's forecast with what was reported. Keep a simple match rate per train and overall, and show it in the dashboard.

### Upgrade path
After several weeks of data, replace averages with a trained model that also uses weather, holidays, college timings, and events.

---

## 9. Photo pipeline and privacy

1. Camera opens live. Gallery uploads are disabled.
2. On the device: stamp time, blur faces, and downscale the image.
3. Upload the blurred image over HTTPS to the analysis step.
4. The model returns a level estimate and confidence. The image is deleted immediately afterward.
5. Only the estimate and the match result are stored.

Privacy rules:
- No face recognition or identification.
- Location is read only at the moment of reporting. Only the matched station is stored.
- No raw location history.
- A clear note on the camera screen explains all of this.

---

## 10. API surface

| Endpoint | Purpose |
|---|---|
| Get trains for a route and time | Feeds the route and station views |
| Get crowd for a route | Returns level, colour, and confidence per stretch |
| Post a report | Validates, analyses the photo, stores, triggers a blend |
| Get forecast for a train | Returns the prediction, sample count, and label |
| Get better option | Returns a lighter alternative if one exists |
| Post a volunteer log | Stores ground-truth data |
| Get impact stats | Dashboard numbers and trends |
| Post a petition signature | Increments the public count |

Live updates use the database's realtime channel so maps and badges change without refreshing.

---

## 11. Security and abuse prevention

- One report per device per train per day.
- Rate limits per device and per network.
- Location and time checks on every report.
- Trust score and volunteer cross-checks down-weight bad data.
- Outlier reports, meaning those far from neighbours on the same train, are down-weighted.
- Admin-only access to volunteer tools and raw tables.
- Row-level rules so users can read aggregates but never other users' raw data.

---

## 12. Phase 2 prototypes

### On-train mode
- While the page stays open, read position and speed every 10 to 30 seconds.
- Confirm the device is near the track and moving at train speed.
- Match to a train using the timetable and direction. Ask the user to confirm if two trains are close.
- Count matched app users per train as a soft signal.
- Limits: web pages lose location in the background, battery use, tunnels and weak signal, and it needs many users. Demo with a few phones or a clearly labelled simulated route.

### Platform camera look-ahead
- Count people in a platform view, convert to density, and calibrate per camera against volunteer observations.
- Link the crowd waiting to the arriving train, then estimate the load leaving the station from the arriving load, the boarders, and typical alighting.
- Pass that estimate down the line so later stretches show a predicted colour.
- Run the counting near the camera and send only counts, never video.
- For the hackathon, demo on a permitted sample video. Real feeds need Railways' approval.

---

## 13. Deployment and operations

| Area | Plan |
|---|---|
| Environments | One hosted environment for the demo, local for development |
| Seed data | Two corridors, hand-entered timetables, a special-days list, clearly labelled sample reports |
| Monitoring | Basic logs, a daily forecast accuracy check, and a dashboard of reports per day |
| Backups | Database backups from the hosting provider |
| Data retention | Photos deleted right after analysis. Reports kept. Raw location not kept. |

---

## 14. Testing

- **Unit:** blend weights, decay, trust updates, forecast blending, colour mapping.
- **Flow:** report end to end including photo failure and mismatch.
- **Data:** grey appears when nothing is recent. Duplicate reports are rejected.
- **Device:** low-end Android browser, slow network, camera permission denied.
- **Accuracy:** compare forecasts with the next day's reports and log the match rate.
- **Privacy check:** confirm no photo or raw location persists after analysis.

---

## 15. Known limits (say them out loud)

- All data is passenger-reported, not official occupancy.
- One photo shows only part of a coach.
- Forecasts are averages, not a trained model, and they improve with data.
- Web location tracking is limited in the background.
- Camera feeds and PRS or UTS data need official permission.
- Station coordinates and timetables in the seed data are samples and must be verified before public use.
