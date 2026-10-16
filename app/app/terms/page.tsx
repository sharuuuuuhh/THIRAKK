import Link from 'next/link'

export const metadata = {
  title: 'Terms - Thirakku',
  description: 'Prototype scope and passenger safety guidance for Thirakku.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <header className="mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Prototype terms</h1>
        <p className="mt-1 text-xs text-slate-600">Updated October 17, 2026</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Crowd information</h2>
          <p>
            Crowd levels come from passenger reports and clearly labelled sample data. Passenger reports are self-reported and are not independently verified. The app is not an Indian Railways service and does not provide official occupancy, timetable, or safety information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Use your judgment</h2>
          <p>
            Treat the map as an informal planning aid, not a guarantee of conditions or a recommendation to board a particular train. Sample reports do not describe current railway conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Passenger safety and photos</h2>
          <p>
            Do not use your phone or take photos while boarding, alighting, near an open train door, or close to the platform edge. The report screen asks for a live camera photo; take it only from a safe position. Photos stay in the browser and are not uploaded, analyzed, or face-blurred. Avoid capturing identifiable people.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Reports and accounts</h2>
          <p>
            A signed-in account can submit at most one report per train per India calendar day. Do not submit fabricated or abusive reports. Reports remain unverified until a real verification process is available.
          </p>
        </section>

        <div className="border-t border-slate-300 pt-6">
          <Link href="/" className="text-xs font-semibold text-slate-900 underline">Return to crowd map</Link>
        </div>
      </div>
    </main>
  )
}
