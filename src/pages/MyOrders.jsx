import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageOpen, Sparkles, X, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import OrderCard from '../components/dashboard/OrderCard'
import OrderTracker from '../components/dashboard/OrderTracker'
import { StatusBadge } from '../components/ui/Badge'
import { useOrders } from '../context/OrderContext'
import { siteConfig } from '../config/siteConfig'
import { formatINR, cn } from '../lib/utils'

const FILTERS = ['All', ...siteConfig.orderStatuses]

const MyOrders = () => {
  const { orders, loadingOrders } = useOrders()
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [tracking, setTracking] = useState(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      const matchesFilter = filter === 'All' || o.status === filter
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [orders, filter, query])

  const counts = useMemo(() => {
    const map = { All: orders.length }
    siteConfig.orderStatuses.forEach((s) => {
      map[s] = orders.filter((o) => o.status === s).length
    })
    return map
  }, [orders])

  return (
    <section className="relative overflow-hidden bg-blob-lavender py-10 sm:py-14">
      <div className="container-sistara">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <span className="pill border-2 border-dashed border-lavender-300 bg-white/80 text-grape-500">
            <PackageOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
          <h1 className="mt-4 text-balance text-3xl sm:text-4xl">My Orders</h1>
          <p className="mx-auto mt-2.5 max-w-lg text-pretty font-body text-base text-ink-soft">
            Track everything you’ve ordered. Tap any order to see where it is.
          </p>
        </motion.header>

        {/* search + filters */}
        <div className="mt-7">
          <div className="relative mx-auto max-w-md">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lavender-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order ID or service…"
              aria-label="Search orders"
              className="field pl-12"
            />
          </div>

          {/* horizontal scroll chips — never causes page-level overflow */}
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => {
              const active = filter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'shrink-0 rounded-full border-2 px-4 py-2 font-display text-sm font-bold transition-all duration-200',
                    active
                      ? 'border-pink-300 bg-pink-300 text-ink shadow-pop-sm'
                      : 'border-lavender-200 bg-white text-ink-soft hover:border-lavender-400',
                  )}
                >
                  {f}
                  <span
                    className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                      active ? 'bg-white/50' : 'bg-cream-200',
                    )}
                  >
                    {counts[f] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* list */}
        {loadingOrders ? (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-4xl bg-white/60" aria-hidden="true" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-5xl border-2 border-dashed border-pink-200 bg-white/70 p-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-lavender-100 text-grape-500">
              <PackageOpen className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl">
              {orders.length === 0 ? 'No orders yet' : 'Nothing matches that'}
            </h2>
            <p className="mt-2 text-pretty font-body text-sm text-ink-soft">
              {orders.length === 0
                ? 'Once you place an order it will show up here with live status updates.'
                : 'Try a different status filter or clear your search.'}
            </p>
            {orders.length === 0 ? (
              <Button to="/order" className="mt-5" icon={Sparkles}>
                Place your first order
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => {
                  setFilter('All')
                  setQuery('')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="mt-7 grid list-none gap-3 sm:grid-cols-2"
          >
            {visible.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} onTrack={setTracking} />
            ))}
          </motion.ul>
        )}

        <p className="mt-8 text-center font-body text-sm font-semibold text-ink-muted">
          Something looks wrong?{' '}
          <Link
            to="/contact"
            className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
          >
            Contact support
          </Link>
        </p>
      </div>

      {/* tracker sheet */}
      <AnimatePresence>
        {tracking && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTracking(null)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-5xl border-t-2 border-pink-100 bg-cream p-5 pb-safe shadow-card sm:bottom-auto sm:top-1/2 sm:max-h-[86vh] sm:-translate-y-1/2 sm:rounded-5xl sm:p-6"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label={`Track order ${tracking.id}`}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-lavender-200 sm:hidden" aria-hidden="true" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold text-ink">
                    {tracking.serviceName}
                  </p>
                  <p className="font-body text-xs font-semibold text-ink-muted">
                    {tracking.id} · {formatINR(tracking.amount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTracking(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-pink-50 hover:text-pink-600"
                  aria-label="Close tracker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex justify-center">
                <StatusBadge status={tracking.status} />
              </div>

              <div className="mt-5">
                <OrderTracker order={tracking} />
              </div>

              <Button to="/dashboard" fullWidth className="mt-5">
                Back to Dashboard
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default MyOrders
