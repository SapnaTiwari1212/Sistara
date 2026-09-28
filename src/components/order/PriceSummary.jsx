import { motion } from 'framer-motion'
import { Sparkles, Tag, Info, TrendingDown } from 'lucide-react'
import { formatINR, cn } from '../../lib/utils'
import { getAccent } from '../../config/services'
import { siteConfig } from '../../config/siteConfig'

/**
 * Live price breakdown.
 * Reads totals from `pricing` so the order form and payment screen can never
 * show a different number.
 */
const PriceSummary = ({ service, pricing, quantity, deadline, compact = false }) => {
  if (!service) return null

  const accent = getAccent(service.accent)
  const deadlineInfo = siteConfig.deadlines.find((d) => d.value === deadline)

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.68, 0.36, 1] }}
      className={cn(
        'relative overflow-hidden rounded-4xl border-2 bg-white p-5 shadow-card sm:p-6',
        accent.border,
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', accent.gradient)} aria-hidden="true" />

      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', accent.bg)}>
          <service.icon className={cn('h-5 w-5', accent.text)} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-extrabold text-ink">
            {service.name}
          </p>
            <p className="font-body text-xs font-semibold text-ink-muted">
              {quantity} {Number(quantity) === 1 ? service.unit : service.unitLabel}
            </p>
        </div>
      </div>

      {/* line items */}
      <dl className="mt-5 space-y-2.5 border-t-2 border-dashed border-lavender-100 pt-4 font-body text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold text-ink-soft">Base price</dt>
          <dd className="font-bold text-ink">{formatINR(pricing.subtotal - pricing.extras - (pricing.rush || 0))}</dd>
        </div>

        {pricing.extras > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-ink-soft">
              Extra {quantity - service.minQuantity} {service.unitLabel}
            </dt>
            <dd className="font-bold text-ink">{formatINR(pricing.extras)}</dd>
          </div>
        )}

        {pricing.rush !== 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt
              className={cn(
                'flex items-center gap-1.5 font-semibold',
                pricing.rush > 0 ? 'text-butter-500' : 'text-mint-500',
              )}
            >
              {pricing.rush > 0 ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Rush delivery
                </>
              ) : (
                <>
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Relaxed-rate saving
                </>
              )}
            </dt>
            <dd
              className={cn(
                'font-bold',
                pricing.rush > 0 ? 'text-butter-500' : 'text-mint-500',
              )}
            >
              {pricing.rush > 0 ? '+' : '−'}
              {formatINR(Math.abs(pricing.rush))}
            </dd>
          </div>
        )}

        {pricing.discount > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 font-semibold text-mint-500">
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
              Discount
            </dt>
            <dd className="font-bold text-mint-500">−{formatINR(pricing.discount)}</dd>
          </div>
        )}

        {pricing.tax > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-ink-soft">Tax</dt>
            <dd className="font-bold text-ink">{formatINR(pricing.tax)}</dd>
          </div>
        )}
      </dl>

      {/* total */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t-2 border-dashed border-lavender-100 pt-4">
        <div>
          <p className="font-display text-sm font-bold text-ink-soft">Estimated Price</p>
          {deadlineInfo && (
            <p className="mt-0.5 font-body text-[11px] font-semibold text-ink-muted">
              {deadlineInfo.label} · {deadlineInfo.note}
            </p>
          )}
        </div>
        <motion.p
          key={pricing.total}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="font-display text-2xl font-extrabold text-pink-600 sm:text-3xl"
        >
          {formatINR(pricing.total)}
        </motion.p>
      </div>

      {/* value note */}
      {!compact && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-200/80 p-3 font-body text-xs font-semibold leading-relaxed text-ink-soft">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden="true" />
          Final price is confirmed after we review your files. You will never be charged extra
          without your approval.
        </p>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 font-display text-[11px] font-bold text-ink-muted">
        <Tag className="h-3.5 w-3.5 text-pink-400" aria-hidden="true" />
        Student-friendly pricing · no hidden charges
      </p>
    </motion.aside>
  )
}

export default PriceSummary
