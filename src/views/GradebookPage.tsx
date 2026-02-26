import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiJson } from '../lib/api'
import type { GradebookData } from '../lib/types'

export function GradebookPage() {
  const { id } = useParams()
  const [data, setData] = useState<GradebookData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiJson<GradebookData>(`/api/v1/classrooms/${id}/gradebook/`)
      setData(res)
    } catch (e) {
      console.error('Gradebook load error', e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <div className="card p-8 animate-pulse text-center text-sm text-slate-500">Loading Gradebook...</div>
  if (!data) return <div className="text-red-600 text-sm">Failed to load gradebook.</div>

  const { classroom, tasks, students } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-brand-600 hover:underline" to={`/classrooms/${id}`}>← Back to Classroom</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Gradebook: {classroom.name}</h1>
        </div>
        <button className="btn-secondary" onClick={() => window.print()}>Export PDF</button>
      </div>

      {students.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">No students found.</div>
      ) : (
        <div className="space-y-6">
          {students.map((student) => {
            const percentage = student.total_full_marks > 0
              ? Math.round((student.total_obtained / student.total_full_marks) * 100)
              : 0

            return (
              <div key={student.id} className="card overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-200">
                  <div>
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Student</div>
                    <div className="text-base font-semibold text-slate-900 mt-1">{student.roll_no} <span className="text-slate-400 text-sm font-normal">(@{student.username})</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-600">
                      {student.total_obtained} <span className="text-slate-400 text-base font-normal">/ {student.total_full_marks}</span>
                    </div>
                    <div className="inline-block mt-1 px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                      {percentage}%
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-500">
                        <th className="px-6 py-3 font-medium w-1/2">Task</th>
                        <th className="px-6 py-3 font-medium text-right">Full Marks</th>
                        <th className="px-6 py-3 font-medium text-right">Obtained</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {tasks.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-400 text-sm">No tasks available.</td></tr>
                      ) : (
                        tasks.map(t => {
                          const obtained = student.marks[t.id]
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{t.full_marks}</td>
                              <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                {obtained ?? <span className="text-slate-400 font-normal">—</span>}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                      <tr>
                        <td className="px-6 py-4 text-slate-900 text-right uppercase tracking-wider text-xs">Total</td>
                        <td className="px-6 py-4 text-right text-slate-900">{student.total_full_marks}</td>
                        <td className="px-6 py-4 text-right text-brand-700">{student.total_obtained}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
