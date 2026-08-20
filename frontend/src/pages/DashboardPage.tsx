import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { schemeApi } from '@/lib/api'
import { profileApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import {
  Sparkles, User, BookmarkCheck, History, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, ClipboardList,
  Search, ExternalLink, Award
} from 'lucide-react'

const REQUIRED_FIELDS = [
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'state', label: 'State' },
  { key: 'district', label: 'District' },
  { key: 'annual_income', label: 'Income' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'category', label: 'Caste Category' },
  { key: 'education', label: 'Education' },
  { key: 'marital_status', label: 'Marital Status' },
  { key: 'family_size', label: 'Family Size' },
] as const

const RECOMMENDED_SCHEMES = [
  {
    name: 'PM-KISAN Samman Nidhi',
    category: 'Agriculture',
    benefit: '₹6,000 / year direct bank transfer',
    tag: 'Central Sector',
    borderTop: 'border-t-4 border-t-green-500',
    badge: 'bg-green-100 text-green-800',
  },
  {
    name: 'Ayushman Bharat (AB-PMJAY)',
    category: 'Healthcare',
    benefit: '₹5,00,000 / family / year cashless hospitalization',
    tag: 'Health Insurance',
    borderTop: 'border-t-4 border-t-red-500',
    badge: 'bg-red-100 text-red-800',
  },
  {
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Housing & Solar',
    benefit: 'Up to ₹78,000 subsidy + 300 units free power',
    tag: 'Rooftop Solar',
    borderTop: 'border-t-4 border-t-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: profileApi.getMe })
  const { data: historyData } = useQuery({ queryKey: ['history'], queryFn: schemeApi.history })
  const { data: bookmarksData } = useQuery({ queryKey: ['bookmarks'], queryFn: schemeApi.bookmarks })

  const profile = profileData?.data || {}
  const history = historyData?.data?.results || historyData?.data || []
  const bookmarks = bookmarksData?.data?.results || bookmarksData?.data || []

  const eligibleCount = history.filter((h: { result: string }) => h.result === 'eligible').length
  const needsInfoCount = history.filter((h: { result: string }) => h.result === 'needs_info').length

  // Calculate actual completion based on required fields
  const missingFields = REQUIRED_FIELDS.filter(f => !profile[f.key])
  const filledCount = REQUIRED_FIELDS.length - missingFields.length
  const profilePct = Math.round((filledCount / REQUIRED_FIELDS.length) * 100)
  const isProfileComplete = profilePct === 100

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="page-container space-y-8">
        
        {/* 1. Welcome & Status Banner */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
                Welcome back, <span className="gradient-text">{user?.username}</span> 👋
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Complete your profile to unlock personalized welfare matches.
              </p>
            </div>

            <Link
              to="/eligibility"
              className="btn-primary py-3 px-6 text-sm font-bold shrink-0 self-start sm:self-auto gap-2 shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Eligibility Check</span>
            </Link>
          </div>

          {/* Status Alert Banner */}
          {!isProfileComplete ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm font-medium">
                  <strong>Your profile is incomplete ({profilePct}%).</strong> Fill in your details to get 100% accurate rule evaluations.
                </span>
              </div>
              <Link
                to="/profile"
                className="text-xs font-bold text-amber-950 hover:underline shrink-0 bg-amber-200/80 px-3 py-1.5 rounded-lg self-start sm:self-auto"
              >
                Complete Profile →
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium">
                  <strong>Profile 100% complete!</strong> Your parameters are ready for instant rule matching.
                </span>
              </div>
              <Link
                to="/eligibility"
                className="text-xs font-bold text-emerald-950 hover:underline shrink-0 bg-emerald-200/80 px-3 py-1.5 rounded-lg"
              >
                Check Schemes →
              </Link>
            </div>
          )}
        </div>

        {/* 2. Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-display font-black text-emerald-700">{eligibleCount}</p>
            <p className="text-xs font-bold text-emerald-900 mt-1">Eligible Schemes</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-display font-black text-amber-700">{needsInfoCount}</p>
            <p className="text-xs font-bold text-amber-900 mt-1">Needs More Info</p>
          </div>

          <div className="p-5 rounded-2xl bg-violet-50 border border-violet-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
              <BookmarkCheck className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-3xl font-display font-black text-violet-700">{bookmarks.length}</p>
            <p className="text-xs font-bold text-violet-900 mt-1">Saved Schemes</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <History className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-3xl font-display font-black text-gray-700">{history.length}</p>
            <p className="text-xs font-bold text-gray-800 mt-1">Total Checked</p>
          </div>
        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* 3. Middle Grid: Profile Completion & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Profile Completion Card */}
          <div className="bg-white border border-gray-200 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" /> Profile Completion
              </h2>
              <Link to="/profile" className="text-violet-600 text-xs font-bold hover:text-violet-700 flex items-center gap-1">
                Edit Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-500">Filled {filledCount} of {REQUIRED_FIELDS.length} fields</span>
                <span className={isProfileComplete ? 'text-emerald-600 font-bold' : 'text-violet-600 font-bold'}>
                  {profilePct}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isProfileComplete
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'
                  }`}
                  style={{ width: `${profilePct}%` }}
                />
              </div>
            </div>

            {missingFields.length > 0 ? (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Missing parameters:</p>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.map(f => (
                    <span key={f.key} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-semibold border border-gray-200">
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-medium pt-2 border-t border-gray-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> All core parameters are filled!
              </p>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-gray-200 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" /> Quick Actions
            </h2>

            <div className="space-y-2.5">
              <Link
                to="/eligibility"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-50 border border-violet-200 hover:bg-violet-100/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-violet-900">Run Eligibility Check</p>
                    <p className="text-xs text-violet-700">Test profile against 135+ rules</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/profile"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Update Profile</p>
                    <p className="text-xs text-blue-700">Auto-fill via OCR or text</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/schemes"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Browse All Schemes</p>
                    <p className="text-xs text-emerald-700">Filter by state & category</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* 4. Schemes to Explore Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-600" /> Schemes to Explore
              </h2>
              <p className="text-xs text-gray-500">Popular high-impact Central & State programs</p>
            </div>
            <Link to="/schemes" className="text-xs font-bold text-violet-600 hover:underline">
              View all 135+ →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RECOMMENDED_SCHEMES.map((scheme) => (
              <div
                key={scheme.name}
                className={`bg-white border border-gray-200 ${scheme.borderTop} rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${scheme.badge}`}>
                      {scheme.category}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{scheme.tag}</span>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-sm mb-1">{scheme.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{scheme.benefit}</p>
                </div>

                <Link
                  to="/eligibility"
                  className="w-full py-2 text-center text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors"
                >
                  Check Eligibility →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* 5. Recent Eligibility Checks */}
        <div className="bg-white border border-gray-200 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-violet-600" /> Recent Eligibility Checks
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <ClipboardList className="w-14 h-14 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 text-base">No eligibility checks yet</h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                Run your first check to see your matched schemes and deterministic rule breakdowns here.
              </p>
              <div className="pt-2">
                <Link
                  to="/eligibility"
                  className="btn-primary py-2.5 px-5 text-xs font-bold shadow-md shadow-violet-500/20 inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Your First Check →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.slice(0, 8).map((h: { scheme_name: string; result: string; checked_at: string; scheme_id: number }, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-gray-50 ${
                    h.result === 'eligible'
                      ? 'border-l-4 border-l-green-500 border-gray-200'
                      : h.result === 'needs_info'
                      ? 'border-l-4 border-l-amber-500 border-gray-200'
                      : 'border-l-4 border-l-gray-400 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {h.result === 'eligible' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : h.result === 'needs_info' ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-gray-800 truncate">{h.scheme_name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`badge text-[11px] ${
                        h.result === 'eligible'
                          ? 'badge-eligible'
                          : h.result === 'needs_info'
                          ? 'badge-info'
                          : 'badge-ineligible'
                      }`}
                    >
                      {h.result.replace('_', ' ')}
                    </span>
                    <Link
                      to="/eligibility"
                      className="text-xs font-bold text-violet-600 hover:text-violet-700 hidden sm:inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
