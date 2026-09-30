'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

// Paths accessible without authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/signup', '/privacy', '/terms']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userEmail, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthenticated = Boolean(user || userEmail)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // If on a subpage (not root / and not public path) and not logged in, enforce authentication
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !isPublicPath && pathname !== '/') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-xl font-bold border border-blue-200">
            🔒
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Authentication Required</h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Please sign in or register with your Gmail / Email to access live crowd maps, reports, and petitions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full rounded-xl bg-blue-600 py-3 text-center text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              Sign In or Register Now
            </Link>
            <Link
              href="/auth/signup"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
