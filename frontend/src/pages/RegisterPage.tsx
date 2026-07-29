import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } }
      const msgs = error.response?.data
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const perks = ['Free forever', 'No spam', 'Instant results']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Create your account</h1>
          <p className="text-surface-400 mt-2">Start finding government benefits you qualify for</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            {perks.map(p => (
              <span key={p} className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> {p}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          <div>
            <label className="input-label">Username</label>
            <input type="text" className="input" placeholder="your_username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>

          <div>
            <label className="input-label">Email</label>
            <input type="email" className="input" placeholder="you@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-11"
                placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Confirm Password</label>
            <input type="password" className="input" placeholder="Repeat password"
              value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Free Account'}
          </button>

          <p className="text-center text-surface-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
