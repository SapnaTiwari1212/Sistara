/**
 * Pricing — one pure quote function for the whole app.
 * ---------------------------------------------------------------------------
 * The order form, the payment screen and any future server-side total must all
 * agree to the last rupee, so the maths lives here rather than inside a
 * component. It is deliberately free of React and browser APIs.
 *
 * Breakdown:
 *   base      = the service's starting price
 *   extras    = per-unit price for every unit above the included minimum
 *   rush      = deadline multiplier applied to `base`; negative for relaxed runs
 *   subtotal  = base + rush + extras
 *   discount  = discountPercent of subtotal (0 by default)
 *   tax       = taxRatePercent of (subtotal - discount)
 *   total     = subtotal - discount + tax   <-- the only payable figure
 */

import { calculateTotals } from '../services/paymentService.js'
import { siteConfig } from '../config/siteConfig.js'

/**
 * @param {object}  opts
 * @param {object}  opts.service       entry from `src/config/services`
 * @param {number}  opts.quantity      total units ordered
 * @param {string}  opts.deadline      deadline `value` (e.g. '3d')
 * @param {number} [opts.discountPercent]
 * @param {number} [opts.taxRatePercent]
 */
export const calculateQuote = ({
  service,
  quantity,
  deadline,
  discountPercent = siteConfig.payment.discountPercent,
  taxRatePercent = siteConfig.payment.taxRatePercent,
}) => {
  if (!service) {
    return {
      base: 0,
      extras: 0,
      rush: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      unitLabel: 'items',
      unitSingular: 'item',
    }
  }

  const qty = Math.min(
    Math.max(Number(quantity) || service.defaultQuantity, service.minQuantity),
    service.maxQuantity,
  )

  const base = service.basePrice
  const extraUnits = Math.max(0, qty - service.minQuantity)
  const extras = extraUnits * service.perUnitPrice

  const deadlineInfo = siteConfig.deadlines.find((d) => d.value === deadline)
  const multiplier = deadlineInfo?.multiplier ?? 1
  // Negative multiplier = a cheaper, relaxed deadline; keep it visible as a saving.
  const rush = multiplier === 1 ? 0 : Math.round(base * (multiplier - 1))

  const totals = calculateTotals({
    base: base + rush,
    extras,
    discountPercent,
    taxRatePercent,
  })

  return {
    ...totals,
    base,
    extras,
    rush,
    multiplier,
    unitLabel: service.unitLabel,
    unitSingular: service.unit,
  }
}

/** The line items rendered in an order/payment summary, in display order. */
export const quoteLines = (quote) => {
  if (!quote) return []
  const lines = [{ key: 'base', label: 'Base price', value: quote.base }]

  if (quote.extras > 0) {
    lines.push({ key: 'extras', label: 'Extras', value: quote.extras })
  }
  if (quote.rush > 0) {
    lines.push({ key: 'rush', label: 'Rush delivery', value: quote.rush, tone: 'warn' })
  }
  if (quote.rush < 0) {
    lines.push({
      key: 'rush-saving',
      label: 'Relaxed-rate saving',
      value: quote.rush,
      tone: 'good',
    })
  }
  if (quote.discount > 0) {
    lines.push({ key: 'discount', label: 'Discount', value: -quote.discount, tone: 'good' })
  }
  if (quote.tax > 0) {
    lines.push({ key: 'tax', label: 'Tax', value: quote.tax })
  }
  return lines
}
