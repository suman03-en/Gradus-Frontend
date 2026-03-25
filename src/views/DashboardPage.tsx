import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { apiJson } from '../lib/api'
import type { Task, Classroom, TaskRecord } from '../lib/types'

export function DashboardPage() {
  const { user } = useAuth()
  const isStudent = !!(user?.profile && 'roll_no' in user.profile)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [deadlines, setDeadlines] = useState<Task[]>([])
  const [pendingEvals, setPendingEvals] = useState<{ task: Task; record: TaskRecord }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const cls = await apiJson<Classroom[]>('/api/v1/classrooms/')
      setClassrooms(cls)

      if (isStudent) {
        const allTasks: Task[] = []
        for (const c of cls) {
          try {
            const tasks = await apiJson<Task[]>(`/api/v1/classrooms/${c.id}/tasks/`)
            allTasks.push(...tasks)
          } catch (e) { /* ignore */ }
        }
        const upcoming = allTasks
          .filter((t) => new Date(t.end_date) > new Date())
          .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
          .slice(0, 3)
        setDeadlines(upcoming)
      } else {
        const pending: { task: Task; record: TaskRecord }[] = []
        for (const c of cls) {
          try {
            const tasks = await apiJson<Task[]>(`/api/v1/classrooms/${c.id}/tasks/`)
            for (const t of tasks) {
              const records = await apiJson<TaskRecord[]>(`/api/v1/tasks/${t.id}/submit/`)
              for (const r of records) {
                if (!r.is_evaluated) {
                  pending.push({ task: t, record: r })
                }
              }
            }
          } catch (e) { /* ignore */ }
        }
        setPendingEvals(pending.slice(0, 5))
      }
    } catch (e) {
      console.error('Dashboard load error', e)
    } finally {
      setLoading(false)
    }
  }, [isStudent])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const highlightedCount = isStudent ? deadlines.length : pendingEvals.length

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-teal-700/15 bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-700 p-6 text-white shadow-sm sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-12 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-10 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">Dashboard Overview</div>
          <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Welcome back, {user?.first_name || user?.username}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-teal-50/95 sm:text-base">
            You currently have {classrooms.length} active classroom{classrooms.length !== 1 ? 's' : ''} and {highlightedCount}{' '}
            {isStudent ? 'upcoming deadline' : 'pending review'}{highlightedCount !== 1 ? 's' : ''} in focus.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/classrooms" className="btn bg-white px-4 py-2.5 text-teal-800 hover:bg-teal-50">
              View Classrooms
            </Link>
            <Link to="/profile" className="btn border border-white/35 bg-white/10 px-4 py-2.5 text-white hover:bg-white/20">
              Open Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active Classrooms</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{classrooms.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {isStudent ? 'Upcoming Deadlines' : 'Pending Reviews'}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{highlightedCount}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Role</div>
          <div className="mt-3">
            <span className={isStudent ? 'badge-brand' : 'badge-green'}>{isStudent ? 'Student' : 'Teacher'}</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Updates</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">0</div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {isStudent ? 'Upcoming Deadlines' : 'Pending Reviews'}
            </h2>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority Queue</div>
          </div>

          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : isStudent ? (
                deadlines.length > 0 ? (
                  deadlines.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tasks/${t.id}`}
                      className="stagger-in flex flex-col items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{t.name}</div>
                        <div className="mt-1 text-xs text-slate-500">Due: {new Date(t.end_date).toLocaleDateString()}</div>
                      </div>
                      <span className="badge-amber">Upcoming</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">No upcoming deadlines. Great job!</div>
                )
              ) : pendingEvals.length > 0 ? (
                pendingEvals.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/tasks/${item.task.id}`}
                    className="stagger-in flex flex-col items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {item.record.student_username || item.record.student} — {item.task.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Submitted: {new Date(item.record.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge-brand">Needs Review</span>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-10 text-center text-sm text-slate-500">All submissions evaluated!</div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">Your Profile</h3>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-900">@{user?.username}</div>
                <div className="text-xs text-slate-500">{isStudent ? 'Student Account' : 'Teacher Account'}</div>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/profile" className="btn-primary w-full">View Profile</Link>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">Classroom Snapshot</h3>
              <Link to="/classrooms" className="text-xs font-semibold text-brand-700 hover:underline">View all</Link>
            </div>

            {loading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : classrooms.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {classrooms.slice(0, 3).map((c) => (
                  <li key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="truncate text-sm font-medium text-slate-800">{c.name}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 text-sm text-slate-500">No classrooms available yet.</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
