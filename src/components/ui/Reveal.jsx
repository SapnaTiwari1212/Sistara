import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Scroll reveal wrapper.
 * Fades + lifts children into view once, then stops animating to keep
 * scrolling smooth. `once: true` avoids replay cost.
 */
export const Reveal = ({
  children,
  delay = 0,
  y = 26,
  duration = 0.55,
  className = '',
  as = 'div',
}) => {
  const Component = motion[as] || motion.div

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -60px 0px' }}
      transition={{ duration, delay, ease: [0.22, 0.68, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}

/** Staggered container — pair with <RevealItem>. */
export const RevealGroup = ({ children, className = '', stagger = 0.09, delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: stagger, delayChildren: delay } },
    }}
  >
    {children}
  </motion.div>
)

export const RevealItem = ({ children, className = '', y = 24 }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 0.68, 0.36, 1] },
      },
    }}
  >
    {children}
  </motion.div>
)

/** Small helper for the section eyebrow pill. */
export const Eyebrow = ({ children, className = '' }) => (
  <span
    className={cn(
      'pill border-2 border-dashed border-pink-200 bg-white/80 text-pink-600 shadow-soft backdrop-blur',
      className,
    )}
  >
    {children}
  </span>
)
