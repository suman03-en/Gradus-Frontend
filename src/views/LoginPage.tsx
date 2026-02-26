import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ApiError } from '../lib/api'
import { useAuth } from '../state/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = useMemo(() => (location.state as any)?.from ?? '/dashboard', [location.state])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const e = err as ApiError
      setError(e.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          Session-based auth
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          CSRF protected
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Sign in to manage classrooms and track internal marks.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Login</h2>
        <p className="mt-1 text-sm text-slate-600">Use your username and password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Username</label>
            <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
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
