import { useMutation } from '@tanstack/react-query'
import { schemeApi, aiApi, type EligibilityCheckResponse, type EligibilityResult } from '@/lib/api'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertCircle, Sparkles, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

function ExplanationRow({ item }: { item: EligibilityResult['explanation'][0] }) {
  return (
    <div className={`flex items-start gap-2 text-xs py-1.5 ${
      item.met === null ? 'text-amber-400' : item.met ? 'text-emerald-400' : 'text-red-400'
    }`}>
      {item.met === null ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        : item.met ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        : <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
      <span className="leading-relaxed">{item.message}</span>
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
    <div className={`card border transition-all duration-200 ${
      isEligible ? 'border-emerald-500/30 hover:border-emerald-500/50'
        : isNeedsInfo ? 'border-amber-500/30 hover:border-amber-500/50'
        : 'border-surface-700/50 hover:border-surface-600'
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isEligible ? 'bg-emerald-500/15' : isNeedsInfo ? 'bg-amber-500/15' : 'bg-red-500/10'
          }`}>
            {isEligible ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              : isNeedsInfo ? <AlertCircle className="w-5 h-5 text-amber-400" />
              : <XCircle className="w-5 h-5 text-red-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display font-bold text-white text-sm leading-tight">{entry.scheme_name}</h3>
              {isEligible && <span className="badge-eligible">✓ Eligible</span>}
              {isNeedsInfo && <span className="badge-info">⚠ More Info Needed</span>}
              {!isEligible && !isNeedsInfo && <span className="badge-ineligible">✗ Not Eligible</span>}
            </div>
            <span className="badge-category text-xs">{entry.category}</span>

            {isEligible && (
              <p className="text-emerald-400/80 text-xs mt-2 line-clamp-1">💰 {entry.benefits.substring(0, 100)}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {entry.official_website && isEligible && (
              <a href={entry.official_website} target="_blank" rel="noopener noreferrer"
                className="btn-sm btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 px-2.5 rounded-lg">
                Apply <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => setOpen(!open)}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Explanation */}
        {open && (
          <div className="mt-4 pt-4 border-t border-surface-800 space-y-4">
            {entry.explanation.length > 0 && (
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Why this result:</p>
                {entry.explanation.map((item, i) => <ExplanationRow key={i} item={item} />)}
              </div>
            )}
            
            <div className="pt-3 border-t border-surface-800/40">
              {explanation ? (
                <div className="bg-primary-500/5 border border-primary-500/10 rounded-xl p-4 animate-fade-in">
                  <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Explanation
                  </p>
                  <p className="text-sm text-surface-200 leading-relaxed">{explanation}</p>
                </div>
              ) : (
                <button
                  onClick={fetchAIExplanation}
                  disabled={loadingExpl}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-medium border-primary-500/30 hover:border-primary-500/60 text-primary-300 bg-primary-950/20"
                >
                  {loadingExpl ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Ask AI to Explain</>
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
    <div className="min-h-screen py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-lg animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="section-title">Eligibility Checker</h1>
          <p className="section-subtitle max-w-xl mx-auto">
            We'll evaluate your profile against all active schemes and explain exactly why you qualify or don't.
          </p>

          {!results?.profile_complete && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Complete your <Link to="/profile" className="underline font-semibold">profile</Link> for more accurate results
            </div>
          )}

          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="btn-primary btn-lg mt-6 mx-auto"
          >
            {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
              : isSuccess ? <><RefreshCw className="w-5 h-5" /> Re-Check</>
              : <><Sparkles className="w-5 h-5" /> Check My Eligibility</>}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-fade-in space-y-8">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Eligible', count: results.summary.eligible_count, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400' },
                { label: 'Needs Info', count: results.summary.needs_info_count, color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400' },
                { label: 'Not Eligible', count: results.summary.not_eligible_count, color: 'from-red-500/15 to-red-500/5 border-red-500/20 text-red-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`card p-5 text-center bg-gradient-to-br border ${color}`}>
                  <p className="text-4xl font-display font-bold">{count}</p>
                  <p className="text-sm mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Eligible */}
            {results.eligible.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-emerald-400 mb-4">
                  <CheckCircle2 className="w-6 h-6" /> Eligible Schemes ({results.eligible.length})
                </h2>
                <div className="space-y-3">
                  {results.eligible.map(e => <ResultCard key={e.scheme_id} entry={e} defaultOpen />)}
                </div>
              </div>
            )}

            {/* Needs info */}
            {results.needs_info.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-amber-400 mb-4">
                  <AlertCircle className="w-6 h-6" /> Needs More Information ({results.needs_info.length})
                </h2>
                <div className="space-y-3">
                  {results.needs_info.map(e => <ResultCard key={e.scheme_id} entry={e} />)}
                </div>
              </div>
            )}

            {/* Not eligible */}
            {results.not_eligible.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold text-surface-400 mb-4">
                  <XCircle className="w-6 h-6" /> Not Eligible ({results.not_eligible.length})
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
