import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth-context'

export function LoginPage() {
  const { t } = useTranslation()
  const { lang } = useParams()
  const navigate = useNavigate()
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const language = lang ?? 'en'

  if (loading) return null
  if (session) return <Navigate to={`/${language}/admin`} replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const message = await signIn(email, password)
    setSubmitting(false)
    if (message) {
      setError(t('invalidCredentials'))
      return
    }
    void navigate(`/${language}/admin`)
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <form onSubmit={(event) => void onSubmit(event)} className="flex w-full max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-green-800">
          {t('email')}
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-blue-800 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-green-800">
          {t('password')}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-blue-800 px-3 py-2"
          />
        </label>
        {error ? <p className="text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gradient-to-r from-blue-800 to-blue-500 px-3 py-2 text-white disabled:opacity-60"
        >
          {t('signIn')}
        </button>
      </form>
    </main>
  )
}
