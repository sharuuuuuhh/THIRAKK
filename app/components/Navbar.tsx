'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Train, Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, userEmail, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Live Crowd Map' },
    { href: '/better-option', label: 'Better Option' },
    { href: '/report', label: 'Report Crowd' },
    { href: '/contributions', label: 'Contributions' },
    { href: '/petitions', label: 'Impact & Petition' },
    { href: '/volunteer', label: 'Volunteer Log' },
    { href: '/explore', label: 'All Trains' },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const activeIdentity = user?.email || userEmail

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Train className="h-5 w-5" />
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
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section: Auth (Desktop) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {loading ? (
            <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
          ) : activeIdentity ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-semibold max-w-[170px] truncate bg-slate-100 text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg">
                {activeIdentity}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign in</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 font-semibold text-white hover:bg-slate-800 shadow-xs transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign up</span>
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
              className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
          <div className="pt-2 border-t border-slate-100">
            {activeIdentity ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white"
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
