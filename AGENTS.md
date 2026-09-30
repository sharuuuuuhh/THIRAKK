# AGENTS.md

## Project
Thirakku (working name): a passenger-powered crowd map for Kerala trains. Built for the Code to Change hackathon.

One-line pitch: we can't add coaches, but we can make crowding visible, avoidable, and impossible to ignore.

## Read first
Before writing any code, read these files:
- `docs/PRD.md` for what to build and what is out of scope
- `docs/ARCHITECTURE.md` for the data model, flows, weights, and stack
- `docs/DESIGN.md` for screens, colours, copy, and states
- `TASKS.md` for the build order

## How to work
- Do one step of `TASKS.md` at a time. Stop after each step and show what works.
- Do not add features that are not in the PRD. Ask first.
- Keep the code simple and readable. Prefer plain weighted averages over machine learning.
- Mobile first. Test at a 390 px wide screen before anything else.
- Keep all user-facing text in one place so English and Malayalam can both be supported.

## Stack
- React or Next.js with Tailwind CSS
- Leaflet with OpenStreetMap for the map
- Supabase (Postgres and Realtime) for data and live updates
- Recharts for dashboard charts
- A hosted vision model for the photo estimate, called from the backend only

## Non-negotiable rules
1. Grey means no recent data. Never guess a crowd colour.
2. Every report requires a live camera photo. No gallery uploads.
3. Blur faces on the device before upload. Delete the photo after analysis. Never store photos.
4. Request location only at the moment of reporting. Store only the matched station, never raw location history.
5. One report per device per train per day.
6. Always show a confidence line and sample size next to any crowd level or forecast.
7. Colour is never the only signal. Pair it with a word.
8. Label all sample or seeded data clearly as sample data.
9. Never scrape IRCTC, PRS, or UTS. Use hand-entered sample timetables.
10. Do not put API keys in the code. Use environment variables.

## Crowd levels
1 Seats free (green), 2 Standing (amber), 3 Packed (red), 4 Couldn't board (dark red). No recent data is grey.

## Style
- Flat, minimal UI. One main button per screen.
- Sentence case. Verb-first buttons. No exclamation marks in system text.
- Tap targets at least 44 px high.

## When unsure
Prefer the simpler option, say what you assumed, and keep going. If something in the docs conflicts, the PRD wins for scope, the architecture for data and logic, and the design file for look and copy.
