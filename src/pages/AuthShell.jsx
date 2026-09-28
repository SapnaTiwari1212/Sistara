import { motion } from 'framer-motion'
import { Sparkles, Heart, ShieldCheck, Zap } from 'lucide-react'
import Logo from '../components/brand/Logo'
import Mascot from '../components/brand/Mascot'
import { LoginForm, SignupForm } from '../components/auth/AuthForms'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../config/siteConfig'

/**
 * Shared pastel-gradient shell for /login and /signup.
 * `mode` swaps the heading + which form renders.
 */
const AuthShell = ({ mode = 'login' }) => {
  const { isDemo } = useAuth()
  const isLogin = mode === 'login'

  const perks = isLogin
    ? [
        { icon: Zap, text: 'Track every order in one place' },
        { icon: Heart, text: 'Reorder your favourite service in seconds' },
        { icon: ShieldCheck, text: 'Your files stay private and secure' },
      ]
    : [
        { icon: Sparkles, text: 'Order in under a minute' },
        { icon: Heart, text: 'Saved prices, no surprises' },
        { icon: ShieldCheck, text: 'Quality checked, every single time' },
      ]

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-lavender-100 to-sky-100 py-10 sm:py-14">
      {/* soft blobs */}
      <div
        className="pointer-events-none absolute -left-20 top-16 h-64 w-64 animate-floatySlow rounded-full bg-pink-200/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 animate-floaty rounded-full bg-lavender-300/40 blur-3xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-paper opacity-50" aria-hidden="true" />

      <div className="container-sistara relative">
        <div className="mx-auto max-w-5xl">
          {/* brand header */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <Mascot size={128} floatDelay={0.3} />
            <div className="mt-3">
              <Logo size="md" className="justify-center" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-6 text-center"
          >
            <h1 className="text-balance text-3xl sm:text-4xl">
              {isLogin ? 'Welcome to SISTARA' : 'Join SISTARA'}{' '}
              <span aria-hidden="true">💕</span>
            </h1>
            <p className="mt-2.5 text-pretty font-body text-base text-ink-soft sm:text-lg">
              {isLogin
                ? "Let's make your work extra special!"
                : 'Create your free account and order in under a minute.'}
            </p>
          </motion.div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_0.85fr]">
            {/* form card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-5xl border-2 border-white bg-white/90 p-5 shadow-card backdrop-blur-md sm:p-7"
            >
              {isLogin ? <LoginForm /> : <SignupForm />}
            </motion.div>

            {/* perks panel */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative overflow-hidden rounded-5xl border-2 border-dashed border-pink-200 bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6"
            >
              <span
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-butter-200/50 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative">
                <p className="font-display text-lg font-extrabold text-ink">
                  {isLogin ? 'Why sign in?' : 'What you get'}
                </p>

                <ul className="mt-4 space-y-3.5">
                  {perks.map((p) => (
                    <li key={p.text} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-100 text-pink-600">
                        <p.icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span className="pt-1.5 font-body text-sm font-semibold text-ink-soft">
                        {p.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-3xl bg-cream-200/80 p-4">
                  <p className="font-display text-sm font-extrabold text-grape-500">
                    “{siteConfig.brand.whyPhrase}”
                  </p>
                </div>

                {isDemo && (
                  <p className="mt-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-3 font-body text-xs font-semibold leading-relaxed text-sky-500">
                    <strong className="font-extrabold">Demo mode.</strong> Accounts are stored only
                    in your browser, so nothing is sent anywhere. To go live, create a Supabase
                    client and swap the method bodies in{' '}
                    <code className="rounded bg-sky-100 px-1 py-0.5 text-[11px]">src/services/authService.js</code>{' '}
                    — the screens stay as they are.
                  </p>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthShell
