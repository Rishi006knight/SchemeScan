import { Link, useLocation } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MobileStickyCTA() {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const target = document.getElementById('final-cta')
    if (!target) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If final-cta is visible in viewport, hide sticky bar
        setIsVisible(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [location.pathname])

  // Hide on auth pages or profile/eligibility pages
  if (['/login', '/register', '/eligibility', '/profile'].includes(location.pathname)) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-2xl"
        >
          <Link
            to="/eligibility"
            className="w-full btn-primary btn-shine py-3 px-4 flex items-center justify-between rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span>Check Eligibility Free</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
