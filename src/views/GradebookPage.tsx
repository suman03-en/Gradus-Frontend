import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiBlob, apiJson } from '../lib/api'
import { TASK_COMPONENT_CHOICES, TASK_TYPE_CHOICES } from '../lib/choices'
import { useAuth } from '../state/auth'
import type { ClassroomWeightageConfig, ClassroomWeightageConfigPayload, GradebookData } from '../lib/types'

function taskTypeLabel(taskType: string) {
  return TASK_TYPE_CHOICES.find((choice) => choice.value === taskType)?.label ?? taskType
}

function weightageKey(component: 'theory' | 'lab', taskType: string) {
  return `${component}:${taskType}`
}

function attendanceWeightageKey(component: 'theory' | 'lab') {
  return `attendance:${component}`
}

type WeightageFormItem = {
  include_in_final: boolean
  weightage: string
}

type GradebookTab = 'overview' | 'weightage' | 'students'

export function GradebookPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const isStudent = useMemo(() => !!(user?.profile && 'roll_no' in user.profile), [user])
  const [exportComponent, setExportComponent] = useState<'theory' | 'lab'>('theory')
  const [weightageComponent, setWeightageComponent] = useState<'theory' | 'lab'>('theory')
  const [studentSearchRollNo, setStudentSearchRollNo] = useState('')

  const [data, setData] = useState<GradebookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [weightageForm, setWeightageForm] = useState<Record<string, WeightageFormItem>>({})
  const [attendanceWeightageForm, setAttendanceWeightageForm] = useState<Record<string, WeightageFormItem>>({})
  const [weightageTotal, setWeightageTotal] = useState(0)
  const [weightageLoading, setWeightageLoading] = useState(false)
  const [weightageSaving, setWeightageSaving] = useState(false)
  const [weightageMsg, setWeightageMsg] = useState<string | null>(null)
  const [weightageSuccess, setWeightageSuccess] = useState(false)
  const [showWeightageForm, setShowWeightageForm] = useState(false)
  const [activeTab, setActiveTab] = useState<GradebookTab>('overview')
  const [exportBusy, setExportBusy] = useState(false)

  function extractFilename(contentDisposition: string | null, fallback: string) {
    if (!contentDisposition) return fallback
    const match = /filename="?([^";]+)"?/i.exec(contentDisposition)
    if (!match?.[1]) return fallback
    return match[1]
  }

  async function onExportExcel() {
    if (!id) return

    setExportBusy(true)
    setError(null)
    try {
      const { blob, contentDisposition } = await apiBlob(
        `/api/v1/classrooms/${id}/gradebook/export-excel/?component=${exportComponent}`,
      )

      const fallbackFilename = `${classroom.name.replace(/\s+/g, '_')}_${exportComponent}_marks.xlsx`
      const filename = extractFilename(contentDisposition, fallbackFilename)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to export Excel file.')
    } finally {
      setExportBusy(false)
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<GradebookData>(`/api/v1/classrooms/${id}/gradebook/`)
      setData(res)
    } catch (e: any) {
      console.error('Gradebook load error', e)
      setError(e?.message ?? 'Failed to load gradebook.')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchWeightages = useCallback(async () => {
    setWeightageLoading(true)
    setWeightageMsg(null)
    try {
      const res = await apiJson<ClassroomWeightageConfig>(`/api/v1/classrooms/${id}/gradebook/weightages/`)
      const next: Record<string, WeightageFormItem> = {}
      for (const item of res.weightages) {
        next[weightageKey(item.assessment_component, item.task_type)] = {
          include_in_final: item.include_in_final,
          weightage: String(item.weightage ?? 0),
        }
      }
      const attendanceNext: Record<string, WeightageFormItem> = {}
      for (const item of res.attendance_weightages ?? []) {
        attendanceNext[attendanceWeightageKey(item.assessment_component)] = {
          include_in_final: item.include_in_final,
          weightage: String(item.weightage ?? 0),
        }
      }
      setWeightageForm(next)
      setAttendanceWeightageForm(attendanceNext)
      setWeightageTotal(res.total_configured_weightage)
    } catch (e: any) {
      setWeightageMsg(e?.message ?? 'Failed to load weightages.')
      setWeightageSuccess(false)
    } finally {
      setWeightageLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
    fetchWeightages()
  }, [fetchData, fetchWeightages])

  const formTotalsByComponent = useMemo(() => {
    return {
      theory: TASK_TYPE_CHOICES.reduce((total, choice) => {
        const row = weightageForm[weightageKey('theory', choice.value)]
        if (!row?.include_in_final) return total
        const value = Number.parseFloat(row.weightage)
        return total + (Number.isFinite(value) ? value : 0)
      }, 0) + (() => {
        const attendance = attendanceWeightageForm[attendanceWeightageKey('theory')]
        if (!attendance?.include_in_final) return 0
        const value = Number.parseFloat(attendance.weightage)
        return Number.isFinite(value) ? value : 0
      })(),
      lab: TASK_TYPE_CHOICES.reduce((total, choice) => {
        const row = weightageForm[weightageKey('lab', choice.value)]
        if (!row?.include_in_final) return total
        const value = Number.parseFloat(row.weightage)
        return total + (Number.isFinite(value) ? value : 0)
      }, 0) + (() => {
        const attendance = attendanceWeightageForm[attendanceWeightageKey('lab')]
        if (!attendance?.include_in_final) return 0
        const value = Number.parseFloat(attendance.weightage)
        return Number.isFinite(value) ? value : 0
      })(),
    }
  }, [weightageForm, attendanceWeightageForm])

  function updateWeightage(component: 'theory' | 'lab', taskType: string, patch: Partial<WeightageFormItem>) {
    setWeightageForm((prev) => {
      const key = weightageKey(component, taskType)
      const current = prev[key] ?? { include_in_final: false, weightage: '0' }
      return {
        ...prev,
        [key]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  function updateAttendanceWeightage(component: 'theory' | 'lab', patch: Partial<WeightageFormItem>) {
    setAttendanceWeightageForm((prev) => {
      const key = attendanceWeightageKey(component)
      const current = prev[key] ?? { include_in_final: false, weightage: '0' }
      return {
        ...prev,
        [key]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  async function saveWeightages() {
    setWeightageMsg(null)
    setWeightageSuccess(false)

    const normalized = TASK_COMPONENT_CHOICES.flatMap((componentChoice) => {
      const component = componentChoice.value as 'theory' | 'lab'
      return TASK_TYPE_CHOICES.map((choice) => {
        const row = weightageForm[weightageKey(component, choice.value)] ?? {
          include_in_final: false,
          weightage: '0',
        }
        const parsed = Number.parseFloat(row.weightage)
        const safeWeightage = Number.isFinite(parsed) ? parsed : 0
        return {
          assessment_component: component,
          task_type: choice.value,
          include_in_final: row.include_in_final,
          weightage: row.include_in_final ? safeWeightage : 0,
        }
      })
    })

    const hasInvalidPositive = normalized.some((item) => item.include_in_final && item.weightage <= 0)
    if (hasInvalidPositive) {
      setWeightageMsg('Included task types must have weightage greater than 0.')
      return
    }

    const normalizedAttendance = TASK_COMPONENT_CHOICES.map((componentChoice) => {
      const component = componentChoice.value as 'theory' | 'lab'
      const row = attendanceWeightageForm[attendanceWeightageKey(component)] ?? {
        include_in_final: false,
        weightage: '0',
      }
      const parsed = Number.parseFloat(row.weightage)
      const safeWeightage = Number.isFinite(parsed) ? parsed : 0
      return {
        assessment_component: component,
        include_in_final: row.include_in_final,
        weightage: row.include_in_final ? safeWeightage : 0,
      }
    })

    const invalidAttendance = normalizedAttendance.some(
      (item) => item.include_in_final && item.weightage <= 0,
    )
    if (invalidAttendance) {
      setWeightageMsg('Included attendance must have weightage greater than 0.')
      return
    }

    const totalsByComponent = normalized.reduce(
      (acc, item) => {
        if (item.include_in_final) {
          acc[item.assessment_component] += item.weightage
        }
        return acc
      },
      { theory: 0, lab: 0 },
    )
    for (const item of normalizedAttendance) {
      if (item.include_in_final) {
        totalsByComponent[item.assessment_component] += item.weightage
      }
    }
    if (totalsByComponent.theory > 100 || totalsByComponent.lab > 100) {
      setWeightageMsg('Total included weightage (tasks + attendance) cannot exceed 100 within Theory or Lab.')
      return
    }

    setWeightageSaving(true)
    try {
      const payload: ClassroomWeightageConfigPayload = {
        weightages: normalized,
        attendance_weightages: normalizedAttendance,
      }
      const res = await apiJson<ClassroomWeightageConfig>(`/api/v1/classrooms/${id}/gradebook/weightages/`, {
        method: 'PUT',
        body: payload,
      })
      setWeightageTotal(res.total_configured_weightage)
      setWeightageMsg('Weightages updated successfully.')
      setWeightageSuccess(true)
      await fetchData()
    } catch (e: any) {
      setWeightageMsg(e?.message ?? 'Failed to save weightages.')
      setWeightageSuccess(false)
    } finally {
      setWeightageSaving(false)
    }
  }

  const students = data?.students ?? []
  const filteredStudents = useMemo(() => {
    const query = studentSearchRollNo.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) => student.roll_no.toLowerCase().includes(query))
  }, [students, studentSearchRollNo])

  if (loading) return <div className="card p-8 animate-pulse text-center text-sm text-slate-500">Loading Gradebook...</div>
  if (error || !data) return <div className="text-red-600 text-sm">{error ?? 'Failed to load gradebook.'}</div>

  const { classroom, tasks } = data
  const selectedWeightageLabel =
    TASK_COMPONENT_CHOICES.find((choice) => choice.value === weightageComponent)?.label ?? 'Theory'
  const selectedWeightageTone = weightageComponent === 'lab'
    ? 'border-slate-300 bg-slate-100 text-slate-700'
    : 'border-brand-200 bg-brand-50 text-brand-700'

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link className="text-sm font-medium text-brand-600 hover:underline" to={`/classrooms/${id}`}>← Back to Classroom</Link>
            <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Gradebook: {classroom.name}</h1>
            <p className="mt-1 text-sm text-slate-600">Manage gradebook in focused tabs.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Students</div>
              <div className="text-lg font-bold text-slate-900">{students.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tasks</div>
              <div className="text-lg font-bold text-slate-900">{tasks.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Export Component</div>
              <div className="text-lg font-bold text-slate-900">{exportComponent === 'lab' ? 'Lab' : 'Theory'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={activeTab === 'overview' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button type="button" className={activeTab === 'weightage' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('weightage')}>
            Weightage
          </button>
          <button type="button" className={activeTab === 'students' ? 'btn-primary text-xs' : 'btn-secondary text-xs'} onClick={() => setActiveTab('students')}>
            Students
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Component (Export only)</div>
              <select
                className="input mt-2"
                value={exportComponent}
                onChange={(e) => setExportComponent(e.target.value as 'theory' | 'lab')}
              >
                {TASK_COMPONENT_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>{choice.label}</option>
                ))}
              </select>
            </div>

            <button className="btn-secondary h-fit w-full self-end lg:w-auto" onClick={onExportExcel} disabled={exportBusy}>
              {exportBusy ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'weightage' && (
        <div className="card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Final Marks Weightage</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isStudent
                    ? 'Weightages used for final marks calculation (read-only).'
                    : 'Configure task-type weightages separately for Theory and Lab.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                  Theory Total: {formTotalsByComponent.theory.toFixed(2)}%
                </div>
                <div className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  Lab Total: {formTotalsByComponent.lab.toFixed(2)}%
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => setShowWeightageForm((prev) => !prev)}
              >
                {showWeightageForm ? 'Hide Weightage' : isStudent ? 'View Weightage' : 'Configure Weightage'}
              </button>
            </div>

            {showWeightageForm && (weightageLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <div className="grid gap-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <label className="text-sm font-semibold text-slate-900" htmlFor="weightage-component-select">
                        Configure Component
                      </label>
                      <select
                        id="weightage-component-select"
                        className="input w-full sm:w-36"
                        value={weightageComponent}
                        onChange={(e) => setWeightageComponent(e.target.value as 'theory' | 'lab')}
                      >
                        {TASK_COMPONENT_CHOICES.map((choice) => (
                          <option key={choice.value} value={choice.value}>{choice.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedWeightageTone}`}>
                      {selectedWeightageLabel} Total: {formTotalsByComponent[weightageComponent].toFixed(2)}%
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {TASK_TYPE_CHOICES.map((choice) => {
                      const row = weightageForm[weightageKey(weightageComponent, choice.value)] ?? {
                        include_in_final: false,
                        weightage: '0',
                      }
                      return (
                        <div key={`${weightageComponent}-${choice.value}`} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{taskTypeLabel(choice.value)}</div>
                              <div className="text-xs text-slate-500">Type key: {choice.value}</div>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={row.include_in_final}
                                disabled={isStudent}
                                onChange={(e) => updateWeightage(weightageComponent, choice.value, { include_in_final: e.target.checked })}
                              />
                              Include
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                className="input w-full sm:w-28"
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={row.weightage}
                                disabled={isStudent || !row.include_in_final}
                                onChange={(e) => updateWeightage(weightageComponent, choice.value, { weightage: e.target.value })}
                              />
                              <span className="text-sm text-slate-500">%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {(() => {
                      const row = attendanceWeightageForm[attendanceWeightageKey(weightageComponent)] ?? {
                        include_in_final: false,
                        weightage: '0',
                      }
                      return (
                        <div key={`attendance-${weightageComponent}`} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">Attendance</div>
                              <div className="text-xs text-slate-500">Component-level attendance contribution</div>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={row.include_in_final}
                                disabled={isStudent}
                                onChange={(e) => updateAttendanceWeightage(weightageComponent, { include_in_final: e.target.checked })}
                              />
                              Include
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                className="input w-full sm:w-28"
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={row.weightage}
                                disabled={isStudent || !row.include_in_final}
                                onChange={(e) => updateAttendanceWeightage(weightageComponent, { weightage: e.target.value })}
                              />
                              <span className="text-sm text-slate-500">%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))}

            {showWeightageForm && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500">
                  Last saved overall total from server: {weightageTotal.toFixed(2)}%
                </div>
                {!isStudent && (
                  <button className="btn-primary w-full sm:w-auto" onClick={saveWeightages} disabled={weightageLoading || weightageSaving}>
                    {weightageSaving ? 'Saving...' : 'Save Weightages'}
                  </button>
                )}
              </div>
            )}

            {weightageMsg && (
              <div className={`rounded-xl border px-3 py-2 text-sm ${weightageSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {weightageMsg}
              </div>
            )}
        </div>
      )}

      {activeTab === 'students' && (
        students.length === 0 ? (
          <div className="card p-8 text-center text-slate-500 text-sm">No students found.</div>
        ) : (
          <div className="space-y-6">
            <div className="card p-4 sm:p-5">
              <label className="label">Search by Roll No</label>
              <input
                className="input mt-2"
                type="text"
                value={studentSearchRollNo}
                onChange={(e) => setStudentSearchRollNo(e.target.value.toUpperCase())}
                placeholder="e.g. THA079BEI042"
              />
              <p className="mt-2 text-xs text-slate-500">
                Showing {filteredStudents.length} of {students.length} student(s).
              </p>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="card p-6 text-sm text-slate-500">
                No students matched roll number "{studentSearchRollNo}".
              </div>
            ) : filteredStudents.map((student) => {
              const percentage = student.total_full_marks > 0
                ? Math.round((student.total_obtained / student.total_full_marks) * 100)
                : 0
              const finalMarks = Number.isFinite(student.final_marks) ? student.final_marks : 0
              const theoryTotals = student.component_totals?.theory ?? { obtained: 0, full_marks: 0 }
              const labTotals = student.component_totals?.lab ?? { obtained: 0, full_marks: 0 }
              const theoryAttendance = student.attendance?.theory
              const labAttendance = student.attendance?.lab

              return (
                <div key={student.id} className="card overflow-hidden">
                  <div className="bg-slate-50 px-4 py-4 flex flex-wrap justify-between items-start gap-3 border-b border-slate-200 sm:px-6 sm:items-center">
                    <div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Student</div>
                      <div className="text-base font-semibold text-slate-900 mt-1">{student.roll_no} <span className="text-slate-400 text-sm font-normal">(@{student.username})</span></div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-bold text-slate-900">
                        {student.total_obtained} <span className="text-slate-400 text-base font-normal">/ {student.total_full_marks}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                        <div className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          Raw: {percentage}%
                        </div>
                        <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          Final: {finalMarks.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Theory: {theoryTotals.obtained}/{theoryTotals.full_marks} | Lab: {labTotals.obtained}/{labTotals.full_marks}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Attendance - Theory: {theoryAttendance?.percentage ?? 0}% ({theoryAttendance?.present ?? 0}/{theoryAttendance?.total ?? 0}) | Lab: {labAttendance?.percentage ?? 0}% ({labAttendance?.present ?? 0}/{labAttendance?.total ?? 0})
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 text-slate-500">
                          <th className="px-3 py-3 font-medium sm:px-6">Task</th>
                          <th className="px-3 py-3 font-medium sm:px-6">Type</th>
                          <th className="px-3 py-3 font-medium text-right sm:px-6">Full Marks</th>
                          <th className="px-3 py-3 font-medium text-right sm:px-6">Obtained</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 bg-white">
                        {tasks.length === 0 ? (
                          <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400 sm:px-6">No tasks available.</td></tr>
                        ) : (
                          tasks.map(t => {
                            const obtained = student.marks[t.id]
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-4 font-medium text-slate-900 sm:px-6">{t.name}</td>
                                <td className="px-3 py-4 text-slate-600 sm:px-6">{taskTypeLabel(t.task_type)} ({t.assessment_component === 'lab' ? 'Lab' : 'Theory'})</td>
                                <td className="px-3 py-4 text-right text-slate-500 sm:px-6">{t.full_marks}</td>
                                <td className="px-3 py-4 text-right font-semibold text-slate-900 sm:px-6">
                                  {obtained ?? <span className="text-slate-400 font-normal">—</span>}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                        <tr>
                          <td className="px-3 py-4 text-xs uppercase tracking-wider text-slate-900 text-right sm:px-6" colSpan={2}>Total</td>
                          <td className="px-3 py-4 text-right text-slate-900 sm:px-6">{student.total_full_marks}</td>
                          <td className="px-3 py-4 text-right text-slate-900 sm:px-6">{student.total_obtained}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
