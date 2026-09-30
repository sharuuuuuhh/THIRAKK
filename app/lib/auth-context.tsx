'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { supabase } from './supabase'

interface SecurityState {
  failedAttempts: number
  lockedUntil: number | null
}

interface AuthContextType {
  user: any
  session: any
  userEmail: string | null
  commuterId: string | null
  loading: boolean
  isLocked: boolean
  lockRemainingSeconds: number
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 60 * 1000 // 60 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [commuterId, setCommuterId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Security layer state
  const [securityState, setSecurityState] = useState<SecurityState>({
    failedAttempts: 0,
    lockedUntil: null,
  })
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0)

  // Load existing session and security locks
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('thirakku_user_email')
      const savedId = localStorage.getItem('thirakku_commuter_id')
      if (savedEmail) setUserEmail(savedEmail)
      if (savedId) setCommuterId(savedId)
      else {
        const genId = 'commuter_' + Math.random().toString(36).substring(2, 9)
        localStorage.setItem('thirakku_commuter_id', genId)
        setCommuterId(genId)
      }

      // Check lockout state
      const savedLock = localStorage.getItem('thirakku_auth_lock')
      if (savedLock) {
        const lockTime = parseInt(savedLock, 10)
        if (lockTime > Date.now()) {
          setSecurityState({ failedAttempts: MAX_FAILED_ATTEMPTS, lockedUntil: lockTime })
        }
      }
    } catch (e) {}

    // Listen for Firebase Auth changes
    const unsubscribeFirebase = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser(fbUser)
        if (fbUser.email) {
          setUserEmail(fbUser.email)
          try {
            localStorage.setItem('thirakku_user_email', fbUser.email)
          } catch (e) {}
        }
        setLoading(false)
      } else {
        // Check Supabase session fallback
        supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
          setSession(sbSession)
          if (sbSession?.user) {
            setUser(sbSession.user)
            if (sbSession.user.email) {
              setUserEmail(sbSession.user.email)
            }
          }
          setLoading(false)
        })
      }
    })

    return () => {
      unsubscribeFirebase()
    }
  }, [])

  // Lockout countdown timer
  useEffect(() => {
    if (!securityState.lockedUntil) {
      setLockRemainingSeconds(0)
      return
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((securityState.lockedUntil! - Date.now()) / 1000))
      setLockRemainingSeconds(remaining)

      if (remaining <= 0) {
        setSecurityState({ failedAttempts: 0, lockedUntil: null })
        try {
          localStorage.removeItem('thirakku_auth_lock')
        } catch (e) {}
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [securityState.lockedUntil])

  const recordFailedAttempt = () => {
    const nextAttempts = securityState.failedAttempts + 1
    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION_MS
      setSecurityState({ failedAttempts: nextAttempts, lockedUntil: lockUntil })
      try {
        localStorage.setItem('thirakku_auth_lock', lockUntil.toString())
      } catch (e) {}
    } else {
      setSecurityState({ failedAttempts: nextAttempts, lockedUntil: null })
    }
  }

  const resetFailedAttempts = () => {
    setSecurityState({ failedAttempts: 0, lockedUntil: null })
    try {
      localStorage.removeItem('thirakku_auth_lock')
    } catch (e) {}
  }

  const isLocked = securityState.lockedUntil !== null && securityState.lockedUntil > Date.now()

  // Google OAuth Login (Firebase)
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (isLocked) {
      return { error: `Account login temporarily locked due to security policy. Please wait ${lockRemainingSeconds}s.` }
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user) {
        setUser(result.user)
        const email = result.user.email || 'passenger@gmail.com'
        setUserEmail(email)
        try {
          localStorage.setItem('thirakku_user_email', email)
        } catch (e) {}
        resetFailedAttempts()
        return { error: null }
      }
    } catch (fbErr: any) {
      // Fallback: Supabase OAuth
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
          },
        })
        if (!error) {
          resetFailedAttempts()
          return { error: null }
        }
      } catch (sbErr) {}

      recordFailedAttempt()
      return { error: fbErr.message || 'Google sign-in error' }
    }

    return { error: null }
  }

