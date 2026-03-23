import { useCallback, useEffect, useState } from 'react'
import { apiFormData, apiJson } from '../lib/api'
import type { Resource } from '../lib/types'
import { firstFieldError, getFieldErrors, type FieldErrors } from '../lib/validation'
import { useAuth } from '../state/auth'
import { PDFViewerModal } from './PDFViewerModal'

interface Props {
  contentType: string
  objectId: string
}

export function ResourcesPanel({ contentType, objectId }: Props) {
  const { user } = useAuth()
  const isStudent = !!(user?.profile && 'roll_no' in user.profile)

  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upload form
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // PDF Viewer
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiJson<Resource[]>(
        `/api/v1/resources/?content_type=${contentType}&object_id=${objectId}`,
      )
      setResources(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [contentType, objectId])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  async function onUpload(e: React.FormEvent) {
    e.preventDefault()
    setUploadMsg(null)
    setUploadSuccess(false)
    setFieldErrors(null)

    const clientErrors: FieldErrors = {}
    if (!name.trim()) clientErrors.name = ['Resource name is required.']
    if (!file) clientErrors.file = ['Please select a file to upload.']
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('file', file!)
      fd.append('content_type', contentType)
      fd.append('object_id', objectId)
      await apiFormData<Resource>('/api/v1/resources/', fd)
      setName('')
      setFile(null)
      // Reset the file input visually
      const fileInput = document.getElementById(`resource-file-${objectId}`) as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
      setUploadMsg('Resource uploaded successfully.')
      setUploadSuccess(true)
      setShowUploadForm(false)
      await fetchResources()
    } catch (err: any) {
      setFieldErrors(getFieldErrors(err))
      setUploadMsg(err?.message ?? 'Upload failed')
      setUploadSuccess(false)
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this resource?')) return
    setDeletingId(id)
    try {
      await apiJson(`/api/v1/resources/${id}/`, { method: 'DELETE' })
      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Resources</div>
          <p className="mt-0.5 text-sm text-slate-500">
            Attached files for reference and download.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isStudent && (
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => {
                setShowUploadForm((prev) => !prev)
                setFieldErrors(null)
              }}
            >
              {showUploadForm ? 'Cancel' : 'Upload Resource'}
            </button>
          )}
          <button
            className="btn-secondary text-xs"
            onClick={fetchResources}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Upload form (teachers only) */}
      {!isStudent && showUploadForm && (
        <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={onUpload}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Upload New Resource
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Resource Name</label>
              <input
                className="input mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lab Report Template"
              />
              {firstFieldError(fieldErrors, 'name') && (
                <div className="mt-1 text-xs font-medium text-red-600">
                  {firstFieldError(fieldErrors, 'name')}
                </div>
              )}
            </div>
            <div>
              <label className="label">File</label>
              <input
                id={`resource-file-${objectId}`}
                className="input mt-1"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {firstFieldError(fieldErrors, 'file') && (
                <div className="mt-1 text-xs font-medium text-red-600">
                  {firstFieldError(fieldErrors, 'file')}
                </div>
              )}
            </div>
          </div>
          <button className="btn-primary text-sm" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {uploadMsg && (
            <div
              className={`mt-2 rounded-xl border px-3 py-2 text-sm ${
                uploadSuccess
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {uploadMsg}
            </div>
          )}
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
          No resources attached yet.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-100">
          {resources.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">{r.name}</div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {new Date(r.uploaded_at).toLocaleDateString()} · {r.uploaded_by}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.file.split('?')[0].toLowerCase().endsWith('.pdf') && (
                  <button
                    onClick={() => setViewingPdf({ url: r.file, title: r.name })}
                    className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    View PDF
                  </button>
                )}
                <a
                  href={r.file}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Download ↗
                </a>
                {!isStudent && (
                  <button
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                    onClick={() => onDelete(r.id)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id ? '…' : 'Delete'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewingPdf && (
        <PDFViewerModal
          url={viewingPdf.url}
          title={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </div>
  )
}
