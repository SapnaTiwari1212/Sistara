import { useMemo } from 'react'
import { Heart, Sparkles, Star, Pencil, StickyNote, Scissors } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Ambient floating doodles.
 *
 * Deliberately sparse and CSS-driven (no JS animation loop) so it stays cheap
 * on phones. `count` is capped and items are `pointer-events-none`, so they
 * can never block a tap or create a scrollbar.
 */
const FloatingDecorations = ({ className = '', density = 'normal' }) => {
  const items = useMemo(() => {
    const pool = [
      { Icon: Heart, className: 'text-pink-300', size: 'h-5 w-5', anim: 'animate-riseHeart' },
      { Icon: Heart, className: 'text-pink-200', size: 'h-4 w-4', anim: 'animate-riseHeart' },
      { Icon: Star, className: 'text-butter-300', size: 'h-5 w-5', anim: 'animate-twinkle' },
      { Icon: Star, className: 'text-lavender-300', size: 'h-4 w-4', anim: 'animate-twinkle' },
      { Icon: Sparkles, className: 'text-sky-300', size: 'h-5 w-5', anim: 'animate-twinkle' },
      { Icon: Pencil, className: 'text-grape-300', size: 'h-5 w-5', anim: 'animate-floaty' },
      { Icon: StickyNote, className: 'text-butter-200', size: 'h-5 w-5', anim: 'animate-floaty' },
      { Icon: Scissors, className: 'text-pink-200', size: 'h-5 w-5', anim: 'animate-floatySlow' },
    ]

    // Fixed positions (percentages) so SSR/CSR render identical markup.
    const slots = [
      { top: '8%', left: '6%' },
      { top: '22%', left: '88%' },
      { top: '46%', left: '3%' },
      { top: '64%', left: '92%' },
      { top: '14%', left: '72%' },
      { top: '80%', left: '12%' },
      { top: '36%', left: '80%' },
      { top: '90%', left: '68%' },
    ]

    const count = density === 'sparse' ? 4 : density === 'dense' ? 8 : 6

    return slots.slice(0, count).map((slot, i) => ({
      ...slot,
      ...pool[i % pool.length],
      // Stagger the CSS animations so nothing pulses in lockstep.
      delay: `${(i % 5) * 0.9}s`,
      dur: i % 3 === 0 ? '7s' : i % 3 === 1 ? '5s' : '3.4s',
    }))
  }, [density])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute opacity-70"
          style={{ top: item.top, left: item.left }}
        >
          <item.Icon
            className={cn(item.size, item.className, item.anim)}
            style={{ animationDelay: item.delay, animationDuration: item.dur }}
          />
        </span>
      ))}
    </div>
  )
}

export default FloatingDecorations
