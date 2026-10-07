import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thirakku — Kerala Train Crowd Map',
  description:
    'Passenger-powered crowd levels for Kerala train general unreserved coaches. Real-time reports, forecasts, and evidence for railway advocacy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" style={{ background: '#08090c' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <AuthGuard>{children}</AuthGuard>
            </main>
            <footer
              className="px-4 py-8 text-xs"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: '#0f1117',
                color: 'var(--text-muted)',
              }}
            >
              <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Thirakku</span>
                  {' '}— Passenger-powered crowd mapping for Kerala trains.
                </div>
                <div className="flex flex-wrap items-center gap-5 font-medium">
                  <Link href="/privacy" className="transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
                    Privacy
                  </Link>
                  <Link href="/terms" className="transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
                    Terms
                  </Link>
                  <Link href="/petitions" className="transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
                    DRM Petition
                  </Link>
                  <Link href="/volunteer" className="transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
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

