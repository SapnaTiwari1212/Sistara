import { cn } from '../../lib/utils'
import { siteConfig } from '../../config/siteConfig'

/** Pastel status pill for order states. */
export const StatusBadge = ({ status, className = '' }) => {
  const style = siteConfig.statusStyles[status] || 'bg-lavender-100 text-grape-500 border-lavender-300'
  return (
    <span
      className={cn(
        'pill border-2 whitespace-nowrap text-[11px] uppercase tracking-wide',
        style,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {status}
    </span>
  )
}

/** Generic pastel pill for tags and metadata. */
export const Tag = ({ children, tone = 'lavender', className = '' }) => {
  const tones = {
    lavender: 'bg-lavender-100 text-grape-500',
    pink: 'bg-pink-100 text-pink-600',
    sky: 'bg-sky-100 text-sky-500',
    butter: 'bg-butter-100 text-butter-500',
    mint: 'bg-mint-100 text-mint-500',
    cream: 'bg-cream-200 text-ink-soft',
  }
  return <span className={cn('pill', tones[tone] || tones.lavender, className)}>{children}</span>
}
