/**
 * Payment service — clean demo flow, structured for Razorpay.
 * ---------------------------------------------------------------------------
 * IMPORTANT: this project intentionally contains NO real payment credentials.
 *
 * Demo mode (default) validates the form, simulates a gateway round-trip and
 * returns a fake reference. It never contacts a real payment provider.
 *
 * TO GO LIVE WITH RAZORPAY:
 *   1. npm i @razorpay/checkout
 *   2. create an order on YOUR SERVER:  POST /api/payments/order
 *      { amount, currency, receipt }  ->  { orderId: "order_xxx" }
 *      (the Razorpay SECRET key stays on the server, never in the client)
 *   3. set VITE_RAZORPAY_KEY_ID (publishable key only) in .env
 *   4. implement `openRazorpay` below using the returned order id.
 *
 * Every screen calls only `createPayment`, so switching gateways does not
 * require touching the payment page.
 */

import { siteConfig } from '../config/siteConfig.js'
import { ENV } from '../lib/env.js'

const delay = (ms = 1400) => new Promise((resolve) => setTimeout(resolve, ms))

/** Last-4 style reference, clearly marked as a demo reference. */
const makeDemoRef = () => `DEMO-${Math.floor(Math.random() * 900000 + 100000)}`

/**
 * Compute the final payable amount from a quote.
 * Kept here (not in the component) so the payment screen and the order form
 * can never disagree about the total.
 */
export const calculateTotals = ({ base, extras = 0, discountPercent = 0, taxRatePercent = 0 }) => {
  const subtotal = Math.max(0, base + extras)
  const discount = Math.round((subtotal * discountPercent) / 100)
  const taxable = subtotal - discount
  const tax = Math.round((taxable * taxRatePercent) / 100)
  return {
    subtotal,
    discount,
    tax,
    total: taxable + tax,
  }
}

export const paymentService = {
  provider: siteConfig.payment.provider,
  isDemo: siteConfig.payment.provider !== 'razorpay',

  /**
   * Runs the checkout for an order.
   * Resolves with `{ success, reference }` — never throws for a declined card,
   * so the UI can render a friendly error state.
   */
  async createPayment({ amount, method = 'upi', orderId }) {
    if (siteConfig.payment.provider === 'razorpay' && ENV.razorpayKeyId) {
      return this.openRazorpay({ amount, method, orderId })
    }
    return this.runDemoCheckout({ amount, method, orderId })
  },

  /** Simulated gateway — same contract a real provider call would return. */
  async runDemoCheckout({ amount, method, orderId }) {
    await delay()
    // Fail-fast if the caller somehow passes an unusable amount.
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, reference: null, error: 'Invalid payment amount.' }
    }
    return {
      success: true,
      reference: `${makeDemoRef()}-${orderId || 'NA'}`,
      method,
      amount,
      demo: true,
    }
  },

  /**
   * Razorpay integration point.
   * Requires a server-created order; see the instructions at the top of file.
   */
  async openRazorpay({ amount, orderId }) {
    if (typeof window === 'undefined' || !window.Razorpay) {
      return { success: false, reference: null, error: 'Razorpay checkout failed to load.' }
    }
    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: ENV.razorpayKeyId,
        amount: amount * 100, // Razorpay expects paise
        currency: siteConfig.payment.currency,
        name: siteConfig.brand.name,
        description: `Order ${orderId || ''}`.trim(),
        order_id: orderId,
        handler: (response) =>
          resolve({
            success: true,
            reference: response?.razorpay_payment_id || null,
            demo: false,
          }),
        modal: {
          ondismiss: () => resolve({ success: false, reference: null, error: 'Payment cancelled.' }),
        },
        theme: { color: '#FC8FAB' },
      })
      rzp.open()
    })
  },
}

export default paymentService
