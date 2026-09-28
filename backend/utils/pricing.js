/**
 * Server-side pricing — standalone mirror of `src/lib/pricing.js`.
 * ---------------------------------------------------------------------------
 * Deliberate duplication: the authoritative payable figure must be computed
 * where the money is collected (the server), and the maths must agree to the
 * last rupee with the frontend. This file mirrors `calculateTotals` +
 * `calculateQuote` from the app with no React/browser dependencies. When a
 * DB-driven catalogue exists, `service` values should come from the database.
 */

import { serviceById, deadlines, paymentDefaults } from '../config/services.js'

export const calculateTotals = ({ base, extras = 0, discountPercent = 0, taxRatePercent = 0 }) => {
  const subtotal = Math.max(0, base + extras)
  const discount = Math.round((subtotal * discountPercent) / 100)
  const taxable = subtotal - discount
  const tax = Math.round((taxable * taxRatePercent) / 100)
  return { subtotal, discount, tax, total: taxable + tax }
}

export const calculateQuote = ({
  service,
  quantity,
  deadline,
  discountPercent = paymentDefaults.discountPercent,
  taxRatePercent = paymentDefaults.taxRatePercent,
}) => {
  if (!service) {
    return {
      base: 0, extras: 0, rush: 0, subtotal: 0,
      discount: 0, tax: 0, total: 0, unitLabel: 'items', unitSingular: 'item',
    }
  }

  const qty = Math.min(
    Math.max(Number(quantity) || service.defaultQuantity, service.minQuantity),
    service.maxQuantity,
  )

  const base = service.basePrice
  const extraUnits = Math.max(0, qty - service.minQuantity)
  const extras = extraUnits * service.perUnitPrice

  const deadlineInfo = deadlines.find((d) => d.value === deadline)
  const multiplier = deadlineInfo?.multiplier ?? 1
  const rush = multiplier === 1 ? 0 : Math.round(base * (multiplier - 1))

  const totals = calculateTotals({ base: base + rush, extras, discountPercent, taxRatePercent })

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

/** Single entry point for validation + authoritative totals. */
export const quoteFor = ({ serviceId, quantity, deadline }) =>
  calculateQuote({ service: serviceById(serviceId), quantity, deadline })