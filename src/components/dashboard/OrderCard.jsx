import { motion } from 'framer-motion'
import { FileText, ChevronRight, CalendarClock } from 'lucide-react'
import { getAccent } from '../../config/services'
import { StatusBadge } from '../ui/Badge'
import { formatINR, formatDate, deliveryLabel, cn } from '../../lib/utils'

/** Compact order card used on the dashboard and My Orders. */
const OrderCard = ({ order, onTrack, index = 0 }) => {
  const accent = getAccent(order.serviceIcon || 'pink')

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.42, delay: index * 0.05 } },
      }}
      className="list-none"
    >
      <div className="group relative overflow-hidden rounded-4xl border-2 border-white bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-5">
        <span className={cn('absolute inset-y-0 left-0 w-1.5', accent.bg)} aria-hidden="true" />

        <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
          {/* identity */}
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', accent.bg)}
              aria-hidden="true"
            >
              <FileText className={cn('h-5 w-5', accent.text)} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-extrabold text-ink">
                {order.serviceName}
              </p>
              <p className="truncate font-body text-xs font-semibold text-ink-muted">
                {order.id} · {order.quantity}{' '}
                {Number(order.quantity) === 1 ? order.unitSingular || 'item' : order.unitLabel}
              </p>
            </div>
          </div>

          <StatusBadge status={order.status} />
        </div>

        {/* meta row */}
        <dl className="mt-4 grid grid-cols-2 gap-3 pl-2 sm:grid-cols-3">
          <div>
            <dt className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Date
            </dt>
            <dd className="font-body text-sm font-bold text-ink">{formatDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Amount
            </dt>
            <dd className="font-body text-sm font-bold text-pink-600">
              {formatINR(order.amount)}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Expected
            </dt>
            <dd className="flex items-center gap-1 font-body text-sm font-bold text-ink">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden="true" />
              {order.status === 'Completed'
                ? formatDate(order.deliveryDate)
                : deliveryLabel(order.deliveryDate)}
            </dd>
          </div>
        </dl>

        {onTrack && (
          <button
            type="button"
            onClick={() => onTrack(order)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-cream-200 py-2.5 font-display text-sm font-bold text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
          >
            Track Order
            <ChevronRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </motion.li>
  )
}

export default OrderCard
