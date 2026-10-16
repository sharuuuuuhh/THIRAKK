'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import { getSafeAuthDestination } from './auth-redirect'

interface AuthContextType {
  user: User | null
  session: Session | null
  userEmail: string | null
  loading: boolean
  signInWithGoogle: (nextPath?: string) => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string,
    nextPath?: string
  ) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function configurationError() {
  return 'Authentication is not configured. Add the Supabase URL and anon key to the environment, then reload.'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Remove credentials saved by the old local-only sign-in flow.
      localStorage.removeItem('thirakku_registered_accounts')
      localStorage.removeItem('thirakku_user_email')
      localStorage.removeItem('thirakku_commuter_id')

    } catch {
      // Local storage may be unavailable; authentication can still initialize.
    }

    if (!isSupabaseConfigured) {
      // Resolve the initial auth state when this deployment has no Supabase credentials.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    let mounted = true
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) console.error('Could not restore the Supabase session:', error.message)
      setSession(data.session)
      setLoading(false)
    }).catch((error: unknown) => {
      if (!mounted) return
      console.error('Could not restore the Supabase session:', error)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async (nextPath = '/'): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: configurationError() }

    try {
      const destination = getSafeAuthDestination(nextPath)
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      return { error: error?.message ?? null }
    } catch {
      return { error: 'Could not start Google sign-in. Check your connection and try again.' }
    }
  }

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: configurationError() }
    if (!email.trim() || !password) return { error: 'Enter your email and password.' }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      return { error: error?.message ?? null }
    } catch {
      return { error: 'Could not sign in. Check your connection and try again.' }
    }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string,
    nextPath = '/'
  ): Promise<{ error: string | null; requiresEmailConfirmation?: boolean }> => {
    if (!isSupabaseConfigured) return { error: configurationError() }
    if (!email.trim() || !password) return { error: 'Enter your email and password.' }
    if (password.length < 8) return { error: 'Use a password with at least 8 characters.' }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getSafeAuthDestination(nextPath))}`,
          data: { full_name: fullName?.trim() || email.trim().split('@')[0] },
        },
      })

      if (error) return { error: error.message }
      return { error: null, requiresEmailConfirmation: !data.session }
    } catch {
      return { error: 'Could not create your account. Check your connection and try again.' }
    }
  }

  const requestPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: configurationError() }
    if (!email.trim()) return { error: 'Enter your email address.' }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })
      return { error: error?.message ?? null }
    } catch {
      return { error: 'Could not send a reset link. Check your connection and try again.' }
    }
  }

  const updatePassword = async (password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: configurationError() }
    if (password.length < 8) return { error: 'Use a password with at least 8 characters.' }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error: error?.message ?? null }
    } catch {
      return { error: 'Could not update your password. Open a fresh reset link and try again.' }
    }
  }

  const signOut = async (): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) return { error: error.message }
      } catch {
        return { error: 'Could not sign out. Try again.' }
      }
    }
    setSession(null)
    return { error: null }
  }

  const user = session?.user ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userEmail: user?.email ?? null,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        requestPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
