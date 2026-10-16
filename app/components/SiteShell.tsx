'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider, useLanguage } from '@/lib/language-context'

function SiteFrame({ children }: { children: ReactNode }) {
  const { t } = useLanguage()

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <AuthGuard>{children}</AuthGuard>
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-6 text-xs text-[var(--text-secondary)]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p>{t('appName')} · {t('footerCopy')}</p>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label={t('impact')}>
              <Link href="/privacy" className="min-h-11 inline-flex items-center hover:text-[var(--text-primary)]">{t('privacy')}</Link>
              <Link href="/terms" className="min-h-11 inline-flex items-center hover:text-[var(--text-primary)]">{t('terms')}</Link>
              <Link href="/petitions" className="min-h-11 inline-flex items-center hover:text-[var(--text-primary)]">{t('petition')}</Link>
              <Link href="/volunteer" className="min-h-11 inline-flex items-center hover:text-[var(--text-primary)]">{t('volunteer')}</Link>
            </nav>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default function SiteShell({ children }: { children: ReactNode }) {
  return <LanguageProvider><SiteFrame>{children}</SiteFrame></LanguageProvider>
}
