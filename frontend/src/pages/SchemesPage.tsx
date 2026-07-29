import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { schemeApi, type Scheme } from '@/lib/api'
import { Search, BookmarkPlus, BookmarkCheck, Calendar, ChevronRight, Filter } from 'lucide-react'
import { useAuthStore } from '@/store'
import { schemeApi as sa } from '@/lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Agriculture', 'Education', 'Health', 'Housing', 'Women', 'Finance', 'Pension', 'Insurance', 'MSME', 'Employment']
const STATES = ['All States', 'Tamil Nadu', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Bihar', 'Madhya Pradesh']

function SchemeCard({ scheme }: { scheme: Scheme }) {
  const { isAuthenticated } = useAuthStore()
  const [bookmarked, setBookmarked] = useState(scheme.is_bookmarked)

  useEffect(() => {
    setBookmarked(scheme.is_bookmarked)
  }, [scheme.is_bookmarked])

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Login to save schemes'); return }
    try {
      if (bookmarked) {
        await sa.unbookmark(scheme.id)
        setBookmarked(false)
        toast.success('Bookmark removed')
      } else {
        await sa.bookmark(scheme.id)
        setBookmarked(true)
        toast.success('Scheme saved!')
      }
    } catch { toast.error('Failed to update bookmark') }
  }

  return (
    <Link to={`/schemes/${scheme.id}`} className="card-hover p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="badge-category">{scheme.category}</span>
        <button onClick={toggleBookmark}
          className={`p-1.5 rounded-lg transition-colors ${bookmarked ? 'text-primary-400 bg-primary-500/10' : 'text-surface-400 hover:text-primary-400 hover:bg-primary-500/10'}`}>
          {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
        </button>
      </div>

      <h3 className="font-display font-bold text-white text-base mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
        {scheme.name}
      </h3>
      <p className="text-surface-400 text-sm line-clamp-2 mb-4">{scheme.description}</p>

      <div className="mt-auto space-y-2">
        <p className="text-xs text-emerald-400 font-medium line-clamp-1">💰 {scheme.benefits.substring(0, 80)}...</p>
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>📍 {scheme.state_applicable === 'All' ? 'All India' : scheme.state_applicable}</span>
          {scheme.deadline && (
            <span className="flex items-center gap-1 text-amber-400">
              <Calendar className="w-3 h-3" /> {new Date(scheme.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-primary-400 text-xs font-medium mt-4">
        View Details <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  )
}

export default function SchemesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [state, setState] = useState('All States')

  const { data, isLoading } = useQuery({
    queryKey: ['schemes', search, category, state],
    queryFn: () => schemeApi.list({
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      state: state !== 'All States' ? state : undefined,
    }),
    staleTime: 60000,
  })

  const schemes: Scheme[] = data?.data?.results || data?.data || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(search ? { search } : {})
  }

  return (
    <div className="min-h-screen py-12">
      <div className="page-container">
        {/* Header */}
        <div className="mb-10">
          <h1 className="section-title">Browse Schemes</h1>
          <p className="section-subtitle">Discover all available government welfare schemes</p>
        </div>

        {/* Search + Filters */}
        <div className="card p-5 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes, benefits, categories..."
                className="input pl-10" />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-primary-600 text-white border border-primary-500'
                      : 'bg-surface-800 text-surface-300 border border-surface-700 hover:border-primary-500/50'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="select ml-auto text-xs py-1.5" style={{ width: 'auto' }}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 h-52 shimmer" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-20 card p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No schemes found</h3>
            <p className="text-surface-400">Try a different search term or category</p>
          </div>
        ) : (
          <>
            <p className="text-surface-400 text-sm mb-5">{schemes.length} scheme{schemes.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
