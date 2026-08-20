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
  { label: 'Agriculture', icon: '🌾', count: '10+ Schemes', badge: 'TRENDING', color: 'bg-green-50/90 border-green-200/80 hover:border-green-300 hover:shadow-green-100' },
  { label: 'Education', icon: '📚', count: '12+ Schemes', badge: 'POPULAR', color: 'bg-blue-50/90 border-blue-200/80 hover:border-blue-300 hover:shadow-blue-100' },
  { label: 'Healthcare', icon: '🏥', count: '11+ Schemes', color: 'bg-red-50/90 border-red-200/80 hover:border-red-300 hover:shadow-red-100' },
  { label: 'Housing', icon: '🏠', count: '6+ Schemes', color: 'bg-amber-50/90 border-amber-200/80 hover:border-amber-300 hover:shadow-amber-100' },
  { label: 'Women', icon: '👩', count: '10+ Schemes', color: 'bg-pink-50/90 border-pink-200/80 hover:border-pink-300 hover:shadow-pink-100' },
  { label: 'MSME & Loans', icon: '🏭', count: '10+ Schemes', color: 'bg-orange-50/90 border-orange-200/80 hover:border-orange-300 hover:shadow-orange-100' },
  { label: 'Pensions', icon: '👴', count: '10+ Schemes', color: 'bg-purple-50/90 border-purple-200/80 hover:border-purple-300 hover:shadow-purple-100' },
  { label: 'State Schemes', icon: '🏛️', count: '50+ Schemes', color: 'bg-teal-50/90 border-teal-200/80 hover:border-teal-300 hover:shadow-teal-100' },
]

const PERSONAS = [
  {
    title: 'Farmers & Agriculturists',
    desc: 'Crop insurance, fertilizer subsidies, PM-KISAN ₹6k/yr, solar pumps, and machinery grants.',
    icon: Sprout,
    count: '18+ Schemes',
    iconBg: 'bg-green-100 text-green-700',
    tag: 'Agriculture',
  },
  {
    title: 'Students & Youth',
    desc: 'Pre/Post-Matric scholarships, fee waivers, study abroad subsidies, and paid internships.',
    icon: GraduationCap,
    count: '22+ Schemes',
    iconBg: 'bg-blue-100 text-blue-700',
    tag: 'Education',
  },
  {
    title: 'Women & Families',
    desc: 'Maternity assistance ₹5k–₹6k, Sukanya Samriddhi 8.2% tax-free, Ujjwala gas, and free bus travel.',
    icon: HeartPulse,
    count: '19+ Schemes',
    iconBg: 'bg-pink-100 text-pink-700',
    tag: 'Women',
  },
  {
    title: 'Small Business Owners',
    desc: 'Collateral-free Mudra loans up to ₹20L, PM SVANidhi, PMEGP 35% subsidies, and ZED grants.',
    icon: Briefcase,
    count: '15+ Schemes',
    iconBg: 'bg-orange-100 text-orange-700',
    tag: 'MSME',
  },
  {
    title: 'Senior Citizens & Widows',
    desc: 'Monthly pensions ₹1,000–₹5,000, 8.2% SCSS returns, free health cover 70+, and assistive devices.',
    icon: HeartHandshake,
    count: '12+ Schemes',
    iconBg: 'bg-purple-100 text-purple-700',
    tag: 'Pension',
  },
]

const FEATURED_SCHEMES = [
  {
    name: 'PM-KISAN (Kisan Samman Nidhi)',
    category: 'Agriculture',
    benefit: '₹6,000 / year direct bank transfer in 3 installments',
    tag: 'All Landholding Farmers',
    borderTop: 'border-t-4 border-t-green-500',
    badge: 'bg-green-100 text-green-800',
  },
  {
    name: 'Ayushman Bharat (AB-PMJAY)',
    category: 'Healthcare',
    benefit: '₹5,00,000 / family / year cashless hospitalization',
    tag: 'Secondary & Tertiary Care',
    borderTop: 'border-t-4 border-t-red-500',
    badge: 'bg-red-100 text-red-800',
  },
  {
    name: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women & Child',
    benefit: '8.2% tax-free compounding interest for girl children',
    tag: 'Age 0–10 Years',
    borderTop: 'border-t-4 border-t-blue-500',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Housing & Solar',
    benefit: 'Up to ₹78,000 direct subsidy + 300 units free power',
    tag: 'Rooftop Solar',
    borderTop: 'border-t-4 border-t-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'PM Mudra Loan (Shishu / Kishor / Tarun)',
    category: 'MSME',
    benefit: 'Collateral-free loans up to ₹20,00,000 for small businesses',
    tag: 'Entrepreneurs & Micro Units',
    borderTop: 'border-t-4 border-t-orange-500',
    badge: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Atal Pension Yojana (APY)',
    category: 'Pensions',
    benefit: 'Guaranteed ₹1,000 to ₹5,000/month lifelong pension from age 60',
    tag: 'Unorganized Workers',
    borderTop: 'border-t-4 border-t-purple-500',
    badge: 'bg-purple-100 text-purple-800',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Enter basic details once: age, state, annual income, occupation, and family size.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Instant AI Matching',
    desc: 'Our explainable rule engine evaluates your profile against 135+ Central and State welfare rules instantly.',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Claim Verified Benefits',
    desc: 'Get a clear breakdown of why you qualify, documents required, and official government application links.',
    icon: Award,
  },
]

