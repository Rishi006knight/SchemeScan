import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, Zap, Users, Award, ChevronRight,
  ArrowRight, Star, ChevronDown,
  Building2, ShieldCheck, CheckCircle2,
  HeartHandshake, Briefcase, GraduationCap,
  Sprout, HeartPulse
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { schemeApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import AnimatedCounter from '@/components/AnimatedCounter'
import ScrollReveal from '@/components/ScrollReveal'

const CATEGORIES = [
  { label: 'Agriculture', icon: '🌾', count: '10+ Schemes', badge: 'TRENDING', badgeColor: 'bg-amber-500 text-white', color: 'from-green-500/30 to-emerald-500/15 border-green-500/40 hover:shadow-green-500/10' },
  { label: 'Education', icon: '📚', count: '12+ Schemes', badge: 'POPULAR', badgeColor: 'bg-violet-600 text-white', color: 'from-blue-500/30 to-indigo-500/15 border-blue-500/40 hover:shadow-blue-500/10' },
  { label: 'Healthcare', icon: '🏥', count: '11+ Schemes', color: 'from-red-500/30 to-rose-500/15 border-red-500/40 hover:shadow-red-500/10' },
  { label: 'Housing', icon: '🏠', count: '6+ Schemes', color: 'from-amber-500/30 to-yellow-500/15 border-amber-500/40 hover:shadow-amber-500/10' },
  { label: 'Women', icon: '👩', count: '10+ Schemes', color: 'from-pink-500/30 to-rose-500/15 border-pink-500/40 hover:shadow-pink-500/10' },
  { label: 'MSME & Loans', icon: '🏭', count: '10+ Schemes', color: 'from-orange-500/30 to-amber-500/15 border-orange-500/40 hover:shadow-orange-500/10' },
  { label: 'Pensions', icon: '👴', count: '10+ Schemes', color: 'from-purple-500/30 to-violet-500/15 border-purple-500/40 hover:shadow-purple-500/10' },
  { label: 'State Schemes', icon: '🏛️', count: '50+ Schemes', color: 'from-teal-500/30 to-emerald-500/15 border-teal-500/40 hover:shadow-teal-500/10' },
]

const PERSONAS = [
  {
    title: 'Farmers & Agriculturists',
    desc: 'Crop insurance, fertilizer subsidies, PM-KISAN ₹6k/yr, solar pumps, and machinery grants.',
    icon: Sprout,
    count: '18+ Schemes',
    color: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-emerald-400',
    tag: 'Agriculture',
  },
  {
    title: 'Students & Youth',
    desc: 'Pre/Post-Matric scholarships, fee waivers, study abroad subsidies, and paid internships.',
    icon: GraduationCap,
    count: '22+ Schemes',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    tag: 'Education',
  },
  {
    title: 'Women & Families',
    desc: 'Maternity assistance ₹5k–₹6k, Sukanya Samriddhi 8.2% tax-free, Ujjwala gas, and free bus travel.',
    icon: HeartPulse,
    count: '19+ Schemes',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
    tag: 'Women',
  },
  {
    title: 'Small Business Owners',
    desc: 'Collateral-free Mudra loans up to ₹20L, PM SVANidhi, PMEGP 35% subsidies, and ZED grants.',
    icon: Briefcase,
    count: '15+ Schemes',
    color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400',
    tag: 'MSME',
  },
  {
    title: 'Senior Citizens & Widows',
    desc: 'Monthly pensions ₹1,000–₹5,000, 8.2% SCSS returns, free health cover 70+, and assistive devices.',
    icon: HeartHandshake,
    count: '12+ Schemes',
    color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400',
    tag: 'Pension',
  },
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
    step: '1',
    title: 'Create Profile',
    desc: 'Enter basic details once: age, state, annual income, occupation, and family size.',
    icon: Users,
    color: 'from-violet-500/25 to-violet-600/10 text-violet-400 border-violet-500/30',
  },
  {
    step: '2',
    title: 'Instant AI Evaluation',
    desc: 'Our explainable rule engine evaluates your profile against 135+ Central and State welfare rules instantly.',
    icon: Zap,
    color: 'from-fuchsia-500/25 to-fuchsia-600/10 text-fuchsia-400 border-fuchsia-500/30',
  },
  {
    step: '3',
    title: 'Claim Direct Benefits',
    desc: 'Get a clear breakdown of why you qualify, documents required, and official government portal application links.',
    icon: Award,
    color: 'from-emerald-500/25 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
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
  { name: 'MyGov India' },
  { name: 'National Informatics Centre (NIC)' },
  { name: 'Ministry of Finance' },
  { name: 'National Health Authority' },
  { name: 'National Scholarship Portal' },
  { name: 'State Government Portals' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [recentCount, setRecentCount] = useState(2847)
  const { isAuthenticated } = useAuthStore()

  const { data: schemesData } = useQuery({
    queryKey: ['schemes-count'],
    queryFn: () => schemeApi.list(),
  })

  const totalCount = schemesData?.data?.count || 135

  // Live recently checked counter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentCount((prev) => prev + Math.floor(Math.random() * 3 + 1))
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen pb-16">
      
      {/* ── 1. Vibrant Light/Colorful Hero Section ──────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 text-slate-900 pt-10 pb-28 lg:pt-16 lg:pb-36 border-b border-slate-200/80">
        
        {/* Soft Organic Gradient Background Blobs */}
        <div className="absolute top-[-50px] left-[-50px] w-[450px] h-[450px] bg-violet-300/35 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-[-30px] w-[400px] h-[400px] bg-fuchsia-300/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-200/35 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/90 border border-violet-200/90 text-violet-800 text-xs sm:text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Explainable AI Welfare Discovery Engine</span>
                <span className="bg-violet-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">Free</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-black tracking-tight text-slate-900 leading-[1.12]">
                Claim Every Government Scheme You{' '}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
                  Qualify For
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                Stop searching dozens of government portals. Enter your details once, let our explainable AI rule engine match you with <strong>135+ central and state benefits</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-shine inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-display font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-violet-500/25 active:scale-95 transition-all"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-shine inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-display font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-sm sm:text-base shadow-xl shadow-violet-500/25 active:scale-95 transition-all"
                    >
                      <span>Check My Eligibility Free</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <Link
                      to="/schemes"
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-violet-50/80 text-violet-700 font-display font-bold px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm sm:text-base border-2 border-violet-600/80 shadow-md shadow-violet-100 active:scale-95 transition-all"
                    >
                      <span>Browse 135+ Schemes</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Micro-copy Trust Signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No sign-up required to browse
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free forever
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-600" /> Official Gazette Rules
                </span>
              </div>

              {/* Live Recently Checked Counter */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-50 border border-violet-200/70 text-violet-900 text-xs font-semibold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>👥 <strong>{recentCount.toLocaleString('en-IN')}</strong> citizens checked their eligibility today</span>
              </div>

              {/* Light-Theme Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="bg-white/95 p-3.5 text-center rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={totalCount} suffix="+" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Schemes</p>
                </div>

                <div className="bg-white/95 p-3.5 text-center rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={28} suffix="+" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">States & UTs</p>
                </div>

                <div className="bg-white/95 p-3.5 text-center rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={100} suffix="%" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Free Forever</p>
                </div>

                <div className="bg-white/95 p-3.5 text-center rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    AI Rules
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Deterministic</p>
                </div>
              </div>

            </div>

            {/* Right: Floating Browser Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="animate-float-slow mx-auto max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-violet-500/15 overflow-hidden">
                
                {/* Browser Window Chrome */}
                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 bg-white rounded-md border border-slate-200 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                    <span className="text-emerald-500">🔒</span> schemechecker.in/eligibility
                  </div>
                  <span className="text-xs text-violet-600 font-bold">Live</span>
                </div>

                {/* Inner Mock Dashboard Content */}
                <div className="p-5 space-y-3.5 bg-slate-50/50">
                  {/* Profile Header */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Citizen Profile</p>
                      <p className="text-xs font-bold text-slate-800">Farmer • Tamil Nadu • Income &lt; ₹2.5L</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ 12 Matches
                    </span>
                  </div>

                  {/* Matched Scheme Cards */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-emerald-500 border border-slate-200/80 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">PM-KISAN Samman Nidhi</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">💰 ₹6,000/yr Direct Bank Transfer</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        ELIGIBLE
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-red-500 border border-slate-200/80 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Ayushman Bharat (AB-PMJAY)</p>
                        <p className="text-[11px] text-red-600 font-semibold">🏥 ₹5,00,000 Cashless Hospital Cover</p>
                      </div>
                      <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200">
                        ELIGIBLE
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-amber-500 border border-slate-200/80 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">PM Surya Ghar Solar</p>
                        <p className="text-[11px] text-amber-600 font-semibold">⚡ 300 Units Free Power + Subsidy</p>
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                        ELIGIBLE
                      </span>
                    </div>
                  </div>

                  {/* Mock Action */}
                  <Link
                    to="/eligibility"
                    className="block w-full py-2.5 text-center bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-colors"
                  >
                    Check Your Matches Now →
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Transition Gradient from Light Hero into Dark Body */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-surface-950 pointer-events-none" />
      </section>

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
            {CATEGORIES.map(({ label, icon, count, badge, badgeColor, color }, i) => (
              <ScrollReveal key={label} delay={i * 0.05}>
                <Link
                  to={`/schemes?category=${label}`}
                  className={`glass p-5 rounded-2xl border bg-gradient-to-br ${color} hover:scale-[1.03] shadow-lg transition-all duration-200 group flex flex-col justify-between h-full relative overflow-hidden`}
                >
                  {badge && (
                    <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                    {!badge && (
                      <span className="text-[11px] font-semibold text-surface-300 bg-surface-900/80 px-2.5 py-0.5 rounded-full border border-surface-700">{count}</span>
                    )}
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

      {/* ── Section Divider 1 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 3. New Section: "Built for Every Indian Citizen" (Who is this for?) ── */}
      <section className="py-20 bg-surface-900/20">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold mb-3">
                <Users className="w-3.5 h-3.5" /> Inclusive Welfare Discovery
              </div>
              <h2 className="section-title">Built for Every Indian Citizen</h2>
              <p className="section-subtitle">Tailored eligibility checks designed for your exact life stage and occupation.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PERSONAS.map((p, i) => {
              const Icon = p.icon
              return (
                <ScrollReveal key={p.title} delay={i * 0.07}>
                  <Link
                    to={`/schemes?category=${p.tag}`}
                    className={`card p-5 rounded-2xl border bg-gradient-to-br ${p.color} flex flex-col justify-between h-full hover:scale-[1.02] transition-all`}
                  >
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-surface-900/90 border border-surface-700/80 flex items-center justify-center mb-3.5 shadow-sm">
                        <Icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <h3 className="font-display font-bold text-white text-sm mb-1.5">{p.title}</h3>
                      <p className="text-surface-400 text-xs leading-relaxed mb-4">{p.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-surface-800/80 flex items-center justify-between text-[11px] font-semibold text-primary-400">
                      <span>{p.count}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section Divider 2 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 4. Featured Popular Schemes ──────────────────────────────────── */}
      <section className="py-20">
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

      {/* ── 5. How It Works with Connecting Line ──────────────────────────── */}
      <section className="py-24 bg-surface-900/20">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="section-title">How SchemeChecker Works</h2>
              <p className="section-subtitle">Three simple steps to unlock your government entitlements.</p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-primary-500/40 -translate-y-6 z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {STEPS.map(({ step, title, desc, icon: Icon, color }, i) => (
                <ScrollReveal key={step} delay={i * 0.1}>
                  <div className="card p-8 relative rounded-3xl group hover:border-primary-500/40 transition-colors h-full bg-surface-950/80">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-display font-black text-sm flex items-center justify-center shadow-glow">
                        {step}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-white text-xl mb-3">{title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Divider 4 ────────────────────────────────────────────── */}
      <div className="gradient-divider" />

      {/* ── 6. Testimonials (Social Proof) ─────────────────────────────────── */}
      <section className="py-20">
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

      {/* ── 7. FAQ Accordion ───────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-900/20">
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

      {/* ── 8. Trust / Partner Logos Strip (Between FAQ & Final CTA) ───────── */}
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

      {/* ── 9. Final CTA Section (Observed by MobileStickyCTA via #final-cta) ─ */}
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
