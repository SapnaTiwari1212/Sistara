import { motion } from 'framer-motion'
import { siteConfig } from '../../config/siteConfig'

/**
 * Order status tracker.
 * Shows the five-step journey with a progress line between steps.
 */
const OrderTracker = ({ order }) => {
  const { orderStatuses } = siteConfig
  const currentIndex = Math.max(0, orderStatuses.indexOf(order.status))

  return (
    <div className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg">Order Progress</h3>
        <p className="font-display text-xs font-bold text-ink-muted">{order.id}</p>
      </div>

      <ol className="mt-6 space-y-0">
        {orderStatuses.map((status, i) => {
          const done = i < currentIndex
          const current = i === currentIndex
          const last = i === orderStatuses.length - 1

          return (
            <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
              {/* connector */}
              {!last && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 rounded-full bg-lavender-100"
                  aria-hidden="true"
                >
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: done ? 1 : 0 }}
                    transition={{ duration: 0.45, delay: i * 0.1 }}
                    className="block h-full w-full origin-top rounded-full bg-mint-500"
                  />
                </span>
              )}

              {/* dot */}
              <span
                className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-extrabold transition-colors duration-300 ${
                  done
                    ? 'border-mint-500 bg-mint-500 text-white'
                    : current
                      ? 'animate-pulse border-pink-400 bg-pink-300 text-ink'
                      : 'border-lavender-200 bg-white text-ink-muted'
                }`}
                aria-hidden="true"
              >
                {i + 1}
              </span>

              <div className="min-w-0 pt-1">
                <p
                  className={`font-display text-base font-extrabold leading-none ${
                    current ? 'text-pink-600' : done ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {status}
                </p>
                <p className="mt-1 font-body text-xs font-semibold text-ink-muted">
                  {current
                    ? 'This is where your order is right now.'
                    : done
                      ? 'Done — nice!'
                      : 'Coming up next'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default OrderTracker
