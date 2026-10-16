'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSafeAuthDestination } from '@/lib/auth-redirect'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let active = true
    let completed = false
    let unsubscribe = () => {}
    const params = new URLSearchParams(window.location.search)
    const destination = getSafeAuthDestination(params.get('next'))
    const providerError = params.get('error_description')

    if (providerError) {
      const timer = window.setTimeout(() => {
        setStatus('error')
        setErrorMsg(providerError)
      }, 0)
      return () => {
        active = false
        window.clearTimeout(timer)
      }
    }

    function complete() {
      if (!active || completed) return
      completed = true
      setStatus('success')
      router.replace(destination)
      router.refresh()
    }

    async function handleAuth() {
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION')) {
            complete()
            unsubscribe()
          }
        })
        unsubscribe = () => data.subscription.unsubscribe()

        const { data: sessionData, error } = await supabase.auth.getSession()
        if (!active) {
          unsubscribe()
          return
        }
        if (error) {
          unsubscribe()
          setStatus('error')
          setErrorMsg('This sign-in link could not be verified. Request a new link and try again.')
          return
        }

        if (sessionData.session) {
          complete()
        } else {
          unsubscribe()
          setStatus('error')
          setErrorMsg('This sign-in link is invalid or has expired. Request a new link and try again.')
        }
      } catch {
        if (!active) return
        setStatus('error')
        setErrorMsg('Authentication could not be completed. Request a new link and try again.')
      }
    }

    handleAuth()
    return () => {
      active = false
      unsubscribe()
    }
  }, [router])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-100">
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Verifying session...</h2>
            <p className="text-sm text-gray-500">
              Please wait while we verify your link.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-bounce" />
            <h2 className="text-lg font-semibold text-gray-900">Signed in successfully!</h2>
            <p className="text-sm text-gray-500">Redirecting you to Thirakku...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <h2 className="text-lg font-semibold text-gray-900">Authentication error</h2>
            <p className="text-sm text-rose-600">{errorMsg || 'Failed to authenticate.'}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
