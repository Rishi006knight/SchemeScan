import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, Sparkles, Search, Shield, Zap, Users, Award, ChevronRight } from 'lucide-react'
import { schemeApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store'

const CATEGORIES = [
  { label: 'Agriculture', icon: '🌾', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  { label: 'Education', icon: '📚', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { label: 'Health', icon: '🏥', color: 'from-red-500/20 to-rose-500/20 border-red-500/30' },
  { label: 'Housing', icon: '🏠', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' },
  { label: 'Women', icon: '👩', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  { label: 'Finance', icon: '💰', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  { label: 'Pension', icon: '👴', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
  { label: 'MSME', icon: '🏭', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30' },
]

const STEPS = [
  { step: '01', title: 'Create Profile', desc: 'Fill in your details once — age, income, state, occupation, and more.', icon: Users },
  { step: '02', title: 'Check Eligibility', desc: 'Our engine evaluates 10+ conditions across all active schemes instantly.', icon: Zap },
  { step: '03', title: 'Apply with Confidence', desc: 'Get a personalized list with explanations. Apply only where you qualify.', icon: Award },
]

export default function LandingPage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const { data: schemesData } = useQuery({
    queryKey: ['schemes-count'],
    queryFn: () => schemeApi.list(),
  })

  const schemeCount = schemesData?.data?.count ? `${schemesData.data.count}+` : '135+'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/schemes?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="page-container relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Government Scheme Discovery
              <span className="ml-1 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">Free</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tight mb-6 text-white">
              Find Every Scheme You{' '}
              <span className="gradient-text">Qualify For</span>
            </h1>
            <p className="text-xl text-surface-300 max-w-2xl mx-auto mb-10">
              Stop searching dozens of government portals. Enter your details once,
              let our explainable AI rule engine match you with 135+ central and state benefits.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="glass p-2 flex items-center gap-2 rounded-2xl shadow-2xl">
              <Search className="w-5 h-5 text-surface-400 ml-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try 'farmer in Tamil Nadu' or 'scholarship for girl student'..."
                className="flex-1 bg-transparent text-surface-100 placeholder-surface-500 text-base focus:outline-none px-2 py-2"
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary btn-lg gap-2">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-lg gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/schemes" className="btn-secondary btn-lg">
                  Browse All 135+ Schemes
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: schemeCount, label: 'Schemes Available' },
              { value: '28+', label: 'States Covered' },
              { value: '100%', label: 'Free Forever' },
              { value: 'AI', label: 'Powered Checker' },
            ].map(({ value, label }) => (
              <div key={label} className="glass p-4 text-center">
                <p className="text-3xl font-display font-bold gradient-text">{value}</p>
                <p className="text-sm text-surface-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find schemes in the areas that matter most to you</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon, color }) => (
              <Link
                key={label}
                to={`/schemes?category=${label}`}
                className={`group card-hover p-5 text-center bg-gradient-to-br ${color} border`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <ChevronRight className="w-4 h-4 text-surface-400 mx-auto mt-2 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-900/30">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to discover your benefits</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card p-8 text-center group hover:border-primary-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary-400" />
                </div>
                <div className="text-xs font-bold text-primary-400 tracking-widest mb-3">STEP {step}</div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Results', desc: 'Get eligibility results in seconds with explainable decisions.', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
              { icon: Shield, title: 'Explainable AI', desc: 'We show you exactly why you qualify or don\'t — no black box.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
              { icon: Sparkles, title: 'AI Chatbot', desc: 'Ask SchemeBot anything about government benefits in plain English.', color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/30' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`card p-6 border ${bg}`}>
                <Icon className={`w-8 h-8 ${color} mb-4`} />
                <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-surface-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="page-container">
            <div className="relative card p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10" />
              <div className="relative">
                <h2 className="text-4xl font-display font-bold text-white mb-4">
                  Ready to find your benefits?
                </h2>
                <p className="text-surface-400 mb-8 text-lg">
                  Create a free profile and check eligibility for all schemes in under 2 minutes.
                </p>
                <Link to="/register" className="btn-primary btn-lg">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8">
        <div className="page-container text-center text-surface-500 text-sm">
          <p>SchemeChecker — Empowering citizens to access government benefits they deserve.</p>
          <p className="mt-2">Data from official government portals. Always verify on official websites before applying.</p>
        </div>
      </footer>
    </div>
  )
}
