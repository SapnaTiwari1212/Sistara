import { motion } from 'framer-motion'
import { siteConfig } from '../../config/siteConfig'
import { cn } from '../../lib/utils'

/**
 * SISTARA mascot.
 *
 * Renders the real mascot image as soon as `siteConfig.brandAssets.mascot.src`
 * is set (drop the file in `public/assets/brand/` and set the path).
 * Until then it draws a vector mascot so the layout is honest and complete.
 *
 * The image is wrapped in a `motion.div` that gently floats, so swapping in a
 * real PNG needs no other change.
 */
const Mascot = ({ className = '', float = true, floatDelay = 0, size = 240 }) => {
  const { mascot } = siteConfig.brandAssets

  const inner = mascot.src ? (
    <img
      src={mascot.src}
      alt={mascot.alt}
      width={size}
      height={size}
      className="h-full w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(46,42,71,0.16)]"
      draggable="false"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  ) : (
    <VectorMascot />
  )

  if (!float) {
    return (
      <div className={cn('select-none', className)} style={{ width: size, height: size }}>
        {inner}
      </div>
    )
  }

  return (
    <motion.div
      className={cn('select-none', className)}
      style={{ width: size, height: size }}
      animate={{ y: [0, -14, 0], rotate: [0, 1.6, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: floatDelay,
      }}
    >
      {inner}
    </motion.div>
  )
}

/**
 * Vector mascot placeholder — a soft pastel star character with a pencil.
 * Deliberately simple so it reads clearly at every size.
 */
const VectorMascot = () => (
  <svg viewBox="0 0 260 260" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="mBody" x1="0" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#FFE7EF" />
        <stop offset="50%" stopColor="#FFD1E0" />
        <stop offset="100%" stopColor="#D8C6F5" />
      </linearGradient>
      <linearGradient id="mPencil" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#A6D8F2" />
        <stop offset="100%" stopColor="#7FC3E8" />
      </linearGradient>
      <radialGradient id="mBlush" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#FC8FAB" stopOpacity=".7" />
        <stop offset="100%" stopColor="#FC8FAB" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* soft shadow */}
    <ellipse cx="130" cy="234" rx="66" ry="11" fill="#2E2A47" opacity=".08" />

    {/* star body */}
    <path
      d="M130 26c6.6 0 11.9 3.7 14.9 9.5l19.6 39 43.1 6.6c6.6 1 11.6 5.6 13.2 11.5 1.6 6.2-.5 12.9-5.5 17.5l-31.2 31.1 7.2 43.4c1 6.4-1.4 13-6.8 17.2-5.5 4.2-12.7 4.9-19 1.9L130 191l-35.5 12.8c-6.3 3-13.5 2.3-19-1.9-5.4-4.2-7.8-10.8-6.8-17.2l7.2-43.4-31.2-31.1c-5-4.6-7.1-11.3-5.5-17.5 1.6-5.9 6.6-10.5 13.2-11.5l43.1-6.6 19.6-39c3-5.8 8.3-9.5 14.9-9.5z"
      fill="url(#mBody)"
      stroke="#ffffff"
      strokeWidth="7"
      strokeLinejoin="round"
    />

    {/* face */}
    <ellipse cx="101" cy="119" rx="15" ry="9" fill="url(#mBlush)" />
    <ellipse cx="159" cy="119" rx="15" ry="9" fill="url(#mBlush)" />
    <g fill="#2E2A47">
      <ellipse cx="108" cy="110" rx="6.4" ry="7.4" />
      <ellipse cx="152" cy="110" rx="6.4" ry="7.4" />
    </g>
    <g fill="#fff">
      <circle cx="110" cy="107.5" r="2.3" />
      <circle cx="154" cy="107.5" r="2.3" />
    </g>
    <path
      d="M119 128c3.4 4.6 6.7 6.8 11 6.8s7.6-2.2 11-6.8"
      fill="none"
      stroke="#2E2A47"
      strokeWidth="5.4"
      strokeLinecap="round"
    />

    {/* pencil tucked beside the star */}
    <g transform="rotate(18 196 158)">
      <rect x="184" y="122" width="24" height="58" rx="6" fill="url(#mPencil)" />
      <rect x="184" y="122" width="24" height="14" fill="#FFDE84" />
      <path d="M184 180h24l-12 22z" fill="#FFE9C7" />
      <path d="M191.5 196h9l-4.5 8z" fill="#2E2A47" />
      <rect x="184" y="122" width="24" height="58" rx="6" fill="none" stroke="#fff" strokeWidth="4" />
    </g>

    {/* sparkles */}
    <g fill="#FFDE84">
      <path d="M44 62c1.6 6 2.4 6.8 8.4 8.4-6 1.6-6.8 2.4-8.4 8.4-1.6-6-2.4-6.8-8.4-8.4 6-1.6 6.8-2.4 8.4-8.4z" />
      <path d="M214 74c1.2 4.6 1.8 5.2 6.4 6.4-4.6 1.2-5.2 1.8-6.4 6.4-1.2-4.6-1.8-5.2-6.4-6.4 4.6-1.2 5.2-1.8 6.4-6.4z" />
    </g>
  </svg>
)

export default Mascot
