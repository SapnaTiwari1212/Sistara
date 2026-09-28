import { Instagram, Heart } from 'lucide-react'
import { Reveal, Eyebrow } from '../ui/Reveal'
import { siteConfig } from '../../config/siteConfig'
import { services } from '../../config/services'
import { formatINR } from '../../lib/utils'

/** Instagram promo panel + a preview of what gets posted. */
const InstagramSection = () => {
  const { social, brand } = siteConfig
  const previews = services.slice(0, 6)

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container-sistara">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl border-2 border-white bg-gradient-to-br from-pink-100 via-lavender-100 to-sky-100 p-6 shadow-card sm:p-10">
            {/* decorative corners */}
            <span className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-pink-200/50 blur-2xl" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-8 -right-6 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl" aria-hidden="true" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="text-center lg:text-left">
                <Eyebrow>
                  <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                  Instagram
                </Eyebrow>

                <h2 className="mt-4 text-balance text-3xl sm:text-4xl">
                  Follow SISTARA on Instagram <span aria-hidden="true">💕</span>
                </h2>

                <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                  Behind-the-scenes peeks, cute work samples, pastel palettes and the occasional
                  study tip. We post often.
                </p>

                <p className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-white bg-white/80 px-4 py-2 font-display text-base font-extrabold text-grape-600">
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                  {social.instagram.handle}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href={social.instagram.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-primary group w-full sm:w-auto"
                  >
                    <Instagram className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Follow Us on Instagram
                  </a>
                </div>
              </div>

              {/* Phone-ish preview */}
              <div className="relative mx-auto w-full max-w-[280px]">
                <div className="rounded-[2rem] border-4 border-ink bg-white p-2.5 shadow-card">
                  {/* header */}
                  <div className="flex items-center gap-2 px-1.5 pb-2 pt-1">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-grape-400 text-[10px] font-extrabold text-white">
                      S
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[11px] font-extrabold leading-none text-ink">
                        {brand.name.toLowerCase()}
                      </p>
                      <p className="truncate font-body text-[9px] text-ink-muted">
                        {social.instagram.handle}
                      </p>
                    </div>
                  </div>

                  {/* grid */}
                  <div className="grid grid-cols-3 gap-1">
                    {previews.map((s, i) => (
                      <div
                        key={s.id}
                        className={`relative aspect-square overflow-hidden ${
                          ['bg-pink-200', 'bg-lavender-200', 'bg-sky-200', 'bg-butter-200', 'bg-mint-300', 'bg-grape-200'][i % 6]
                        }`}
                      >
                        <s.icon
                          className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-white/95"
                          aria-hidden="true"
                        />
                        <span className="absolute bottom-1 left-1 right-1 truncate text-center font-display text-[7px] font-extrabold text-white/90">
                          from {formatINR(s.basePrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* footer stats */}
                  <div className="flex items-center justify-center gap-3 px-1 pb-1 pt-2.5">
                    <span className="flex items-center gap-1 font-body text-[10px] font-bold text-pink-500">
                      <Heart className="h-3 w-3 fill-pink-300" aria-hidden="true" />
                      cute work daily
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default InstagramSection
