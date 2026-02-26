import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../lib/api'
import type { Classroom, User } from '../lib/types'
import { useAuth } from '../state/auth'

function isStudent(user: User | null) {
  return !!(user?.profile && 'roll_no' in user.profile)
}

export function ClassroomsPage() {
  const { user } = useAuth()
  const student = useMemo(() => isStudent(user), [user])

  const [items, setItems] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inviteCode, setInviteCode] = useState('')
  const [joinMsg, setJoinMsg] = useState<string | null>(null)

  const [create, setCreate] = useState({ name: '', description: '' })
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  async function refresh() {
    setError(null)
    setLoading(true)
    try {
      const data = await apiJson<Classroom[]>('/api/v1/classrooms/')
      setItems(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinMsg(null)
    try {
      const res = await apiJson<{ detail: string }>('/api/v1/classrooms/join/', {
        method: 'POST',
        body: { invite_code: inviteCode.trim() },
      })
      setJoinMsg(res.detail)
      setInviteCode('')
      await refresh()
    } catch (err: any) {
      setJoinMsg(err?.message ?? 'Join failed')
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateMsg(null)
    try {
      const created = await apiJson<Classroom>('/api/v1/classrooms/', {
        method: 'POST',
        body: { name: create.name.trim(), description: create.description.trim(), students: [] },
      })
      setCreateMsg(`Created "${created.name}" (invite: ${created.invite_code})`)
      setCreate({ name: '', description: '' })
      await refresh()
    } catch (err: any) {
      setCreateMsg(err?.message ?? 'Create failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Classrooms</h1>
          <p className="mt-1 text-sm text-slate-500">
            {student ? 'Your joined classrooms' : 'Your created classrooms'}
          </p>
        </div>
        <button className="btn-secondary" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {student ? (
        <div className="card p-6">
          <div className="text-sm font-semibold text-slate-900">Join a classroom</div>
          <p className="mt-1 text-sm text-slate-500">Enter the invite code provided by your teacher.</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onJoin}>
            <input className="input flex-1" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Invite code" />
            <button className="btn-primary" disabled={!inviteCode.trim()}>
              Join
            </button>
          </form>
          {joinMsg ? <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{joinMsg}</div> : null}
        </div>
      ) : (
        <div className="card p-6">
          <div className="text-sm font-semibold text-slate-900">Create a classroom</div>
          <p className="mt-1 text-sm text-slate-500">Students can join using the generated invite code.</p>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onCreate}>
            <div className="sm:col-span-1">
              <label className="label">Name</label>
              <input className="input mt-1" value={create.name} onChange={(e) => setCreate((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="sm:col-span-1">
              <label className="label">Description</label>
              <input
                className="input mt-1"
                value={create.description}
                onChange={(e) => setCreate((c) => ({ ...c, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <button className="btn-primary" disabled={!create.name.trim() || !create.description.trim()}>
                Create
              </button>
            </div>
          </form>
          {createMsg ? <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{createMsg}</div> : null}
        </div>
      )}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
          ))
        ) : items.length ? (
          items.map((c) => (
            <Link key={c.id} to={`/classrooms/${c.id}`} className="card p-5 hover:border-brand-200 transition">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
                <div className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                <span className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  {c.created_by}
                </span>
                <span className="px-2 py-1 bg-brand-50 text-brand-600 rounded-lg border border-brand-100">Code: {c.invite_code}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-6 sm:col-span-2 lg:col-span-3">
            <div className="text-sm font-medium text-slate-900">No classrooms yet</div>
            <div className="mt-1 text-sm text-slate-500">
              {student ? 'Join one with an invite code.' : 'Create your first classroom above.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
