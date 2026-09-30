# Product Requirements Document: Thirakku (working name)

A passenger-powered crowd map for Kerala trains. Built for the **Code to Change** hackathon.

> Working name only. Other options: RailRush Kerala, Nilkkan Idam. Pick one before the demo.

---

## 1. Summary

Kerala's general (unreserved) train coaches are often so crowded that people cannot even stand. Nobody measures this, so nobody has to fix it. Indian Railways reservation data (PRS) covers reserved coaches only, and unreserved tickets (UTS) are not tied to a seat or coach.

Thirakku makes crowding **visible, predictable, and impossible to ignore**:

1. Passengers report how crowded their train is, backed by a live photo.
2. The site shows a traffic-style map of crowd levels per stretch of track.
3. The site predicts tomorrow's crowd from past reports and suggests a better train.
4. The site turns the data into evidence and a petition for more coaches.

**One-line pitch:** "We can't add coaches, but we can make crowding visible, avoidable, and impossible to ignore."

---

## 2. Problem

| Who | Pain today |
|---|---|
| Daily commuters (students, workers) | Cannot board or stand in general coaches at peak hours. No way to know which train is lighter. |
| Elders, women, people with disabilities | Standing in a crush is unsafe. No way to plan around it. |
| Passenger associations | Complaints are anecdotal, so they are easy to ignore. |
| Railways | No measured demand for unreserved travel, so no data to justify more coaches. |

**Gap:** Crowd data for unreserved coaches does not exist in a usable, public form.

---

## 3. Goals and non-goals

### Goals
- G1. Let a commuter see how crowded each train or stretch is, right now.
- G2. Let a commuter report crowding in under 20 seconds.
- G3. Predict the next day's crowd for a given train and suggest a better option.
- G4. Produce a public evidence dashboard and a one-click petition.
- G5. Keep reports trustworthy (live photo, location check, trust score).

