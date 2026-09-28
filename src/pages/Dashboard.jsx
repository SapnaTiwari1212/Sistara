import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  PackageOpen,
  UserCircle2,
  LifeBuoy,
  Wallet,
  Sparkles,
  X,
  Instagram,
  MessageCircle,
  Mail,
  LogOut,
} from 'lucide-react'
import BrandLockup from '../components/brand/BrandLockup'
import Button from '../components/ui/Button'
import Mascot from '../components/brand/Mascot'
import OrderCard from '../components/dashboard/OrderCard'
import OrderTracker from '../components/dashboard/OrderTracker'
import { StatusBadge } from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { siteConfig } from '../config/siteConfig'
import { formatINR, cn } from '../lib/utils'

const QUICK_ACTIONS = [
  { to: '/order', icon: Plus, label: 'New Order', tone: 'bg-pink-300 text-ink' },
  { to: '/orders', icon: PackageOpen, label: 'My Orders', tone: 'bg-lavender-300 text-ink' },
  { to: '/profile', icon: UserCircle2, label: 'Profile', tone: 'bg-sky-200 text-ink' },
  { to: '/contact', icon: LifeBuoy, label: 'Support', tone: 'bg-butter-200 text-ink' },
]

const Dashboard = () => {
  const { user, signOut, isDemo } = useAuth()
  const { orders, loadingOrders } = useOrders()
  const [tracking, setTracking] = useState(null)

  const firstName = user?.name?.split(' ')[0] || 'there'
  const active = orders.filter((o) => o.status !== 'Completed')
  const completed = orders.filter((o) => o.status === 'Completed')
  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0)

  const stats = [
    { label: 'Total orders', value: orders.length, tone: 'text-ink' },
    { label: 'In progress', value: active.length, tone: 'text-grape-500' },
    { label: 'Completed', value: completed.length, tone: 'text-mint-500' },
    { label: 'Total spent', value: formatINR(totalSpent), tone: 'text-pink-600' },
  ]

  return (
    <section className="relative overflow-hidden bg-blob-pink py-10 sm:py-14">
      <div className="container-sistara">
        {/* welcome */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="hidden shrink-0 sm:block">
              <Mascot size={96} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-pink-500">
                {siteConfig.brand.tagline}
              </p>
              <h1 className="mt-0.5 truncate text-2xl sm:text-3xl lg:text-4xl">
                Welcome, {firstName} <span aria-hidden="true">💕</span>
              </h1>
              <p className="mt-1 font-body text-sm text-ink-soft sm:text-base">
                Here’s everything you’ve ordered with {siteConfig.brand.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="pill border-2 border-dashed border-sky-200 bg-sky-50 text-sky-500">
                Demo mode
              </span>
            )}
            <button
              type="button"
              onClick={signOut}
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-lavender-200 bg-white text-ink-soft transition-colors hover:border-pink-300 hover:text-pink-600"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </motion.header>

        {/* quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
            >
              <Link
                to={action.to}
                className="group flex h-full flex-col items-center gap-2.5 rounded-4xl border-2 border-white bg-white p-4 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft sm:p-5"
              >
                <span
                  className={cn(
                    'grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-7deg] group-hover:scale-110',
                    action.tone,
                  )}
                  aria-hidden="true"
                >
                  <action.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-sm font-extrabold text-ink sm:text-base">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border-2 border-dashed border-lavender-200 bg-white/70 p-3.5 text-center backdrop-blur-sm"
            >
              <p className={cn('font-display text-xl font-extrabold sm:text-2xl', s.tone)}>
                {s.value}
              </p>
              <p className="mt-0.5 font-body text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* recent orders */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl">Recent Orders</h2>
            {orders.length > 0 && (
              <Button to="/orders" variant="ghost" size="sm">
                View all
              </Button>
            )}
          </div>

          {loadingOrders ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-4xl bg-white/60"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            /* empty state */
            <div className="mt-5 rounded-5xl border-2 border-dashed border-pink-200 bg-white/70 p-8 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-pink-100 text-pink-500">
                <Sparkles className="h-8 w-8" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl">No orders yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-pretty font-body text-sm text-ink-soft">
                Your first order is just a few taps away. Pick a service, upload your files and
                we’ll handle the rest.
              </p>
              <Button to="/order" className="mt-5" icon={Sparkles}>
                Place your first order
              </Button>
            </div>
          ) : (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              className="mt-5 grid list-none gap-3 sm:grid-cols-2"
            >
              {orders.slice(0, 4).map((order, i) => (
                <OrderCard key={order.id} order={order} index={i} onTrack={setTracking} />
              ))}
            </motion.ul>
          )}
        </div>

        {/* footer nudge */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-4xl border-2 border-dashed border-lavender-200 bg-white/60 p-5 text-center">
          <BrandLockup size="sm" />
          <p className="font-body text-sm font-semibold text-ink-soft">
            Need something custom? We’re one message away.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button href={siteConfig.social.whatsapp.url} variant="secondary" size="sm" icon={MessageCircle}>
              WhatsApp
            </Button>
            <Button href={siteConfig.social.instagram.url} variant="secondary" size="sm" icon={Instagram}>
              Instagram
            </Button>
            <Button href={siteConfig.social.email.url} variant="secondary" size="sm" icon={Mail}>
              Email
            </Button>
          </div>
        </div>
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

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <Button to="/orders" fullWidth>
                  View My Orders
                </Button>
                <Button
                  href={siteConfig.social.whatsapp.url}
                  variant="secondary"
                  fullWidth
                  icon={MessageCircle}
                >
                  Need help?
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Dashboard
