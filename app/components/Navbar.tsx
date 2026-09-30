'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMalayalam, setIsMalayalam] = useState(false)

  const navLinks = [
    { href: '/', label: isMalayalam ? 'തത്സമയ മാപ്പ്' : 'Live Crowd Map' },
    { href: '/better-option', label: isMalayalam ? 'മെച്ചപ്പെട്ട ട്രെയിൻ' : 'Better Option' },
    { href: '/report', label: isMalayalam ? 'റിപ്പോർട്ട് ചെയ്യുക' : 'Report Crowd' },
    { href: '/petitions', label: isMalayalam ? 'പെറ്റീഷൻ' : 'Impact & Petition' },
    { href: '/volunteer', label: isMalayalam ? 'വോളണ്ടിയർ ലോഗ്' : 'Volunteer Log' },
    { href: '/explore', label: isMalayalam ? 'ട്രെയിനുകൾ' : 'All Trains' },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-slate-300 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 font-bold text-white text-sm">
              തി
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
                Thirakku
              </span>
              <span className="text-[10px] font-medium text-slate-500 block leading-tight mt-0.5">
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
                  className={`rounded px-3 py-1.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section: Language Toggle & Auth */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMalayalam(!isMalayalam)}
            className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {isMalayalam ? 'English' : 'മലയാളം'}
          </button>

          {loading ? (
            <div className="h-7 w-16 bg-slate-100 rounded" />
          ) : user ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 max-w-[140px] truncate">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100 font-medium"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href="/auth/login"
                className="rounded border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded bg-slate-900 px-3 py-1 font-semibold text-white hover:bg-slate-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMalayalam(!isMalayalam)}
            className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
          >
            {isMalayalam ? 'EN' : 'മല'}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 lg:hidden space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 flex gap-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full rounded border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center rounded border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center rounded bg-slate-900 py-2 text-xs font-semibold text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
