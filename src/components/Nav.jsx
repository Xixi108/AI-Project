import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/weather', label: '🇵🇭 Weather' },
  { to: '/email-generator', label: '✉️ Email Generator' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const isDark = pathname === '/' || pathname === '/weather'

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${isDark ? 'bg-gray-950/90 border-white/8 text-white' : 'bg-white/90 border-gray-200 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 font-bold text-sm">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">⚡</div>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>DevSuite</span>
        </NavLink>

        <div className="flex items-center gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-white/10 text-white'
                      : 'bg-violet-50 text-violet-700'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/8'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
