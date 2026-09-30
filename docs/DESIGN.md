# Design: Thirakku (working name)

UX and visual design for the train crowd app. Read with `PRD.md` and `ARCHITECTURE.md`.

---

## 1. Design principles

1. **One job per screen.** Each screen has one main button.
2. **Explain in one breath.** Check, Report, Decide, Change.
3. **Plain words and plain colours.** Green, amber, red, grey. Always colour plus text.
4. **Honest by default.** Show confidence and sample size. Grey means "no recent data".
5. **Fast for tired people.** A report takes three taps and a photo, under 20 seconds.
6. **Safe.** Never encourage taking photos while boarding.
7. **Minimal.** Flat surfaces, few elements, large tap targets.

---

## 2. The story

| Step | Screen | User question |
|---|---|---|
| Check | Choose route, Live map | "How crowded is it?" |
| Report | Pick level, Take photo, Sent | "How can I help?" |
| Decide | Better option | "What should I do?" |
| Change | Impact, Petition | "How do we fix this?" |

---

## 3. Information architecture

Main flow: Choose route, then Live map, then either Report or Better option. The dashboard and petition are reached from a simple menu entry called Impact.

Secondary areas (not in the main flow):
- Volunteer entry (admin or volunteer only).
- Tomorrow's forecast (inside Better option and the map time selector).
- Language toggle (English, Malayalam).

---

## 4. Screen specifications

### Screen 1: Choose route
- **Purpose:** Start with where you are going.
- **Content:** Title "Where are you going?", From field, To field.
- **Main button:** See crowd.
- **Notes:** Remember the last route. Offer "same as last time" for daily commuters.

### Screen 2: Live map
- **Purpose:** See crowd now.
- **Content:** Route title, map with the route split into stretches between stations, each coloured green, amber, red, or grey. One-line legend: "Green: seats. Amber: standing. Red: packed."
- **Main button:** Report crowding.
- **Interactions:** Tap a stretch to see its level, confidence, and report count. A small Now, Later, Tomorrow selector switches between live and forecast colours.
- **States:** Loading shows a skeleton route. No data shows grey with "No recent reports".

### Screen 3: Pick level
- **Purpose:** Say how your train is.
- **Content:** "How is your train?" with three large choices: Seats free, Standing, Packed. A small link below: "Couldn't board".
- **Main button:** Next.
- **Notes:** Train and station are pre-filled from the route and time. The selected choice is highlighted.

### Screen 4: Take photo (required)
- **Purpose:** Prove the report with a live photo.
- **Content:** Live camera view. Text: "Faces are blurred. The photo is deleted after checking." Safety line: "Take the photo when you're safely inside or on the platform."
- **Main button:** Capture and send.
- **Notes:** No gallery upload. If the camera is blocked, explain how to allow it.

### Screen 4b: Check your report (appears after capture)
- **Content:** Your tap and the photo estimate side by side.
- **Match:** Message "Match" and a send button.
- **Mismatch:** Message "Different result. The photo may not show the whole coach." Buttons: keep your answer, change it, or retake.

### Screen 5: Sent
- **Purpose:** Close the loop and show the effect.
- **Content:** "Thanks". One line: "Your report is live. It helps people on this route choose a better train." The level now shown for the stretch.
- **Main button:** Back to map.

### Screen 6: Better option
- **Purpose:** Turn data into a decision.
- **Content:** Your train and its level in large type. One suggestion card: "Take the 18:15 instead. Less crowded, 20 min later." A line showing "based on N reports over N days".
- **Main button:** Remind me.
- **Notes:** If no better option exists, say so plainly instead of inventing one.

### Screen 7: Impact
- **Purpose:** Show that reports add up to evidence.
- **Content:** This week's percentage of reports that are Packed, the worst train, and the peak hours. Forecast accuracy as a small line.
- **Main button:** Demand more coaches.

### Screen 8: Petition
- **Purpose:** Take action.
- **Content:** "Ask for more coaches". Recipient: Divisional Railway Manager. Note: "The report data is attached automatically." Public signature count.
- **Main button:** Sign and send. Secondary: Share report card.