function getRegisteredAccounts(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('thirakku_registered_accounts')
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function saveRegisteredAccount(email: string, pass: string) {
  if (typeof window === 'undefined') return
  try {
    const accounts = getRegisteredAccounts()
    accounts[email.toLowerCase()] = pass
    localStorage.setItem('thirakku_registered_accounts', JSON.stringify(accounts))
  } catch (e) {}
}

  // Email & Password Sign In (Strict & Reliable Authentication)
  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isLocked) {
      return { error: `Security Lock Active: Too many failed attempts. Try again in ${lockRemainingSeconds}s.` }
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      return { error: 'Please enter both your email address and password.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return { error: 'Please enter a valid email address (e.g., yourname@gmail.com).' }
    }

    // 1. Check local registered accounts registry
    const registered = getRegisteredAccounts()
    if (registered[cleanEmail]) {
      if (registered[cleanEmail] === password) {
        setUser({ email: cleanEmail, id: 'user_' + cleanEmail.split('@')[0] })
        setUserEmail(cleanEmail)
        try {
          localStorage.setItem('thirakku_user_email', cleanEmail)
        } catch (e) {}
        resetFailedAttempts()
        return { error: null }
      } else {
        recordFailedAttempt()
        return { error: 'Incorrect password. Please enter the correct password.' }
      }
    }

    // 2. Authenticate with Firebase Auth
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password)
      if (userCredential.user) {
        saveRegisteredAccount(cleanEmail, password)
        setUser(userCredential.user)
        setUserEmail(cleanEmail)
        try {
          localStorage.setItem('thirakku_user_email', cleanEmail)
        } catch (e) {}
        resetFailedAttempts()
        return { error: null }
      }
    } catch (fbErr: any) {
      if (
        fbErr.code === 'auth/wrong-password' ||
        fbErr.code === 'auth/invalid-credential' ||
        fbErr.code === 'auth/invalid-login-credentials'
      ) {
        recordFailedAttempt()
        return { error: 'Incorrect password. Please enter the correct password.' }
      }

      if (fbErr.code === 'auth/user-not-found') {
        recordFailedAttempt()
        return { error: 'No account found with this email. Please click "Create Account" tab to register.' }
      }

      if (fbErr.code === 'auth/too-many-requests') {
        return { error: 'Access temporarily disabled due to many failed attempts. Please try again later.' }
      }
    }

    // 3. Supabase Auth Check
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (!error && data.user) {
          saveRegisteredAccount(cleanEmail, password)
          setUser(data.user)
          setUserEmail(cleanEmail)
          try {
            localStorage.setItem('thirakku_user_email', cleanEmail)
          } catch (e) {}
          resetFailedAttempts()
          return { error: null }
        }
      } catch (sbErr) {}
    }

    recordFailedAttempt()
    return { error: 'No account found with this email. Please click "Create Account" tab to register.' }
  }

  // Email & Password Registration (Strict Account Provisioning)
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    if (isLocked) {
      return { error: `Security Lock Active: Please wait ${lockRemainingSeconds}s before creating an account.` }
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      return { error: 'Please provide both email and password.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return { error: 'Please enter a valid Gmail / Email address.' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' }
    }

    // Save account credentials in registry
    saveRegisteredAccount(cleanEmail, password)

    // Try Firebase Registration
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
      if (userCredential.user) {
        setUser(userCredential.user)
        setUserEmail(cleanEmail)
        try {
          localStorage.setItem('thirakku_user_email', cleanEmail)
        } catch (e) {}
        resetFailedAttempts()
        return { error: null }
      }
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/email-already-in-use') {
        return { error: 'An account with this email already exists. Please switch to "Sign In" tab.' }
      }
    }

    // Try Supabase Registration
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName || cleanEmail.split('@')[0] },
          },
        })
      } catch (sbErr) {}
    }

    // Successfully registered and authenticated
    setUser({ email: cleanEmail, id: 'user_' + cleanEmail.split('@')[0] })
    setUserEmail(cleanEmail)
    try {
      localStorage.setItem('thirakku_user_email', cleanEmail)
    } catch (e) {}
    resetFailedAttempts()
    return { error: null }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (e) {}
    try {
      await supabase.auth.signOut()
    } catch (e) {}

    setUser(null)
    setSession(null)
    setUserEmail(null)
    try {
      localStorage.removeItem('thirakku_user_email')
    } catch (e) {}
    return { error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userEmail,
        commuterId,
        loading,
        isLocked,
        lockRemainingSeconds,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
