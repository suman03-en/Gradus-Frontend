import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await apiJson<{ detail: string }>('/api/v1/accounts/password-reset/request/', {
        method: 'POST',
        body: { email: email.trim() },
      })
      setSuccess(true)
      // Navigate to OTP verification page with email in state
      setTimeout(() => navigate('/verify-otp', { state: { email: email.trim() } }), 1500)
    } catch (err: any) {
      // The backend always returns success message for security,
      // but we handle network errors here
      setError(err?.message ?? 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          Step 1 of 3
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          Password Reset
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Forgot your password?</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Enter your email address and we'll send you an OTP code to reset your password.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Request Reset Code</h2>
        <p className="mt-1 text-sm text-slate-600">We'll send a 5-digit OTP to your email.</p>

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="font-semibold">OTP sent!</div>
            <div className="mt-1">If an account exists with this email, a reset code has been sent. Redirecting…</div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Email address</label>
              <input
                className="input mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="your@email.com"
              />
            </div>

            {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <button className="btn-primary w-full" disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
