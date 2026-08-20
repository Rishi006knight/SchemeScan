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
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-gray-900">
              Scheme<span className="gradient-text">Checker</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs'
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50/70'
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
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost btn-sm gap-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-sm px-4 py-2 text-sm font-bold shadow-md shadow-violet-500/20">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 bg-white animate-slide-down">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(to) ? 'text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-3 border-t border-gray-200 mt-3">
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
