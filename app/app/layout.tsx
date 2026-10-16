import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import SiteShell from '@/components/SiteShell'

export const metadata: Metadata = {
  title: 'Thirakku — Kerala Train Crowd Map',
  description:
    'A prototype map of passenger-reported crowd levels on Kerala trains. Reports are unverified and sample data is labelled.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}

