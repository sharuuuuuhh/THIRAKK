'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const { user, userEmail, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMalayalam, setIsMalayalam] = useState(false)

  const navLinks = [
    { href: '/', label: isMalayalam ? 'തത്സമയ മാപ്പ്' : 'Live Crowd Map' },
    { href: '/better-option', label: isMalayalam ? 'മെച്ചപ്പെട്ട ട്രെയിൻ' : 'Better Option' },
    { href: '/report', label: isMalayalam ? 'റിപ്പോർട്ട്' : 'Report Crowd' },
    { href: '/contributions', label: isMalayalam ? 'സംഭാവനകൾ' : 'Contributions' },
    { href: '/petitions', label: isMalayalam ? 'പെറ്റീഷൻ' : 'Impact & Petition' },
    { href: '/volunteer', label: isMalayalam ? 'വോളണ്ടിയർ' : 'Volunteer Log' },
    { href: '/explore', label: isMalayalam ? 'ട്രെയിനുകൾ' : 'All Trains' },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const activeIdentity = user?.email || userEmail

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 font-bold text-white text-sm">
              തി
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Thirakku
              </span>
              <span className="text-[10px] font-medium text-slate-500 block leading-none">
                Kerala Train Crowd Map
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section: Language Toggle & Auth (Desktop) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMalayalam(!isMalayalam)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {isMalayalam ? 'English' : 'മലയാളം'}
          </button>

          {loading ? (
            <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
          ) : activeIdentity ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-semibold max-w-[150px] truncate bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-md">
                {activeIdentity}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href="/auth/login"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-xs"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          {activeIdentity ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden space-y-1">
          {activeIdentity && (
            <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Signed in as:</span>
              <span className="font-bold text-slate-900 max-w-[180px] truncate">{activeIdentity}</span>
            </div>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsMalayalam(!isMalayalam)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {isMalayalam ? 'English' : 'മലയാളം'}
            </button>
            {activeIdentity ? (
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Sign out
              </button>
            ) : (
              <div className="flex gap-1.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
