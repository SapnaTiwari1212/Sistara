import { Link } from 'react-router-dom'
import { Reveal, RevealGroup, RevealItem, Eyebrow } from '../ui/Reveal'
import ServiceCard from './ServiceCard'
import { services } from '../../config/services'
import { Sparkles } from 'lucide-react'

/** "What Can We Create For You?" — the main services grid. */
const ServicesSection = ({ limit, showHeading = true, id = 'services' }) => {
  const list = limit ? services.slice(0, limit) : services

  return (
    <section id={id} className="relative scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="container-sistara">
        {showHeading && (
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Our Services
            </Eyebrow>
            <h2 className="mt-4 text-balance text-3xl sm:text-4xl lg:text-[2.75rem]">
              What Can We Create For You?{' '}
              <span aria-hidden="true">💕</span>
            </h2>
            <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
              Pick what you need — every order is made by hand, checked twice, and delivered on time.
            </p>
          </Reveal>
        )}

        <RevealGroup
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          stagger={0.07}
        >
          {list.map((service) => (
            <RevealItem key={service.id} className="h-full">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>

        {limit && (
          <Reveal className="mt-10 text-center">
            <p className="font-body text-sm font-semibold text-ink-muted">
              Want to see everything we make?{' '}
              <Link
                to="/services"
                className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4 transition-colors hover:text-pink-500"
              >
                View all {services.length} services
              </Link>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export default ServicesSection
