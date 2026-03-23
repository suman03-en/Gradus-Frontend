import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAuth } from '../state/auth'

function cx(isActive: boolean) {
  return [
    'relative rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
    isActive 
      ? 'bg-slate-100 text-slate-900' 
      : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800',
  ].join(' ')
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const brandHref = user ? '/dashboard' : '/'

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <Link to={brandHref} className="flex items-center gap-3 group">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white transition-colors group-hover:bg-brand-800">
                <span className="text-base font-bold">G</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight text-slate-900">Gradus</div>
                <div className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:block">Internal Mark Evaluation</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 md:flex">
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
                  <div className="mx-1 h-4 w-px bg-slate-200" />
                  <NavLink to="/about" className={({ isActive }) => cx(isActive)}>
                    About
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" className={({ isActive }) => cx(isActive)}>
                    Home
                  </NavLink>
                  <NavLink to="/login" className={({ isActive }) => cx(isActive)}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={({ isActive }) => cx(isActive)}>
                    Register
                  </NavLink>
                  <div className="mx-1 h-4 w-px bg-slate-200" />
                  <NavLink to="/about" className={({ isActive }) => cx(isActive)}>
                    About
                  </NavLink>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-right sm:block">
                    <div className="text-xs font-semibold text-slate-700">@{user.username}</div>
                    <div className="text-[11px] text-slate-500">{user.email || 'No email added'}</div>
                  </div>
                  <button className="btn-secondary px-3 py-2 text-xs" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink to="/register" className="btn-secondary px-3 py-2 text-xs">
                    Register
                  </NavLink>
                  <NavLink to="/login" className="btn-primary px-3 py-2 text-xs">
                    Sign in
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {user ? (
            <nav className="flex items-center gap-2 overflow-x-auto pb-3 md:hidden">
              <NavLink to="/dashboard" className={({ isActive }) => cx(isActive)}>
                Dashboard
              </NavLink>
              <NavLink to="/classrooms" className={({ isActive }) => cx(isActive)}>
                Classrooms
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => cx(isActive)}>
                Profile
              </NavLink>
              <div className="mx-1 h-4 w-px bg-slate-300" />
              <NavLink to="/about" className={({ isActive }) => cx(isActive)}>
                About
              </NavLink>
            </nav>
          ) : null}
        </div>
      </header>

      <main className="flex-1 container-page surface-rise py-6 md:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-page flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-slate-500">
              © 2026 <span className="font-semibold text-slate-700">Gradus</span> · Internal Mark Evaluation System
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Academic Workflow Platform</div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="text-slate-600 hover:text-slate-900 font-medium transition">
              About & Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
