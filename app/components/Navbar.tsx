'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Train, Menu, X, LogIn, LogOut, Map, Compass, Trophy, FileText, UserCheck } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, userEmail, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'EN' | 'ML'>('EN')

  const navLinks = [
    { href: '/', label: 'Live map', icon: Map },
    { href: '/better-option', label: 'Better train', icon: Compass },
    { href: '/petitions', label: 'Petitions', icon: FileText },
    { href: '/contributions', label: 'Leaderboard', icon: Trophy },
    { href: '/volunteer', label: 'Volunteer', icon: UserCheck },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const activeIdentity = user?.email || userEmail

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(8, 11, 17, 0.88)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Train className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white leading-none">
                  Thirakku
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <span className="text-[11px] font-normal text-slate-400 block leading-tight mt-0.5">
                Kerala Train Crowd Map
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  }}
                >
                  <Icon className="h-3.5 w-3.5 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(l => l === 'EN' ? 'ML' : 'EN')}
            className="hidden sm:inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              minHeight: '32px',
            }}
            title="Toggle Language (English / Malayalam)"
          >
            {language === 'EN' ? 'മലയാളം' : 'English'}
          </button>

          {/* Desktop Auth */}
          <div className="hidden sm:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-20 rounded bg-slate-800 animate-pulse" />
            ) : activeIdentity ? (
              <div className="flex items-center gap-2">
                <span
                  className="truncate max-w-[130px] px-2.5 py-1 rounded text-xs text-slate-300"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)' }}
                >
                  {activeIdentity.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
                  style={{ minHeight: '32px' }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border)',
                  minHeight: '32px',
                }}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign in</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              minHeight: '36px',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1.5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs font-medium transition-colors"
                style={{
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                }}
              >
                <Icon className="h-4 w-4 opacity-70" />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setLanguage(l => l === 'EN' ? 'ML' : 'EN')}
              className="text-slate-400 py-1"
            >
              Language: <strong className="text-white">{language === 'EN' ? 'English' : 'മലയാളം'}</strong>
            </button>
            {activeIdentity ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-red-400 py-1"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-blue-400 py-1"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
