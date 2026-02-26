import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../state/auth'

function cx(isActive: boolean) {
  return [
    'relative px-3 py-2 text-sm font-medium transition-all duration-200',
    isActive 
      ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-brand-600' 
      : 'text-slate-500 hover:text-slate-800',
  ].join(' ')
}

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <span className="text-base font-bold">G</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-900 tracking-tight">Gradus</div>
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Internal Marks</div>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {user ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => cx(isActive)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/classrooms" className={({ isActive }) => cx(isActive)}>
                    Classrooms
                  </NavLink>
                  <NavLink to="/profile" className={({ isActive }) => cx(isActive)}>
                    Profile
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={({ isActive }) => cx(isActive)}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={({ isActive }) => cx(isActive)}>
                    Register
                  </NavLink>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden text-right sm:block">
                    <div className="text-xs font-medium text-slate-700">@{user.username}</div>
                    <div className="text-[11px] text-slate-400">{user.email || '—'}</div>
                  </div>
                  <button className="btn-secondary text-xs" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="btn-primary">
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="container-page py-6 text-xs text-slate-400">
          © 2026 <span className="font-medium text-slate-500">Gradus</span> · Internal Mark Evaluation System
        </div>
      </footer>
    </div>
  )
}
