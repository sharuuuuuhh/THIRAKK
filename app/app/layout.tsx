import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thirakku - Kerala Train Crowd Map',
  description:
    'Passenger-powered crowd levels for Kerala train general unreserved coaches. Real-time reports, forecasts, and evidence for railway advocacy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <AuthGuard>{children}</AuthGuard>
            </main>
            <footer className="border-t border-slate-300 bg-white px-4 py-8 text-xs text-slate-600">
              <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900">Thirakku</span> - Passenger-powered crowd mapping initiative for Kerala trains.
                </div>
                <div className="flex flex-wrap items-center gap-4 font-medium">
                  <Link href="/privacy" className="hover:text-slate-900 underline">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-slate-900 underline">
                    Terms of Service
                  </Link>
                  <Link href="/petitions" className="hover:text-slate-900 underline">
                    DRM Petition
                  </Link>
                  <Link href="/volunteer" className="hover:text-slate-900 underline">
                    Volunteer Log
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
