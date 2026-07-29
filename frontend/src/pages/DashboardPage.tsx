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
    <div className="min-h-screen py-12">
      <div className="page-container">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-surface-400 mt-2">Here's your scheme eligibility overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: CheckCircle2, label: 'Eligible Schemes', value: eligibleCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
            { icon: AlertCircle, label: 'Needs More Info', value: needsInfoCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
            { icon: BookmarkCheck, label: 'Saved Schemes', value: bookmarks.length, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/30' },
            { icon: History, label: 'Total Checked', value: history.length, color: 'text-surface-300', bg: 'bg-surface-800 border-surface-700' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`card border p-5 ${bg}`}>
              <Icon className={`w-6 h-6 ${color} mb-3`} />
              <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
              <p className="text-sm text-surface-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Completion */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" /> Profile
              </h2>
              <Link to="/profile" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                Edit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-surface-400">Completion</span>
                <span className={`font-semibold ${profilePct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{profilePct}%</span>
              </div>
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${profilePct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                  style={{ width: `${profilePct}%` }} />
              </div>
            </div>
            {profilePct < 100 && (
              <p className="text-xs text-amber-400">Complete your profile for better eligibility results</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" /> Quick Actions
            </h2>
            <div className="space-y-2">
              <Link to="/eligibility" className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-600/15 border border-primary-500/30 hover:border-primary-500/60 transition-all group">
                <span className="text-sm font-medium text-primary-300">Run Eligibility Check</span>
                <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all group">
                <span className="text-sm font-medium text-surface-300">Update Profile</span>
                <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/schemes" className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all group">
                <span className="text-sm font-medium text-surface-300">Browse All Schemes</span>
                <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent History */}
          <div className="card p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" /> Recent Eligibility Checks
              </h2>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <p>No checks yet. <Link to="/eligibility" className="text-primary-400 underline">Run your first check →</Link></p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 8).map((h: { scheme_name: string; result: string; checked_at: string }, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/50">
                    {h.result === 'eligible' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : h.result === 'needs_info' ? <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <span className="text-sm text-white flex-1 truncate">{h.scheme_name}</span>
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
