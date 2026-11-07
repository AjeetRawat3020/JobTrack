
type SidebarProps = {
  username: string
  activePage: 'dashboard' | 'applications' | 'interviews'
  onNavigate: (page: 'dashboard' | 'applications' | 'interviews') => void
}

function Sidebar({ username, activePage, onNavigate }: SidebarProps) {
  const displayName = username || 'Job Seeker'

  const navigationItems = [
    { label: 'Dashboard', icon: '▦', page: 'dashboard' as const },
    { label: 'My Applications', icon: '▤', page: 'applications' as const },
    { label: 'Interviews', icon: '◷', page: 'interviews' as const },
  ]

  return (
    <aside className="sidebar flex min-h-screen flex-col bg-white">
      <div className="brand flex items-center gap-3">
        <span className="brand-icon flex items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm">
          J
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-800">
          JobTrack
        </span>
      </div>

      <p className="nav-heading mb-3 mt-8 px-3 text-xs font-bold tracking-widest text-slate-400">
        WORKSPACE
      </p>

      <nav className="navigation flex flex-col gap-1">
        {navigationItems.map((item) => (
          <button
            key={item.page}
            type="button"
            onClick={() => onNavigate(item.page)}
            aria-current={activePage === item.page ? 'page' : undefined}
            className={`nav-link flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors duration-200 ${
              activePage === item.page
                ? 'active bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg">
              {item.icon}
            </span>
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom mt-auto flex items-center gap-3 border-t border-slate-100 px-3 py-5">
        <div className="avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold text-slate-800">
            {displayName}
          </strong>
          <p className="mt-1 text-xs text-slate-400">
            Personal workspace
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
