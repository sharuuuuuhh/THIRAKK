'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setMessage(t('resetLinkSent'))
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <section className="transit-card p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900">{t('resetPassword')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('resetPasswordHelp')}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-gray-800">{t('emailAddress')}</label>
            <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200" />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="text-sm text-green-800">{message}</p>}
          <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t('sendingLink') : t('sendResetLink')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600"><Link href="/auth/login" className="underline underline-offset-2">{t('backToSignIn')}</Link></p>
      </section>
    </main>
  )
}