### Screen 9: Volunteer entry (secondary)
- **Content:** Station, train, time, level, approximate platform count.
- **Main button:** Submit log.

---

## 5. Visual design

### Look and feel
Flat, light, and calm. White and soft grey surfaces, thin borders, rounded corners, generous spacing. No gradients or shadows. Colour is reserved for crowd levels and the single primary action.

### Colours
| Purpose | Colour |
|---|---|
| Seats free | Green |
| Standing | Amber |
| Packed | Red |
| Couldn't board | Dark red |
| No data | Grey |
| Primary button | Near-black fill with white text |
| Selected choice | Soft blue tint with blue text |

Always pair colour with a word or icon so the app works for colour-blind users.

### Typography
- One clean sans-serif family. Regular and medium weights only.
- Title about 22 px, section heading about 15 px, body 13 to 14 px, hints 12 px. Nothing smaller than 11 px.
- Sentence case everywhere.

### Spacing and shape
- 8 px spacing grid.
- Buttons and choices about 44 to 48 px high for easy thumb taps.
- Corner radius about 10 px for controls and 16 px for cards.

### Icons
Simple outline icons only, used sparingly: camera, location, train, bus, people.

---

## 6. Components

| Component | Notes |
|---|---|
| Primary button | One per screen, full width, near-black |
| Secondary button | Outlined, same size |
| Choice row | Colour dot plus label, highlights when selected |
| Route field | Station picker with search |
| Crowd line (map segment) | Thick rounded line in level colour |
| Confidence line | Small text: "Packed, high confidence, 9 reports, 9 photos" |
| Suggestion card | Bold headline, one supporting line |
| Metric | Large number with a one-line label |
| Privacy note | Short grey text under the camera |

---

## 7. States and edge cases

| Situation | Behaviour |
|---|---|
| No recent data | Grey segment and "No recent reports" |
| Few reports | "Early estimate" label |
| Photo analysis fails | Report is accepted as unverified with a short note |
| Photo and tap differ | Mismatch screen: keep, change, or retake |
| Camera permission denied | Plain instructions and a retry button |
| Location not near route | Friendly message: reports are for people on or near the route |
| Already reported today | "You already reported this train today. Thanks." |
| Offline | Show the last map with a banner "Showing the last update" |
| No better option | "No lighter train in the next two hours" |

---

## 8. Content and tone

- Friendly, clear, and short. Active voice, verb first on buttons.
- No jargon. Say "Packed", not "Level 3".
- No exclamation marks on system copy.
- Buttons: "See crowd", "Report crowding", "Next", "Capture and send", "Remind me", "Demand more coaches", "Sign and send".
- Errors say what happened and what to do.
- Every screen is available in English and Malayalam, and the toggle is always visible.

---

## 9. Accessibility

- Colour is never the only signal.
- Text contrast meets readable levels on all surfaces.
- Large tap targets and spacing for one-handed use in crowded trains.
- Screen-reader labels on the map segments, for example "Thalassery to Vadakara: packed".
- Support for system text size and dark mode.

---

## 10. Responsive and performance

- Mobile first. Tablet and desktop use a centred single column, except the dashboard, which can use two columns.
- Map and lists load progressively. Show skeletons, not blank screens.
- Keep images and photos small. Downscale on the device before upload.
- Target a fast first view on 4G and low-end Android.

---

## 11. Demo design notes

- Use a real corridor with pre-loaded, clearly labelled sample reports so the map is not empty.
- Screens 2, 3, 4, and 8 tell the story alone: see it, report it, prove it, act on it.
- Keep numbers on Impact and Petition either real or labelled as sample data.
- Have a recorded fallback in case the venue network is slow.

---

## 12. Design checklist before the demo

- [ ] Each screen has one clear main button.
- [ ] Colours always come with words.
- [ ] Camera screen shows the privacy and safety lines.
- [ ] Grey state and "early estimate" label are visible.
- [ ] Malayalam text fits every screen.
- [ ] Sample data is labelled.
- [ ] The 3-minute demo runs end to end on a real phone.
