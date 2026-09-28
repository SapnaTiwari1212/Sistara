import { MessageCircle, Instagram, Mail, Sparkles } from 'lucide-react'
import { Reveal, Eyebrow } from '../ui/Reveal'
import { siteConfig } from '../../config/siteConfig'

/** Short "About" blurb. */
export const AboutSection = () => {
  const { brand } = siteConfig

  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <Eyebrow>About Us</Eyebrow>
      <h2 className="mt-4 text-balance text-2xl sm:text-3xl">{brand.audience}</h2>
      <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
        {brand.about}
      </p>
    </Reveal>
  )
}

/** Support / contact panel. */
export const ContactSection = ({ id = 'contact' }) => {
  const { social } = siteConfig

  const channels = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      hint: 'Fastest replies',
      href: social.whatsapp.url,
      tone: 'bg-mint-300 text-ink',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      hint: social.instagram.handle,
      href: social.instagram.url,
      tone: 'bg-gradient-to-br from-pink-400 via-grape-400 to-butter-300 text-white',
    },
    {
      icon: Mail,
      label: 'Email',
      hint: social.email.address,
      href: social.email.url,
      tone: 'bg-sky-200 text-ink',
    },
  ]

  return (
    <section id={id} className="relative scroll-mt-24 py-16 sm:py-20">
      <div className="container-sistara">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl border-2 border-dashed border-lavender-300 bg-white/80 p-6 shadow-card backdrop-blur-sm sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Support
              </Eyebrow>

              <h2 className="mt-4 text-balance text-3xl sm:text-4xl">
                Need something custom?
              </h2>
              <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                Just tell us what you need. We’ll help you figure it out.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="group flex flex-col items-center gap-2 rounded-4xl border-2 border-white bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-pink-200 hover:shadow-card"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105 ${c.tone}`}
                    aria-hidden="true"
                  >
                    <c.icon className="h-7 w-7" />
                  </span>
                  <span className="font-display text-lg font-extrabold text-ink">{c.label}</span>
                  <span className="break-all font-body text-xs font-semibold text-ink-muted">
                    {c.hint}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ContactSection
