'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Lock, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { getSafeAuthDestination } from '@/lib/auth-redirect'

// Paths accessible without authentication
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/privacy', '/terms']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthenticated = Boolean(user)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // Don't block public paths (especially root /) with auth loaders
  if (loading && !isPublicPath) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span>{t('checkingSession')}</span>
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
            <h1 className="text-base font-bold text-white">{t('signInRequired')}</h1>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {t('signInDescription')}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={(event) => {
                event.preventDefault()
                const next = getSafeAuthDestination(`${pathname}${window.location.search}`)
                router.push(`/auth/login?next=${encodeURIComponent(next)}`)
              }}
              className="btn-primary w-full text-xs font-semibold"
            >
              {t('signIn')}
            </Link>
            <Link
              href="/"
              className="btn-secondary w-full text-xs"
            >
              {t('backToMap')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
