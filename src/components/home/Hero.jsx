import { motion } from 'framer-motion'
import { Sparkles, ArrowDown, Truck, ShieldCheck, Wallet } from 'lucide-react'
import Logo from '../brand/Logo'
import Mascot from '../brand/Mascot'
import Button from '../ui/Button'
import FloatingDecorations from '../decor/FloatingDecorations'
import { MarqueeStrip } from '../decor/Doodles'
import { siteConfig } from '../../config/siteConfig'
import { services } from '../../config/services'
import { formatINR } from '../../lib/utils'

const TRUST = [
  { icon: '💸', label: 'Student-friendly pricing' },
  { icon: '⚡', label: 'Fast delivery' },
  { icon: '💕', label: 'Made with care' },
  { icon: '🎨', label: 'Creative designs' },
  { icon: '🔒', label: 'Zero fault promise' },
  { icon: '📚', label: 'Student friendly' },
]

const Hero = () => {
  const { brand } = siteConfig
  const cheapest = Math.min(...services.map((s) => s.basePrice))

  return (
    <section className="relative isolate overflow-hidden bg-blob-pink pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24">
      {/* paper grid + soft blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-paper opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl animate-floatySlow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-lavender-200/50 blur-3xl animate-floaty"
        aria-hidden="true"
      />

      <FloatingDecorations density="normal" />

      <div className="container-sistara relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* ---------------- Copy ---------------- */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <Logo size="lg" className="justify-center lg:justify-start" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 font-display text-lg font-bold text-pink-500 sm:text-xl"
            >
              “{brand.promise}” <span aria-hidden="true">✨</span>
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-3 text-balance text-4xl sm:text-5xl lg:text-6xl"
            >
              Your Ideas,
              <br className="hidden sm:block" />{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-pink-500 via-grape-500 to-sky-500 bg-clip-text text-transparent">
                  Our Creativity
                </span>
                <span
                  className="absolute inset-x-0 bottom-1.5 -z-0 h-3.5 rounded-full bg-butter-200/70 sm:bottom-2 sm:h-4"
                  aria-hidden="true"
                />
              </span>{' '}
              <span aria-hidden="true">✨</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="mx-auto mt-5 max-w-lg text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0"
            >
              {brand.shortDescription}
            </motion.p>

            {/* Price nudge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28 }}
              className="mt-6 flex justify-center lg:justify-start"
            >
              <div className="pill border-2 border-dashed border-mint-300 bg-mint-100 text-mint-500">
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Starting from {formatINR(cheapest)} · student-friendly pricing
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button to="/services" size="lg" icon={Sparkles} className="w-full sm:w-auto">
                Explore Services
              </Button>
              <Button
                to="/order"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Place an Order
              </Button>
            </motion.div>

            {/* Reassurance */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.44 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-display text-[13px] font-bold text-ink-soft lg:justify-start"
            >
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-mint-500" aria-hidden="true" />
                Zero Fault quality check
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-sky-500" aria-hidden="true" />
                Fast delivery
              </li>
            </motion.ul>
          </div>

          {/* ---------------- Mascot ---------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.68, 0.36, 1] }}
            className="order-1 flex justify-center lg:order-2"
          >
            <div className="relative">
              {/* pastel halo */}
              <div
                className="absolute inset-0 -z-10 mx-auto h-64 w-64 rounded-full bg-gradient-to-br from-pink-200 via-lavender-200 to-sky-200 opacity-70 blur-2xl animate-floatySlow sm:h-80 sm:w-80"
                aria-hidden="true"
              />

              {/* taped polaroid frame */}
              <div className="relative rotate-[3deg] rounded-4xl border-2 border-white bg-white/70 p-4 shadow-card backdrop-blur-sm transition-transform duration-500 hover:rotate-0 sm:p-6">
                <span
                  className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 rounded-sm bg-butter-200/90"
                  aria-hidden="true"
                />
                <Mascot size={230} className="sm:hidden" />
                <Mascot size={300} className="hidden sm:block" />
                <p className="mt-1 text-center font-display text-sm font-extrabold text-pink-500">
                  {brand.tagline} <span aria-hidden="true">💕</span>
                </p>
              </div>

              {/* floating price bubble */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-2 bottom-6 hidden rounded-2xl border-2 border-white bg-white px-4 py-2.5 shadow-card sm:block"
              >
                <p className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Quality work
                </p>
                <p className="font-display text-lg font-extrabold text-pink-500">Zero Fault</p>
              </motion.div>

              {/* floating deadline bubble */}
              <motion.div
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -right-2 top-8 hidden rounded-2xl border-2 border-white bg-white px-4 py-2.5 shadow-card sm:block"
              >
                <p className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Delivery
                </p>
                <p className="font-display text-lg font-extrabold text-grape-500">24–48 hrs</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#services"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mx-auto mt-12 hidden w-fit animate-wiggle rounded-full border-2 border-pink-200 bg-white/80 p-2.5 text-pink-400 shadow-soft lg:block"
          aria-label="Scroll to services"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.a>
      </div>

      {/* ticker */}
      <div className="relative mt-12 border-y-2 border-dashed border-pink-200 bg-white/60 py-3 backdrop-blur-sm">
        <MarqueeStrip items={TRUST} />
      </div>
    </section>
  )
}

export default Hero
