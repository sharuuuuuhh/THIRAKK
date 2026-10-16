'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword, signOut, user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError(t('passwordsDoNotMatch'))
      return
    }
    setLoading(true)
    const result = await updatePassword(password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    await signOut()
    router.replace('/auth/login?password-reset=success')
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <section className="transit-card p-6 sm:p-8">
        {authLoading ? (
          <p role="status" className="text-sm text-gray-600">{t('loadingAccount')}</p>
        ) : !user ? (
          <>
            <h1 className="text-xl font-semibold text-gray-900">{t('resetPassword')}</h1>
            <p role="alert" className="mt-3 text-sm text-gray-600">{t('resetLinkExpired')}</p>
            <Link href="/auth/forgot-password" className="btn-primary mt-6 flex min-h-12 w-full items-center justify-center">
              {t('requestAnotherResetLink')}
            </Link>
          </>
        ) : (
          <>
        <h1 className="text-xl font-semibold text-gray-900">{t('chooseNewPassword')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('newPasswordHelp')}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-800">{t('newPassword')}</label>
            <input id="new-password" name="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-800">{t('confirmNewPassword')}</label>
            <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200" />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t('updatingPassword') : t('updatePassword')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600"><Link href="/auth/login" className="underline underline-offset-2">{t('backToSignIn')}</Link></p>
          </>
        )}
      </section>
    </main>
  )
}
