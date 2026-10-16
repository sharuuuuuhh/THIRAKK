# THIRAKKU (തിരക്ക്)

Thirakku is a bilingual, mobile-first prototype for sharing crowd reports on Kerala train routes. It helps commuters view recent passenger reports and submit their own. Reports are unverified and should be treated as indicative, not as official railway information or safety advice.

Built for **INNOVUS Season 3**, hosted by the **CSE Association at the College of Engineering Thalassery**, under the theme **Code 4 Change**.

**Live prototype:** [thirakk.vercel.app](https://thirakk.vercel.app)

## What the prototype does

- Displays route crowd levels from recent passenger reports, with sample reports clearly identified. Grey means no data.
- Supports Supabase email/password and Google sign-in, password recovery, and account-protected reporting.
- Lets signed-in passengers submit a crowd level for a train and station. The app requests location at report time for a proximity check and stores the matched station, not a location history.
- Provides bilingual English and Malayalam UI.

The app does not have live train telemetry, crowd-image analysis, face blurring, photo upload, or forecast data. Camera capture is a local, live-camera interaction only; images are not uploaded or analyzed. Forecasts and volunteer submissions are unavailable. Petition content and other prototype pages are not official railway services. Do not use the app as a substitute for railway instructions.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Supabase Auth and Postgres with row-level security
- Leaflet and OpenStreetMap tiles

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/sharuuuuuhh/THIRAKK.git
cd THIRAKK/app
npm install
```

Copy `.env.example` to `.env.local` and set the Supabase URL and publishable/anon key from your Supabase project. The service role key is only needed for server-side administrative operations; never expose it in a `NEXT_PUBLIC_` variable or commit it.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase credentials, database-backed features remain unavailable; the application should not be assumed to have live data.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/01_schema.sql` in the Supabase SQL editor.
3. Run `supabase/04_security_hardening.sql` after the schema. This enables row-level security and applies the repository's access policies.
4. Run `supabase/05_report_rate_limit.sql`. Report submission fails closed until this shared, database-backed per-account limit is installed.
5. Configure the Supabase Auth site URL and allowed redirect URLs for the deployed app, including `/auth/callback` and the password recovery route. Configure Google as an Auth provider in Supabase if Google sign-in is desired.
6. The optional seed endpoint requires a random `SEED_ADMIN_TOKEN` on the server. Send it as a bearer token in the `Authorization` header when making a `POST` request to `/api/seed-india`. Never put it in a browser variable. Seed scripts under `supabase/` are for explicit database initialization.

Review SQL policies and auth settings against your Supabase project before deployment. Keep `SUPABASE_SERVICE_ROLE_KEY` private; it bypasses row-level security.

## Environment variables

See [`app/.env.example`](app/.env.example) for the supported variable names. Client-side variables are limited to the Supabase project URL and anon/publishable key.

## Repository layout

```text
docs/                 Product, architecture, and design notes
app/app/              Next.js routes and API handlers
app/components/       Shared UI components
app/lib/              Auth, database, and crowd-report logic
app/supabase/         Schema, policy, and seed SQL/scripts
```

## License

MIT.
