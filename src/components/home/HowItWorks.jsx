import { MousePointerClick, UploadCloud, BadgeCheck, PackageCheck } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem, Eyebrow } from '../ui/Reveal'
import { cn } from '../../lib/utils'

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Choose Your Service',
    copy: 'Pick what you need from our cute little menu and see the price straight away.',
    tone: 'pink',
  },
  {
    icon: UploadCloud,
    title: 'Upload Your Requirements',
    copy: 'Drop in your brief, notes or files. We read everything before we start.',
    tone: 'lavender',
  },
  {
    icon: BadgeCheck,
    title: 'Confirm & Pay',
    copy: 'Check the total, pay securely via UPI, card or net banking. No hidden charges.',
    tone: 'sky',
  },
  {
    icon: PackageCheck,
    title: 'Get Your Work',
    copy: 'Receive your finished, zero-fault work — and track it every step of the way.',
    tone: 'mint',
  },
]

const TONES = {
  pink: 'bg-pink-100 text-pink-600 border-pink-200',
  lavender: 'bg-lavender-100 text-grape-500 border-lavender-200',
  sky: 'bg-sky-100 text-sky-500 border-sky-200',
  mint: 'bg-mint-100 text-mint-500 border-mint-300',
}

/** Four-step "How It Works" timeline. */
const HowItWorks = ({ id = 'how-it-works' }) => (
  <section
    id={id}
    className="relative scroll-mt-24 overflow-hidden border-y-2 border-dashed border-lavender-200 bg-blob-lavender py-16 sm:py-20 lg:py-24"
  >
    <div className="container-sistara relative">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>Easy Peasy</Eyebrow>
        <h2 className="mt-4 text-balance text-3xl sm:text-4xl">
          How It Works <span aria-hidden="true">🌸</span>
        </h2>
        <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
          Four simple steps. You can place your first order in under a minute.
        </p>
      </Reveal>

      <div className="relative mt-12">
        {/* dashed connector (desktop) */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-[52px] hidden border-t-4 border-dashed border-pink-200 lg:block"
          aria-hidden="true"
        />

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
          {STEPS.map((step, i) => (
            <RevealItem key={step.title} className="relative">
              <div className="group relative flex h-full flex-col items-center text-center lg:px-2">
                <div
                  className={cn(
                    'relative z-10 grid h-[104px] w-[104px] place-items-center rounded-full border-4 border-cream shadow-card transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-3',
                    TONES[step.tone],
                  )}
                >
                  <step.icon className="h-10 w-10" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-ink font-display text-sm font-extrabold text-cream shadow-soft">
                    {i + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg">{step.title}</h3>
                <p className="mt-2 text-pretty font-body text-[15px] leading-relaxed text-ink-soft">
                  {step.copy}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  </section>
)

export default HowItWorks
