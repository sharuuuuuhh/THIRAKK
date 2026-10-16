import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function VolunteerEntryPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <section className="transit-card space-y-4 p-6 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-white">Volunteer logging is not enabled</h1>
        <p className="text-sm text-slate-400">
          Ground-truth logs can change crowd estimates, so this tool is restricted to authorized staff. No volunteer submissions are being accepted or saved yet.
        </p>
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-blue-300 underline">
          Return to the crowd map
        </Link>
      </section>
    </main>
  )
}
