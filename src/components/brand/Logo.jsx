import { siteConfig } from '../../config/siteConfig'
import { cn } from '../../lib/utils'

/**
 * SISTARA wordmark.
 *
 * If `siteConfig.brandAssets.logo.src` points at a real logo file, that image
 * is used. Otherwise a vector wordmark is rendered, so the site always shows
 * "SISTARA / ZERO FAULT" and never a broken image.
 */
const Logo = ({ size = 'md', showTagline = true, className = '', withIcon = true }) => {
  const { brand, brandAssets } = siteConfig
  const { logo } = brandAssets

  const sizes = {
    sm: { name: 'text-lg', tag: 'text-[8px]', icon: 'h-7 w-7', gap: 'gap-2' },
    md: { name: 'text-2xl', tag: 'text-[9px]', icon: 'h-9 w-9', gap: 'gap-2.5' },
    lg: { name: 'text-4xl sm:text-5xl', tag: 'text-xs', icon: 'h-12 w-12 sm:h-14 sm:w-14', gap: 'gap-3' },
  }
  const s = sizes[size] || sizes.md

  if (logo.src) {
    return (
      <span className={cn('inline-flex items-center', s.gap, className)}>
        <img
          src={logo.src}
          alt={logo.alt}
          className={cn('shrink-0 object-contain', s.icon)}
          onError={(e) => {
            // If the configured file is missing, hide the broken img and let
            // the vector mark below take over.
            e.currentTarget.style.display = 'none'
          }}
        />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      {withIcon && <StarIcon className={cn('shrink-0 drop-shadow-sm', s.icon)} />}

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-extrabold tracking-tight',
            s.name,
            'bg-gradient-to-br from-pink-500 via-grape-400 to-sky-500 bg-clip-text text-transparent',
          )}
        >
          SISTARA
        </span>

        {showTagline && (
          <span
            className={cn(
              'mt-0.5 font-display font-bold uppercase tracking-[0.3em] text-ink-soft/80',
              s.tag,
            )}
          >
            {brand.tagline}
          </span>
        )}
      </span>
    </span>
  )
}

/** The little star that sits beside the wordmark. */
export const StarIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="sistaraStar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD1E0" />
        <stop offset="52%" stopColor="#FFB3C7" />
        <stop offset="100%" stopColor="#CBBDFA" />
      </linearGradient>
    </defs>
    <path
      d="M32 3.5c2.4 0 4.3 1.3 5.4 3.4l7.2 14.2 15.7 2.4c2.4.4 4.2 2 4.8 4.2.6 2.3-.2 4.7-2 6.4l-11.3 11.3 2.6 15.8c.4 2.4-.5 4.8-2.5 6.3-2 1.5-4.6 1.8-6.9.8L32 61l-13 7.3c-2.3 1-4.9.7-6.9-.8-2-1.5-2.9-3.9-2.5-6.3l2.6-15.8L1 34.2C-.8 32.5-1.6 30 0 27.8c.6-2.2 2.4-3.8 4.8-4.2l15.7-2.4 7.2-14.2c1.1-2.1 3-3.4 5.4-3.4z"
      fill="url(#sistaraStar)"
      stroke="#fff"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* little face so the star reads as the mascot */}
    <circle cx="25" cy="30" r="2.9" fill="#2E2A47" />
    <circle cx="39" cy="30" r="2.9" fill="#2E2A47" />
    <circle cx="25.9" cy="28.9" r="1" fill="#fff" />
    <circle cx="39.9" cy="28.9" r="1" fill="#fff" />
    <ellipse cx="19.5" cy="36" rx="3.4" ry="2.3" fill="#FC8FAB" opacity=".65" />
    <ellipse cx="44.5" cy="36" rx="3.4" ry="2.3" fill="#FC8FAB" opacity=".65" />
    <path
      d="M28 37.4c1.2 1.5 2.6 2.2 4 2.2s2.8-.7 4-2.2"
      fill="none"
      stroke="#2E2A47"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
)

export default Logo