const TESTIMONIALS = [
  {
    quote: "I found 3 agricultural and equipment subsidies I never knew existed in Tamil Nadu. Applied for PM-KISAN and SMAM the same afternoon!",
    name: "Rajesh Kannan",
    role: "Farmer, Thanjavur (Tamil Nadu)",
    initials: "RK",
    border: "border-l-4 border-l-violet-500",
    avatarBg: "bg-violet-100 text-violet-700",
  },
  {
    quote: "As a first-generation engineering student, SchemeChecker matched me with the AICTE Pragati scholarship that covers my entire tuition fees.",
    name: "Priya Murthy",
    role: "B.Tech Student, Pune (Maharashtra)",
    initials: "PM",
    border: "border-l-4 border-l-blue-500",
    avatarBg: "bg-blue-100 text-blue-700",
  },
  {
    quote: "The explainable AI breakdown showed me exactly why my workshop qualified for the PM Mudra Kishor loan. No middlemen, zero confusion.",
    name: "Amit Sharma",
    role: "Small Business Owner, Ahmedabad (Gujarat)",
    initials: "AS",
    border: "border-l-4 border-l-emerald-500",
    avatarBg: "bg-emerald-100 text-emerald-700",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentCount((prev) => prev + Math.floor(Math.random() * 3 + 1))
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* ── 1. Hero Section (Vibrant Light Theme) ────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-gray-200/80">
        
        {/* Soft Organic Gradient Background Blobs */}
        <div className="absolute top-[-40px] left-[-40px] w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 right-[-40px] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-xs sm:text-sm font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Explainable AI Welfare Discovery Engine</span>
                <span className="bg-violet-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">Free</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-black tracking-tight text-gray-900 leading-[1.12]">
                Claim Every Government Scheme You{' '}
                <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Qualify For
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                Stop searching dozens of government portals. Enter your details once, let our explainable AI rule engine match you with <strong>135+ central and state benefits</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-shine inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-display font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-shine inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-display font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-sm sm:text-base shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      <span>Check My Eligibility Free</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <Link
                      to="/schemes"
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-violet-50 text-violet-600 font-display font-bold px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm sm:text-base border-2 border-violet-500 shadow-sm active:scale-95 transition-all"
                    >
                      <span>Browse 135+ Schemes</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Micro-copy Trust Signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No sign-up required to browse
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free forever
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-600" /> Data from official portals
                </span>
              </div>

              {/* Live Recently Checked Counter */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-xs font-semibold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>👥 <strong>{recentCount.toLocaleString('en-IN')}</strong> citizens checked their eligibility today</span>
              </div>

              {/* Light-Theme Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="bg-white p-3.5 text-center rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                    <AnimatedCounter target={totalCount} suffix="+" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">Schemes</p>
                </div>

                <div className="bg-white p-3.5 text-center rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                    <AnimatedCounter target={28} suffix="+" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">States & UTs</p>
                </div>

                <div className="bg-white p-3.5 text-center rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                    <AnimatedCounter target={100} suffix="%" />
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">Free Forever</p>
                </div>

                <div className="bg-white p-3.5 text-center rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                    AI Rules
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">Deterministic</p>
                </div>
              </div>

            </div>

            {/* Right: Floating Browser Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="animate-float-slow mx-auto max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-violet-500/10 overflow-hidden">
                
                {/* Browser Window Chrome */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 bg-white rounded-md border border-gray-200 text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                    <span className="text-emerald-500">🔒</span> schemechecker.in/eligibility
                  </div>
                  <span className="text-xs text-violet-600 font-bold">Live</span>
                </div>

                {/* Inner Mock Dashboard Content */}
                <div className="p-5 space-y-3 bg-gray-50/50">
                  {/* Profile Header */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Citizen Profile</p>
                      <p className="text-xs font-bold text-gray-800">Farmer • Tamil Nadu • Income &lt; ₹2.5L</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ 12 Matches
                    </span>
                  </div>

                  {/* Matched Scheme Cards */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-green-500 border border-gray-200 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">PM-KISAN Samman Nidhi</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">💰 ₹6,000/yr Direct Bank Transfer</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        ELIGIBLE
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-red-500 border border-gray-200 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Ayushman Bharat (AB-PMJAY)</p>
                        <p className="text-[11px] text-red-600 font-semibold">🏥 ₹5,00,000 Cashless Hospital Cover</p>
                      </div>
                      <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200">
                        ELIGIBLE
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-l-4 border-l-amber-500 border border-gray-200 shadow-xs flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">PM Surya Ghar Solar</p>
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
      </section>

      {/* ── 2. Browse by Category (Light Pastel Cards) ──────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="section-title">Explore Welfare by Category</h2>
              <p className="section-subtitle">Select any domain to find target subsidies, pensions, and financial aid.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon, count, badge, color }, i) => (
              <ScrollReveal key={label} delay={i * 0.05}>
                <Link
                  to={`/schemes?category=${label}`}
                  className={`p-5 rounded-2xl border ${color} hover:-translate-y-1 hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-full relative overflow-hidden`}
                >
                  {badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs bg-amber-400 text-white">
                      {badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                    {!badge && (
                      <span className="text-[11px] font-semibold text-gray-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-gray-200">{count}</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display font-bold text-gray-900 text-base group-hover:text-violet-600 transition-colors">{label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      {count} <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-700" />
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. "Built for Every Indian Citizen" (bg-gray-50) ─────────────── */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold mb-3">
                <Users className="w-3.5 h-3.5 text-violet-600" /> Inclusive Welfare Discovery
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
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover:shadow-lg hover:border-violet-200 transition-all group"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center mb-4 shadow-xs`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-gray-900 text-sm mb-1.5 group-hover:text-violet-600 transition-colors">{p.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-4">{p.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-violet-600">
                      <span>{p.count}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Popular Welfare Schemes (bg-white) ───────────────────────── */}
      <section className="py-20 bg-white">
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
                  className={`bg-white border border-gray-200 ${scheme.borderTop} rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scheme.badge}`}>
                        {scheme.category}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{scheme.tag}</span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{scheme.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
                      💰 {scheme.benefit}
                    </p>
                  </div>

                  <Link
                    to="/eligibility"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-violet-600 hover:bg-violet-50 border border-violet-200 rounded-xl transition-colors"
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

      {/* ── 5. How It Works (bg-gray-50) ─────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="section-title">How SchemeChecker Works</h2>
              <p className="section-subtitle">Three simple steps to unlock your government entitlements.</p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-violet-300 -translate-y-6 z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {STEPS.map(({ step, title, desc, icon: Icon }, i) => (
                <ScrollReveal key={step} delay={i * 0.1}>
                  <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-violet-300 transition-colors h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-violet-100 border border-violet-200 text-violet-600 flex items-center justify-center shadow-xs">
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="font-display font-black text-sm text-violet-600 uppercase tracking-wider">
                          STEP {step}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-gray-900 text-xl mb-3">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials (bg-white) ───────────────────────────────────── */}
      <section className="py-20 bg-white">
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
                <div className={`bg-white border border-gray-200 ${t.border} p-6 rounded-2xl shadow-sm flex flex-col justify-between h-full`}>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-gray-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ Accordion (bg-gray-50) ─────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
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
                    className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs transition-colors ${
                      isOpen ? 'border-violet-300' : 'hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-display font-bold text-gray-900 text-base">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-white">
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

      {/* ── 8. Trust / Partner Logos Strip (bg-white) ─────────────────────── */}
      <section className="py-12 border-t border-gray-200 bg-white">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                Data Sourced from Official Government Portals & Gazettes
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {TRUST_LOGOS.map((logo) => (
                  <div
                    key={logo.name}
                    className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-violet-300 hover:text-violet-700 transition-all text-gray-700 text-xs font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>{logo.name}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Always verify details on official government departments before applying</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 9. Final CTA Section (Vibrant Gradient Banner) ───────────────── */}
      <section id="final-cta" className="py-16 bg-white">
        <div className="page-container">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-violet-500/25">
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
                    className="btn-shine inline-flex items-center gap-2 bg-white text-violet-600 hover:bg-gray-50 font-display font-bold px-8 py-4 rounded-xl text-base shadow-2xl hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-violet-600" />
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
