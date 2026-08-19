import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Loader2, User, Lock, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setTokens(data.access, data.refresh)
      setUser(data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    try {
      const demoData = {
        username: `Citizen_Demo`,
        email: `demo@schemechecker.in`,
        password: 'password123',
        password2: 'password123',
      }
      const { data } = await authApi.register(demoData)
      setTokens(data.access, data.refresh)
      setUser(data.user)
      toast.success('Signed in as Demo Citizen!')
      navigate('/dashboard')
    } catch {
      toast.error('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-5xl glass rounded-3xl border border-surface-800/80 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Citizen Portal Sign In
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">Welcome back</h1>
            <p className="text-surface-400 text-sm mt-1">Sign in to review your saved schemes and eligibility updates.</p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-700 text-surface-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant One-Click Guest Access</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-800 w-full" />
            <span className="bg-surface-950 px-3 text-xs text-surface-500 uppercase tracking-wider">or sign in with credentials</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="input-label mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => toast('Password reset link sent to registered email in live mode.')}
                  className="text-xs text-primary-400 hover:text-primary-300 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="text-xs text-surface-400">
                Keep me signed in on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold justify-center shadow-glow mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard →'}
            </button>

            <p className="text-center text-surface-400 text-xs pt-2">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold underline">
                Create one free in 30 seconds
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side: Brand Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary-600/30 via-accent-600/20 to-orange-600/10 p-10 flex-col justify-between border-l border-surface-800/80 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display font-black text-2xl text-white leading-tight mb-3">
              Personalized Welfare Dashboard
            </h3>
            <p className="text-surface-300 text-sm leading-relaxed">
              Track eligibility changes as new government schemes and state budgets are announced.
            </p>
          </div>

          <div className="space-y-3.5 my-8">
            {[
              'Save & bookmark high-value schemes for offline reference',
              'Deterministic rule breakdown with reason explanations',
              'AI Assistant (SchemeBot) for personalized guidance',
              'Direct submission links & document requirements',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2.5 text-xs text-surface-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-surface-950/60 border border-surface-800 text-xs text-surface-400">
            🏛️ <strong>Official Data</strong>: Aligned with Gazette guidelines across Central & State ministries.
          </div>
        </div>

      </div>
    </div>
  )
}
