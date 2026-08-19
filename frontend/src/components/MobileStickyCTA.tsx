import { Link, useLocation } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function MobileStickyCTA() {
  const location = useLocation()
  
  // Hide on auth pages or eligibility check page where full flow is active
  if (['/login', '/register', '/eligibility', '/profile'].includes(location.pathname)) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-surface-950/90 backdrop-blur-xl border-t border-surface-800 shadow-2xl">
      <Link
        to="/eligibility"
        className="w-full btn-primary py-3 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-glow"
      >
        <Sparkles className="w-4 h-4 text-primary-200" />
        <span>Check 135+ Schemes Free</span>
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Link>
    </div>
  )
}
