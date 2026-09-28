import { cn } from '../../lib/utils'

/**
 * Hand-drawn-style SVG doodles used as section decorations.
 * Purely decorative — hidden from screen readers.
 */

export const ScribbleUnderline = ({ className = '', color = '#FFB3C7' }) => (
  <svg
    viewBox="0 0 200 14"
    preserveAspectRatio="none"
    className={cn('h-3 w-full', className)}
    aria-hidden="true"
  >
    <path
      d="M3 10C34 3.5 70 2 100 6s70 5 97-2"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
)

export const DoodleArrow = ({ className = '', color = '#A585DF' }) => (
  <svg viewBox="0 0 80 50" className={cn('h-8 w-14', className)} aria-hidden="true">
    <path
      d="M4 12c14 4 30 6 46 4 8-1 14-3 20-6"
      fill="none"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M62 6c5-1 8 0 9 3-1 3-4 5-9 5"
      fill="none"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const StarCluster = ({ className = '', color = '#FFDE84' }) => (
  <svg viewBox="0 0 70 70" className={cn('h-10 w-10', className)} aria-hidden="true">
    <path
      d="M24 6c1.8 7 2.6 7.8 9.6 9.6C26.6 17.4 25.8 18.2 24 25c-1.8-6.8-2.6-7.6-9.6-9.4 7-1.8 7.8-2.6 9.6-9.6z"
      fill={color}
    />
    <path
      d="M48 32c1.4 5.4 2 6 7.4 7.4-5.4 1.4-6 2-7.4 7.4-1.4-5.4-2-6-7.4-7.4 5.4-1.4 6-2 7.4-7.4z"
      fill={color}
      opacity=".75"
    />
    <path
      d="M14 44c.9 3.6 1.3 4 4.9 4.9-3.6.9-4 1.3-4.9 4.9-.9-3.6-1.3-4-4.9-4.9 3.6-.9 4-1.3 4.9-4.9z"
      fill={color}
      opacity=".5"
    />
  </svg>
)

/** Repeating pastel "trust" ticker. */
export const MarqueeStrip = ({ items, className = '' }) => (
  <div className={cn('relative flex overflow-hidden', className)} aria-hidden="true">
    <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
      {[...items, ...items].map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-2 whitespace-nowrap font-display text-sm font-bold text-ink-soft"
        >
          <span className="text-pink-300" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </span>
      ))}
    </div>
  </div>
)
