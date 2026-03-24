import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { apiFormData, apiJson } from '../lib/api'
import type {
  Classroom,
  Task,
  GradebookData,
  User,
  ClassroomAttendanceResponse,
} from '../lib/types'
import { useAuth } from '../state/auth'
import { TASK_STATUS_CHOICES, TASK_MODE_CHOICES, TASK_TYPE_CHOICES, TASK_COMPONENT_CHOICES } from '../lib/choices'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'
import { ResourcesPanel } from '../components/ResourcesPanel'

function statusBadge(status: string) {
  if (status === 'published') return 'badge-green'
  if (status === 'draft') return 'badge-amber'
  return 'badge-slate'
}

function choiceLabel(choices: readonly { value: string; label: string }[], val: string) {
  return choices.find((c) => c.value === val)?.label ?? val
}

type ClassroomTab = 'overview' | 'resources' | 'students' | 'tasks' | 'attendance'

export function ClassroomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isStudent = useMemo(() => !!(user?.profile && 'roll_no' in user.profile), [user])

  const [item, setItem] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit Classroom
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [editMsg, setEditMsg] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors | null>(null)

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'upcoming' | 'overdue'>('all')
  const [componentFilter, setComponentFilter] = useState<'all' | 'theory' | 'lab'>('all')
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | Task['task_type']>('all')

  const [gradebook, setGradebook] = useState<GradebookData | null>(null)
  const [gbLoading, setGbLoading] = useState(false)
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})
  const [attendanceData, setAttendanceData] = useState<ClassroomAttendanceResponse | null>(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null)
  const [attendanceSuccess, setAttendanceSuccess] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState('')
  const [attendanceComponent, setAttendanceComponent] = useState<'theory' | 'lab'>('theory')
  const [attendanceNote, setAttendanceNote] = useState('')
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, boolean>>({})
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvUploading, setCsvUploading] = useState(false)

  const fetchGradebook = useCallback(async () => {
    setGbLoading(true)
    try {
      const g = await apiJson<GradebookData>(`/api/v1/classrooms/${id}/gradebook/`)
      setGradebook(g)
    } catch {
      // ignore
    } finally {
      setGbLoading(false)
    }
  }, [id])

  const fetchAttendance = useCallback(async () => {
    setAttendanceLoading(true)
    try {
      const data = await apiJson<ClassroomAttendanceResponse>(`/api/v1/classrooms/${id}/attendance/`)
      setAttendanceData(data)
    } catch {
      setAttendanceData(null)
    } finally {
      setAttendanceLoading(false)
    }
  }, [id])

  // Add student form (teacher only)
  const [rollNo, setRollNo] = useState('')
  const [addStudentMsg, setAddStudentMsg] = useState<string | null>(null)
  const [addStudentSuccess, setAddStudentSuccess] = useState(false)
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)

  // Add co-teacher form (owner only)
  const [teacherUsername, setTeacherUsername] = useState('')
  const [addTeacherMsg, setAddTeacherMsg] = useState<string | null>(null)
  const [addTeacherSuccess, setAddTeacherSuccess] = useState(false)
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false)

  // Create task form (teacher only)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [activeTab, setActiveTab] = useState<ClassroomTab>('overview')
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    end_date: '',
    full_marks: '',
    status: 'published',
    mode: 'online',
    task_type: 'assignment',
    assessment_component: 'theory',
  })
  const [createTaskMsg, setCreateTaskMsg] = useState<string | null>(null)
  const [createTaskSuccess, setCreateTaskSuccess] = useState(false)
  const [createTaskFieldErrors, setCreateTaskFieldErrors] = useState<FieldErrors | null>(null)

  const isOwnerTeacher = useMemo(() => {
    return !isStudent && !!item && user?.username === item.created_by
  }, [isStudent, item, user])

  const refreshClassroom = useCallback(async () => {
    const data = await apiJson<Classroom>(`/api/v1/classrooms/${id}/`)
    setItem(data)
    setEditForm({ name: data.name, description: data.description })
  }, [id])

  useEffect(() => {
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        await refreshClassroom()
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load classroom')
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshClassroom])

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

  const filteredTasks = useMemo(() => {
    const now = new Date()

    return tasks.filter((task) => {
      if (componentFilter !== 'all' && task.assessment_component !== componentFilter) {
        return false
      }

      if (taskTypeFilter !== 'all' && task.task_type !== taskTypeFilter) {
        return false
      }

      const dueDate = new Date(task.end_date)
      if (deadlineFilter === 'upcoming' && dueDate < now) {
        return false
      }
      if (deadlineFilter === 'overdue' && dueDate >= now) {
        return false
      }

      return true
    })
  }, [tasks, deadlineFilter, componentFilter, taskTypeFilter])

  useEffect(() => {
    if (activeTab === 'students' && !gradebook) {
      fetchGradebook()
    }
  }, [activeTab, gradebook, fetchGradebook])

  useEffect(() => {
    if (activeTab === 'attendance' && !attendanceData) {
      fetchAttendance()
    }
  }, [activeTab, attendanceData, fetchAttendance])

  useEffect(() => {
    if (activeTab === 'attendance' && !gradebook && !isStudent) {
      fetchGradebook()
    }
  }, [activeTab, gradebook, isStudent, fetchGradebook])

  // Set activeTab from navigation state (when coming back from task detail)
  useEffect(() => {
    const state = location.state as any
    if (state?.activeTab) {
      setActiveTab(state.activeTab)
    }
  }, [location.state])

  useEffect(() => {
    if (activeTab !== 'students' || !gradebook?.students?.length) return

    const missingUsernames = gradebook.students
      .map((student) => student.username)
      .filter((username) => !studentNames[username])

    if (!missingUsernames.length) return

    let cancelled = false

    ;(async () => {
      const results = await Promise.allSettled(
        missingUsernames.map((username) => apiJson<User>(`/api/v1/accounts/users/${username}`)),
      )

      if (cancelled) return

      const nextNames: Record<string, string> = {}
      results.forEach((result, index) => {
        const username = missingUsernames[index]
        if (result.status === 'fulfilled') {
          const first = result.value.first_name?.trim() ?? ''
          const last = result.value.last_name?.trim() ?? ''
          const fullName = `${first} ${last}`.trim()
          nextNames[username] = fullName || username
        } else {
          nextNames[username] = username
        }
      })

      setStudentNames((prev) => ({ ...prev, ...nextNames }))
    })()

    return () => {
      cancelled = true
    }
  }, [activeTab, gradebook, studentNames])

  useEffect(() => {
    if (!gradebook?.students?.length) return
    setAttendanceMarks((prev) => {
      if (Object.keys(prev).length) return prev
      const defaults: Record<string, boolean> = {}
      for (const s of gradebook.students) {
        defaults[s.id] = true
      }
      return defaults
    })
  }, [gradebook])

  // ─── Add Student ───────────────────────────────────────────
  async function onAddStudent(e: React.FormEvent) {
    e.preventDefault()
    setAddStudentMsg(null)
    setAddStudentSuccess(false)
    try {
      const res = await apiJson<{ detail: string }>(`/api/v1/classrooms/${id}/students/`, {
        method: 'POST',
        body: { roll_no: rollNo.trim() },
      })
      setAddStudentMsg(res.detail)
      setAddStudentSuccess(true)
      setRollNo('')
      setShowAddStudentForm(false)
    } catch (err: any) {
      setAddStudentMsg(err?.message ?? 'Add student failed')
      setAddStudentSuccess(false)
    }
  }

  async function onAddTeacher(e: React.FormEvent) {
    e.preventDefault()
    setAddTeacherMsg(null)
    setAddTeacherSuccess(false)
    try {
      const res = await apiJson<{ detail: string }>(`/api/v1/classrooms/${id}/teachers/`, {
        method: 'POST',
        body: { username: teacherUsername.trim() },
      })
      setAddTeacherMsg(res.detail)
      setAddTeacherSuccess(true)
      setTeacherUsername('')
      setShowAddTeacherForm(false)
      await refreshClassroom()
    } catch (err: any) {
      setAddTeacherMsg(err?.message ?? 'Add teacher failed')
      setAddTeacherSuccess(false)
    }
  }

  async function onSaveAttendanceDay(e: React.FormEvent) {
    e.preventDefault()
    setAttendanceMsg(null)
    setAttendanceSuccess(false)

    if (!attendanceDate) {
      setAttendanceMsg('Please choose attendance date.')
      return
    }

    const sourceStudents = gradebook?.students ?? []
    if (!sourceStudents.length) {
      setAttendanceMsg('No students available to mark attendance.')
      return
    }

    try {
      const entries = sourceStudents.map((s) => ({
        student_id: s.id,
        is_present: !!attendanceMarks[s.id],
      }))

      const res = await apiJson<{ detail: string }>(`/api/v1/classrooms/${id}/attendance/`, {
        method: 'POST',
        body: {
          date: attendanceDate,
          assessment_component: attendanceComponent,
          note: attendanceNote,
          entries,
        },
      })

      setAttendanceMsg(res.detail)
      setAttendanceSuccess(true)
      setAttendanceNote('')
      await fetchAttendance()
      await fetchGradebook()
    } catch (err: any) {
      setAttendanceMsg(err?.message ?? 'Attendance save failed')
      setAttendanceSuccess(false)
    }
  }

  async function onUploadAttendanceCsv() {
    setAttendanceMsg(null)
    setAttendanceSuccess(false)

    if (!csvFile) {
      setAttendanceMsg('Please choose a CSV file first.')
      return
    }

    try {
      setCsvUploading(true)
      const form = new FormData()
      form.append('file', csvFile)

      const res = await apiFormData<{ detail: string }>(`/api/v1/classrooms/${id}/attendance/summary/csv/`, form)
      setAttendanceMsg(res.detail)
      setAttendanceSuccess(true)
      setCsvFile(null)
      await fetchAttendance()
      await fetchGradebook()
    } catch (err: any) {
      setAttendanceMsg(err?.message ?? 'CSV upload failed')
      setAttendanceSuccess(false)
    } finally {
      setCsvUploading(false)
    }
  }

  function onDownloadAttendanceCsvTemplate() {
    const header = 'assessment_component,roll_no,present_days,total_days,note\n'
    const sampleRows = [
      'theory,THA079BEI111,20,24,Month Summary',
      'theory,THA079BEI112,19,24,Month Summary',
    ]
    const csv = header + sampleRows.join('\n') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance_summary_template.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  // ─── Create Task ───────────────────────────────────────────
  async function onCreateTask(e: React.FormEvent) {
    e.preventDefault()
    setCreateTaskMsg(null)
    setCreateTaskSuccess(false)
    setCreateTaskFieldErrors(null)

    // Client-side validation
    const clientErrors: FieldErrors = {}
    if (!taskForm.name.trim()) clientErrors.name = ['Task name is required.']
    if (!taskForm.end_date) clientErrors.end_date = ['Due date is required.']
    if (!taskForm.full_marks) clientErrors.full_marks = ['Full marks is required.']
    if (taskForm.full_marks && Number(taskForm.full_marks) <= 0)
      clientErrors.full_marks = ['Full marks must be greater than 0.']
    if (Object.keys(clientErrors).length) {
      setCreateTaskFieldErrors(clientErrors)
      return
    }

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
          assessment_component: taskForm.assessment_component,
        },
      })
      setCreateTaskMsg(`Created "${created.name}"`)
      setCreateTaskSuccess(true)
      setTaskForm({
        name: '',
        description: '',
        end_date: '',
        full_marks: '',
        status: 'published',
        mode: 'online',
        task_type: 'assignment',
        assessment_component: 'theory',
      })
      setShowCreateTask(false)
      await fetchTasks()
    } catch (err: any) {
      setCreateTaskFieldErrors(getFieldErrors(err))
      setCreateTaskMsg(err?.message ?? 'Create failed')
      setCreateTaskSuccess(false)
    }
  }

  // ─── Edit/Delete Classroom ────────────────────────────────
  async function onSaveClassroom(e: React.FormEvent) {
    e.preventDefault()
    setEditMsg(null)
    setEditSuccess(false)
    setEditFieldErrors(null)

    const clientErrors: FieldErrors = {}
    if (!editForm.name.trim()) clientErrors.name = ['Classroom name is required.']
    if (Object.keys(clientErrors).length) {
      setEditFieldErrors(clientErrors)
      return
    }

    try {
      const updated = await apiJson<Classroom>(`/api/v1/classrooms/${id}/`, {
        method: 'PATCH',
        body: { name: editForm.name.trim(), description: editForm.description.trim() },
      })
      setItem(updated)
      setEditing(false)
      setEditMsg('Classroom updated.')
      setEditSuccess(true)
    } catch (err: any) {
      setEditFieldErrors(getFieldErrors(err))
      setEditMsg(err?.message ?? 'Update failed')
      setEditSuccess(false)
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
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Classroom</h1>
        </div>
        {!isStudent ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link to={`/classrooms/${id}/gradebook`} className="btn-primary flex-1 sm:flex-none">
              Gradebook
            </Link>
            <button className="btn-secondary flex-1 sm:flex-none" onClick={() => setActiveTab('attendance')}>
              Attendance
            </button>
            {isOwnerTeacher && (
              <>
                <button className="btn-secondary flex-1 sm:flex-none" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                <button className="btn-danger flex-1 sm:flex-none" onClick={onDeleteClassroom}>
                  Delete
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex w-full gap-2 sm:w-auto">
            <Link to={`/classrooms/${id}/gradebook`} className="btn-primary w-full sm:w-auto">
              My Grades
            </Link>
            <button className="btn-secondary w-full sm:w-auto" onClick={() => setActiveTab('attendance')}>
              My Attendance
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
      ) : item ? (
        <>
          <div className="card p-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={activeTab === 'overview' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('overview')}>
                Overview
              </button>
              <button type="button" className={activeTab === 'resources' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('resources')}>
                Resources
              </button>
              <button type="button" className={activeTab === 'students' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('students')}>
                Students
              </button>
              <button type="button" className={activeTab === 'tasks' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('tasks')}>
                Tasks
              </button>
              <button type="button" className={activeTab === 'attendance' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('attendance')}>
                Attendance
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {editing ? (
                    <form className="card p-6 space-y-4" onSubmit={onSaveClassroom}>
                      <div className="text-sm font-semibold text-slate-900">Edit Classroom</div>
                      <div>
                        <label className="label">Name</label>
                        <input
                          className="input mt-1"
                          value={editForm.name}
                          onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                        {firstFieldError(editFieldErrors, 'name') && (
                          <div className="mt-1 text-xs font-medium text-red-600">
                            {firstFieldError(editFieldErrors, 'name')}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="label">Description</label>
                        <textarea
                          className="textarea"
                          value={editForm.description}
                          onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                        />
                        {firstFieldError(editFieldErrors, 'description') && (
                          <div className="mt-1 text-xs font-medium text-red-600">
                            {firstFieldError(editFieldErrors, 'description')}
                          </div>
                        )}
                      </div>
                      {editMsg && (
                        <div className={`rounded-xl border px-3 py-2 text-sm ${editSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                          {editMsg}
                        </div>
                      )}
                      <button className="btn-primary">Save Changes</button>
                    </form>
                  ) : (
                    <div className="card p-6 h-full">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Name</div>
                          <div className="mt-1 text-xl font-bold text-slate-900">{item.name}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Invite Code</div>
                          <div className="mt-0.5 text-lg font-bold text-brand-700 tracking-widest">{item.invite_code}</div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</div>
                        <div className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</div>
                      </div>
                    </div>
                  )}
                </div>

                <aside className="card p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Details</div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Lead Teacher</dt>
                      <dd className="font-medium text-slate-900">{item.created_by}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">All Teachers</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {(item.teachers ?? []).map((teacher) => (
                          <span key={teacher} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                            @{teacher}
                          </span>
                        ))}
                      </dd>
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

              {!isStudent && isOwnerTeacher && (
                <div className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Add Co-Teacher</div>
                      <p className="mt-1 text-sm text-slate-500">Add another teacher by username to co-manage this classroom.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary w-full sm:w-auto"
                      onClick={() => setShowAddTeacherForm((prev) => !prev)}
                    >
                      {showAddTeacherForm ? 'Cancel' : 'Add Co-Teacher'}
                    </button>
                  </div>
                  {showAddTeacherForm && (
                    <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onAddTeacher}>
                      <input
                        className="input flex-1"
                        value={teacherUsername}
                        onChange={(e) => setTeacherUsername(e.target.value)}
                        placeholder="Teacher username"
                      />
                      <button className="btn-primary w-full sm:w-auto" disabled={!teacherUsername.trim()}>
                        Add Teacher
                      </button>
                    </form>
                  )}
                  {addTeacherMsg && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${addTeacherSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {addTeacherMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              {!isStudent && (
                <div className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Add Student</div>
                      <p className="mt-1 text-sm text-slate-500">Add a student by their roll number (e.g. THA079BEI042).</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary w-full sm:w-auto"
                      onClick={() => setShowAddStudentForm((prev) => !prev)}
                    >
                      {showAddStudentForm ? 'Cancel' : 'Add Student'}
                    </button>
                  </div>
                  {showAddStudentForm && (
                    <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onAddStudent}>
                      <input
                        className="input flex-1"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                        placeholder="Roll number"
                      />
                      <button className="btn-primary w-full sm:w-auto" disabled={!rollNo.trim()}>
                        Add Student
                      </button>
                    </form>
                  )}
                  {addStudentMsg && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${addStudentSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {addStudentMsg}
                    </div>
                  )}
                </div>
              )}

              <div className="card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Enrolled Students</div>
                </div>

                {gbLoading ? (
                   <div className="mt-4 animate-pulse h-10 w-full bg-slate-100 rounded-xl" />
                ) : !gradebook || gradebook.students.length === 0 ? (
                   <div className="mt-4 text-sm text-slate-500">No students enrolled yet.</div>
                ) : (
                   <ul className="mt-4 space-y-3">
                     {gradebook.students.map(s => (
                       <li key={s.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                         <div className="flex flex-wrap items-center justify-between gap-2">
                           <div className="min-w-0">
                             <div className="text-sm font-semibold text-slate-900 truncate">
                               {studentNames[s.username] ?? s.username}
                             </div>
                             <div className="mt-0.5 text-xs text-slate-500">Roll No: {s.roll_no}</div>
                           </div>
                           <Link to={`/users/${s.username}`} className="text-xs font-semibold text-brand-700 hover:underline">
                             View Profile
                           </Link>
                         </div>
                       </li>
                     ))}
                   </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {!isStudent && (
                <div className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Mark Attendance</div>
                      <p className="mt-1 text-sm text-slate-500">Mark day-by-day manually or upload final attendance summary by CSV.</p>
                    </div>
                    <button className="btn-secondary" onClick={fetchAttendance} disabled={attendanceLoading}>
                      Refresh
                    </button>
                  </div>

                  <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={onSaveAttendanceDay}>
                    <div>
                      <label className="label">Date</label>
                      <input
                        className="input mt-1"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Component</label>
                      <select
                        className="input mt-1"
                        value={attendanceComponent}
                        onChange={(e) => setAttendanceComponent(e.target.value as 'theory' | 'lab')}
                      >
                        {TASK_COMPONENT_CHOICES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="label">Note (Optional)</label>
                      <input
                        className="input mt-1"
                        value={attendanceNote}
                        onChange={(e) => setAttendanceNote(e.target.value)}
                        placeholder="Topic or remarks"
                      />
                    </div>

                    <div className="sm:col-span-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Student Presence</div>
                      {!gradebook?.students?.length ? (
                        <div className="mt-2 text-sm text-slate-500">No students available.</div>
                      ) : (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {gradebook.students.map((s) => (
                            <label key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <span className="text-sm text-slate-700">{studentNames[s.username] ?? s.username} ({s.roll_no})</span>
                              <input
                                type="checkbox"
                                checked={!!attendanceMarks[s.id]}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  setAttendanceMarks((prev) => ({ ...prev, [s.id]: checked }))
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 flex flex-wrap gap-2">
                      <button className="btn-primary" type="submit">Save This Day</button>
                    </div>
                  </form>

                  {attendanceMsg && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${attendanceSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {attendanceMsg}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">CSV Bulk Upload</div>
                      <button className="btn-secondary text-xs" type="button" onClick={onDownloadAttendanceCsvTemplate}>
                        Download Template
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Required columns: assessment_component, roll_no, present_days, total_days. Optional: note.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        className="input"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                      />
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={onUploadAttendanceCsv}
                        disabled={!csvFile || csvUploading}
                      >
                        {csvUploading ? 'Uploading...' : 'Upload CSV'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                  {isStudent ? 'My Attendance' : 'Attendance Summary'}
                </div>

                {attendanceLoading ? (
                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-slate-100" />
                ) : !attendanceData || attendanceData.attendance_summary.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-500">No attendance records yet.</div>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          {!isStudent && <th className="py-2 pr-4">Student</th>}
                          <th className="py-2 pr-4">Present</th>
                          <th className="py-2 pr-4">Total</th>
                          <th className="py-2">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.attendance_summary.map((s) => (
                          <tr key={s.student_id} className="border-b border-slate-100">
                            {!isStudent && <td className="py-2 pr-4 text-slate-700">{s.username} ({s.roll_no})</td>}
                            <td className="py-2 pr-4">{s.present}</td>
                            <td className="py-2 pr-4">{s.total}</td>
                            <td className="py-2 font-semibold text-slate-800">{s.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Attendance History</div>
                {attendanceLoading ? (
                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-slate-100" />
                ) : !attendanceData || attendanceData.sessions.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-500">No attendance sessions recorded yet.</div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {attendanceData.sessions.map((session) => (
                      <li key={session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-800">
                            {new Date(session.date).toLocaleDateString()} · {session.assessment_component.toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500">
                            Present: {session.records.filter((r) => r.is_present).length}/{session.records.length}
                          </div>
                        </div>
                        {session.note && <div className="mt-1 text-xs text-slate-500">{session.note}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'resources' && id && <ResourcesPanel contentType="classroom" objectId={id} />}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900">Tasks</div>
                <p className="text-sm text-slate-500">
                  {isStudent ? 'View and submit assignments.' : 'Manage classroom tasks.'}
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button className="btn-secondary flex-1 text-xs sm:flex-none" onClick={fetchTasks} disabled={tasksLoading}>
                  Refresh
                </button>
                {!isStudent && (
                  <button className="btn-primary flex-1 text-xs sm:flex-none" onClick={() => setShowCreateTask(!showCreateTask)}>
                    {showCreateTask ? 'Cancel' : '+ Create Task'}
                  </button>
                )}
              </div>
            </div>

            <div className="card p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Deadline</label>
                  <select
                    className="input mt-1"
                    value={deadlineFilter}
                    onChange={(e) => setDeadlineFilter(e.target.value as 'all' | 'upcoming' | 'overdue')}
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="label">Component</label>
                  <select
                    className="input mt-1"
                    value={componentFilter}
                    onChange={(e) => setComponentFilter(e.target.value as 'all' | 'theory' | 'lab')}
                  >
                    <option value="all">All</option>
                    {TASK_COMPONENT_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>{choice.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Task Type</label>
                  <select
                    className="input mt-1"
                    value={taskTypeFilter}
                    onChange={(e) => setTaskTypeFilter(e.target.value as 'all' | Task['task_type'])}
                  >
                    <option value="all">All</option>
                    {TASK_TYPE_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>{choice.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Create Task Form */}
            {showCreateTask && !isStudent && (
              <div className="card p-6">
                <div className="text-sm font-semibold text-slate-900 mb-4">New Task</div>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={onCreateTask}>
                  <div className="sm:col-span-2">
                    <label className="label">Name</label>
                    <input
                      className="input mt-1"
                      value={taskForm.name}
                      onChange={(e) => setTaskForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {firstFieldError(createTaskFieldErrors, 'name') && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        {firstFieldError(createTaskFieldErrors, 'name')}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      className="textarea mt-1"
                      rows={3}
                      value={taskForm.description}
                      onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                    />
                    {firstFieldError(createTaskFieldErrors, 'description') && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        {firstFieldError(createTaskFieldErrors, 'description')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input
                      className="input mt-1"
                      type="datetime-local"
                      value={taskForm.end_date}
                      onChange={(e) => setTaskForm((f) => ({ ...f, end_date: e.target.value }))}
                    />
                    {firstFieldError(createTaskFieldErrors, 'end_date') && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        {firstFieldError(createTaskFieldErrors, 'end_date')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Full Marks</label>
                    <input
                      className="input mt-1"
                      type="number"
                      min={0}
                      value={taskForm.full_marks}
                      onChange={(e) => setTaskForm((f) => ({ ...f, full_marks: e.target.value }))}
                    />
                    {firstFieldError(createTaskFieldErrors, 'full_marks') && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        {firstFieldError(createTaskFieldErrors, 'full_marks')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input mt-1"
                      value={taskForm.status}
                      onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {TASK_STATUS_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Mode</label>
                    <select
                      className="input mt-1"
                      value={taskForm.mode}
                      onChange={(e) => setTaskForm((f) => ({ ...f, mode: e.target.value }))}
                    >
                      {TASK_MODE_CHOICES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input mt-1"
                      value={taskForm.task_type}
                      onChange={(e) => setTaskForm((f) => ({ ...f, task_type: e.target.value }))}
                    >
                      {TASK_TYPE_CHOICES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Component</label>
                    <select
                      className="input mt-1"
                      value={taskForm.assessment_component}
                      onChange={(e) => setTaskForm((f) => ({ ...f, assessment_component: e.target.value as 'theory' | 'lab' }))}
                    >
                      {TASK_COMPONENT_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button className="btn-primary w-full sm:w-auto">
                      Create Task
                    </button>
                  </div>
                </form>
                {createTaskMsg && (
                  <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${createTaskSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {createTaskMsg}
                  </div>
                )}
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
            ) : filteredTasks.length === 0 ? (
              <div className="card p-6">
                <div className="text-sm font-medium text-slate-900">No tasks match the current filters</div>
                <div className="mt-1 text-sm text-slate-500">
                  Try adjusting deadline, component, or task type.
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((t) => (
                  <Link key={t.id} to={`/tasks/${t.id}`} state={{ fromClassroomTasksTab: true, classroomId: id }} className="card p-5 hover:border-brand-200 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{t.name}</div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-500">{t.description || '—'}</div>
                      </div>
                      <span className={statusBadge(t.status)}>{choiceLabel(TASK_STATUS_CHOICES, t.status)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">{choiceLabel(TASK_TYPE_CHOICES, t.task_type)}</span>
                      <span className={`rounded px-2 py-1 border font-medium ${t.assessment_component === 'lab' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                        {choiceLabel(TASK_COMPONENT_CHOICES, t.assessment_component)}
                      </span>
                      <span className={`rounded px-2 py-1 border font-medium ${t.mode === 'online' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{choiceLabel(TASK_MODE_CHOICES, t.mode)}</span>
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">FM: {t.full_marks}</span>
                      <span className="rounded bg-slate-50 px-2 py-1 border border-slate-100">Due: {new Date(t.end_date).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          )}

        </>
      ) : null}
    </div>
  )
}
