'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, TrainFront, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: t('liveMap') },
    { href: '/better-option', label: t('betterOption') },
    { href: '/petitions', label: t('impact') },
  ]

  const closeMenu = () => setMenuOpen(false)
  const toggleLanguage = () => setLang(lang === 'en' ? 'ml' : 'en')

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded-sm text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" onClick={closeMenu}>
          <TrainFront className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">{t('appName')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('appName')}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${pathname === link.href ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleLanguage} className="inline-flex min-h-11 items-center rounded-md px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" aria-label={t('language')}>
            {t('language')}
          </button>
          {loading ? (
          <span className="h-9 w-16 animate-pulse rounded bg-[var(--bg-surface)]" aria-label={t('loadingAccount')} />
          ) : user ? (
            <button type="button" onClick={() => { void signOut() }} className="inline-flex min-h-11 items-center rounded-md border border-[var(--border)] px-3 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
              {t('signOut')}
            </button>
          ) : (
            <Link href="/auth/login" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
              {t('signIn')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] md:hidden"
          aria-label={menuOpen ? t('closeNavigation') : t('openNavigation')}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="space-y-1 border-t border-[var(--border)] px-4 py-3 md:hidden" aria-label={t('appName')}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={pathname === link.href ? 'page' : undefined}
              className="flex min-h-11 items-center rounded-md px-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
            <button type="button" onClick={toggleLanguage} className="min-h-11 px-3 text-xs text-[var(--text-secondary)]">{t('language')}</button>
            {!loading && (user ? (
              <button type="button" onClick={() => { void signOut(); closeMenu() }} className="min-h-11 px-3 text-xs font-medium text-[var(--text-primary)]">{t('signOut')}</button>
            ) : (
              <Link href="/auth/login" onClick={closeMenu} className="min-h-11 px-3 pt-3 text-xs font-medium text-[var(--text-primary)]">{t('signIn')}</Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
