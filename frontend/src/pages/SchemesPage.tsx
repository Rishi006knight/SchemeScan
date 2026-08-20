import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { schemeApi, type Scheme } from '@/lib/api'
import {
  Search, BookmarkPlus, BookmarkCheck, Calendar, ChevronRight,
  Filter, Sparkles, RotateCcw, Building, ShieldCheck
} from 'lucide-react'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'All',
  'Agriculture',
  'Education',
  'Healthcare',
  'Women',
  'Housing',
  'MSME',
  'Pensions',
  'Insurance',
  'Employment',
  'Disability',
  'Social Welfare'
]

const STATES = [
  'All States',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Uttar Pradesh',
  'Kerala',
  'Telangana',
  'Andhra Pradesh',
  'Rajasthan',
  'Gujarat',
  'West Bengal',
  'Bihar',
  'Odisha',
  'Delhi',
  'Punjab'
]

function getCategoryColor(cat: string) {
  const c = cat.toLowerCase()
  if (c.includes('agri')) return { border: 'border-l-green-500', badge: 'bg-green-100 text-green-800' }
  if (c.includes('edu')) return { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-800' }
  if (c.includes('health')) return { border: 'border-l-red-500', badge: 'bg-red-100 text-red-800' }
  if (c.includes('women')) return { border: 'border-l-pink-500', badge: 'bg-pink-100 text-pink-800' }
  if (c.includes('hous')) return { border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-800' }
  if (c.includes('msme') || c.includes('financ')) return { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-800' }
  if (c.includes('pension') || c.includes('senior')) return { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-800' }
  if (c.includes('employ') || c.includes('skill')) return { border: 'border-l-cyan-500', badge: 'bg-cyan-100 text-cyan-800' }
  return { border: 'border-l-violet-500', badge: 'bg-violet-100 text-violet-800' }
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  const { isAuthenticated } = useAuthStore()
  const [bookmarked, setBookmarked] = useState(scheme.is_bookmarked)
  const colors = getCategoryColor(scheme.category)

  useEffect(() => {
    setBookmarked(scheme.is_bookmarked)
  }, [scheme.is_bookmarked])

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Sign in to save schemes to your profile')
      return
    }
    try {
      if (bookmarked) {
        await schemeApi.unbookmark(scheme.id)
        setBookmarked(false)
        toast.success('Scheme removed from saved list')
      } else {
        await schemeApi.bookmark(scheme.id)
        setBookmarked(true)
        toast.success('Scheme bookmarked!')
      }
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  return (
    <Link
      to={`/schemes/${scheme.id}`}
      className={`bg-white p-6 flex flex-col justify-between h-full border border-gray-200 border-l-4 ${colors.border} rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
              {scheme.category}
            </span>
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Building className="w-3 h-3 text-gray-400" />
              {scheme.state_applicable === 'All' ? 'Central Govt.' : scheme.state_applicable}
            </span>
          </div>

          <button
            onClick={toggleBookmark}
            title={bookmarked ? 'Remove bookmark' : 'Save scheme'}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? 'text-violet-600 bg-violet-50'
                : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
            }`}
          >
            {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        </div>

        <h3 className="font-display font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors leading-snug">
          {scheme.name}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
        <p className="text-xs text-emerald-700 font-medium line-clamp-1 flex items-center gap-1">
          <span>💰</span>
          <span>{scheme.benefits}</span>
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span className="text-violet-600 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Details & Rules <ChevronRight className="w-3.5 h-3.5" />
          </span>
          {scheme.deadline ? (
            <span className="flex items-center gap-1 text-amber-600 text-[11px]">
              <Calendar className="w-3 h-3" /> {scheme.deadline}
            </span>
          ) : (
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active Scheme
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function SchemesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [state, setState] = useState(searchParams.get('state') || 'All States')
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'category'>('relevance')

  // Keep state synced with URL query params
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
    const q = searchParams.get('search')
    if (q) setSearch(q)
  }, [searchParams])

  const { data, isLoading } = useQuery({
    queryKey: ['schemes', search, category, state],
    queryFn: () =>
      schemeApi.list({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        state: state !== 'All States' ? state : undefined,
      }),
    staleTime: 60000,
  })

  const rawSchemes: Scheme[] = data?.data?.results || data?.data || []

  // Apply sorting
  const schemes = useMemo(() => {
    const list = [...rawSchemes]
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sortBy === 'category') {
      return list.sort((a, b) => a.category.localeCompare(b.category))
    }
    return list
  }, [rawSchemes, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(search ? { search, category } : { category })
  }

  const resetFilters = () => {
    setSearch('')
    setCategory('All')
    setState('All States')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="page-container space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Direct Welfare Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
              Browse Government Schemes
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Explore 135+ verified Central & State programs with eligibility rules and official links.
            </p>
          </div>

          <Link to="/eligibility" className="btn-primary py-2.5 px-5 text-xs font-bold shrink-0 self-start md:self-auto gap-2 shadow-md shadow-violet-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Check My Eligibility</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 sm:p-6 space-y-4 rounded-3xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword: 'farmer subsidy', 'scholarship', 'pension', 'women loan'..."
                className="input pl-10 pr-4 py-3 text-sm border-gray-300"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 text-sm font-semibold shrink-0">
              Search
            </button>
          </form>

          {/* Category Pills & State Dropdown */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-gray-100">
            
            {/* Scrollable Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat)
                    setSearchParams(search ? { search, category: cat } : { category: cat })
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* State & Sort Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="select text-xs py-2 bg-white border-gray-300 rounded-xl"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'name' | 'category')}
                className="select text-xs py-2 bg-white border-gray-300 rounded-xl"
              >
                <option value="relevance">Sort: Default</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="category">Sort: Category</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Header with Active Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap text-xs text-gray-500">
          <p>
            Showing <strong className="text-gray-900">{schemes.length}</strong> welfare scheme{schemes.length !== 1 ? 's' : ''}
          </p>

          {(category !== 'All' || state !== 'All States' || search) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Scheme Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 p-6 h-60 shimmer rounded-2xl" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-20 bg-white p-12 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-display font-bold text-gray-900">No matching schemes found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              We couldn't find schemes matching "{search}" in category "{category}". Try changing your keywords or resetting filters.
            </p>
            <button onClick={resetFilters} className="btn-secondary text-xs font-semibold py-2 px-4 inline-flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
