import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <div className="card p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

