'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  Train,
  MapPin,
  Camera,
  FileText,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Compass,
  Video,
  Radio,
  Languages,
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [isMalayalam, setIsMalayalam] = useState(false)

  const navLinks = [
    { href: '/', label: isMalayalam ? 'തത്സമയ മാപ്പ്' : 'Live Crowd Map', icon: MapPin },
    { href: '/better-option', label: isMalayalam ? 'മെച്ചപ്പെട്ട ട്രെയിൻ' : 'Better Option', icon: Compass },
    { href: '/report', label: isMalayalam ? 'തിരക്ക് റിപ്പോർട്ട്' : 'Report Crowd', icon: Camera },
    { href: '/petitions', label: isMalayalam ? 'പെറ്റീഷൻ' : 'Impact & Petition', icon: FileText },
    { href: '/volunteer', label: isMalayalam ? 'വോളണ്ടിയർ' : 'Volunteer Log', icon: Train },
    { href: '/camera-lookahead', label: isMalayalam ? 'പ്ലാറ്റ്ഫോം AI' : 'Camera AI', icon: Video },
    { href: '/on-train', label: isMalayalam ? 'ഓൺ-ട്രെയിൻ' : 'On-Train', icon: Radio },
    { href: '/explore', label: isMalayalam ? 'ട്രെയിനുകൾ' : 'All Trains', icon: Compass },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
              തി
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Thirakku
              </span>
              <span className="text-[10px] font-medium text-slate-500 block leading-none">
                Crowd Map & Railway Guide
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
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Language & Auth Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Malayalam / English Toggle */}
          <button
            type="button"
            onClick={() => setIsMalayalam(!isMalayalam)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Languages className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isMalayalam ? 'English' : 'മലയാളം'}</span>
          </button>

          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[150px] truncate font-medium">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-medium text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