### Non-goals (for the hackathon)
- Adding real train capacity. A website cannot do this.
- Official live occupancy. Railways does not publish it, so all data is passenger-reported.
- Reliable deepfake or photo forensics. Photos are evidence signals, not proof.
- Background location tracking (limited on the web).
- Official CCTV integration (needs Railways' permission).

---

## 4. Users

| Persona | Need | Key screens |
|---|---|---|
| **Anu, college student**, takes the same train daily | Know which train is lighter, report quickly | Map, Report, Better option |
| **Rajan, office worker**, travels at peak | Plan departure, avoid the worst train | Map, Better option |
| **Volunteer** (passenger association or team member) | Log ground-truth counts at peak hours | Volunteer entry |
| **Association leader** | Evidence to push Railways | Impact, Petition |

---

## 5. User stories

- As a commuter, I can pick my route and see crowd colours so I know what to expect.
- As a commuter, I can report my train's crowd level with a photo so others can see it.
- As a commuter, I am told about a less crowded alternative so I can shift my travel.
- As a commuter, I can set a reminder for the better train.
- As a volunteer, I can log a crowd level and approximate count at a station.
- As an association leader, I can see the worst trains and peak hours and send a petition with the data attached.
- As any user, I can see how confident the crowd level is and how many reports support it.

---

## 6. Scope

### MVP (must have)
1. Route selection on one or two seeded corridors.
2. Live crowd map, coloured per stretch between stations.
3. Report flow with **required live photo**.
4. Photo analysis that estimates the level and checks it against the tap.
5. Location check at the moment of reporting.
6. Trust score per reporter.
7. Blended crowd level with a confidence line.
8. Next-day prediction and a "better option" suggestion.
9. Impact dashboard and petition generator.
10. Volunteer entry form.

### Phase 2 (stretch, label as prototype)
- On-train mode: match a phone to a train by movement and count app users aboard.
- Platform camera look-ahead: people counting at the previous station predicts the arriving train's load (demo on sample video).

### Roadmap (slide only)
- Official PRS waitlist and UTS ticket-count integration.
- Door counters and load-weighing sensors on coaches.
- Native app for background location.
- Trained forecasting model using weather, holidays, and events.

---

## 7. Functional requirements

### 7.1 Route and map
- FR1. User selects a From and To station from a seeded list.
- FR2. The map shows each stretch between consecutive stations coloured green, amber, red, or grey.
- FR3. Grey means no recent data. The system never guesses a colour.
- FR4. A legend explains the colours in plain words.
- FR5. Tapping a stretch shows its level, confidence, and number of reports.

### 7.2 Reporting
- FR6. The user picks a level: Seats free, Standing, Packed (plus "Couldn't board" as a secondary choice).
- FR7. A **live camera photo is required** to send a report. No gallery uploads.
- FR8. The photo is time-stamped and checked against the route and time.
- FR9. Faces are blurred on the device before upload. The photo is deleted after analysis.
- FR10. The AI estimate is shown next to the user's tap. If they differ, the user may keep, change, or retake.
- FR11. One report per device per train per day.
- FR12. The camera screen tells users to take the photo only when safely inside or on the platform.

### 7.3 Trust and blending
- FR13. Every reporter has a trust score that rises when their reports agree with photos, volunteers, and other riders, and falls when they do not.
- FR14. Volunteer logs carry the highest weight.
- FR15. Reports with a matching photo and a location check carry more weight than those without.
- FR16. The displayed level shows a confidence line, for example "Packed, high confidence, 9 reports, 9 photos, 1 volunteer".

### 7.4 Prediction
- FR17. The system predicts crowd level per train, weekday type, and time slot from past reports.
- FR18. With only one day of data, the baseline is "same train, same time, last day".
- FR19. With more data, recent days are weighted more, weekdays are compared with weekdays, and special days (holidays, exams, festivals) are treated separately.
- FR20. Live reports from the last hour can raise or lower the prediction.
- FR21. Predictions always show a sample size and an "early estimate" label when data is thin.
- FR22. The system records yesterday's prediction and compares it with what was reported, to produce an accuracy score.

### 7.5 Suggestions
- FR23. If the user's train is forecast or reported as Packed, suggest a lighter train departing within a set window and arriving within a set delay.
- FR24. Show alternatives (next train, express with reserved seating, bus) with time and crowd side by side.
- FR25. User can set a reminder for the suggested train.

### 7.6 Impact and petition
- FR26. The dashboard shows percent of reports that are Packed, worst trains, peak hours, and a weekly trend.
- FR27. "Demand more coaches" generates a pre-filled message addressed to the Divisional Railway Manager, with data attached.
- FR28. Users can sign the petition. The signature count is public.
- FR29. A shareable report card summarises the week for social media.

### 7.7 Volunteer entry
- FR30. A volunteer selects station, train, and time, enters a level and an approximate platform count, and submits.
- FR31. Volunteer logs are visible to admins and used to check accuracy of other signals.

---

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Speed | A report can be sent in under 20 seconds on a 4G phone. The map loads in under 3 seconds. |
| Devices | Mobile-first. Works on low-end Android browsers. |
| Language | English and Malayalam for all user-facing text. |
| Privacy | No face storage. Photos deleted after analysis. Location used only while reporting. No raw location history kept. |
| Reliability | If photo analysis fails, the report is saved as unverified with a lower weight. |
| Accessibility | Large tap targets, colour plus text labels, readable contrast. |
| Honesty | The site states that data is passenger-reported and shows confidence on every level. |

---

## 9. Success metrics

| Metric | Target for pilot |
|---|---|
| Reports per day on seeded corridors | 50+ during the pilot week |
| Time to send a report | Under 20 seconds |
| Photo and tap agreement | Above 70 percent |
| Prediction match rate (predicted colour equals reported colour) | Above 65 percent after one week, reported honestly |
| Survey evidence | 100+ commuter responses |
| Petition signatures | 300+ |

These targets are starting points. Adjust them after the first pilot day.

---

## 10. Privacy, safety, and ethics

- Collect the minimum. Faces are blurred on the device. Photos are deleted after analysis.
- Location is requested only at the moment of reporting, and only a station match is stored.
- Users are told not to take photos while boarding or near an open door.
- Show confidence and sample size. Never present an estimate as exact.
- State the source: passenger reports, not official Railways data.
- Do not scrape IRCTC, PRS, or UTS. Use official data only with permission.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Cold start (no data on day one) | Pre-seed with a commuter survey and a pilot among classmates. Label sample data clearly. |
| Fake, old, or staged photos | Live camera only, time and location stamp, trust score, volunteer cross-checks. |
| Compulsory photo lowers reports | Three-tap flow, "same train as last time" shortcut, optional reminders. |
| One photo does not show the whole coach | Mismatch screen lets users keep their answer. Mismatch lowers weight instead of rejecting. |
| Prediction is weak with little data | Show "early estimate", blend with route average, report accuracy honestly. |
| Privacy concerns about photos and location | Blur on device, delete after analysis, explain on the camera screen. |
| Web cannot track location in the background | Keep on-train mode as a prototype. Native app on the roadmap. |
| Camera feeds are not accessible | Demo on sample video. Propose an official pilot. |

---

## 12. What is live and what is simulated (tell the judges)

| Live | Prototype | Simulated or roadmap |
|---|---|---|
| Reports, map, trust score, blending, prediction, dashboard, petition | Photo estimate, people counting on sample footage | Phone-movement matching, official CCTV, PRS and UTS data |

---

## 13. Hackathon plan (24 to 36 hours)

| Hours | Work |
|---|---|
| 0 to 3 | Name, repo, design tokens, seed train data, task split |
| 3 to 12 | Route, map, report flow, live updates |
| 12 to 20 | Photo step with analysis, trust score, confidence line |
| 20 to 28 | Prediction and better option, dashboard, petition |
| 28 to 36 | Sample data, demo rehearsal, slides. Freeze features early. |

Cut from the bottom if time runs out. Screens 1 to 4 of the design make a complete project on their own.

### Team roles
- **Frontend:** screens, map, camera flow, dashboard.
- **Backend:** storage, blending, trust, prediction, live updates.
- **AI and vision:** photo estimate, face blur, sample-video counting.
- **Data and pitch:** survey, volunteer sheet, seed data, slides, script.

---

## 14. Demo script (about 3 minutes)

1. Open the live map on a phone. Show colours on a real corridor.
2. Pick a level, take the photo, send. Watch the colour and confidence update.
3. Show the better-option suggestion for a packed train.
4. Show tomorrow's forecast with its sample size.
5. Open the dashboard and send the petition.
6. Optional: play platform footage and show the people count turning into a predicted red stretch.

---

## 15. Pitch outline

- **Story:** a real commuter who could not board.
- **Gap:** unreserved demand is never measured.
- **Solution:** many signals, one honest crowd picture, and the evidence to demand change.
- **Ethics:** confidence on every level, privacy by design, clear data source.
- **Impact line:** "Helps daily commuters avoid the worst trains today, and gives passenger groups the data to win more coaches tomorrow."

---

## 16. Open questions

- Which two corridors will be seeded (for example Kannur to Kozhikode and Thrissur to Ernakulam)?
- Which passenger association or volunteer group can be approached for ground truth?
- Which photo-analysis model and hosting will be used, and what does it cost at demo scale?
- Will "Couldn't board" appear on the main level screen or as a secondary option?
- Who is the final recipient for petitions (Divisional Railway Manager, MPs, or both)?
