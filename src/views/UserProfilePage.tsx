import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiJson } from '../lib/api'
import type { User } from '../lib/types'
import { DEPARTMENT_CHOICES, DESIGNATION_CHOICES, SECTION_CHOICES, SEMESTER_CHOICES } from '../lib/choices'

function choiceLabel(choices: readonly { value: string | number; label: string }[], val: string | number | null | undefined) {
  if (val == null || val === '') return '—'
  const c = choices.find((c) => String(c.value) === String(val))
  return c?.label ?? String(val)
}

export function UserProfilePage() {
  const { username } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const data = await apiJson<User>(`/api/v1/accounts/users/${username}`)
        setUser(data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load user profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [username])

  const isStudent = !!(user?.profile && 'roll_no' in user.profile)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link className="text-sm font-medium text-brand-600 hover:underline" to="/dashboard">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
      </div>

      {loading ? (
        <div className="card p-6">
          <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : user ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* User info */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <span className="text-2xl font-bold uppercase">{user.first_name[0]}{user.last_name[0]}</span>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-slate-500">@{user.username}</div>
                <div className="mt-0.5 text-sm text-slate-400">{user.email || '—'}</div>
              </div>
            </div>
          </div>

          {/* Role badge */}
          <aside className="card p-6">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Role</div>
            <div className="mt-2">
              <span className={isStudent ? 'badge-brand' : 'badge-green'}>
                {isStudent ? 'Student' : 'Teacher'}
              </span>
            </div>
          </aside>

          {/* Profile detail */}
          <div className="card p-6 lg:col-span-3">
            <div className="text-sm font-semibold text-slate-900 mb-4">{isStudent ? 'Student Details' : 'Teacher Details'}</div>
            {isStudent && user.profile && 'roll_no' in user.profile ? (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Roll No</dt>
                  <dd className="mt-1 font-medium text-slate-900">{user.profile.roll_no || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Department</dt>
                  <dd className="mt-1 font-medium text-slate-900">{choiceLabel(DEPARTMENT_CHOICES, user.profile.department)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Semester</dt>
                  <dd className="mt-1 font-medium text-slate-900">{choiceLabel(SEMESTER_CHOICES, user.profile.current_semester)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Batch Year</dt>
                  <dd className="mt-1 font-medium text-slate-900">{user.profile.batch_year ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Section</dt>
                  <dd className="mt-1 font-medium text-slate-900">{choiceLabel(SECTION_CHOICES, user.profile.section)}</dd>
                </div>
              </dl>
            ) : user.profile && 'designation' in user.profile ? (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Department</dt>
                  <dd className="mt-1 font-medium text-slate-900">{choiceLabel(DEPARTMENT_CHOICES, user.profile.department)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Designation</dt>
                  <dd className="mt-1 font-medium text-slate-900">{choiceLabel(DESIGNATION_CHOICES, user.profile.designation)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="mt-1 font-medium text-slate-900">{user.profile.phone_number || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Employment</dt>
                  <dd className="mt-1 font-medium text-slate-900">{user.profile.is_full_time ? 'Full-time' : 'Part-time'}</dd>
                </div>
              </dl>
            ) : (
              <div className="text-sm text-slate-500">No profile details available.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
