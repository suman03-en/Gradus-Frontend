import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    is_student: true,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors(null)

    // Client-side validation (fast feedback, avoids avoidable API calls)
    const clientErrors: FieldErrors = {}
    if (!form.first_name.trim()) clientErrors.first_name = ['First name is required.']
    if (!form.last_name.trim()) clientErrors.last_name = ['Last name is required.']
    if (!form.username.trim()) clientErrors.username = ['Username is required.']
    if (!form.email.trim()) clientErrors.email = ['Email is required.']
    if (!form.password) clientErrors.password = ['Password is required.']
    if (!form.confirm_password) clientErrors.confirm_password = ['Confirm password is required.']
    if (form.password && form.confirm_password && form.password !== form.confirm_password) {
      clientErrors.confirm_password = ['Passwords do not match.']
    }
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors)
      setError('Please fix the highlighted fields.')
      return
    }

    setBusy(true)
    try {
      await apiJson('/api/v1/accounts/register/', {
        method: 'POST',
        body: {
          username: form.username.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          confirm_password: form.confirm_password,
          is_student: form.is_student,
        },
      })
      navigate('/login', { replace: true })
    } catch (err: any) {
      setFieldErrors(getFieldErrors(err))
      setError(err?.message ?? 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Register as a student or teacher.</p>
      </div>

      <div className="card p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">First name</label>
              <input className="input mt-1" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
              {firstFieldError(fieldErrors, 'first_name') ? (
                <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'first_name')}</div>
              ) : null}
            </div>
            <div>
              <label className="label">Last name</label>
              <input className="input mt-1" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              {firstFieldError(fieldErrors, 'last_name') ? (
                <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'last_name')}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="label">Username</label>
            <input className="input mt-1" value={form.username} onChange={(e) => set('username', e.target.value)} autoComplete="username" />
            {firstFieldError(fieldErrors, 'username') ? (
              <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'username')}</div>
            ) : null}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            {firstFieldError(fieldErrors, 'email') ? (
              <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'email')}</div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Password</label>
              <input className="input mt-1" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
              {firstFieldError(fieldErrors, 'password') ? (
                <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'password')}</div>
              ) : null}
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                className="input mt-1"
                type="password"
                value={form.confirm_password}
                onChange={(e) => set('confirm_password', e.target.value)}
                autoComplete="new-password"
              />
              {firstFieldError(fieldErrors, 'confirm_password') ? (
                <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(fieldErrors, 'confirm_password')}</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">Role</div>
              <div className="text-xs text-slate-500">Select your account type.</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.is_student ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                onClick={() => set('is_student', true)}
              >
                Student
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!form.is_student ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                onClick={() => set('is_student', false)}
              >
                Teacher
              </button>
            </div>
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-medium text-brand-600 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
