import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { schemeApi, type Scheme } from '@/lib/api'
import {
  BookmarkCheck, ExternalLink, Trash2, ChevronRight,
  Sparkles, Filter, RotateCcw, Building
} from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const qc = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'category'>('recent')

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: schemeApi.bookmarks,
  })

  const rawBookmarks: Array<{ id: number; scheme: Scheme; created_at: string }> =
    data?.data?.results || data?.data || []

  const removeBookmark = async (schemeId: number) => {
    try {
      await schemeApi.unbookmark(schemeId)
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('Scheme removed from bookmarks')
    } catch {
      toast.error('Failed to remove bookmark')
    }
  }

  const clearAllBookmarks = async () => {
    if (!window.confirm('Are you sure you want to remove all saved schemes?')) return
    try {
      for (const b of rawBookmarks) {
        await schemeApi.unbookmark(b.scheme.id)
      }
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('All bookmarks cleared')
    } catch {
      toast.error('Failed to clear bookmarks')
    }
  }

  // Extract unique categories in bookmarks
  const categories = useMemo(() => {
    const cats = new Set(rawBookmarks.map(b => b.scheme.category))
    return ['All', ...Array.from(cats)]
  }, [rawBookmarks])

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let list = [...rawBookmarks]
    if (selectedCategory !== 'All') {
      list = list.filter(b => b.scheme.category.toLowerCase() === selectedCategory.toLowerCase())
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.scheme.name.localeCompare(b.scheme.name))
    } else if (sortBy === 'category') {
      list.sort((a, b) => a.scheme.category.localeCompare(b.scheme.category))
    }
    return list
  }, [rawBookmarks, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="page-container space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold mb-2">
              <BookmarkCheck className="w-3.5 h-3.5 text-violet-600" /> Saved Schemes List
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
              Saved Schemes ({rawBookmarks.length})
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Keep track of programs you're interested in for easy reference and application.
            </p>
          </div>

          {rawBookmarks.length > 0 && (
            <button
              onClick={clearAllBookmarks}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Bookmarks</span>
            </button>
          )}
        </div>

        {/* Filter / Sort controls (if bookmarks exist) */}
        {rawBookmarks.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs text-gray-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'category')}
                className="select text-xs py-1.5 px-3 bg-white border-gray-300 rounded-xl"
              >
                <option value="recent">Recently Saved</option>
                <option value="name">Scheme Name (A-Z)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-gray-200 h-40 shimmer rounded-2xl" />)}
          </div>
        ) : rawBookmarks.length === 0 ? (
          /* Illustration Empty State */
          <div className="bg-white border border-gray-200 p-12 sm:p-16 text-center rounded-3xl shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto text-violet-500 shadow-xs">
              <BookmarkCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900">No saved schemes yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              When you find schemes you're interested in while browsing, save them here for quick access and document checklists.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                to="/schemes"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-violet-50 text-violet-600 font-bold px-5 py-2.5 rounded-xl text-sm border-2 border-violet-500 shadow-xs"
              >
                <span>Browse All 135+ Schemes</span>
              </Link>
              <Link
                to="/eligibility"
                className="btn-primary btn-shine px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-violet-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Check Eligibility</span>
              </Link>
            </div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-2">
            <p className="text-sm text-gray-600 font-medium">No saved schemes in category "{selectedCategory}".</p>
            <button onClick={() => setSelectedCategory('All')} className="text-xs font-bold text-violet-600 hover:underline inline-flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Show all bookmarks
            </button>
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid md:grid-cols-2 gap-5">
            {filteredBookmarks.map(({ id, scheme, created_at }) => (
              <div
                key={id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-category text-[11px]">{scheme.category}</span>
                      <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Building className="w-3 h-3 text-gray-400" />
                        {scheme.state_applicable === 'All' ? 'Central Scheme' : scheme.state_applicable}
                      </span>
                    </div>

                    <button
                      onClick={() => removeBookmark(scheme.id)}
                      title="Remove bookmark"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/schemes/${scheme.id}`} className="font-display font-bold text-gray-900 text-base mb-1.5 line-clamp-2 hover:text-violet-600 transition-colors">
                    {scheme.name}
                  </Link>
                  <p className="text-emerald-700 text-xs font-medium mb-3 line-clamp-1">
                    💰 {scheme.benefits}
                  </p>
                  {created_at && (
                    <p className="text-[11px] text-gray-400 mb-4">
                      Saved on {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    to="/eligibility"
                    className="text-xs font-bold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check Eligibility</span>
                  </Link>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/schemes/${scheme.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-0.5"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {scheme.official_website && (
                      <a
                        href={scheme.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-0.5"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
