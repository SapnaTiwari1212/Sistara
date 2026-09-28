import { Check } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem, Eyebrow } from '../ui/Reveal'
import Button from '../ui/Button'
import Mascot from '../brand/Mascot'
import { siteConfig } from '../../config/siteConfig'
import { cn } from '../../lib/utils'

const REASONS = [
  { title: 'Affordable Pricing', copy: 'Made for student budgets, not corporate ones.', tone: 'pink' },
  { title: 'Cute & Creative Designs', copy: 'Pastel, playful and genuinely nice to look at.', tone: 'lavender' },
  { title: 'Student-Friendly', copy: 'We explain things simply. No confusing jargon.', tone: 'sky' },
  { title: 'Fast Delivery', copy: 'Rush options when your deadline is tomorrow.', tone: 'butter' },
  { title: 'Custom Requirements', copy: "We'll follow your brief, template or college format.", tone: 'mint' },
  { title: 'Quality-Focused Work', copy: 'Every file gets checked before it reaches you.', tone: 'grape' },
]

const TONES = {
  pink: 'bg-pink-100 text-pink-600',
  lavender: 'bg-lavender-100 text-grape-500',
  sky: 'bg-sky-100 text-sky-500',
  butter: 'bg-butter-100 text-butter-500',
  mint: 'bg-mint-100 text-mint-500',
  grape: 'bg-grape-100 text-grape-600',
}

const WhySistara = () => (
  <section className="relative py-16 sm:py-20 lg:py-24">
    <div className="container-sistara">
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        {/* Left: heading + mascot sticker */}
        <Reveal className="lg:sticky lg:top-28">
          <Eyebrow>Why Us</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl">
            Why Students Choose SISTARA <span aria-hidden="true">💗</span>
          </h2>

          <div className="mt-5 rounded-4xl border-2 border-dashed border-pink-200 bg-white/70 p-5">
            <p className="font-display text-lg font-extrabold leading-snug text-grape-500 sm:text-xl">
              “{siteConfig.brand.whyPhrase}”
            </p>
            <p className="mt-2 font-body text-[15px] leading-relaxed text-ink-soft">
              {siteConfig.brand.about}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="shrink-0">
              <Mascot size={104} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-extrabold text-ink">
                {siteConfig.brand.audience}
              </p>
              <p className="mt-0.5 font-body text-sm text-ink-soft">
                Quality without the heavy price tag.
              </p>
            </div>
          </div>

          <Button to="/order" className="mt-6" icon={undefined}>
            Start your order
          </Button>
        </Reveal>

        {/* Right: benefit cards */}
        <RevealGroup className="grid gap-4 sm:grid-cols-2" stagger={0.08}>
          {REASONS.map((r) => (
            <RevealItem key={r.title} className="h-full">
              <div
                className={cn(
                  'group flex h-full gap-3.5 rounded-4xl border-2 border-white bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft',
                )}
              >
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-8deg]',
                    TONES[r.tone],
                  )}
                  aria-hidden="true"
                >
                  <Check className="h-5 w-5" strokeWidth={3.2} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base leading-snug">{r.title}</h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-ink-soft">{r.copy}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  </section>
)

export default WhySistara
