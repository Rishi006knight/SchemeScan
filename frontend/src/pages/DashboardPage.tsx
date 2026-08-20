import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { schemeApi } from '@/lib/api'
import { profileApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { Sparkles, User, BookmarkCheck, History, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: profileApi.getMe })
  const { data: historyData } = useQuery({ queryKey: ['history'], queryFn: schemeApi.history })
  const { data: bookmarksData } = useQuery({ queryKey: ['bookmarks'], queryFn: schemeApi.bookmarks })

  const profile = profileData?.data
  const history = historyData?.data?.results || historyData?.data || []
  const bookmarks = bookmarksData?.data?.results || bookmarksData?.data || []

  const eligibleCount = history.filter((h: { result: string }) => h.result === 'eligible').length
  const needsInfoCount = history.filter((h: { result: string }) => h.result === 'needs_info').length

  const profileFields = profile ? [
    profile.age, profile.gender, profile.state, profile.annual_income, profile.occupation, profile.category
  ] : []
  const profileComplete = profileFields.filter(Boolean).length
  const profilePct = Math.round((profileComplete / profileFields.length) * 100) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="page-container">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your scheme eligibility overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: CheckCircle2, label: 'Eligible Schemes', value: eligibleCount, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
            { icon: AlertCircle, label: 'Needs More Info', value: needsInfoCount, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
            { icon: BookmarkCheck, label: 'Saved Schemes', value: bookmarks.length, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
            { icon: History, label: 'Total Checked', value: history.length, color: 'text-gray-700', bg: 'bg-white border-gray-200' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`p-5 rounded-2xl border shadow-xs ${bg}`}>
              <Icon className={`w-6 h-6 ${color} mb-3`} />
              <p className={`text-3xl font-display font-black ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Completion */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" /> Profile
              </h2>
              <Link to="/profile" className="text-violet-600 text-sm font-semibold hover:text-violet-700 flex items-center gap-1">
                Edit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-gray-500">Completion</span>
                <span className={profilePct === 100 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{profilePct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${profilePct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}
                  style={{ width: `${profilePct}%` }} />
              </div>
            </div>
            {profilePct < 100 && (
              <p className="text-xs text-amber-700 font-medium">Complete your profile for better eligibility results</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" /> Quick Actions
            </h2>
            <div className="space-y-2">
              <Link to="/eligibility" className="flex items-center justify-between px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-all group">
                <span className="text-sm font-semibold text-violet-800">Run Eligibility Check</span>
                <ArrowRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all group">
                <span className="text-sm font-semibold text-gray-700">Update Profile</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/schemes" className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all group">
                <span className="text-sm font-semibold text-gray-700">Browse All Schemes</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-violet-600" /> Recent Eligibility Checks
              </h2>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No checks yet. <Link to="/eligibility" className="text-violet-600 font-semibold underline">Run your first check →</Link></p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 8).map((h: { scheme_name: string; result: string; checked_at: string }, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                    {h.result === 'eligible' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      : h.result === 'needs_info' ? <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{h.scheme_name}</span>
                    <span className={`badge text-xs ${h.result === 'eligible' ? 'badge-eligible' : h.result === 'needs_info' ? 'badge-info' : 'badge-ineligible'}`}>
                      {h.result.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
