import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiJson } from '../lib/api'
import type { Classroom, Task } from '../lib/types'
import { useAuth } from '../state/auth'
import { TASK_STATUS_CHOICES, TASK_MODE_CHOICES, TASK_TYPE_CHOICES } from '../lib/choices'

function statusBadge(status: string) {
  if (status === 'published') return 'badge-green'
  if (status === 'draft') return 'badge-amber'
  return 'badge-slate'
}

function choiceLabel(choices: readonly { value: string; label: string }[], val: string) {
  return choices.find((c) => c.value === val)?.label ?? val
}

export function ClassroomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isStudent = useMemo(() => !!(user?.profile && 'roll_no' in user.profile), [user])

  const [item, setItem] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit Classroom
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [editMsg, setEditMsg] = useState<string | null>(null)

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  // Add student form (teacher only)
  const [rollNo, setRollNo] = useState('')
  const [addStudentMsg, setAddStudentMsg] = useState<string | null>(null)

  // Create task form (teacher only)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    end_date: '',
    full_marks: '',
    status: 'published',
    mode: 'online',
    task_type: 'assignment',
  })
  const [createTaskMsg, setCreateTaskMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const data = await apiJson<Classroom>(`/api/v1/classrooms/${id}/`)
        setItem(data)
        setEditForm({ name: data.name, description: data.description })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load classroom')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true)
    try {
      const data = await apiJson<Task[]>(`/api/v1/classrooms/${id}/tasks/`)
      setTasks(data)
    } catch {
      // could be empty or error
    } finally {
      setTasksLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ─── Add Student ───────────────────────────────────────────
  async function onAddStudent(e: React.FormEvent) {
    e.preventDefault()
    setAddStudentMsg(null)
    try {
      const res = await apiJson<{ detail: string }>(`/api/v1/classrooms/${id}/students/`, {
        method: 'POST',
        body: { roll_no: rollNo.trim() },
      })
      setAddStudentMsg(res.detail)
      setRollNo('')
    } catch (err: any) {
      setAddStudentMsg(err?.message ?? 'Add student failed')
    }
  }

  // ─── Create Task ───────────────────────────────────────────
  async function onCreateTask(e: React.FormEvent) {
    e.preventDefault()
    setCreateTaskMsg(null)
    try {
      const created = await apiJson<Task>(`/api/v1/classrooms/${id}/tasks/`, {
        method: 'POST',
        body: {
          name: taskForm.name.trim(),
          description: taskForm.description.trim(),
          end_date: taskForm.end_date ? new Date(taskForm.end_date).toISOString() : undefined,
          full_marks: Number(taskForm.full_marks),
          status: taskForm.status,
          mode: taskForm.mode,
          task_type: taskForm.task_type,
        },
      })
      setCreateTaskMsg(`Created "${created.name}"`)
      setTaskForm({ name: '', description: '', end_date: '', full_marks: '', status: 'published', mode: 'online', task_type: 'assignment' })
      setShowCreateTask(false)
      await fetchTasks()
    } catch (err: any) {
      setCreateTaskMsg(err?.message ?? 'Create failed')
    }
  }

  // ─── Edit/Delete Classroom ────────────────────────────────
  async function onSaveClassroom(e: React.FormEvent) {
    e.preventDefault()
    setEditMsg(null)
    try {
      const updated = await apiJson<Classroom>(`/api/v1/classrooms/${id}/`, {
        method: 'PATCH',
        body: { name: editForm.name.trim(), description: editForm.description.trim() },
      })
      setItem(updated)
      setEditing(false)
      setEditMsg('Classroom updated.')
    } catch (err: any) {
      setEditMsg(err?.message ?? 'Update failed')
    }
  }

  async function onDeleteClassroom() {
    if (!confirm('Are you sure you want to delete this classroom? This cannot be undone.')) return
    try {
      await apiJson(`/api/v1/classrooms/${id}/`, { method: 'DELETE' })
      navigate('/classrooms')
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-brand-600 hover:underline" to="/classrooms">
            ← Back to Classrooms
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Classroom</h1>
        </div>
        {!isStudent ? (
          <div className="flex gap-2">
            <Link to={`/classrooms/${id}/gradebook`} className="btn-primary">
              Gradebook
            </Link>
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button className="btn-danger" onClick={onDeleteClassroom}>
              Delete
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to={`/classrooms/${id}/gradebook`} className="btn-primary">
              My Grades
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card p-6">
          <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : item ? (
        <>
          {/* ─── Classroom Info & Edit Form ─────────────── */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {editing ? (
                <form className="card p-6 space-y-4" onSubmit={onSaveClassroom}>
                  <div className="text-sm font-semibold text-slate-900">Edit Classroom</div>
                  <div>
                    <label className="label">Name</label>
                    <input className="input" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea className="textarea" value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  {editMsg && <div className="text-xs font-medium text-brand-600">{editMsg}</div>}
                  <button className="btn-primary">Save Changes</button>
                </form>
              ) : (
                <div className="card p-6 h-full">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name</div>
                      <div className="mt-1 text-xl font-bold text-slate-900">{item.name}</div>
                    </div>
                    <div className="rounded-xl bg-brand-50 border border-brand-100 px-5 py-3">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Invite Code</div>
                      <div className="mt-0.5 text-lg font-bold text-brand-700 tracking-widest">{item.invite_code}</div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</div>
                    <div className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</div>
                  </div>
                </div>
              )}
            </div>

            <aside className="card p-6">
              <div className="text-sm font-semibold text-slate-900">Details</div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Teacher</dt>
                  <dd className="font-medium text-slate-900">{item.created_by}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Students</dt>
                  <dd className="font-medium text-slate-900">{item.students?.length ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="font-medium text-slate-900">{new Date(item.created_at).toLocaleString()}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {/* ─── Add Student (Teacher Only) ────────── */}
          {!isStudent && (
            <div className="card p-6">
              <div className="text-sm font-semibold text-slate-900">Add Student</div>
              <p className="mt-1 text-sm text-slate-500">Add a student by their roll number (e.g. THA079BEI042).</p>
              <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onAddStudent}>
                <input
                  className="input flex-1"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Roll number"
                />
                <button className="btn-primary" disabled={!rollNo.trim()}>
                  Add Student
                </button>
              </form>
              {addStudentMsg ? (
                <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{addStudentMsg}</div>
              ) : null}
            </div>
          )}

          {/* ─── Tasks Section ─────────────────────── */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-slate-900">Tasks</div>
                <p className="text-sm text-slate-500">
                  {isStudent ? 'View and submit assignments.' : 'Manage classroom tasks.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" onClick={fetchTasks} disabled={tasksLoading}>
                  Refresh
                </button>
                {!isStudent && (
                  <button className="btn-primary text-xs" onClick={() => setShowCreateTask(!showCreateTask)}>
                    {showCreateTask ? 'Cancel' : '+ Create Task'}
                  </button>
                )}
              </div>
            </div>

            {/* Create Task Form */}
            {showCreateTask && !isStudent && (
              <div className="card p-6">
                <div className="text-sm font-semibold text-slate-900 mb-4">New Task</div>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={onCreateTask}>
                  <div className="sm:col-span-2">
                    <label className="label">Name</label>
                    <input className="input mt-1" value={taskForm.name} onChange={(e) => setTaskForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="textarea mt-1" rows={3} value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input className="input mt-1" type="datetime-local" value={taskForm.end_date} onChange={(e) => setTaskForm((f) => ({ ...f, end_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Full Marks</label>
                    <input className="input mt-1" type="number" min={0} value={taskForm.full_marks} onChange={(e) => setTaskForm((f) => ({ ...f, full_marks: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input mt-1" value={taskForm.status} onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}>
                      {TASK_STATUS_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Mode</label>
                    <select className="input mt-1" value={taskForm.mode} onChange={(e) => setTaskForm((f) => ({ ...f, mode: e.target.value }))}>
                      {TASK_MODE_CHOICES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="input mt-1" value={taskForm.task_type} onChange={(e) => setTaskForm((f) => ({ ...f, task_type: e.target.value }))}>
                      {TASK_TYPE_CHOICES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button className="btn-primary" disabled={!taskForm.name.trim() || !taskForm.full_marks || !taskForm.end_date}>
                      Create Task
                    </button>
                  </div>
                </form>
                {createTaskMsg ? (
                  <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{createTaskMsg}</div>
                ) : null}
              </div>
            )}

            {/* Tasks Grid */}
            {tasksLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="card p-6">
                <div className="text-sm font-medium text-slate-900">No tasks yet</div>
                <div className="mt-1 text-sm text-slate-500">
                  {isStudent ? 'No tasks have been assigned yet.' : 'Create your first task above.'}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((t) => (
                  <Link key={t.id} to={`/tasks/${t.id}`} className="card p-5 hover:border-brand-200 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{t.name}</div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-500">{t.description || '—'}</div>
                      </div>
                      <span className={statusBadge(t.status)}>{choiceLabel(TASK_STATUS_CHOICES, t.status)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">{choiceLabel(TASK_TYPE_CHOICES, t.task_type)}</span>
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">FM: {t.full_marks}</span>
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">Due: {new Date(t.end_date).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
