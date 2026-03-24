import { useEffect, useMemo, useState } from 'react'
import { apiJson } from '../lib/api'
import type { User } from '../lib/types'
import { useAuth } from '../state/auth'
import { DEPARTMENT_CHOICES, DESIGNATION_CHOICES, SECTION_CHOICES, SEMESTER_CHOICES } from '../lib/choices'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'

function choiceLabel(choices: readonly { value: string | number; label: string }[], val: string | number | null | undefined) {
  if (val == null || val === '') return '—'
  const c = choices.find((item) => String(item.value) === String(val))
  return c?.label ?? String(val)
}

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

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || '—'
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || (isStudent ? 'S' : 'T')

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review and manage your account identity and institutional details.
        </p>
      </header>

      {!isEditing ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="card p-6 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-700 text-2xl font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">{fullName}</h2>
                    <div className="mt-0.5 truncate text-sm text-slate-500">@{user?.username}</div>
                    <div className="mt-0.5 truncate text-sm text-slate-500">{user?.email || '—'}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={isStudent ? 'badge-brand' : 'badge-green'}>
                        {isStudent ? 'Student' : 'Teacher'}
                      </span>
                      {!isStudent && (
                        <span className={`badge ${(user?.profile as any)?.is_full_time ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {(user?.profile as any)?.is_full_time ? 'Full Time' : 'Part Time'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            </section>

            <aside className="rounded-2xl border border-teal-700/20 bg-gradient-to-br from-teal-700 to-emerald-700 p-6 text-white shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">Institutional Role</div>
              <div className="mt-2 text-3xl font-black leading-tight">{isStudent ? 'Student' : 'Faculty'}</div>
              <div className="mt-4 text-sm text-teal-50/90">
                {isStudent
                  ? choiceLabel(SEMESTER_CHOICES, (user?.profile as any)?.current_semester)
                  : choiceLabel(DESIGNATION_CHOICES, (user?.profile as any)?.designation)}
              </div>
              <div className="mt-1 text-sm text-teal-50/80">
                {choiceLabel(DEPARTMENT_CHOICES, (user?.profile as any)?.department)}
              </div>
            </aside>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Account Information</div>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full Name</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Academic Username</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">@{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Primary Email</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{user?.email || '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="card p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                {isStudent ? 'Student Details' : 'Teacher Details'}
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                {isStudent ? (
                  <>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Roll Number</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">{(user?.profile as any)?.roll_no || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Department</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {choiceLabel(DEPARTMENT_CHOICES, (user?.profile as any)?.department)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Semester</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {choiceLabel(SEMESTER_CHOICES, (user?.profile as any)?.current_semester)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Batch Year</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">{(user?.profile as any)?.batch_year || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Section</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {choiceLabel(SECTION_CHOICES, (user?.profile as any)?.section)}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Designation</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {choiceLabel(DESIGNATION_CHOICES, (user?.profile as any)?.designation)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Employment</dt>
                      <dd className="mt-1">
                        <span className={`badge ${(user?.profile as any)?.is_full_time ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {(user?.profile as any)?.is_full_time ? 'Full Time' : 'Part Time'}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Department</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {choiceLabel(DEPARTMENT_CHOICES, (user?.profile as any)?.department)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Contact Phone</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">{(user?.profile as any)?.phone_number || '—'}</dd>
                    </div>
                  </>
                )}
              </dl>
            </section>
          </div>

          {msg ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{msg}</div> : null}
          {err ? <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</div> : null}
        </>
      ) : (
        <form className="space-y-4" onSubmit={onSave}>
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                <p className="mt-1 text-sm text-slate-500">Update your account and profile information.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card p-6 space-y-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Account Information</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">First Name</label>
                  <input
                    className="input"
                    placeholder="e.g. John"
                    value={basic.first_name}
                    onChange={(e) => setBasic((b) => ({ ...b, first_name: e.target.value }))}
                  />
                  {firstFieldError(basicErrors, 'first_name') ? (
                    <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'first_name')}</div>
                  ) : null}
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Doe"
                    value={basic.last_name}
                    onChange={(e) => setBasic((b) => ({ ...b, last_name: e.target.value }))}
                  />
                  {firstFieldError(basicErrors, 'last_name') ? (
                    <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'last_name')}</div>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    placeholder="email@example.com"
                    value={basic.email}
                    onChange={(e) => setBasic((b) => ({ ...b, email: e.target.value }))}
                  />
                  {firstFieldError(basicErrors, 'email') ? (
                    <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(basicErrors, 'email')}</div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="card p-6 space-y-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">{isStudent ? 'Student Details' : 'Teacher Details'}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {isStudent ? (
                  <>
                    <div className="sm:col-span-2">
                      <label className="label">Roll Number</label>
                      <input
                        className="input"
                        value={profile.roll_no ?? ''}
                        onChange={(e) => setProfile((p: any) => ({ ...p, roll_no: e.target.value.toUpperCase() }))}
                      />
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
                    <div>
                      <label className="label">Batch Year</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="e.g. 2021"
                        value={profile.batch_year ?? ''}
                        onChange={(e) => setProfile((p: any) => ({ ...p, batch_year: e.target.value ? Number(e.target.value) : null }))}
                      />
                      {firstFieldError(profileErrors, 'batch_year') ? (
                        <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'batch_year')}</div>
                      ) : null}
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
                      {firstFieldError(profileErrors, 'department') ? (
                        <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'department')}</div>
                      ) : null}
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        className="input"
                        value={profile.phone_number ?? ''}
                        onChange={(e) => setProfile((p: any) => ({ ...p, phone_number: e.target.value }))}
                      />
                      {firstFieldError(profileErrors, 'phone_number') ? (
                        <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'phone_number')}</div>
                      ) : null}
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
                      {firstFieldError(profileErrors, 'designation') ? (
                        <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'designation')}</div>
                      ) : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Employment Type</label>
                      <select
                        className="input"
                        value={profile.is_full_time === true ? 'true' : profile.is_full_time === false ? 'false' : ''}
                        onChange={(e) => setProfile((p: any) => ({ ...p, is_full_time: e.target.value === 'true' }))}
                      >
                        <option value="">Select type</option>
                        <option value="true">Full-Time</option>
                        <option value="false">Part-Time</option>
                      </select>
                      {firstFieldError(profileErrors, 'is_full_time') ? (
                        <div className="mt-1 text-xs font-medium text-red-600">{firstFieldError(profileErrors, 'is_full_time')}</div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {msg ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{msg}</div> : null}
          {err ? <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</div> : null}

          <div className="card p-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">Changes apply immediately across the system.</div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-primary px-8" disabled={busy}>
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
