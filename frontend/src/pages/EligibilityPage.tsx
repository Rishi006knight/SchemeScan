import { useMutation } from '@tanstack/react-query'
import { schemeApi, aiApi, type EligibilityCheckResponse, type EligibilityResult } from '@/lib/api'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertCircle, Sparkles, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
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
  const isEligible = entry.result === 'eligible'
  const isNeedsInfo = entry.result === 'needs_info'

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
    <div className={`bg-white border rounded-2xl shadow-sm transition-all duration-200 ${
      isEligible ? 'border-emerald-200 hover:border-emerald-300'
        : isNeedsInfo ? 'border-amber-200 hover:border-amber-300'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isEligible ? 'bg-emerald-100' : isNeedsInfo ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            {isEligible ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              : isNeedsInfo ? <AlertCircle className="w-5 h-5 text-amber-600" />
              : <XCircle className="w-5 h-5 text-red-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display font-bold text-gray-900 text-sm leading-tight">{entry.scheme_name}</h3>
              {isEligible && <span className="badge-eligible">✓ Eligible</span>}
              {isNeedsInfo && <span className="badge-info">⚠ More Info Needed</span>}
              {!isEligible && !isNeedsInfo && <span className="badge-ineligible">✗ Not Eligible</span>}
            </div>
            <span className="badge-category text-xs">{entry.category}</span>

            {isEligible && (
              <p className="text-emerald-700 text-xs mt-2 line-clamp-1 font-medium">💰 {entry.benefits.substring(0, 100)}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {entry.official_website && isEligible && (
              <a href={entry.official_website} target="_blank" rel="noopener noreferrer"
                className="btn-sm btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 px-2.5 rounded-lg shadow-xs">
                Apply <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => setOpen(!open)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Explanation */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {entry.explanation.length > 0 && (
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Why this result:</p>
                {entry.explanation.map((item, i) => <ExplanationRow key={i} item={item} />)}
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-100">
              {explanation ? (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" /> AI Explanation
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">{explanation}</p>
                </div>
              ) : (
                <button
                  onClick={fetchAIExplanation}
                  disabled={loadingExpl}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-semibold border-violet-300 hover:border-violet-400 text-violet-700 bg-violet-50 hover:bg-violet-100"
                >
                  {loadingExpl ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5 text-violet-600" /> Ask AI to Explain</>
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
  const { mutate, data, isPending, isSuccess } = useMutation({
    mutationFn: () => schemeApi.check(),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      toast.error(error.response?.data?.detail || 'Failed to check eligibility')
    },
  })

  const results: EligibilityCheckResponse | null = data?.data || null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="section-title">Eligibility Checker</h1>
          <p className="section-subtitle max-w-xl mx-auto">
            We'll evaluate your profile against all active schemes and explain exactly why you qualify or don't.
          </p>

          {!results?.profile_complete && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Complete your <Link to="/profile" className="underline font-bold text-amber-900">profile</Link> for more accurate results
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => mutate()}
              disabled={isPending}
              className="btn-primary btn-lg mt-4 mx-auto font-bold shadow-lg shadow-violet-500/25"
            >
              {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
                : isSuccess ? <><RefreshCw className="w-5 h-5" /> Re-Check</>
                : <><Sparkles className="w-5 h-5" /> Check My Eligibility</>}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-fade-in space-y-8">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Eligible', count: results.summary.eligible_count, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                { label: 'Needs Info', count: results.summary.needs_info_count, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                { label: 'Not Eligible', count: results.summary.not_eligible_count, color: 'bg-gray-100 border-gray-200 text-gray-700' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`p-5 text-center rounded-2xl border shadow-sm ${color}`}>
                  <p className="text-4xl font-display font-black">{count}</p>
                  <p className="text-sm mt-1 font-bold">{label}</p>
                </div>
              ))}
            </div>

            {/* Eligible */}
            {results.eligible.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-emerald-700 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Eligible Schemes ({results.eligible.length})
                </h2>
                <div className="space-y-3">
                  {results.eligible.map(e => <ResultCard key={e.scheme_id} entry={e} defaultOpen />)}
                </div>
              </div>
            )}

            {/* Needs info */}
            {results.needs_info.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-amber-700 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600" /> Needs More Information ({results.needs_info.length})
                </h2>
                <div className="space-y-3">
                  {results.needs_info.map(e => <ResultCard key={e.scheme_id} entry={e} />)}
                </div>
              </div>
            )}

            {/* Not eligible */}
            {results.not_eligible.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-gray-700 mb-4">
                  <XCircle className="w-6 h-6 text-gray-500" /> Not Eligible ({results.not_eligible.length})
                </h2>
                <div className="space-y-3">
                  {results.not_eligible.map(e => <ResultCard key={e.scheme_id} entry={e} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
