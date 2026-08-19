import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Lock, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [agree, setAgree] = useState(true)
  const [loading, setLoading] = useState(false)
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: '', color: 'bg-surface-700' }
    if (pass.length < 6) return { level: 1, text: 'Too short', color: 'bg-red-500' }
    if (pass.length < 8) return { level: 2, text: 'Medium', color: 'bg-amber-500' }
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { level: 3, text: 'Strong', color: 'bg-emerald-500' }
    return { level: 2, text: 'Fair', color: 'bg-amber-500' }
  }

  const strength = getPasswordStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agree) {
      toast.error('Please accept the Terms of Service to continue')
      return
    }
    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      setTokens(data.access, data.refresh)
      setUser(data.user)
      toast.success('Account created! Welcome to SchemeChecker 🎉')
      navigate('/profile')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    try {
      const demoData = {
        username: `Citizen_${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `citizen${Date.now()}@example.com`,
        password: 'password123',
        password2: 'password123',
      }
      const { data } = await authApi.register(demoData)
      setTokens(data.access, data.refresh)
      setUser(data.user)
      toast.success('Signed in as Demo Citizen!')
      navigate('/profile')
    } catch {
      toast.error('Quick demo failed')
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
              <Sparkles className="w-3.5 h-3.5" /> 100% Free Citizen Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">Create your free account</h1>
            <p className="text-surface-400 text-sm mt-1">Start discovering all government welfare schemes you qualify for.</p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-700 text-surface-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant One-Click Guest Access (No Signup Needed)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-800 w-full" />
            <span className="bg-surface-950 px-3 text-xs text-surface-500 uppercase tracking-wider">or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="e.g. Ramesh Kumar"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="ramesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.level / 3) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-surface-400 text-right">Strength: {strength.text}</p>
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Repeat your password"
                  value={form.password2}
                  onChange={(e) => setForm({ ...form, password2: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="agree" className="text-xs text-surface-400">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold justify-center shadow-glow mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Free Account →'}
            </button>

            <p className="text-center text-surface-400 text-xs pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold underline">
                Sign in here
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
              Unlock Your Central & State Benefits
            </h3>
            <p className="text-surface-300 text-sm leading-relaxed">
              India has over ₹3 Lakh Crore allocated in welfare budgets every year. Find the exact portion meant for you.
            </p>
          </div>

          <div className="space-y-3.5 my-8">
            {[
              '135+ Central & State Schemes verified',
              'Deterministic Explainable AI rule engine',
              'Direct links to official government application forms',
              'AI OCR Scanner for Aadhaar & Income Certificates',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2.5 text-xs text-surface-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-surface-950/60 border border-surface-800 text-xs text-surface-400">
            🔒 <strong>100% Privacy</strong>: Your data is never sold or shared. Used solely to match welfare rules.
          </div>
        </div>

      </div>
    </div>
  )
}
