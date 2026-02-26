import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { apiJson } from '../lib/api'
import type { Task, Classroom, TaskSubmission } from '../lib/types'

export function DashboardPage() {
  const { user } = useAuth()
  const isStudent = !!(user?.profile && 'roll_no' in user.profile)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [deadlines, setDeadlines] = useState<Task[]>([])
  const [pendingEvals, setPendingEvals] = useState<{ task: Task; submission: TaskSubmission }[]>([])
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
        const pending: { task: Task; submission: TaskSubmission }[] = []
        for (const c of cls) {
          try {
            const tasks = await apiJson<Task[]>(`/api/v1/classrooms/${c.id}/tasks/`)
            for (const t of tasks) {
              const subs = await apiJson<TaskSubmission[]>(`/api/v1/tasks/${t.id}/submit/`)
              for (const s of subs) {
                try {
                  await apiJson(`/api/v1/tasks/submissions/${s.id}/`)
                } catch {
                  pending.push({ task: t, submission: s })
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-10 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.first_name || user?.username}!</h1>
          <p className="mt-2 text-brand-200 text-sm">You have {classrooms.length} active classroom{classrooms.length !== 1 ? 's' : ''}.</p>
          <div className="mt-6">
            <Link to="/classrooms" className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-sm">
              View Classrooms
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Important Section */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {isStudent ? 'Upcoming Deadlines' : 'Pending Reviews'}
            </h2>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="card h-28 animate-pulse bg-slate-100" />
                ))}
              </div>
            ) : isStudent ? (
              <div className="grid gap-3">
                {deadlines.length > 0 ? (
                  deadlines.map((t) => (
                    <Link key={t.id} to={`/tasks/${t.id}`} className="card flex items-center justify-between p-5 group hover:border-brand-200">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {t.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Due: {new Date(t.end_date).toLocaleDateString()}</div>
                      </div>
                      <span className="badge-amber">Upcoming</span>
                    </Link>
                  ))
                ) : (
                  <div className="card p-8 text-center text-slate-500 text-sm">No upcoming deadlines. Great job!</div>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {pendingEvals.length > 0 ? (
                  pendingEvals.map((item, idx) => (
                    <Link key={idx} to={`/tasks/${item.task.id}`} className="card flex items-center justify-between p-5 group hover:border-brand-200">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {item.submission.student} — {item.task.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Submitted: {new Date(item.submission.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge-brand">Needs Review</span>
                    </Link>
                  ))
                ) : (
                  <div className="card p-8 text-center text-slate-500 text-sm">All submissions evaluated!</div>
                )}
              </div>
            )}
          </section>

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Classrooms</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">{classrooms.length}</div>
            </div>
            <div className="card p-5 border-l-2 border-l-emerald-400">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isStudent ? 'GPA Estimate' : 'Performance'}</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">{isStudent ? '3.8' : '92%'}</div>
            </div>
            <div className="card p-5 border-l-2 border-l-amber-400">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Updates</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">0</div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900">Your Profile</h3>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-600 text-white grid place-items-center font-bold text-lg">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-slate-900">@{user?.username}</div>
                <div className="text-xs text-slate-500">{isStudent ? 'Student' : 'Teacher'}</div>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/profile" className="btn-primary w-full">View Profile</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
