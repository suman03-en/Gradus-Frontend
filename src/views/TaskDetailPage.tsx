import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiJson, apiFormData } from '../lib/api'
import type { Task, TaskSubmission, TaskEvaluation } from '../lib/types'
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

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isStudent = useMemo(() => !!(user?.profile && 'roll_no' in user.profile), [user])

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Submissions
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
  const [subLoading, setSubLoading] = useState(false)

  // Edit mode (teacher)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const [editMsg, setEditMsg] = useState<string | null>(null)

  // File submission (student)
  const [file, setFile] = useState<File | null>(null)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [submitBusy, setSubmitBusy] = useState(false)

  // Evaluation (teacher)
  const [evalForm, setEvalForm] = useState<Record<string, { marks_obtained: string; feedback: string }>>({})
  const [evalMsg, setEvalMsg] = useState<string | null>(null)

  // View evaluations
  const [evaluations, setEvaluations] = useState<Record<string, TaskEvaluation>>({})

  const fetchTask = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await apiJson<Task>(`/api/v1/tasks/${id}/`)
      setTask(data)
      setEditForm(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchSubmissions = useCallback(async () => {
    setSubLoading(true)
    try {
      const data = await apiJson<TaskSubmission[]>(`/api/v1/tasks/${id}/submit/`)
      setSubmissions(data)
      // Fetch evaluations for each submission
      for (const sub of data) {
        try {
          const evalData = await apiJson<TaskEvaluation>(`/api/v1/tasks/submissions/${sub.id}/`)
          setEvaluations((prev) => ({ ...prev, [sub.id]: evalData }))
        } catch {
          // No evaluation yet
        }
      }
    } catch {
      // Could be no submissions
    } finally {
      setSubLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTask()
    fetchSubmissions()
  }, [fetchTask, fetchSubmissions])

  // ─── Delete Task (Teacher) ──────────────────────────────────
  async function onDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await apiJson(`/api/v1/tasks/${id}/`, { method: 'DELETE' })
      navigate(-1)
    } catch (e: any) {
      setError(e?.message ?? 'Delete failed')
    }
  }

  // ─── Edit Task (Teacher) ────────────────────────────────────
  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditMsg(null)
    try {
      await apiJson<Task>(`/api/v1/tasks/${id}/`, {
        method: 'PATCH',
        body: {
          name: editForm.name,
          description: editForm.description,
          end_date: editForm.end_date,
          full_marks: editForm.full_marks,
          status: editForm.status,
          mode: editForm.mode,
          task_type: editForm.task_type,
        },
      })
      setEditMsg('Task updated successfully.')
      setEditing(false)
      await fetchTask()
    } catch (e: any) {
      setEditMsg(e?.message ?? 'Update failed')
    }
  }

  // ─── Submit File (Student) ──────────────────────────────────
  async function onSubmitFile(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setSubmitMsg(null)
    setSubmitBusy(true)
    try {
      const fd = new FormData()
      fd.append('uploaded_file', file)
      
      const mySub = submissions.find((s) => s.student === user?.username)
      if (mySub) {
        await apiFormData<TaskSubmission>(`/api/v1/tasks/submissions/${mySub.id}/update`, fd, { method: 'PATCH' })
        setSubmitMsg('Submission updated successfully!')
      } else {
        await apiFormData<TaskSubmission>(`/api/v1/tasks/${id}/submit/`, fd)
        setSubmitMsg('Submission uploaded successfully!')
      }
      
      setFile(null)
      await fetchSubmissions()
    } catch (e: any) {
      setSubmitMsg(e?.message ?? 'Submission failed')
    } finally {
      setSubmitBusy(false)
    }
  }

  const isClosed = useMemo(() => {
    if (!task) return false
    return new Date(task.end_date) < new Date()
  }, [task])

  // ─── Evaluate Submission (Teacher) ──────────────────────────
  async function onEvaluate(submissionId: string) {
    const form = evalForm[submissionId]
    if (!form) return
    setEvalMsg(null)
    try {
      await apiJson<TaskEvaluation>(`/api/v1/tasks/submissions/${submissionId}/evaluate/`, {
        method: 'POST',
        body: { marks_obtained: parseFloat(form.marks_obtained), feedback: form.feedback },
      })
      setEvalMsg('Evaluation saved!')
      await fetchSubmissions()
    } catch (e: any) {
      setEvalMsg(e?.message ?? 'Evaluation failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-brand-600 hover:underline">
            ← Back
          </button>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Task Details</h1>
        </div>
        {!isStudent && task && (
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button className="btn-danger" onClick={onDelete}>
              Delete
            </button>
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
      ) : task ? (
        <>
          {/* ─── Task Info Card ───────────────────────────── */}
          {editing ? (
            <form className="card p-6 space-y-6" onSubmit={onSaveEdit}>
              <div className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Edit Task</div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Name</label>
                  <input className="input" value={editForm.name ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="textarea" rows={4} value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input className="input" type="datetime-local" value={(editForm.end_date ?? '').slice(0, 16)} onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Full Marks</label>
                  <input className="input" type="number" value={editForm.full_marks ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, full_marks: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editForm.status ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    {TASK_STATUS_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Mode</label>
                  <select className="input" value={editForm.mode ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, mode: e.target.value }))}>
                    {TASK_MODE_CHOICES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              {editMsg ? <div className="rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-700">{editMsg}</div> : null}
              <div className="flex justify-end pt-4">
                <button className="btn-primary px-8">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="card p-6 h-full">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Task Name</div>
                      <div className="mt-1 text-xl font-bold text-slate-900">{task.name}</div>
                    </div>
                    <span className={statusBadge(task.status)}>{choiceLabel(TASK_STATUS_CHOICES, task.status)}</span>
                  </div>
                  <div className="mt-8">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</div>
                    <div className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided.'}</div>
                  </div>
                </div>
              </div>
              <aside className="card p-6">
                <div className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">Details</div>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Teacher</dt>
                    <dd className="mt-1 font-medium text-slate-900 text-sm">@{task.created_by}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <div>
                      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Marks</dt>
                      <dd className="mt-1 font-bold text-brand-700 text-2xl">{task.full_marks}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mode</dt>
                      <dd className="mt-1 font-medium text-slate-900 capitalize text-sm px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">{task.mode}</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</dt>
                    <dd className="mt-1 font-medium text-slate-900 text-sm">{new Date(task.end_date).toLocaleString()}</dd>
                    {isClosed && <div className="mt-2 inline-block px-3 py-1 bg-red-50 text-[10px] font-semibold uppercase text-red-600 rounded-full border border-red-100">Closed</div>}
                  </div>
                </dl>
              </aside>
            </div>
          )}

          {/* ─── Submit File (Student Only) ────────────── */}
          {isStudent && (
            <div className="card p-6">
              {(() => {
                const mySub = submissions.find((s) => s.student === user?.username)
                const isEvaluated = mySub && evaluations[mySub.id]
                return (
                  <>
                    <div className="text-sm font-semibold text-slate-900">
                      {mySub ? 'Update Your Submission' : 'Submit Your Work'}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {mySub ? 'You have already submitted. Upload a new file to update.' : 'Upload a file for this task.'}
                    </p>
                    
                    {isEvaluated ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Your submission has been evaluated. You can no longer update it.
                      </div>
                    ) : (
                      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSubmitFile}>
                        <div className="flex-1">
                          <label className="label">File</label>
                          <input
                            className="input mt-1"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          />
                        </div>
                        <button className="btn-primary" disabled={!file || submitBusy || isClosed}>
                          {submitBusy ? 'Uploading…' : isClosed ? 'Deadline Passed' : mySub ? 'Update' : 'Submit'}
                        </button>
                      </form>
                    )}
                  </>
                )
              })()}
              
              {isClosed && <p className="mt-2 text-xs font-medium text-red-500">This task is no longer accepting submissions.</p>}
              {submitMsg ? (
                <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{submitMsg}</div>
              ) : null}
            </div>
          )}

          {/* ─── Submissions List ──────────────────────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-900">
                Submissions {submissions.length > 0 && <span className="text-slate-400">({submissions.length})</span>}
              </div>
              <button className="btn-secondary text-xs" onClick={fetchSubmissions} disabled={subLoading}>
                {subLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {subLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="mt-4 text-sm text-slate-500">No submissions yet.</div>
            ) : (
              <div className="mt-4 space-y-4">
                {submissions.map((sub) => {
                  const ev = evaluations[sub.id]
                  return (
                    <div key={sub.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{sub.student}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Submitted: {new Date(sub.submitted_at).toLocaleString()}
                          </div>
                          <a
                            href={sub.uploaded_file}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-xs font-medium text-brand-600 hover:underline"
                          >
                            Download file ↗
                          </a>
                        </div>
                        {ev ? (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-right">
                            <div className="text-xs text-emerald-600 font-medium">Evaluated</div>
                            <div className="text-lg font-bold text-emerald-800">{ev.marks_obtained}/{task.full_marks}</div>
                            <div className="mt-1 text-xs text-slate-600">{ev.feedback}</div>
                          </div>
                        ) : (
                          <span className="badge-amber">Pending</span>
                        )}
                      </div>

                      {/* Teacher evaluation form */}
                      {!isStudent && !ev && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <div className="text-xs font-semibold text-slate-900 mb-3">Evaluate</div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="label">Marks ({task.full_marks} max)</label>
                              <input
                                className="input mt-1"
                                type="number"
                                min={0}
                                max={task.full_marks}
                                value={evalForm[sub.id]?.marks_obtained ?? ''}
                                onChange={(e) =>
                                  setEvalForm((f) => ({
                                    ...f,
                                    [sub.id]: { ...f[sub.id], marks_obtained: e.target.value, feedback: f[sub.id]?.feedback ?? '' },
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">Feedback</label>
                              <input
                                className="input mt-1"
                                value={evalForm[sub.id]?.feedback ?? ''}
                                onChange={(e) =>
                                  setEvalForm((f) => ({
                                    ...f,
                                    [sub.id]: { ...f[sub.id], feedback: e.target.value, marks_obtained: f[sub.id]?.marks_obtained ?? '' },
                                  }))
                                }
                                placeholder="Great work!"
                              />
                            </div>
                          </div>
                          <button
                            className="btn-primary mt-3"
                            onClick={() => onEvaluate(sub.id)}
                            disabled={!evalForm[sub.id]?.marks_obtained || !evalForm[sub.id]?.feedback?.trim()}
                          >
                            Submit Evaluation
                          </button>
                          {evalMsg ? (
                            <div className="mt-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800">{evalMsg}</div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
