import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Thirakku',
  description: 'On-device privacy architecture and data retention policies for the Thirakku platform.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <div className="border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-600 mt-1">
          Effective Date: September 30, 2026 · Thirakku Public Transit Data Initiative
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Core Privacy Architecture</h2>
          <p>
            Thirakku is built on the principle of minimal data retention. We measure crowd levels in general train coaches without collecting personal identities, faces, or continuous tracking data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. On-Device Face Blurring</h2>
          <p>
            When a passenger captures a photo to verify crowd density:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Passenger faces are detected and blurred directly within the browser on your local device before transmission.</li>
            <li>No unblurred facial photographs leave your device.</li>
            <li>The blurred image is evaluated by a server-side density analyzer in transient memory and immediately discarded.</li>
            <li>We do not store photos on any permanent storage system.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Location Information</h2>
          <p>
            Location is requested solely at the exact instant a crowd report is submitted to verify proximity to the specified railway station.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We only store the matched railway station name and code (for example, &quot;CAN&quot; or &quot;CLT&quot;).</li>
            <li>Raw GPS coordinates and ongoing location histories are never logged or stored.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Device Identifiers & Limits</h2>
          <p>
            To prevent spam and manipulation, we compute a non-reversible cryptographic hash from device attributes to enforce the rule of one report per device per train per day. This hash cannot be reverse-engineered to identify the user.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact</h2>
          <p>
            For privacy inquiries or audit verifications, contact the open data coordinators via the petition and feedback channel.
          </p>
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
