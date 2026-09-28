import { Link } from 'react-router-dom'
import { Instagram, MessageCircle, Mail, Heart, ArrowUpRight } from 'lucide-react'
import Logo, { StarIcon } from '../brand/Logo'
import { siteConfig } from '../../config/siteConfig'

const Footer = () => {
  const { brand, social } = siteConfig

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/my-orders', label: 'My Orders' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="relative mt-20 overflow-hidden border-t-2 border-dashed border-pink-200 bg-blob-lavender">
      <div className="pointer-events-none absolute -top-6 left-8 h-20 w-20 animate-drift opacity-60">
        <StarIcon className="h-full w-full" />
      </div>

      <div className="container-sistara relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" aria-label="SISTARA home">
              <Logo size="md" />
            </Link>
            <p className="mt-4 max-w-xs font-body text-[15px] leading-relaxed text-ink-soft">
              {brand.promise} <span aria-hidden="true">💕</span>
            </p>
            <p className="mt-2 font-display text-sm font-bold text-grape-500">
              “{brand.whyPhrase}”
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={social.instagram.url}
                target="_blank"
                rel="noreferrer noopener"
                className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-grape-400 to-butter-300 text-white shadow-soft transition-transform hover:-translate-y-1"
                aria-label="SISTARA on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={social.whatsapp.url}
                target="_blank"
                rel="noreferrer noopener"
                className="grid h-11 w-11 place-items-center rounded-full bg-mint-300 text-ink shadow-soft transition-transform hover:-translate-y-1"
                aria-label={social.whatsapp.label}
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={social.email.url}
                className="grid h-11 w-11 place-items-center rounded-full bg-sky-200 text-ink shadow-soft transition-transform hover:-translate-y-1"
                aria-label={`Email ${social.email.address}`}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <nav aria-label="Footer">
            <h3 className="font-display text-base font-extrabold text-ink">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-1 font-body text-[15px] font-semibold text-ink-soft transition-colors hover:text-pink-600"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Instagram + contact */}
          <div>
            <h3 className="font-display text-base font-extrabold text-ink">Say hello</h3>
            <ul className="mt-4 space-y-3 font-body text-[15px] font-semibold text-ink-soft">
              <li>
                <a
                  href={social.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-pink-600"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  {social.instagram.handle}
                </a>
              </li>
              <li>
                <a
                  href={social.whatsapp.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-pink-600"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp support
                </a>
              </li>
              <li>
                <a
                  href={social.email.url}
                  className="inline-flex items-center gap-1.5 break-all transition-colors hover:text-pink-600"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {social.email.address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-pink-200 pt-6 sm:flex-row">
          <p className="text-center font-body text-sm font-semibold text-ink-muted sm:text-left">
            © {brand.copyrightYear} {brand.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 font-display text-sm font-bold text-pink-500">
            Made with <Heart className="h-4 w-4 fill-pink-300 text-pink-300" aria-hidden="true" />{' '}
            for students
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
