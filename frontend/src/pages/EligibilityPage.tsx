import { useMutation, useQuery } from '@tanstack/react-query'
import { schemeApi, aiApi, profileApi, type EligibilityCheckResponse, type EligibilityResult } from '@/lib/api'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, XCircle, AlertCircle, Sparkles, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, Loader2, User,
  BookmarkPlus, BookmarkCheck, Download, ShieldCheck, ArrowRight
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

function ExplanationRow({ item }: { item: EligibilityResult['explanation'][0] }) {
  return (
    <div className={`flex items-start gap-2 text-xs py-1.5 ${
      item.met === null ? 'text-amber-700' : item.met ? 'text-emerald-700' : 'text-red-700'
    }`}>
      {item.met === null ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
        : item.met ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
        : <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-600" />}
      <span className="leading-relaxed font-medium">{item.message}</span>
    </div>
  )
}

function ResultCard({ entry, defaultOpen = false }: { entry: EligibilityResult; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [explanation, setExplanation] = useState<string>('')
  const [loadingExpl, setLoadingExpl] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const isEligible = entry.result === 'eligible'
  const isNeedsInfo = entry.result === 'needs_info'

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      if (bookmarked) {
        await schemeApi.unbookmark(entry.scheme_id)
        setBookmarked(false)
        toast.success('Removed from bookmarks')
      } else {
        await schemeApi.bookmark(entry.scheme_id)
        setBookmarked(true)
        toast.success('Scheme saved!')
      }
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  const fetchAIExplanation = async () => {
    setLoadingExpl(true)
    try {
      const { data } = await aiApi.explain(entry.scheme_id)
      setExplanation(data.explanation)
    } catch {
      toast.error('Failed to generate AI explanation')
    } finally {
      setLoadingExpl(false)
    }
  }

  return (
    <div className={`bg-white border rounded-2xl shadow-xs transition-all duration-200 ${
      isEligible ? 'border-l-4 border-l-green-500 border-gray-200 hover:shadow-md'
        : isNeedsInfo ? 'border-l-4 border-l-amber-500 border-gray-200 hover:shadow-md'
        : 'border-l-4 border-l-gray-300 border-gray-200 hover:shadow-md'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isEligible ? 'bg-emerald-100' : isNeedsInfo ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {isEligible ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                : isNeedsInfo ? <AlertCircle className="w-5 h-5 text-amber-600" />
                : <XCircle className="w-5 h-5 text-red-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link to={`/schemes/${entry.scheme_id}`} className="font-display font-bold text-gray-900 text-base hover:text-violet-600 transition-colors leading-tight">
                  {entry.scheme_name}
                </Link>
                {isEligible && <span className="badge-eligible text-[11px]">✓ 100% Eligible</span>}
                {isNeedsInfo && <span className="badge-info text-[11px]">⚠ Partial Match</span>}
                {!isEligible && !isNeedsInfo && <span className="badge-ineligible text-[11px]">✗ Not Eligible</span>}
              </div>

              <span className="badge-category text-[11px] mb-2">{entry.category}</span>

              {isEligible && (
                <p className="text-violet-700 text-xs font-bold mt-1.5 flex items-center gap-1">
                  <span>💰</span>
                  <span>{entry.benefits}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleBookmark}
              title={bookmarked ? 'Remove bookmark' : 'Save scheme'}
              className={`p-2 rounded-xl border transition-colors ${
                bookmarked ? 'bg-violet-50 text-violet-600 border-violet-200' : 'text-gray-400 hover:text-violet-600 hover:bg-gray-50 border-gray-200'
              }`}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>

            {entry.official_website && isEligible && (
              <a
                href={entry.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sm btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 px-3 rounded-xl shadow-xs"
              >
                Apply <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Breakdown Accordion */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {entry.explanation.length > 0 && (
              <div className="space-y-1 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Criteria Rule Evaluation Breakdown:
                </p>
                {entry.explanation.map((item, i) => <ExplanationRow key={i} item={item} />)}
              </div>
            )}
            
            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                to={`/schemes/${entry.scheme_id}`}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
              >
                View Scheme Details & Documents <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {explanation ? (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs text-gray-800 flex-1">
                  <p className="font-bold text-violet-800 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-600" /> AI Summary:
                  </p>
                  <p>{explanation}</p>
                </div>
              ) : (
                <button
                  onClick={fetchAIExplanation}
                  disabled={loadingExpl}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-semibold border-violet-300 hover:border-violet-400 text-violet-700 bg-violet-50 hover:bg-violet-100"
                >
                  {loadingExpl ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-3 h-3 text-violet-600" /> Ask AI to Explain</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EligibilityPage() {
  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: profileApi.getMe })
  const profile = profileData?.data || {}

  const { mutate, data, isPending, isSuccess } = useMutation({
    mutationFn: () => schemeApi.check(),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      toast.error(error.response?.data?.detail || 'Failed to check eligibility')
    },
  })

  const results: EligibilityCheckResponse | null = data?.data || null

  const handleDownloadReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="page-container max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
            AI Welfare Eligibility Checker
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Our deterministic rule engine tests your profile against 135+ Central & State welfare programs in under 1 second.
          </p>
        </div>

        {/* 1. Profile Summary Card (Before/Alongside check) */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-600" />
              <h2 className="font-display font-bold text-gray-900 text-base">Your Active Profile Parameters</h2>
            </div>
            <Link to="/profile" className="text-violet-600 text-xs font-bold hover:underline">
              Edit in Profile →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.age && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                🎂 Age: {profile.age}
              </span>
            )}
            {profile.gender && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                ⚧ {profile.gender}
              </span>
            )}
            {profile.state && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                📍 {profile.state}
              </span>
            )}
            {profile.annual_income && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                💵 ₹{Number(profile.annual_income).toLocaleString('en-IN')}/year
              </span>
            )}
            {profile.occupation && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                💼 {profile.occupation}
              </span>
            )}
            {profile.category && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                🏷️ {profile.category}
              </span>
            )}
            {profile.is_rural !== undefined && (
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                🏡 {profile.is_rural ? 'Rural Area' : 'Urban Area'}
              </span>
            )}
            {!profile.age && !profile.state && !profile.occupation && (
              <p className="text-xs text-amber-700 font-medium">
                No profile details saved yet. Complete your profile for 100% personalized matches.
              </p>
            )}
          </div>
        </div>

        {/* 2. Prominent Action Button */}
        <div className="text-center space-y-2">
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="btn-primary btn-shine px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-violet-500/25 mx-auto inline-flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Evaluating 135+ Schemes...</span>
              </>
            ) : isSuccess ? (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Re-Evaluate Eligibility</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Check My Scheme Eligibility Now</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-400">Evaluates income thresholds, landholding, age limits, and state criteria.</p>
        </div>

        {/* 3. Results Section */}
        {results && (
          <div className="space-y-8 animate-fade-in pt-4">
            
            {/* Top Match Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-display font-black">
                  🎉 We matched you with {results.summary.eligible_count} schemes!
                </h3>
                <p className="text-white/85 text-xs sm:text-sm mt-1">
                  You fully qualify for {results.summary.eligible_count} schemes, with {results.summary.needs_info_count} partial matches.
                </p>
              </div>
              <button
                onClick={handleDownloadReport}
                className="btn-secondary bg-white text-violet-700 hover:bg-gray-50 border-0 text-xs font-bold py-2.5 px-4 rounded-xl shrink-0 self-start sm:self-auto gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Report</span>
              </button>
            </div>

            {/* Results Grid / Columns */}
            <div className="space-y-6">
              
              {/* Eligible Schemes */}
              {results.eligible.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-display font-bold text-gray-900">
                      Eligible Schemes ({results.eligible.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {results.eligible.map(e => <ResultCard key={e.scheme_id} entry={e} defaultOpen />)}
                  </div>
                </div>
              )}

              {/* Partial / Needs info */}
              {results.needs_info.length > 0 && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-display font-bold text-gray-900">
                      Partial Matches — More Info Needed ({results.needs_info.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {results.needs_info.map(e => <ResultCard key={e.scheme_id} entry={e} />)}
                  </div>
                </div>
              )}

              {/* Ineligible schemes */}
              {results.not_eligible.length > 0 && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-display font-bold text-gray-700">
                      Not Eligible ({results.not_eligible.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {results.not_eligible.map(e => <ResultCard key={e.scheme_id} entry={e} />)}
                  </div>
                </div>
              )}

            </div>

            {/* Explainable AI Note */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-500 flex items-center gap-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Deterministic & Explainable</strong>: Results are calculated directly from official gazette qualification trees. No random guessing or automated approvals without verifying documentation.
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
