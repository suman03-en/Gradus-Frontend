import { useEffect, useMemo, useState } from 'react'
import { apiJson } from '../lib/api'
import type { User } from '../lib/types'
import { useAuth } from '../state/auth'
import { DEPARTMENT_CHOICES, DESIGNATION_CHOICES, SECTION_CHOICES, SEMESTER_CHOICES } from '../lib/choices'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'

export function ProfilePage() {
  const { user, refresh } = useAuth()
  const isStudent = useMemo(() => !!(user?.profile && 'roll_no' in user.profile), [user])

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [basicErrors, setBasicErrors] = useState<FieldErrors | null>(null)
  const [profileErrors, setProfileErrors] = useState<FieldErrors | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [basic, setBasic] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
  })

  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    setBasic({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', email: user?.email ?? '' })
    setProfile(user?.profile ?? {})
  }, [user])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setErr(null)
    setBasicErrors(null)
    setProfileErrors(null)
    setBusy(true)
    try {
      try {
        await apiJson<User>('/api/v1/accounts/users/me', { method: 'PATCH', body: basic })
      } catch (e: any) {
        setBasicErrors(getFieldErrors(e))
        throw e
      }
      try {
        await apiJson('/api/v1/accounts/profile/me', { method: 'PATCH', body: profile })
      } catch (e: any) {
        setProfileErrors(getFieldErrors(e))
        throw e
      }
      await refresh()
      setMsg('Profile updated.')
      setIsEditing(false)
    } catch (e: any) {
      setErr(e?.message ?? 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your Gradus account</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="text-sm font-semibold text-slate-900">{isEditing ? 'Editing Profile' : 'Current Profile'}</div>
        {!isEditing && (
          <button className="btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
                Account Info
              </div>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</div>
                  <div className="text-lg font-bold text-slate-900">{user?.first_name} {user?.last_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username</div>
                  <div className="text-lg font-bold text-slate-900">@{user?.username}</div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</div>
                  <div className="text-lg font-bold text-slate-900">{user?.email}</div>
                </div>
              </div>
            </section>

            <section className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
                {isStudent ? 'Student Details' : 'Teacher Details'}
              </div>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {isStudent ? (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Roll Number</div>
                      <div className="text-base font-semibold text-slate-900">{(user?.profile as any)?.roll_no || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</div>
                      <div className="text-base font-semibold text-slate-900">{DEPARTMENT_CHOICES.find(c => c.value === (user?.profile as any)?.department)?.label || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Semester</div>
                      <div className="text-base font-semibold text-slate-900">{SEMESTER_CHOICES.find(c => String(c.value) === String((user?.profile as any)?.current_semester))?.label || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Batch Year</div>
                      <div className="text-base font-semibold text-slate-900">{(user?.profile as any)?.batch_year || '—'}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Designation</div>
                      <div className="text-base font-semibold text-slate-900">{DESIGNATION_CHOICES.find(c => c.value === (user?.profile as any)?.designation)?.label || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</div>
                      <div className="text-base font-semibold text-slate-900">{DEPARTMENT_CHOICES.find(c => c.value === (user?.profile as any)?.department)?.label || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</div>
                      <div className="text-base font-semibold text-slate-900">{(user?.profile as any)?.phone_number || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Employment</div>
                      <div className="mt-1">
                        <span className={`badge ${(user?.profile as any)?.is_full_time ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {(user?.profile as any)?.is_full_time ? 'Full Time' : 'Part Time'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          <aside>
            <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
              <div className="text-xs font-medium uppercase tracking-wider text-brand-200 mb-4">Role</div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white text-brand-700 grid place-items-center text-xl font-bold">
                  {isStudent ? 'S' : 'T'}
                </div>
                <div>
                  <div className="font-bold text-white text-base">{isStudent ? 'Student' : 'Teacher'}</div>
                  <div className="text-xs text-brand-200 mt-0.5">Gradus Account</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <form className="mx-auto max-w-3xl card p-8 space-y-8" onSubmit={onSave}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
            <button type="button" className="text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>

          <section className="space-y-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Info</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">First Name</label>
                <input className="input" placeholder="e.g. John" value={basic.first_name} onChange={(e) => setBasic((b) => ({ ...b, first_name: e.target.value }))} />
                {firstFieldError(basicErrors, 'first_name') ? (
                  <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'first_name')}</div>
                ) : null}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="e.g. Doe" value={basic.last_name} onChange={(e) => setBasic((b) => ({ ...b, last_name: e.target.value }))} />
                {firstFieldError(basicErrors, 'last_name') ? (
                  <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'last_name')}</div>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email</label>
                <input className="input" placeholder="email@example.com" value={basic.email} onChange={(e) => setBasic((b) => ({ ...b, email: e.target.value }))} />
                {firstFieldError(basicErrors, 'email') ? (
                  <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'email')}</div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{isStudent ? 'Student Details' : 'Teacher Details'}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              {isStudent ? (
                <>
                  <div className="sm:col-span-2">
                    <label className="label">Roll Number</label>
                    <input className="input" value={profile.roll_no ?? ''} onChange={(e) => setProfile((p: any) => ({ ...p, roll_no: e.target.value }))} />
                    {firstFieldError(profileErrors, 'roll_no') ? (
                      <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'roll_no')}</div>
                    ) : null}
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <select
                      className="input"
                      value={profile.department ?? ''}
                      onChange={(e) => setProfile((p: any) => ({ ...p, department: e.target.value }))}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENT_CHOICES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Semester</label>
                    <select
                      className="input"
                      value={profile.current_semester ?? ''}
                      onChange={(e) => setProfile((p: any) => ({ ...p, current_semester: Number(e.target.value) }))}
                    >
                      <option value="">Select semester</option>
                      {SEMESTER_CHOICES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="label">Department</label>
                    <select
                      className="input"
                      value={profile.department ?? ''}
                      onChange={(e) => setProfile((p: any) => ({ ...p, department: e.target.value }))}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENT_CHOICES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={profile.phone_number ?? ''} onChange={(e) => setProfile((p: any) => ({ ...p, phone_number: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Designation</label>
                    <select
                      className="input"
                      value={profile.designation ?? ''}
                      onChange={(e) => setProfile((p: any) => ({ ...p, designation: e.target.value }))}
                    >
                      <option value="">Select designation</option>
                      {DESIGNATION_CHOICES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </section>

          {msg ? <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium text-center border border-emerald-100">{msg}</div> : null}
          {err ? <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium text-center border border-red-100">{err}</div> : null}

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100">
            <div className="text-xs text-slate-400">Changes apply immediately across the system.</div>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn-primary px-8" disabled={busy}>
                {busy ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
