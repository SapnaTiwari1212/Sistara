import { Link } from 'react-router-dom'
import { ChevronDown, Sparkles, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import HowItWorks from '../components/home/HowItWorks'
import WhySistara from '../components/home/WhySistara'
import ContactSection from '../components/home/ContactSection'
import Button from '../components/ui/Button'
import Mascot from '../components/brand/Mascot'
import { siteConfig } from '../config/siteConfig'

const FAQ = [
  {
    q: 'How long does a typical order take?',
    a: 'Most academic orders are ready in 2–4 days. Creative PPTs are usually 2–3 days, and lab manuals take 3–5 days. If you need it faster, pick the 24-hour rush option when ordering.',
  },
  {
    q: 'What do I need to upload?',
    a: 'Your brief, notes, or any reference files. We accept PDF, DOC, DOCX, PPT, PPTX, JPG, PNG and ZIP. If you only have a rough idea, write it in the instructions box — that’s fine too.',
  },
  {
    q: 'How does pricing work?',
    a: 'Every service has a starting price that includes the minimum order. Add more pages, slides or pieces and the total updates live as you type. You approve the final price before paying.',
  },
  {
    q: 'Is my work original?',
    a: 'Yes. Your work is created specifically for you and checked before delivery. It is your submission — please use it responsibly and add your own review.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'UPI, credit/debit cards and net banking. You’ll get a receipt and an order ID right after paying, and you can track progress from your dashboard.',
  },
  {
    q: 'Something isn’t listed. Can you still help?',
    a: 'Absolutely — that’s what the Custom Request service is for. Message us with your idea and we’ll tell you whether we can do it and what it would cost.',
  },
]

const HowItWorksPage = () => (
  <>
    <section className="relative overflow-hidden border-b-2 border-dashed border-lavender-200 bg-blob-pink py-12 sm:py-16">
      <div className="container-sistara">
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <span className="pill border-2 border-dashed border-pink-200 bg-white/80 text-pink-600">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Simple & stress-free
            </span>
            <h1 className="mt-4 text-balance text-4xl sm:text-5xl">
              How ordering with SISTARA works
            </h1>
            <p className="mt-3 max-w-xl text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
              No long forms, no confusing calls. Four steps and you’re done — we handle the rest.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button to="/order" size="lg" className="w-full sm:w-auto">
                Place an Order
              </Button>
              <Button to="/contact" variant="secondary" className="w-full sm:w-auto">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Ask a question
              </Button>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <Mascot size={190} />
          </div>
        </div>
      </div>
    </section>

    <HowItWorks />

    <WhySistara />

    {/* FAQ */}
    <section className="py-16 sm:py-20">
      <div className="container-sistara">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl sm:text-4xl">
            Questions students ask us <span aria-hidden="true">❓</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-pretty font-body text-base text-ink-soft">
            Quick answers. Still unsure?{' '}
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
            >
              Message us
            </a>
            .
          </p>

          <div className="mt-9 space-y-3">
            {FAQ.map((item, i) => (
              <motion.details
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25) }}
                className="group overflow-hidden rounded-3xl border-2 border-lavender-200 bg-white shadow-soft open:border-pink-200 open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-display text-base font-extrabold text-ink sm:p-5 sm:text-lg">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100 text-pink-600 transition-transform duration-300 group-open:rotate-180">
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <div className="border-t-2 border-dashed border-lavender-100 px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-pretty font-body text-[15px] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </div>
              </motion.details>
            ))}
          </div>

          <p className="mt-8 text-center font-body text-sm font-semibold text-ink-muted">
            Still have questions?{' '}
            <Link
              to="/contact"
              className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
            >
              Visit contact
            </Link>
          </p>
        </div>
      </div>
    </section>

    <ContactSection />
  </>
)

export default HowItWorksPage
