import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { schemeApi } from '@/lib/api'
import { ExternalLink, Calendar, MapPin, FileText, ArrowLeft, BookmarkPlus, BookmarkCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { schemeApi as sa } from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, error } = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => schemeApi.detail(Number(id)),
  })

  const scheme = data?.data
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (scheme) {
      setBookmarked(scheme.is_bookmarked)
    }
  }, [scheme])

  const toggleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Login to save schemes'); return }
    try {
      if (bookmarked) { await sa.unbookmark(Number(id)); setBookmarked(false); toast.success('Removed') }
      else { await sa.bookmark(Number(id)); setBookmarked(true); toast.success('Saved!') }
    } catch { toast.error('Failed') }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-12 page-container">
      <div className="h-8 w-48 shimmer rounded mb-8" />
      <div className="h-64 shimmer rounded-2xl" />
    </div>
  )

  if (error || !scheme) return (
    <div className="min-h-screen bg-gray-50 py-12 page-container text-center">
      <p className="text-gray-500">Scheme not found.</p>
      <Link to="/schemes" className="btn-primary mt-4">Browse Schemes</Link>
    </div>
  )

  const docs = scheme.documents_required.split(',').map((d: string) => d.trim())

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="page-container max-w-4xl">
        <Link to="/schemes" className="flex items-center gap-2 text-gray-500 hover:text-violet-600 mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Schemes
        </Link>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="badge-category mb-3">{scheme.category}</span>
              <h1 className="text-3xl font-display font-black text-gray-900 mt-2">{scheme.name}</h1>
            </div>
            <button onClick={toggleBookmark}
              className={`p-3 rounded-2xl border transition-all flex-shrink-0 ${bookmarked ? 'bg-violet-50 border-violet-300 text-violet-600' : 'bg-white border-gray-300 text-gray-400 hover:border-violet-300 hover:text-violet-600'}`}>
              {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-600" />
              {scheme.state_applicable === 'All' ? 'All India (Central Scheme)' : scheme.state_applicable}
            </span>
            {scheme.deadline && (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium"><Calendar className="w-4 h-4 text-amber-600" />
                Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{scheme.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="font-display font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">💰 Benefits</h2>
            <p className="text-emerald-700 font-medium text-sm leading-relaxed">{scheme.benefits}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="font-display font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" /> Documents Required
            </h2>
            <ul className="space-y-2">
              {docs.map((doc: string) => (
                <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" /> {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {scheme.official_website && (
            <a href={scheme.official_website} target="_blank" rel="noopener noreferrer"
              className="btn-primary btn-lg gap-2 flex-1 justify-center shadow-lg shadow-violet-500/20">
              Apply on Official Website <ExternalLink className="w-5 h-5" />
            </a>
          )}
          {isAuthenticated && (
            <Link to="/eligibility" className="btn-secondary btn-lg flex-1 justify-center font-bold">
              Check My Eligibility
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
