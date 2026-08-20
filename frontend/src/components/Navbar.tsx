import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Sparkles, Menu, X, LogOut, LayoutDashboard, BookmarkCheck, Search, User as UserIcon, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    setMobileOpen(false)
    navigate('/')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/schemes', label: 'Browse Schemes', icon: Search },
        { to: '/eligibility', label: 'Check Eligibility', icon: Sparkles },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/bookmarks', label: 'Saved Schemes', icon: BookmarkCheck },
        { to: '/profile', label: 'My Profile', icon: UserIcon },
      ]
    : [
        { to: '/schemes', label: 'Browse Schemes', icon: Search },
        { to: '/eligibility', label: 'Check Eligibility', icon: Sparkles },
      ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
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
              {navLinks.filter(l => l.to !== '/profile').map(({ to, label, icon: Icon }) => (
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

            {/* Desktop Auth buttons */}
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

            {/* Mobile menu toggle (hamburger) */}
            <button
              className="md:hidden p-2.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-[70] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto md:hidden"
            >
              <div className="space-y-6">
                {/* Header with Close button */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-bold text-lg text-gray-900">
                      Scheme<span className="gradient-text">Checker</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {isAuthenticated ? (
                  <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white shadow-xs">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{user?.username}</p>
                      <p className="text-xs text-violet-700 font-medium">Logged in</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full py-3 text-sm font-bold justify-center"
                    >
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary w-full py-2.5 text-sm font-semibold justify-center"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">Navigation</p>
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive(to)
                          ? 'bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs'
                          : 'text-gray-700 hover:text-violet-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-violet-600" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Logout Button */}
              {isAuthenticated && (
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
