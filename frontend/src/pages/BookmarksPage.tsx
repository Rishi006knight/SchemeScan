import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { schemeApi, type Scheme } from '@/lib/api'
import { BookmarkCheck, ExternalLink, Trash2, ChevronRight } from 'lucide-react'
import { schemeApi as sa } from '@/lib/api'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function BookmarksPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['bookmarks'], queryFn: schemeApi.bookmarks })
  const bookmarks: Array<{ id: number; scheme: Scheme; created_at: string }> = data?.data?.results || data?.data || []

  const removeBookmark = async (schemeId: number) => {
    try {
      await sa.unbookmark(schemeId)
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('Bookmark removed')
    } catch { toast.error('Failed to remove') }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="page-container">
        <div className="mb-10">
          <h1 className="section-title flex items-center gap-3">
            <BookmarkCheck className="w-9 h-9 text-violet-600" /> Saved Schemes
          </h1>
          <p className="section-subtitle">Schemes you've bookmarked for later review and application</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-gray-200 h-36 shimmer rounded-2xl" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 text-center rounded-3xl shadow-sm">
            <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Browse schemes and save the ones you're interested in</p>
            <Link to="/schemes" className="btn-primary font-bold shadow-md shadow-violet-500/20">Browse Schemes</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {bookmarks.map(({ id, scheme }) => (
              <div key={id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-category">{scheme.category}</span>
                  <button onClick={() => removeBookmark(scheme.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-display font-bold text-gray-900 text-base mb-2 line-clamp-2">{scheme.name}</h3>
                <p className="text-emerald-700 text-xs mb-4 line-clamp-1 font-medium">💰 {scheme.benefits.substring(0, 80)}...</p>
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <Link to={`/schemes/${scheme.id}`}
                    className="flex items-center gap-1 text-violet-600 text-xs font-bold hover:text-violet-700">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  {scheme.official_website && (
                    <a href={scheme.official_website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-500 text-xs font-semibold hover:text-gray-800">
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
