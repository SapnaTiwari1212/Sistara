import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, PackageSearch, CheckCircle2, Copy, PartyPopper } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/brand/Logo'
import Mascot from '../components/brand/Mascot'
import SuccessAnimation from '../components/success/SuccessAnimation'
import { StatusBadge } from '../components/ui/Badge'
import { useOrders } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../config/siteConfig'
import { formatINR, formatDate, deliveryLabel } from '../lib/utils'

const OrderSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { orders } = useOrders()

  const orderId = location.state?.orderId
  const reference = location.state?.reference

  const order = useMemo(
    () => orders.find((o) => o.id === orderId) || null,
    [orders, orderId],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/order-success' } } }, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  const details = [
    { label: 'Order ID', value: order?.id || orderId || '—' },
    { label: 'Service', value: order?.serviceName || '—' },
    {
      label: 'Amount',
      value: formatINR(order?.amount ?? 0),
      accent: true,
    },
    { label: 'Expected delivery', value: deliveryLabel(order?.deliveryDate) },
    { label: 'Order status', value: order?.status || 'Confirmed' },
  ]

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-pink-100 via-lavender-100 to-sky-100 py-12">
      <SuccessAnimation />

      <div className="container-sistara relative">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 0.68, 0.36, 1] }}
          className="mx-auto max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-5xl border-2 border-white bg-white/90 p-6 text-center shadow-card backdrop-blur-md sm:p-9">
            {/* mascot */}
            <div className="flex justify-center">
              <Mascot size={150} />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 }}
              className="mx-auto -mt-2 grid h-14 w-14 place-items-center rounded-full bg-mint-500 text-white shadow-card"
            >
              <CheckCircle2 className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
            </motion.div>

            <h1 className="mt-4 text-balance text-3xl sm:text-4xl">
              Yay! Your order is confirmed! <span aria-hidden="true">🎉</span>
            </h1>
            <p className="mt-2.5 text-pretty font-body text-base text-ink-soft sm:text-lg">
              Payment Successful! Thank you for choosing {siteConfig.brand.name}. 💕
            </p>

            {/* details */}
            <dl className="mt-7 divide-y-2 divide-dashed divide-lavender-100 rounded-4xl border-2 border-lavender-200 bg-cream-50/80 text-left">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5"
                >
                  <dt className="font-display text-sm font-bold text-ink-soft">{d.label}</dt>
                  <dd className="flex items-center gap-2">
                    <span
                      className={
                        d.accent
                          ? 'font-display text-lg font-extrabold text-pink-600'
                          : 'font-body text-sm font-bold text-ink'
                      }
                    >
                      {d.value}
                    </span>
                    {d.label === 'Order status' && <StatusBadge status={d.value} />}
                    {d.label === 'Order ID' && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(d.value)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-pink-100 hover:text-pink-600"
                        aria-label="Copy order ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {reference && (
              <p className="mt-3 font-body text-[11px] font-semibold text-ink-muted">
                Payment reference: <span className="font-bold">{reference}</span>
              </p>
            )}

            {/* what happens next */}
            <div className="mt-6 rounded-3xl border-2 border-dashed border-mint-300 bg-mint-100/50 p-4 text-left">
              <p className="flex items-center gap-1.5 font-display text-sm font-extrabold text-mint-500">
                <PartyPopper className="h-4 w-4" aria-hidden="true" />
                What happens next?
              </p>
              <ol className="mt-2.5 space-y-1.5 font-body text-sm text-ink-soft">
                <li>1. We review your files and confirm the details.</li>
                <li>2. We start creating your work — the status updates live.</li>
                <li>3. You get it before your deadline. Zero Fault, guaranteed.</li>
              </ol>
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button to="/orders" size="lg" fullWidth icon={PackageSearch}>
                View My Order
              </Button>
              <Button to="/" size="lg" variant="secondary" fullWidth icon={Home}>
                Back to Home
              </Button>
            </div>

            <div className="mt-7 border-t-2 border-dashed border-lavender-100 pt-5">
              <Logo size="sm" className="justify-center" />
              <p className="mt-2 font-display text-xs font-bold text-ink-muted">
                {siteConfig.brand.whyPhrase}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Ordered on {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default OrderSuccess
