import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as any
  const passedEmail = state?.email ?? ''
  const passedToken = state?.reset_token ?? ''

  const [email, setEmail] = useState(passedEmail)
  const [resetToken, setResetToken] = useState(passedToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      await apiJson<{ detail: string }>('/api/v1/accounts/password-reset/confirm/', {
        method: 'POST',
        body: { email: email.trim(), reset_token: resetToken.trim(), new_password: newPassword },
      })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err: any) {
      setError(err?.message ?? 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          Step 3 of 3
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          New Password
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Set new password</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Your OTP was verified. Choose a strong new password for your account.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Create New Password</h2>
        <p className="mt-1 text-sm text-slate-600">Enter your new password below.</p>

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="font-semibold">Password reset successful!</div>
            <div className="mt-1">Your password has been changed. Redirecting to login…</div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {!passedEmail && (
              <div>
                <label className="label">Email</label>
                <input
                  className="input mt-1"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}
            {!passedToken && (
              <div>
                <label className="label">Reset Token</label>
                <input
                  className="input mt-1"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="5-digit reset token"
                />
              </div>
            )}

            <div>
              <label className="label">New password</label>
              <input
                className="input mt-1"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                className="input mt-1"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <button className="btn-primary w-full" disabled={busy || !newPassword || !confirmPassword}>
              {busy ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          <Link className="font-semibold text-brand-700 hover:underline" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
