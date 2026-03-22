import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'

export function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedEmail = (location.state as any)?.email ?? ''

  const [email, setEmail] = useState(passedEmail)
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)

    const clientErrors: FieldErrors = {}
    if (!email.trim()) clientErrors.email = ['Email address is required.']
    if (otp.length < 5) clientErrors.otp = ['Please enter the full 5-digit OTP.']
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors)
      return
    }

    setBusy(true)
    try {
      const res = await apiJson<{ message: string; reset_token: string }>(
        '/api/v1/accounts/password-reset/verify/',
        {
          method: 'POST',
          body: { email: email.trim(), otp: otp.trim() },
        },
      )
      // Navigate to reset password page with email and reset_token
      navigate('/reset-password', {
        state: { email: email.trim(), reset_token: res.reset_token },
        replace: true,
      })
    } catch (err: any) {
      setFieldErrors(getFieldErrors(err))
      setError(err?.message ?? 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          Step 2 of 3
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          Verify OTP
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Enter your OTP</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Check your email for a 5-digit code and enter it below. The code expires in 10 minutes.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Verify Code</h2>
        <p className="mt-1 text-sm text-slate-600">Enter the OTP sent to your email.</p>

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
            {firstFieldError(fieldErrors, 'email') && (
              <div className="mt-1 text-xs font-medium text-red-600">
                {firstFieldError(fieldErrors, 'email')}
              </div>
            )}
          </div>
          <div>
            <label className="label">OTP Code</label>
            <input
              className="input mt-1 text-center text-2xl font-bold tracking-[0.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              placeholder="•••••"
              autoFocus
            />
            {firstFieldError(fieldErrors, 'otp') && (
              <div className="mt-1 text-xs font-medium text-red-600">
                {firstFieldError(fieldErrors, 'otp')}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Didn't receive a code?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/forgot-password">
            Request again
          </Link>
        </div>
      </div>
    </div>
  )
}
