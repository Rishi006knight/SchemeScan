import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const getInitialOffset = () => {
    switch (direction) {
      case 'up': return { y: 30, opacity: 0 }
      case 'down': return { y: -30, opacity: 0 }
      case 'left': return { x: 30, opacity: 0 }
      case 'right': return { x: -30, opacity: 0 }
      case 'none': return { opacity: 0 }
    }
  }

  return (
    <motion.div
      initial={getInitialOffset()}
      whileInView={{ y: 0, x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
