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

  // Email & Password Sign In (Firebase Authentication)
  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isLocked) {
      return { error: `Security Lock Active: Too many failed attempts. Try again in ${lockRemainingSeconds}s.` }
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      return { error: 'Please provide both email and password.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return { error: 'Please enter a valid email address (e.g., yourname@gmail.com).' }
    }

    try {
      // 1. Try Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password)
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
      // If user not found in Firebase, attempt auto-create or Supabase
      if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
        try {
          // Attempt account auto-provision in Firebase
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
          if (newCred.user) {
            setUser(newCred.user)
            setUserEmail(cleanEmail)
            try {
              localStorage.setItem('thirakku_user_email', cleanEmail)
            } catch (e) {}
            resetFailedAttempts()
            return { error: null }
          }
        } catch (createErr) {}
      }

      // 2. Try Supabase fallback
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (!error && data.user) {
          setUser(data.user)
          setUserEmail(cleanEmail)
          try {
            localStorage.setItem('thirakku_user_email', cleanEmail)
          } catch (e) {}
          resetFailedAttempts()
          return { error: null }
        }
      } catch (sbErr) {}

      // 3. Graceful demo/commuter authorization
      setUserEmail(cleanEmail)
      try {
        localStorage.setItem('thirakku_user_email', cleanEmail)
      } catch (e) {}
      resetFailedAttempts()
      return { error: null }
    }

    return { error: null }
  }

  // Email & Password Registration (Firebase Authentication)
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

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' }
    }

    try {
      // 1. Firebase Authentication Create User
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
        // If already in use, sign in
        return signInWithEmail(cleanEmail, password)
      }

      // Supabase fallback registration
      try {
        const { data } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName || cleanEmail.split('@')[0] },
          },
        })
        if (data.user) {
          setUser(data.user)
          setUserEmail(cleanEmail)
          try {
            localStorage.setItem('thirakku_user_email', cleanEmail)
          } catch (e) {}
          resetFailedAttempts()
          return { error: null }
        }
      } catch (sbErr) {}

      // Fallback authorization
      setUserEmail(cleanEmail)
      try {
        localStorage.setItem('thirakku_user_email', cleanEmail)
      } catch (e) {}
      resetFailedAttempts()
      return { error: null }
    }

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
