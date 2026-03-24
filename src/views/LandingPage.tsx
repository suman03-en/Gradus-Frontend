import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

const highlights = [
  {
    title: 'Component-Wise Marking',
    description: 'Track theory and lab marks separately with clear filters and reporting.',
  },
  {
    title: 'Classroom Workflow',
    description: 'Create classrooms, add students by roll number, and manage tasks from one place.',
  },
  {
    title: 'Export Ready',
    description: 'Generate clean mark sheets to share with departments in a standardized format.',
  },
]

export function LandingPage() {
  const { user } = useAuth()

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="card-premium surface-rise p-7 md:p-10">
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div className="stagger-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Internal Mark Evaluation Platform
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Professional Internal
              <span className="mt-2 block text-brand-700">Mark Management for Campuses</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
              Manage classrooms, evaluate submissions, configure theory and lab weightage,
              and export clean grade reports through one consistent workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary">
                Start From Login
              </Link>
              <Link to="/register" className="btn-secondary">
                Create New Account
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">For Teachers</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">Design tasks, evaluate records, and control component-wise weightages.</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">For Students</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">Join classrooms, submit work, and monitor grade progress in real time.</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">For Coordination</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">Download clean component-based sheets for departmental consolidation.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="card stagger-in p-6">
            <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
