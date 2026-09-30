'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setErrorMsg(error.message)
          return
        }

        if (data.session) {
          setStatus('success')
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 800)
        } else {
          // Listen for token exchange
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                setStatus('success')
                authListener.subscription.unsubscribe()
                setTimeout(() => {
                  router.push('/')
                  router.refresh()
                }, 800)
              }
            }
          )
        }
      } catch (err: unknown) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-100">
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Verifying session...</h2>
            <p className="text-sm text-gray-500">
              Please wait while we complete your authentication.
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
