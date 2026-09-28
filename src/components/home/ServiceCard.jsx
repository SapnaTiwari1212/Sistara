import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, Check } from 'lucide-react'
import { getAccent } from '../../config/services'
import { formatINR, cn } from '../../lib/utils'

/**
 * Cute rounded service card.
 * Hovering lifts the card and nudges the accent blob — subtle, not showy.
 *
 * The entrance animation is inherited from the parent `RevealGroup` via
 * framer-motion variant propagation, so the stagger stays in one place.
 */
const ServiceCard = ({ service, showFooterNote = true }) => {
  const accent = getAccent(service.accent)
  const Icon = service.icon

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.68, 0.36, 1] } },
      }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-4xl border-2 bg-white p-5 shadow-card transition-colors duration-300 sm:p-6',
        accent.border,
        accent.ring,
      )}
    >
      {/* accent blob behind the icon */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100',
          accent.blob,
        )}
        aria-hidden="true"
      />

      {service.popular && (
        <span className="pill absolute right-4 top-4 bg-pink-300 text-ink shadow-soft">
          <span aria-hidden="true">⭐</span> Popular
        </span>
      )}

      {/* icon */}
      <div
        className={cn(
          'relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-white shadow-soft transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105',
          accent.bg,
        )}
      >
        <Icon className={cn('h-7 w-7', accent.text)} aria-hidden="true" />
      </div>

      {/* title + copy */}
      <h3 className="relative mt-4 text-xl leading-tight">
        {service.name}
      </h3>
      <p className="relative mt-2 flex-1 font-body text-[15px] leading-relaxed text-ink-soft text-pretty">
        {service.description}
      </p>

      {/* includes */}
      <ul className="relative mt-4 grid gap-1.5">
        {service.includes.slice(0, 3).map((item) => (
          <li key={item} className="flex items-center gap-1.5 font-body text-[13px] font-semibold text-ink-muted">
            <Check className={cn('h-3.5 w-3.5 shrink-0', accent.text)} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      {/* meta */}
      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <span className={cn('pill border-2 border-white', accent.bg, accent.text)}>
          From {formatINR(service.basePrice)}
        </span>
        <span className="pill bg-cream-200 text-ink-soft">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {service.turnaround}
        </span>
      </div>

      {/* CTA */}
      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <Link
          to={`/services/${service.id}`}
          className="btn btn-secondary btn-sm group/view"
          aria-label={`View details for ${service.name}`}
        >
          View Details
          <ArrowUpRight
            className="h-4 w-4 shrink-0 transition-transform group-hover/view:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          to={`/order?service=${service.id}`}
          className={cn(
            'btn btn-sm flex-1 group/btn',
            service.id === 'custom' ? 'btn-secondary' : 'btn-primary',
          )}
          aria-label={`Order ${service.name} now`}
        >
          Order Now
          <ArrowUpRight
            className="h-4 w-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      {showFooterNote && service.popular && (
        <p className="relative mt-2.5 text-right font-display text-xs font-bold text-ink-muted">
          per {service.unit}
        </p>
      )}
    </motion.article>
  )
}

export default ServiceCard
