# Thirakku (തിരക്ക്) 🚆

> **"We can't add coaches, but we can make crowding visible, avoidable, and impossible to ignore."**

A passenger-powered crowd map and evidence platform for Kerala trains, focusing on general unreserved coaches. Built for the **Code to Change** hackathon.

---

## 📌 Problem

Daily commuters in Kerala face extreme crowding in general (unreserved) coaches, often forced into dangerous situations in doorways and vestibules. Meanwhile:
1. **Passengers have zero visibility** into how crowded a train is until it pulls into the platform.
2. **Railway authorities dismiss overcrowding complaints** as subjective anecdotes because there is no systematic, verified data collection.

**Thirakku solves both sides of this problem:**
- **For Commuters:** Real-time visibility into crowd levels and intelligent departure advice to pick less crowded trains.
- **For Advocacy:** Verifiable photo-density evidence collected by passengers to demand more unreserved coaches from the Divisional Railway Manager (DRM).

---

## ✨ Features

- **🗺️ Live Corridor Crowd Map**: Interactive Leaflet map displaying colored track segments based on real-time crowd data (Seats free, Standing, Packed, Couldn't board).
- **📡 Live Train Telemetry**: Integrated tracking with speed, delays, and current station location for major Kerala commuter trains (e.g., 16308 Executive Express, 16604 Maveli Express).
- **📸 Privacy-First Crowd Reporting**: Live camera reporting with mandatory on-device face blurring. Photos are analyzed for density and immediately deleted—never stored.
- **⚡ Better Option & Smart Departure**: Algorithmic suggestions offering lighter alternatives 20–45 minutes earlier or later on the same corridor.
- **📢 Evidence Dossier & DRM Petition**: Weekly crowd distribution metrics and an official petition to the Divisional Railway Manager demanding additional unreserved coaches.
- **🏆 Passenger Scout Leaderboard**: Gamified community reporting with karma points, active streaks, and a 10-week contribution consistency heatmap.
- **🌐 Bilingual Support**: Designed for seamless English and Malayalam (മലയാളം) localization.

---

## 🚦 Crowd Level Standards

In accordance with accessibility guidelines, color is **never** the only signal; every status is paired with text:

| Level | Label | Indicator | Definition |
|---|---|---|---|
| **1** | **Seats free** | 🟢 Emerald | Seats available throughout general compartments |
| **2** | **Standing** | 🟡 Amber | Standing room only inside coaches; vestibules open |
| **3** | **Packed** | 🔴 Red | Doorways congested; tight crush inside |
| **4** | **Couldn't board** | 🛑 Dark Red | Passengers unable to board due to extreme rush |
| **–** | **No data** | ⚪ Slate Grey | No recent reports within the past 45 minutes |

> *Rule: Grey strictly means "no recent data". We never guess or hallucinate crowd colors.*

---

## 🛡️ Privacy & Non-Negotiable Rules

Thirakku operates under strict ethical guidelines:
1. **Live Camera Only**: No gallery uploads. Every report requires a live camera capture to prevent manipulated imagery.
2. **On-Device Face Blurring**: Passenger faces are blurred in the browser/device canvas before transmission.
3. **Zero Photo Retention**: Photos are processed for passenger density analysis and deleted immediately. No photos are ever saved to disk or storage.
4. **Minimal Geolocation**: Location is queried once at the moment of reporting to verify proximity to the station. Only the matched station code is stored—never raw location history or continuous tracking.
5. **Rate Limiting**: Strictly one verified report per device per train per day.
6. **Honest Confidence**: Every crowd rating displays its confidence level and sample size (e.g., *"14 reports • 11 photo-verified • High confidence"*).
7. **No Scraped IRCTC Data**: Uses hand-curated timetables and sample commuter models.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a custom, human-crafted dark transit design system
- **Mapping**: [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles & dynamic SVG track overlays
- **Icons**: [Lucide React](https://lucide.dev/) (Zero emoji as structural icons)
- **Data Visualization**: [Recharts](https://recharts.org/) for crowd distribution and hourly crush rate charts
- **Auth & Database**: [Supabase](https://supabase.com/) & [Firebase Authentication](https://firebase.google.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm / pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sharuuuuuhh/THIRAKK.git
   cd THIRAKK/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file inside the `app/` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
thirakku/
├── docs/
│   ├── PRD.md            # Product Requirements Document & Scope
│   ├── ARCHITECTURE.md   # Data models, scoring algorithms, and security
│   └── DESIGN.md         # Design principles, screen flows, and color systems
├── app/
│   ├── app/
│   │   ├── page.tsx               # Main Live Crowd Map & Dashboard
│   │   ├── better-option/page.tsx # Departure advice & alternative train finder
│   │   ├── petitions/page.tsx     # DRM Petition & hourly crowd evidence charts
│   │   ├── contributions/page.tsx # Passenger Leaderboard & 10-week heatmap
│   │   ├── report/page.tsx        # Camera capture, face blur & reporting flow
│   │   └── globals.css            # Dark transit design tokens & custom styling
│   ├── components/
│   │   ├── LiveCrowdMap.tsx       # Interactive Leaflet crowd map & RailRadar telemetry
│   │   ├── StationSearch.tsx      # Typeahead station selector with code pills
│   │   ├── Navbar.tsx             # Responsive header with language toggle
│   │   ├── StretchDetailsCard.tsx # Detailed segment telemetry & confidence badge
│   │   └── AuthGuard.tsx          # Lightweight route protection
│   └── lib/
│       ├── crowd-service.ts       # Corridor computation & timetable resolution
│       ├── types.ts               # Core transit and crowd interfaces
│       └── data/                  # Hand-curated Kerala train schedules
├── AGENTS.md             # Core developer & agent guidelines
└── TASKS.md              # Milestone tracking & feature roadmap
```

---

## 📜 License

Built for open railway advocacy and the **Code to Change** hackathon. Distributed under the MIT License.
