'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Lock, Loader2 } from 'lucide-react'

// Paths accessible without authentication
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/signup', '/privacy', '/terms']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userEmail, loading } = useAuth()
  const pathname = usePathname()

  const isAuthenticated = Boolean(user || userEmail)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // Don't block public paths (especially root /) with auth loaders
  if (loading && !isPublicPath) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span>Checking passenger credentials…</span>
        </div>
      </div>
    )
  }

  // If on a protected subpage and not logged in, show clean sign-in prompt
  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <div className="transit-card p-6 space-y-4">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Sign in required</h1>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Sign in with your Google account to submit crowd reports, volunteer logs, and official DRM petitions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="btn-primary w-full text-xs font-semibold"
            >
              Sign in with Google
            </Link>
            <Link
              href="/"
              className="btn-secondary w-full text-xs"
            >
              Back to live crowd map
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
