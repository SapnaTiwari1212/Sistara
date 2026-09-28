import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  ClipboardList,
  Package,
  Sparkles,
  Wallet,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/brand/Logo'
import Mascot from '../components/brand/Mascot'
import { Reveal, RevealGroup, Eyebrow } from '../components/ui/Reveal'
import FloatingDecorations from '../components/decor/FloatingDecorations'
import { getAccent, getReadyByDate, getServiceById, services } from '../config/services'
import { siteConfig } from '../config/siteConfig'
import { cn, deliveryLabel, formatDate, formatINR } from '../lib/utils'

/**
 * Shown when `/services/:serviceId` points at a service that does not exist
 * (stale bookmark, typo, renamed service). Kept distinct from the global 404
 * because the customer usually arrived here from a real service card.
 */
const ServiceNotFound = ({ serviceId }) => (
  <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-blob-pink py-16">
    <FloatingDecorations density="sparse" />
    <div className="container-sistara relative text-center">
      <Reveal>
        <div className="flex justify-center">
          <Link to="/" aria-label={`${siteConfig.brand.name} home`}>
            <Logo size="md" />
          </Link>
        </div>
        <Mascot size={170} className="mx-auto mt-6" />
        <p className="mt-4 font-display text-5xl font-extrabold text-pink-300">Oops</p>
        <h1 className="mt-2 text-balance text-2xl sm:text-3xl">
          We don&rsquo;t offer that one <span aria-hidden="true">🌸</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty font-body text-base text-ink-soft">
          {serviceId ? (
            <>
              &ldquo;<span className="font-bold text-ink">{serviceId}</span>&rdquo; isn&rsquo;t one of
              our services. Here&rsquo;s everything we do make.
            </>
          ) : (
            <>Pick one of our services to see prices, timelines and what we need from you.</>
          )}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/services" size="lg" icon={Sparkles}>
            Browse Services
          </Button>
          <Button to="/" size="lg" variant="secondary" icon={ArrowLeft}>
            Back to Home
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
)

/**
 * Service detail — /services/:serviceId
 * ---------------------------------------------------------------------------
 * Answers everything a customer asks before ordering: what it is, what it
 * costs from, what is included, when it arrives, and what we need from them.
 * "Order Now" hands the chosen service to the order form via the query param,
 * so the form opens with the right service already selected.
 */
