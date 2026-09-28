import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Elegant confetti.
 *
 * Purely CSS/Framer transforms over a fixed, seeded set of pieces — no
 * physics loop, no canvas, so it stays cheap on mobile. Renders once and
 * then settles (decorative only, so it can be `aria-hidden`).
 */
const COLORS = ['#FFB3C7', '#CBBDFA', '#A6D8F2', '#FFDE84', '#9EE0BF', '#F76E97']

const SHAPES = ['circle', 'square', 'ribbon', 'circle', 'square']

/** Deterministic pseudo-random so SSR/CSR markup always matches. */
const seeded = (i, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const SuccessAnimation = ({ count = 34, duration = 2.6 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: seeded(i, 1) * 100,
        delay: seeded(i, 2) * 0.7,
        duration: duration * (0.72 + seeded(i, 3) * 0.55),
        size: 6 + seeded(i, 4) * 8,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
        drift: (seeded(i, 5) - 0.5) * 120,
        rotate: (seeded(i, 6) - 0.5) * 540,
      })),
    [count, duration],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === 'ribbon' ? p.size * 0.42 : p.size,
            backgroundColor: p.color,
            borderRadius:
              p.shape === 'circle' ? '9999px' : p.shape === 'square' ? '2px' : '2px',
          }}
          initial={{ opacity: 0, y: -30, rotate: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: ['-6vh', '104vh'],
            x: [0, p.drift],
            rotate: [0, p.rotate],
            scale: [0.6, 1, 0.9],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.6, 0.4, 1],
            times: [0, 0.12, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1.4,
          }}
        />
      ))}
    </div>
  )
}

export default SuccessAnimation
