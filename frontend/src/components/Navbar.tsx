import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Sparkles, Menu, X, LogOut, LayoutDashboard, BookmarkCheck, Search } from 'lucide-react'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/schemes', label: 'Browse Schemes', icon: Search },
        { to: '/eligibility', label: 'Check Eligibility', icon: Sparkles },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/bookmarks', label: 'Saved', icon: BookmarkCheck },
      ]
    : [
        { to: '/schemes', label: 'Browse Schemes', icon: Search },
      ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">
              Scheme<span className="gradient-text">Checker</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                    : 'text-surface-300 hover:text-white hover:bg-surface-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-surface-300 group-hover:text-white">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost btn-sm gap-1.5">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started Free</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-800 py-3 animate-slide-down">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to) ? 'text-primary-400 bg-primary-500/10' : 'text-surface-300 hover:text-white hover:bg-surface-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-3 border-t border-surface-800 mt-3">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-secondary btn-sm w-full justify-center">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1 justify-center">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1 justify-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
