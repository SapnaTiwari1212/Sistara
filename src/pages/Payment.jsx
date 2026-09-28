import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, Receipt, FileText, Lock } from 'lucide-react'
import Button from '../components/ui/Button'
import PaymentCard, { PayButton } from '../components/payment/PaymentCard'
import Mascot from '../components/brand/Mascot'
import { useOrders } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import paymentService from '../services/paymentService'
import { siteConfig } from '../config/siteConfig'
import { formatINR, formatDate, deliveryLabel, cn } from '../lib/utils'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { orders, refreshOrders } = useOrders()

  const orderId = location.state?.orderId
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Resolve the order from context, falling back to a direct read from the
   * order service. This avoids showing the empty state during the brief moment
   * after a page refresh, before `orders` has finished loading.
   */
  const [resolved, setResolved] = useState(null)
  const [resolving, setResolving] = useState(Boolean(orderId))

  useEffect(() => {
    let active = true
    if (!orderId) {
      setResolving(false)
      return () => {
        active = false
      }
    }
    setResolving(true)
    ;(async () => {
      try {
        await refreshOrders()
        const direct = await orderService.getById(orderId)
        if (active) setResolved(direct)
      } finally {
        if (active) setResolving(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Prefer the (always freshest) copy from context once it has arrived.
  const order = useMemo(() => {
    if (!orderId) return null
    return orders.find((o) => o.id === orderId) || resolved
  }, [orders, orderId, resolved])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/payment' } } }, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  /* Still looking the order up. */
  if (resolving) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-blob-pink px-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot size={130} />
          <p className="font-display text-lg font-bold text-ink-soft">Fetching your order…</p>
        </div>
      </div>
    )
  }

  /* No order to pay for (direct URL, or the order is gone). */
  if (!order) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-blob-pink px-5">
        <div className="text-center">
          <Mascot size={130} className="mx-auto" />
          <h1 className="mt-4 text-2xl">No order to pay for</h1>
          <p className="mx-auto mt-2 max-w-sm text-pretty font-body text-sm text-ink-soft">
            We couldn’t find that order. Start a new one and we’ll get you sorted.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button to="/order" icon={Receipt}>
              Place a new order
            </Button>
            <Button to="/my-orders" variant="secondary">
              My Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await paymentService.createPayment({
        amount: order.amount,
        method,
        orderId: order.id,
      })

      if (!result.success) {
        setError(result.error || 'Payment could not be completed. Please try again.')
        return
      }

      await orderService.markPaid(order.id, result.reference)
      await refreshOrders()
      navigate('/order-success', {
        state: { orderId: order.id, reference: result.reference },
        replace: true,
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /*
   * Display the quote the student already agreed to.
   * `order.amount` is the single authoritative payable figure — it already has
   * the discount and tax applied. Re-deriving a discount here would double-charge.
   * Older/seeded orders have no snapshot, so fall back to a single "Price" line.
   */
  const quote = order.price || null
  const payable = order.amount

  return (
    <section className="relative overflow-hidden bg-blob-pink py-10 sm:py-14">
      <div className="container-sistara">
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/order')}
          className="mb-5 inline-flex items-center gap-1.5 font-display text-sm font-bold text-ink-soft transition-colors hover:text-pink-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to order
        </motion.button>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <h1 className="text-balance text-3xl sm:text-4xl">
            Almost yours! <span aria-hidden="true">💳</span>
          </h1>
          <p className="mx-auto mt-2.5 max-w-lg text-pretty font-body text-base text-ink-soft">
            Check the details, pick a payment method and you’re done.
          </p>
        </motion.header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <PaymentCard method={method} onMethodChange={setMethod} error={error} />

            {/* trust */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Lock, text: 'Encrypted & secure' },
                { icon: ShieldCheck, text: 'Zero Fault checked' },
                { icon: Receipt, text: 'Instant receipt' },
              ].map((t) => (
                <div
                  key={t.text}
                  className="flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-lavender-200 bg-white/70 p-3"
                >
                  <t.icon className="h-5 w-5 shrink-0 text-mint-500" aria-hidden="true" />
                  <span className="font-body text-xs font-bold text-ink-soft">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* order summary */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative overflow-hidden rounded-4xl border-2 border-white bg-white shadow-card lg:sticky lg:top-24"
          >
            <div
              className="flex items-center gap-2.5 border-b-2 border-dashed border-lavender-100 p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-100 text-pink-600">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold text-ink">Order Summary</p>
                <p className="font-body text-[11px] font-semibold text-ink-muted">{order.id}</p>
              </div>
            </div>

            <dl className="space-y-3 p-5 font-body text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Service</dt>
                <dd className="text-right font-bold text-ink">{order.serviceName}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Quantity</dt>
                <dd className="text-right font-bold text-ink">
                  {order.quantity}{' '}
                  {Number(order.quantity) === 1 ? order.unitSingular || 'item' : order.unitLabel}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Deadline</dt>
                <dd className="text-right font-bold text-ink">
                  {siteConfig.deadlines.find((d) => d.value === order.deadline)?.label ||
                    order.deadline}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Expected delivery</dt>
                <dd className="text-right font-bold text-ink">
                  {deliveryLabel(order.deliveryDate)}
                </dd>
              </div>
              {order.requirements?.length > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-ink-soft">Files uploaded</dt>
                  <dd className="text-right font-bold text-ink">
                    {order.requirements.length}
                  </dd>
                </div>
              )}

              <div className="border-t-2 border-dashed border-lavender-100 pt-3">
                {quote ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-semibold text-ink-soft">Base price</dt>
                      <dd className="font-bold text-ink">{formatINR(quote.base)}</dd>
                    </div>
                    {quote.extras > 0 && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <dt className="font-semibold text-ink-soft">Extras</dt>
                        <dd className="font-bold text-ink">{formatINR(quote.extras)}</dd>
                      </div>
                    )}
                    {quote.rush !== 0 && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <dt
                          className={cn(
                            'font-semibold',
                            quote.rush > 0 ? 'text-butter-500' : 'text-mint-500',
                          )}
                        >
                          {quote.rush > 0 ? 'Rush delivery' : 'Relaxed-rate saving'}
                        </dt>
                        <dd
                          className={cn(
                            'font-bold',
                            quote.rush > 0 ? 'text-butter-500' : 'text-mint-500',
                          )}
                        >
                          {quote.rush > 0 ? '+' : '−'}
                          {formatINR(Math.abs(quote.rush))}
                        </dd>
                      </div>
                    )}
                    {quote.discount > 0 && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <dt className="font-semibold text-mint-500">Discount</dt>
                        <dd className="font-bold text-mint-500">−{formatINR(quote.discount)}</dd>
                      </div>
                    )}
                    {quote.tax > 0 && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <dt className="font-semibold text-ink-soft">Tax</dt>
                        <dd className="font-bold text-ink">{formatINR(quote.tax)}</dd>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-ink-soft">Price</dt>
                    <dd className="font-bold text-ink">{formatINR(payable)}</dd>
                  </div>
                )}

                <div className="mt-3 flex items-end justify-between gap-3 border-t-2 border-dashed border-lavender-100 pt-3">
                  <dt className="font-display text-base font-extrabold text-ink">Final Amount</dt>
                  <dd className="font-display text-2xl font-extrabold text-pink-600">
                    {formatINR(payable)}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="border-t-2 border-dashed border-lavender-100 p-5">
              <PayButton
                amount={payable}
                onClick={handlePay}
                loading={loading}
                method={method}
              />
            </div>
          </motion.aside>
        </div>

        <p className="mt-8 text-center font-body text-xs text-ink-muted">
          Order placed on {formatDate(order.createdAt)} ·{' '}
          {paymentService.isDemo
            ? 'Payment is running in demo mode — no real money will be charged.'
            : 'Payments are processed securely.'}
        </p>
      </div>
    </section>
  )
}

export default Payment
