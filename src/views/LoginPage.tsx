import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ApiError } from '../lib/api'
import { useAuth } from '../state/auth'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = useMemo(() => (location.state as any)?.from ?? '/dashboard', [location.state])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)

    // Client-side required validation
    const clientErrors: FieldErrors = {}
    if (!username.trim()) clientErrors.username = ['Username is required.']
    if (!password) clientErrors.password = ['Password is required.']
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors)
      return
    }

    setBusy(true)
    try {
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const e = err as ApiError
      setFieldErrors(getFieldErrors(err))
      setError(e.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[1.05fr_1fr] md:items-stretch">
      <div className="card-premium surface-rise flex flex-col justify-between gap-6 p-7 md:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
            Secure Access
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Token Auth
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Welcome Back to Gradus</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-700">
            Continue from where you left off. Track deadlines, evaluate records, and monitor gradebook updates in one place.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-brand-100 bg-white/70 p-4 text-sm text-slate-700">Component-aware gradebook tracking for theory and lab.</div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700">Role-based dashboards for teachers and students.</div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-slate-700">Export-ready reports aligned with classroom records.</div>
        </div>
      </div>

      <div className="card surface-rise p-6 md:p-7">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Sign In</h2>
        <p className="mt-1 text-sm text-slate-600">Use your username and password to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Username</label>
            <input
              className="input mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            {firstFieldError(fieldErrors, 'username') && (
              <div className="mt-1 text-xs font-medium text-red-600">
                {firstFieldError(fieldErrors, 'username')}
              </div>
            )}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {firstFieldError(fieldErrors, 'password') && (
              <div className="mt-1 text-xs font-medium text-red-600">
                {firstFieldError(fieldErrors, 'password')}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <Link className="font-semibold text-brand-700 hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
          <span>
            New here?{' '}
            <Link className="font-semibold text-brand-700 hover:underline" to="/register">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
