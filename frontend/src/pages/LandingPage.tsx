import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, Search, Zap, Users, Award, ChevronRight,
  ArrowRight, Star, ChevronDown, Check,
  Building2, ShieldCheck
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { schemeApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import AnimatedCounter from '@/components/AnimatedCounter'
import ScrollReveal from '@/components/ScrollReveal'

const CATEGORIES = [
  { label: 'Agriculture', icon: '🌾', count: '10+ Schemes', color: 'from-green-500/30 to-emerald-500/15 border-green-500/40 hover:shadow-green-500/10' },
  { label: 'Education', icon: '📚', count: '12+ Schemes', color: 'from-blue-500/30 to-indigo-500/15 border-blue-500/40 hover:shadow-blue-500/10' },
  { label: 'Healthcare', icon: '🏥', count: '11+ Schemes', color: 'from-red-500/30 to-rose-500/15 border-red-500/40 hover:shadow-red-500/10' },
  { label: 'Housing', icon: '🏠', count: '6+ Schemes', color: 'from-amber-500/30 to-yellow-500/15 border-amber-500/40 hover:shadow-amber-500/10' },
  { label: 'Women', icon: '👩', count: '10+ Schemes', color: 'from-pink-500/30 to-rose-500/15 border-pink-500/40 hover:shadow-pink-500/10' },
  { label: 'MSME & Loans', icon: '🏭', count: '10+ Schemes', color: 'from-orange-500/30 to-amber-500/15 border-orange-500/40 hover:shadow-orange-500/10' },
  { label: 'Pensions', icon: '👴', count: '10+ Schemes', color: 'from-purple-500/30 to-violet-500/15 border-purple-500/40 hover:shadow-purple-500/10' },
  { label: 'State Schemes', icon: '🏛️', count: '50+ Schemes', color: 'from-teal-500/30 to-emerald-500/15 border-teal-500/40 hover:shadow-teal-500/10' },
]

const FEATURED_SCHEMES = [
  {
    name: 'PM-KISAN (Kisan Samman Nidhi)',
    category: 'Agriculture',
    benefit: '₹6,000 / year direct bank transfer in 3 installments',
    tag: 'All Landholding Farmers',
    color: 'border-t-4 border-t-green-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-green-500/20 text-green-300',
  },
  {
    name: 'Ayushman Bharat (AB-PMJAY)',
    category: 'Healthcare',
    benefit: '₹5,00,000 / family / year cashless hospitalization',
    tag: 'Secondary & Tertiary Care',
    color: 'border-t-4 border-t-red-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-red-500/20 text-red-300',
  },
  {
    name: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women & Child',
    benefit: '8.2% tax-free compounding interest for girl children',
    tag: 'Age 0–10 Years',
    color: 'border-t-4 border-t-pink-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-pink-500/20 text-pink-300',
  },
  {
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Housing & Solar',
    benefit: 'Up to ₹78,000 direct subsidy + 300 units free power',
    tag: 'Rooftop Solar',
    color: 'border-t-4 border-t-amber-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  {
    name: 'PM Mudra Loan (Shishu / Kishor / Tarun)',
    category: 'MSME',
    benefit: 'Collateral-free loans up to ₹20,00,000 for small businesses',
    tag: 'Entrepreneurs & Micro Units',
    color: 'border-t-4 border-t-blue-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  {
    name: 'Atal Pension Yojana (APY)',
    category: 'Pensions',
    benefit: 'Guaranteed ₹1,000 to ₹5,000/month lifelong pension from age 60',
    tag: 'Unorganized Workers',
    color: 'border-t-4 border-t-purple-500 border-surface-700 bg-surface-900/80',
    badge: 'bg-purple-500/20 text-purple-300',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Enter basic details once: age, state, annual income, occupation, and family size.',
    icon: Users,
    color: 'from-primary-500/25 to-primary-600/10 text-primary-400',
  },
  {
    step: '02',
    title: 'Instant Rule Engine Matching',
    desc: 'Our explainable AI tests your profile against 135+ Central and State welfare rules in under 1 second.',
    icon: Zap,
    color: 'from-accent-500/25 to-accent-600/10 text-accent-400',
  },
  {
    step: '03',
    title: 'Claim Verified Benefits',
    desc: 'Get a clear breakdown of why you qualify, documents required, and official direct application portals.',
    icon: Award,
    color: 'from-emerald-500/25 to-emerald-600/10 text-emerald-400',
  },
]

const TESTIMONIALS = [
  {
    quote: "I found 3 agricultural and equipment subsidies I never knew existed in Tamil Nadu. Applied for PM-KISAN and SMAM the same afternoon!",
    name: "Rajesh Kannan",
    role: "Farmer, Thanjavur (Tamil Nadu)",
    initials: "RK",
    border: "border-l-4 border-l-emerald-500",
    color: "from-green-500 to-emerald-700",
  },
  {
    quote: "As a first-generation engineering student, SchemeChecker matched me with the AICTE Pragati scholarship that covers my entire tuition fees.",
    name: "Priya Murthy",
    role: "B.Tech Student, Pune (Maharashtra)",
    initials: "PM",
    border: "border-l-4 border-l-blue-500",
    color: "from-blue-500 to-indigo-700",
  },
  {
    quote: "The explainable AI breakdown showed me exactly why my workshop qualified for the PM Mudra Kishor loan. No middlemen, zero confusion.",
    name: "Amit Sharma",
    role: "Small Business Owner, Ahmedabad (Gujarat)",
    initials: "AS",
    border: "border-l-4 border-l-amber-500",
    color: "from-amber-500 to-orange-700",
  },
]

const FAQS = [
  {
    q: 'Is SchemeChecker really 100% free?',
    a: 'Yes! SchemeChecker is a free public welfare initiative designed to ensure every citizen can access government entitlements without paying agents or middlemen.'
  },
  {
    q: 'How does the AI eligibility check work?',
    a: 'We encode official government criteria into deterministic rule trees. When you check eligibility, our engine evaluates all income brackets, age limits, land ownership rules, and state mandates, then provides transparent explanations for every decision.'
  },
  {
    q: 'Which states are covered?',
    a: 'All 28 Indian States and 8 Union Territories are covered with Central Sector Schemes. Additionally, we have specialized state-specific modules for Tamil Nadu, Karnataka, Maharashtra, Uttar Pradesh, Kerala, Telangana, Andhra Pradesh, Rajasthan, Gujarat, West Bengal, Bihar, Odisha, Delhi, and Punjab.'
  },
  {
    q: 'Is my personal data safe?',
    a: 'Absolutely. We do not sell or monetize personal data. Your profile parameters are used strictly within your encrypted session to match welfare rules.'
  },
  {
    q: 'Can I apply for schemes directly through SchemeChecker?',
    a: 'We provide direct, verified links to official government portals (such as myScheme, PM-KISAN, NHA, NSP, and State Portals) along with the exact document checklist you need to submit.'
  },
  {
    q: 'How accurate are the results?',
    a: 'Our database is maintained against official gazette notifications and ministry guidelines, updated with the latest 2026 budget announcements.'
  },
]

const TRUST_LOGOS = [
  { name: 'MyGov India', category: 'Citizen Engagement' },
  { name: 'National Informatics Centre (NIC)', category: 'Gov Tech' },
  { name: 'Ministry of Finance', category: 'Central Govt' },
  { name: 'National Health Authority', category: 'PM-JAY' },
  { name: 'National Scholarship Portal', category: 'Direct Benefit' },
  { name: 'State Government Portals', category: '28+ States' },
]

export default function LandingPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const { data: schemesData } = useQuery({
    queryKey: ['schemes-count'],
    queryFn: () => schemeApi.list(),
  })

  const totalCount = schemesData?.data?.count || 135

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/schemes?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="min-h-screen pb-16">
      
      {/* ── 1. Hero Section with Integrated Stats Row ────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-24">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-accent-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-hero-pattern opacity-20 pointer-events-none" />

        <div className="page-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Trust Badge */}
              <ScrollReveal delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-500/15 to-accent-500/15 border border-primary-500/30 text-primary-300 text-xs sm:text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  <span>Explainable AI Welfare Discovery Engine</span>
                  <span className="bg-primary-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">Free</span>
                </div>
              </ScrollReveal>

              {/* Title */}
              <ScrollReveal delay={0.15}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.1]">
                  Claim Every Government Scheme You{' '}
                  <span className="bg-gradient-to-r from-primary-400 via-accent-300 to-orange-400 bg-clip-text text-transparent">
                    Qualify For
                  </span>
                </h1>
              </ScrollReveal>

              {/* Subtitle */}
              <ScrollReveal delay={0.2}>
                <p className="text-base sm:text-lg text-surface-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Stop struggling through hundreds of complicated official portals. Enter your profile once and let our rule engine match you with <strong>135+ Central & State benefits</strong> instantly.
                </p>
              </ScrollReveal>

              {/* Glowing Search Bar */}
              <ScrollReveal delay={0.25}>
                <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0">
                  <div className="glass p-2 flex items-center gap-2 rounded-2xl shadow-glow border border-primary-500/30 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/30 transition-all">
                    <Search className="w-5 h-5 text-surface-400 ml-3 shrink-0" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Try 'farmer in Tamil Nadu' or 'scholarship for girl student'..."
                      className="flex-1 bg-transparent text-surface-100 placeholder-surface-400 text-sm sm:text-base focus:outline-none px-2 py-1"
                    />
                    <button type="submit" className="btn-primary btn-shine py-2.5 px-5 shrink-0 text-sm font-semibold">
                      Search
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-surface-400 mt-2.5 px-2">
                    <span className="text-surface-500 font-medium">Try:</span>
                    <button type="button" onClick={() => setSearch('Farmer subsidy')} className="hover:text-primary-300 underline">Farmer</button>
                    <span>•</span>
                    <button type="button" onClick={() => setSearch('Scholarship')} className="hover:text-primary-300 underline">Scholarships</button>
                    <span>•</span>
                    <button type="button" onClick={() => setSearch('Ayushman Bharat')} className="hover:text-primary-300 underline">Health Cover</button>
                    <span>•</span>
                    <button type="button" onClick={() => setSearch('Mudra Loan')} className="hover:text-primary-300 underline">Mudra Loans</button>
                    <span>•</span>
                    <button type="button" onClick={() => setSearch('Widow pension')} className="hover:text-primary-300 underline">Widow Pension</button>
                  </div>
                </form>
              </ScrollReveal>

              {/* ── Missing 1: Hero Animated Stats Row (Positioned below search & above CTAs) ── */}
              <ScrollReveal delay={0.3}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
                  <div className="glass p-3.5 text-center rounded-2xl border border-surface-800/90 bg-surface-900/40">
                    <p className="text-2xl sm:text-3xl font-display font-black gradient-text">
                      <AnimatedCounter target={totalCount} suffix="+" />
                    </p>
                    <p className="text-[11px] text-surface-400 mt-0.5 font-medium">Schemes</p>
                  </div>

                  <div className="glass p-3.5 text-center rounded-2xl border border-surface-800/90 bg-surface-900/40">
                    <p className="text-2xl sm:text-3xl font-display font-black gradient-text">
                      <AnimatedCounter target={28} suffix="+" />
                    </p>
                    <p className="text-[11px] text-surface-400 mt-0.5 font-medium">States & UTs</p>
                  </div>

                  <div className="glass p-3.5 text-center rounded-2xl border border-surface-800/90 bg-surface-900/40">
                    <p className="text-2xl sm:text-3xl font-display font-black gradient-text">
                      <AnimatedCounter target={100} suffix="%" />
                    </p>
                    <p className="text-[11px] text-surface-400 mt-0.5 font-medium">Free Forever</p>
                  </div>

                  <div className="glass p-3.5 text-center rounded-2xl border border-surface-800/90 bg-surface-900/40">
                    <p className="text-2xl sm:text-3xl font-display font-black gradient-text">
                      AI
                    </p>
                    <p className="text-[11px] text-surface-400 mt-0.5 font-medium">Explainable Rules</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal delay={0.35}>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="btn-primary btn-shine btn-lg gap-2 shadow-glow">
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="btn-primary btn-shine btn-lg gap-2 shadow-glow">
                        <span>Check My Eligibility Free</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link to="/schemes" className="btn-secondary btn-lg">
                        <span>Browse 135+ Schemes</span>
                      </Link>
                    </>
                  )}
                </div>
              </ScrollReveal>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-1 text-xs text-surface-400">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Official Gazette Rules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zero Middlemen Fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Multilingual AI Support</span>
                </div>
              </div>

            </div>

            {/* Right Interactive App Mockup */}
            <div className="lg:col-span-5 relative">
              <ScrollReveal direction="left" delay={0.3}>
                <div className="relative mx-auto max-w-md glass rounded-3xl p-6 border border-surface-700/80 shadow-2xl shadow-primary-500/10">
                  
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-surface-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-mono text-primary-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Live Eligibility Engine
                    </span>
                  </div>

                  {/* Mockup Profile Badge */}
                  <div className="my-4 p-3.5 rounded-2xl bg-surface-900/90 border border-surface-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs text-surface-400">Citizen Profile: Tamil Nadu</p>
                      <p className="text-sm font-bold text-white">Farmer • Income &lt; ₹2.5L</p>
                    </div>
                    <span className="badge-eligible text-xs px-2.5 py-1">✓ 12 Matches</span>
                  </div>

                  {/* Mockup Result Cards */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        🌾
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">PM-KISAN Samman Nidhi</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">ELIGIBLE</span>
                        </div>
                        <p className="text-[11px] text-surface-300">₹6,000 / yr Direct Benefit Transfer</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        🏥
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">Ayushman Bharat (AB-PMJAY)</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">ELIGIBLE</span>
                        </div>
                        <p className="text-[11px] text-surface-300">₹5,00,000 Free Cashless Care</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        ⚡
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">PM Surya Ghar Solar</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">ELIGIBLE</span>
                        </div>
                        <p className="text-[11px] text-surface-300">300 Units Free Electricity + Subsidy</p>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Action */}
                  <div className="mt-4 pt-3 border-t border-surface-800 flex items-center justify-between text-xs">
                    <span className="text-surface-400">Match score: 98%</span>
                    <Link to="/eligibility" className="text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-1">
                      Run check on your profile <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section Divider 1 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 2. Browse by Category ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="section-title">Explore Welfare by Category</h2>
              <p className="section-subtitle">Select any domain to find target subsidies, pensions, and financial aid.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon, count, color }, i) => (
              <ScrollReveal key={label} delay={i * 0.05}>
                <Link
                  to={`/schemes?category=${label}`}
                  className={`glass p-5 rounded-2xl border bg-gradient-to-br ${color} hover:scale-[1.03] shadow-lg transition-all duration-200 group flex flex-col justify-between h-full`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                    <span className="text-[11px] font-semibold text-surface-300 bg-surface-900/80 px-2.5 py-0.5 rounded-full border border-surface-700">{count}</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display font-bold text-white text-base group-hover:text-primary-300 transition-colors">{label}</h3>
                    <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                      Explore schemes <ChevronRight className="w-3 h-3 text-surface-500" />
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider 2 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 3. Featured Popular Schemes ──────────────────────────────────── */}
      <section className="py-20 bg-surface-900/20">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="section-title">Popular Welfare Schemes</h2>
                <p className="section-subtitle">Highest-impact Central & State programs supporting millions of households.</p>
              </div>
              <Link to="/schemes" className="btn-secondary text-sm font-semibold shrink-0">
                View All 135+ Schemes →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_SCHEMES.map((scheme, i) => (
              <ScrollReveal key={scheme.name} delay={i * 0.08}>
                <div
                  className={`card p-6 ${scheme.color} rounded-2xl flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200 h-full shadow-lg`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scheme.badge}`}>
                        {scheme.category}
                      </span>
                      <span className="text-xs text-surface-400">{scheme.tag}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{scheme.name}</h3>
                    <p className="text-sm text-surface-300 leading-relaxed mb-6 font-medium">
                      💰 {scheme.benefit}
                    </p>
                  </div>

                  <Link
                    to="/eligibility"
                    className="btn-primary btn-shine w-full py-2.5 text-xs font-semibold justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check Eligibility</span>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider 3 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 4. How It Works ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="section-title">How SchemeChecker Works</h2>
              <p className="section-subtitle">Three simple steps to unlock your government entitlements.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc, icon: Icon, color }, i) => (
              <ScrollReveal key={step} delay={i * 0.1}>
                <div className="card p-8 relative rounded-3xl group hover:border-primary-500/40 transition-colors h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="font-display font-black text-4xl text-surface-700/80">{step}</span>
                  </div>
                  <h3 className="font-display font-bold text-white text-xl mb-3">{title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider 4 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 5. Testimonials (Social Proof) ─────────────────────────────────── */}
      <section className="py-20 bg-surface-900/30">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h2 className="section-title">Trusted by Citizens Across India</h2>
              <p className="section-subtitle">Real experiences from farmers, students, and small business owners.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1}>
                <div className={`card p-6 ${t.border} flex flex-col justify-between rounded-2xl h-full shadow-lg`}>
                  <p className="text-surface-300 text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-xs text-surface-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider 5 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 6. FAQ Accordion ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="page-container max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about checking and claiming government benefits.</p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <ScrollReveal key={faq.q} delay={index * 0.05}>
                  <div
                    className={`card rounded-2xl overflow-hidden border transition-colors ${
                      index % 2 === 0 ? 'bg-surface-900/60' : 'bg-surface-900/30'
                    } ${isOpen ? 'border-primary-500/40' : 'border-surface-800'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-primary-300 transition-colors"
                    >
                      <span className="font-display font-bold text-white text-base">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-surface-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-surface-300 leading-relaxed border-t border-surface-800/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Missing 5: Trust / Partner Logos Strip (Between FAQ & Final CTA) ── */}
      <section className="py-12 border-t border-surface-800/80 bg-surface-950/70">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <p className="text-xs uppercase tracking-widest text-surface-400 font-bold">
                Data Sourced from Official Government Portals & Gazettes
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {TRUST_LOGOS.map((logo) => (
                  <div
                    key={logo.name}
                    className="px-4 py-2 rounded-xl bg-surface-900/80 border border-surface-800 hover:border-surface-600 hover:text-white transition-all text-surface-300 text-xs font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <Building2 className="w-3.5 h-3.5 text-primary-400" />
                    <span>{logo.name}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-surface-500 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Always verify details on official government departments before applying</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 7. Final CTA Section (Observed by MobileStickyCTA via #final-cta) ─ */}
      <section id="final-cta" className="py-16">
        <div className="page-container">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-br from-primary-600 via-accent-600 to-orange-600 shadow-2xl shadow-primary-500/25">
              <div className="absolute inset-0 bg-hero-pattern opacity-30 pointer-events-none" />

              <div className="relative max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white leading-tight">
                  Don't Miss Out on Government Benefits Meant for You
                </h2>
                <p className="text-white/90 text-base sm:text-lg">
                  Join thousands of citizens who have simplified their welfare discovery. Takes only 2 minutes.
                </p>
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="btn-shine inline-flex items-center gap-2 bg-white text-surface-950 hover:bg-surface-100 font-display font-bold px-8 py-4 rounded-xl text-base shadow-2xl hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    <span>Start Free Eligibility Check</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  )
}
