import { motion } from 'framer-motion'
import { MessageCircle, Instagram, Mail, Sparkles, Clock } from 'lucide-react'
import ContactSection from '../components/home/ContactSection'
import Mascot from '../components/brand/Mascot'
import FloatingDecorations from '../components/decor/FloatingDecorations'
import { siteConfig } from '../config/siteConfig'

const Contact = () => (
  <>
    <section className="relative overflow-hidden border-b-2 border-dashed border-pink-200 bg-blob-pink py-12 sm:py-16">
      <FloatingDecorations density="sparse" />

      <div className="container-sistara relative">
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="pill border-2 border-dashed border-pink-200 bg-white/80 text-pink-600">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              We reply fast
            </span>
            <h1 className="mt-4 text-balance text-4xl sm:text-5xl">
              Let’s talk <span aria-hidden="true">💬</span>
            </h1>
            <p className="mt-3 max-w-xl text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
              Need something custom, or just unsure what to order? Tell us what you need and
              we’ll help you figure it out. No silly questions — ever.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={siteConfig.social.whatsapp.url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-primary"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                WhatsApp us
              </a>
              <a
                href={siteConfig.social.instagram.url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-secondary"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
                {siteConfig.social.instagram.handle}
              </a>
            </div>

            <p className="mt-5 flex items-center gap-1.5 font-body text-sm font-semibold text-ink-soft">
              <Clock className="h-4 w-4 text-pink-400" aria-hidden="true" />
              Usually replies within a few hours, Monday to Saturday.
            </p>
          </motion.div>

          <div className="hidden justify-center lg:flex">
            <Mascot size={200} />
          </div>
        </div>
      </div>
    </section>

    <ContactSection id="channels" />
  </>
)

export default Contact
