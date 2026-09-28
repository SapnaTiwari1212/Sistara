import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import ServicesSection from '../components/home/ServicesSection'
import HowItWorks from '../components/home/HowItWorks'
import Button from '../components/ui/Button'
import Mascot from '../components/brand/Mascot'
import FloatingDecorations from '../components/decor/FloatingDecorations'
import { services } from '../config/services'

const Services = () => (
  <>
    {/* header */}
    <section className="relative overflow-hidden border-b-2 border-dashed border-pink-200 bg-blob-pink py-12 sm:py-16">
      <FloatingDecorations density="sparse" />

      <div className="container-sistara relative">
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <span className="pill border-2 border-dashed border-pink-200 bg-white/80 text-pink-600">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {services.length} services
            </span>
            <h1 className="mt-4 text-balance text-4xl sm:text-5xl">
              Everything we make for you <span aria-hidden="true">🎀</span>
            </h1>
            <p className="mt-3 max-w-xl text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
              Pick a service, see the starting price, and order in under a minute. Every
              starting price below is student-friendly — and easy on your wallet.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button to="/order" size="lg" icon={Sparkles} className="w-full sm:w-auto">
                Start an Order
              </Button>
              <Button to="/how-it-works" variant="secondary" className="w-full sm:w-auto">
                How It Works
              </Button>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <Mascot size={200} />
          </div>
        </div>
      </div>
    </section>

    <ServicesSection showHeading={false} id="all-services" />

    <HowItWorks />

    {/* closing CTA */}
    <section className="pb-16 sm:pb-20">
      <div className="container-sistara">
        <div className="relative overflow-hidden rounded-5xl border-2 border-white bg-gradient-to-br from-pink-200 via-lavender-200 to-sky-200 p-7 text-center shadow-card sm:p-10">
          <h2 className="text-balance text-2xl sm:text-3xl">
            Found what you need? <span aria-hidden="true">✨</span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-pretty font-body text-base text-ink-soft">
            Tell us what you want and we’ll get started right away.
          </p>
          <Button to="/order" size="lg" className="mt-6">
            Place an Order
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <p className="mt-4 font-body text-xs font-semibold text-ink-muted">
            Not sure what to pick?{' '}
            <Link
              to="/contact"
              className="font-bold text-pink-600 underline decoration-pink-300 decoration-2 underline-offset-4"
            >
              Ask us on WhatsApp
            </Link>
          </p>
        </div>
      </div>
    </section>
  </>
)

export default Services
