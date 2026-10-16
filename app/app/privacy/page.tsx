import Link from 'next/link'

export const metadata = {
  title: 'Privacy Notice - Thirakku',
  description: 'What the Thirakku prototype stores and how report photos and location are handled.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <header className="mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Privacy notice</h1>
        <p className="mt-1 text-xs text-slate-600">Prototype · Updated October 17, 2026</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700">
        <p>
          Thirakku is a prototype. This notice describes the current app behavior; hosting and authentication providers may have their own retention practices.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Account information</h2>
          <p>
            Sign-in is handled by Supabase Auth. Email sign-up sends the email address and an optional profile name (the email prefix is used if no name is entered); Google sign-in also redirects through Google. Crowd reports and short-lived rate-limit counters use a keyed hash derived from the authenticated account ID. The hash lets the app enforce one report per train per India calendar day and limit repeated report attempts. Expired minute counters are periodically removed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Photos</h2>
          <p>
            The camera preview and captured photo stay in the browser. The app does not upload or analyze the photo, blur faces, or save the image with a report. Avoid capturing identifiable people, and take a photo only from a safe place.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Location</h2>
          <p>
            If you allow it, the browser provides coordinates while the report camera step is open. The report request sends them to the server for a proximity check. The app stores the selected station with the report, not the coordinates. Hosting-provider request logging is outside the app database and depends on that provider’s settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Reports and signatures</h2>
          <p>
            Crowd reports store the selected train, station, level, travel date, report time, location-check result, and verification status. Petition signatures store a keyed account hash and petition ID; they do not store your email in the signatures table. Reports are unverified because photo analysis is not available.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Questions</h2>
          <p>No privacy contact channel is configured in this prototype yet.</p>
        </section>

        <div className="border-t border-slate-300 pt-6">
          <Link href="/" className="text-xs font-semibold text-slate-900 underline">Return to crowd map</Link>
        </div>
      </div>
    </main>
  )
}
