import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Thirakku',
  description: 'Terms of service and passenger safety guidelines for the Thirakku platform.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <div className="border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-600 mt-1">
          Effective Date: September 30, 2026 · Thirakku Public Transit Data Initiative
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or submitting data on the Thirakku crowd mapping platform, you agree to these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Passenger Safety Mandatory Rule</h2>
          <p className="font-semibold text-slate-900">
            Never attempt to operate your phone or capture photographs while boarding, alighting, or standing near the open doorways of moving trains.
          </p>
          <p>
            Submissions must only be completed once you are safely situated inside the coach or waiting safely on the platform surface away from the track edge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Nature of Crowd Data</h2>
          <p>
            Crowd levels displayed on this platform are computed from passenger submissions, volunteer logs, and historical weighted averages. They are intended as travel planning aids and do not constitute official capacity declarations from Indian Railways.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Prohibited Activities</h2>
          <p>Users must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submit fabricated or maliciously misleading crowd reports.</li>
            <li>Attempt to circumvent device rate limits or tampering defenses.</li>
            <li>Use automated scrapers against the reporting endpoints.</li>
          </ul>
        </section>

        <div className="pt-6 border-t border-slate-300">
          <Link href="/" className="text-xs font-semibold text-slate-900 underline">
            Return to crowd map
          </Link>
        </div>
      </div>
    </div>
  )
}
