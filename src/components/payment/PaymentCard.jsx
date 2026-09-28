import { motion } from 'framer-motion'
import { Smartphone, CreditCard, Landmark, Lock, ShieldCheck, Check, Info } from 'lucide-react'
import { Input } from '../ui/Input'
import { cn, formatINR } from '../../lib/utils'
import { siteConfig } from '../../config/siteConfig'

const METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    hint: 'GPay · PhonePe · Paytm',
    icon: Smartphone,
    tone: 'bg-mint-300',
  },
  {
    id: 'card',
    label: 'Card',
    hint: 'Visa · Mastercard · RuPay',
    icon: CreditCard,
    tone: 'bg-lavender-300',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    hint: 'All major Indian banks',
    icon: Landmark,
    tone: 'bg-sky-200',
  },
]

/**
 * Payment method chooser + demo details form.
 *
 * The selected `method` is owned by the page so the "Pay ₹XXX" button and the
 * summary can both read it.
 *
 * Intentionally collects no real card data — in production a hosted gateway
 * (Razorpay Checkout) collects that, so it never touches this codebase.
 */
const PaymentCard = ({ method, onMethodChange, error }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6"
    >
      <h2 className="text-xl">Payment Method</h2>
      <p className="mt-1.5 font-body text-sm text-ink-soft">
        Choose how you’d like to pay. All transactions are encrypted.
      </p>

      {/* method selector */}
      <div
        className="mt-5 grid gap-3"
        role="radiogroup"
        aria-label="Payment method"
      >
        {METHODS.map((m) => {
          const active = method === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onMethodChange(m.id)}
              className={cn(
                'group flex items-center gap-3.5 rounded-3xl border-2 p-3.5 text-left transition-all duration-200',
                active
                  ? 'border-pink-300 bg-pink-50 shadow-soft'
                  : 'border-lavender-200 bg-white hover:border-lavender-300 hover:bg-lavender-50/50',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-200 group-hover:scale-105',
                  m.tone,
                )}
                aria-hidden="true"
              >
                <m.icon className="h-5 w-5 text-ink" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-extrabold text-ink">
                  {m.label}
                </span>
                <span className="block truncate font-body text-xs font-semibold text-ink-muted">
                  {m.hint}
                </span>
              </span>

              {/* radio */}
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  active ? 'border-pink-400 bg-pink-300' : 'border-lavender-300 bg-white',
                )}
                aria-hidden="true"
              >
                {active && <Check className="h-3.5 w-3.5 text-ink" strokeWidth={3.5} />}
              </span>
            </button>
          )
        })}
      </div>

      {/* method-specific demo fields */}
      <motion.div
        key={method}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-5 rounded-3xl border-2 border-dashed border-lavender-200 bg-lavender-50/50 p-4">
          {method === 'upi' && (
            <Input
              label="UPI ID"
              placeholder="yourname@okaxis"
              icon={Smartphone}
              readOnly
              className="border-dashed bg-white/80"
            />
          )}

          {method === 'card' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Card Number"
                  placeholder="0000 0000 0000 0000"
                  icon={CreditCard}
                  readOnly
                  className="border-dashed bg-white/80"
                />
              </div>
              <Input
                label="Expiry"
                placeholder="MM / YY"
                readOnly
                className="border-dashed bg-white/80"
              />
              <Input
                label="CVV"
                placeholder="•••"
                readOnly
                className="border-dashed bg-white/80"
              />
            </div>
          )}

          {method === 'netbanking' && (
            <div>
              <label htmlFor="bank" className="field-label">
                Select your bank
              </label>
              <select id="bank" className="field border-dashed bg-white/80" defaultValue="" disabled>
                <option value="">Choose a bank…</option>
              </select>
            </div>
          )}

          <p className="mt-3 flex items-start gap-2 font-body text-xs font-semibold leading-relaxed text-ink-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden="true" />
            {siteConfig.payment.provider === 'demo'
              ? 'Demo mode — these fields are display-only and no money will move. Connect Razorpay to enable real payments.'
              : 'A secure payment window will open to complete this transaction.'}
          </p>
        </div>
      </motion.div>

      {error && (
        <p className="mt-4 rounded-2xl border-2 border-pink-200 bg-pink-50 p-3.5 font-body text-sm font-semibold text-pink-600">
          {error}
        </p>
      )}
    </motion.section>
  )
}

/** The prominent "Pay ₹XXX" CTA. Rendered next to the order summary. */
export const PayButton = ({ amount, onClick, loading, method = 'upi' }) => (
  <div>
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="btn btn-primary btn-lg group w-full shadow-pop hover:-translate-y-0.5"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
          Processing…
        </span>
      ) : (
        <>
          <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
          Pay {formatINR(amount)}
        </>
      )}
    </button>

    <p className="mt-3 flex items-center justify-center gap-1.5 font-display text-[11px] font-bold text-ink-muted">
      <ShieldCheck className="h-3.5 w-3.5 text-mint-500" aria-hidden="true" />
      Secured payment · {method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Net Banking'}
    </p>
  </div>
)

export { METHODS }
export default PaymentCard