const ServiceDetail = () => {
  const { serviceId } = useParams()
  const service = useMemo(() => getServiceById(serviceId), [serviceId])

  // Keep the tab title in sync so browser history/back is not confusing.
  useEffect(() => {
    document.title = service
      ? `${service.name} · ${siteConfig.brand.name}`
      : `Service not found · ${siteConfig.brand.name}`
    return () => {
      document.title = siteConfig.brand.tagline
    }
  }, [service])

  if (!service) return <ServiceNotFound serviceId={serviceId} />

  const accent = getAccent(service.accent)
  const Icon = service.icon
  const readyBy = getReadyByDate(service)
  const others = services.filter((s) => s.id !== service.id).slice(0, 4)

  const facts = [
    {
      icon: Wallet,
      label: 'Starting price',
      value: formatINR(service.basePrice),
      sub:
        service.perUnitPrice > 0
          ? `then ${formatINR(service.perUnitPrice)} per extra ${service.unit}`
          : 'fixed price, nothing hidden',
    },
    {
      icon: Clock,
      label: 'Estimated delivery',
      value: service.turnaround,
      sub: `ready by ${formatDate(readyBy)}`,
    },
    {
      icon: Package,
      label: 'Order size',
      value: `${service.minQuantity}–${service.maxQuantity} ${service.unitLabel}`,
      sub: `priced per ${service.unit}`,
    },
  ]

  return (
    <>
      {/* ---------- header ---------- */}
      <section
        className={cn(
          'relative overflow-hidden border-b-2 border-dashed py-12 sm:py-16',
          accent.border,
          'bg-gradient-to-br from-white via-lavender-50 to-pink-50',
        )}
      >
        <FloatingDecorations density="sparse" />

        <div className="container-sistara relative">
          {/* logo — same SISTARA mark used across the whole site */}
          <Reveal className="mb-6 flex justify-center sm:mb-8">
            <Link to="/" aria-label={`${siteConfig.brand.name} home`}>
              <Logo size="md" className="justify-center" />
            </Link>
          </Reveal>

          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 font-body text-sm font-semibold text-ink-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-pink-600">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/services" className="transition-colors hover:text-pink-600">
                  Services
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink" aria-current="page">
                {service.short}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div
                className={cn(
                  'grid h-16 w-16 place-items-center rounded-3xl border-2 border-white shadow-soft',
                  accent.bg,
                )}
              >
                <Icon className={cn('h-8 w-8', accent.text)} aria-hidden="true" />
              </div>

              <h1 className="mt-4 text-balance text-4xl sm:text-5xl">
                {service.name} <span aria-hidden="true">🎀</span>
              </h1>
              <p className="mt-3 max-w-xl text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                {service.longDescription}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  to={`/order?service=${service.id}`}
                  size="lg"
                  icon={Sparkles}
                  className="w-full sm:w-auto"
                >
                  Order Now
                </Button>
                <Button
                  to="/services"
                  variant="secondary"
                  size="lg"
                  icon={ArrowLeft}
                  className="w-full sm:w-auto"
                >
                  All Services
                </Button>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <Mascot size={200} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- price / delivery / size facts ---------- */}
      <section className="container-sistara py-12 sm:py-16">
        <RevealGroup>
          <div className="grid gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <Reveal key={f.label}>
                <div
                  className={cn(
                    'h-full rounded-4xl border-2 bg-white p-5 shadow-soft',
                    accent.border,
                  )}
                >
                  <span
                    className={cn('grid h-11 w-11 place-items-center rounded-2xl', accent.bg)}
                  >
                    <f.icon className={cn('h-5 w-5', accent.text)} aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
                    {f.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-ink">{f.value}</p>
                  <p className="mt-1 font-body text-[13px] font-semibold text-ink-soft">{f.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </RevealGroup>

        {/* ---------- includes + requirements ---------- */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-4xl border-2 border-mint-300 bg-mint-100/50 p-5 sm:p-6">
              <Eyebrow className="border-mint-300 bg-white/80 text-mint-500">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                What&rsquo;s included
              </Eyebrow>
              <ul className="mt-4 space-y-2.5">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-300 text-ink">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="font-body text-[15px] font-semibold text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full rounded-4xl border-2 border-dashed border-lavender-300 bg-lavender-50/70 p-5 sm:p-6">
              <Eyebrow className="border-lavender-300 bg-white/80 text-grape-500">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                What we&rsquo;ll need from you
              </Eyebrow>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-soft">
                You can skip ahead — we&rsquo;ll ask for these on the order form and you can add
                them as notes while you order.
              </p>
              <ul className="mt-4 space-y-2.5">
                {service.requirements.map((req, i) => (
                  <li key={req} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full font-display text-[11px] font-extrabold text-ink',
                        accent.bg,
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="font-body text-[15px] font-semibold text-ink-soft">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- closing CTA ---------- */}
      <section className="pb-16 sm:pb-20">
        <div className="container-sistara">
          <Reveal>
            <div
              className={cn(
                'relative overflow-hidden rounded-5xl border-2 border-white p-7 text-center shadow-card sm:p-10',
                'bg-gradient-to-br from-pink-200 via-lavender-200 to-sky-200',
              )}
            >
              <h2 className="text-balance text-2xl sm:text-3xl">
                Happy with this? <span aria-hidden="true">✨</span>
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-pretty font-body text-base text-ink-soft">
                Order {service.name.toLowerCase()} from {formatINR(service.basePrice)} and upload
                your files right away.
              </p>
              <Button to={`/order?service=${service.id}`} size="lg" className="mt-6">
                Place an Order
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
              <p className="mt-4 font-body text-xs font-semibold text-ink-muted">
                {deliveryLabel(readyBy)} · {siteConfig.brand.tagline}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- other services ---------- */}
      <section className="pb-20">
        <div className="container-sistara">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl sm:text-3xl">
              Looking for something else? <span aria-hidden="true">💕</span>
            </h2>
            <p className="mt-2.5 font-body text-base text-ink-soft">
              Here are a few more things we make.
            </p>
          </Reveal>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => {
              const a = getAccent(other.accent)
              const OtherIcon = other.icon
              return (
                <Reveal key={other.id}>
                  <Link
                    to={`/services/${other.id}`}
                    className={cn(
                      'group flex h-full flex-col rounded-4xl border-2 border-white bg-white p-4 shadow-soft transition-transform duration-200 hover:-translate-y-1',
                      a.ring,
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-10 w-10 place-items-center rounded-xl',
                        a.bg,
                      )}
                    >
                      <OtherIcon className={cn('h-5 w-5', a.text)} aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-display text-base font-extrabold text-ink">
                      {other.short}
                    </p>
                    <p className="mt-1 flex-1 font-body text-[13px] leading-relaxed text-ink-soft">
                      {other.description}
                    </p>
                    <p className="mt-3 font-display text-sm font-extrabold text-pink-600">
                      From {formatINR(other.basePrice)}
                    </p>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default ServiceDetail
