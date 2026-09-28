import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCircle2, Save, LogOut, Check, Instagram, MessageCircle, Mail, Palette } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/brand/Logo'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { siteConfig } from '../config/siteConfig'
import { formatDate, isEmail, isPhone } from '../lib/utils'

const Profile = () => {
  const { user, updateProfile, signOut, isDemo } = useAuth()
  const { orders } = useOrders()

  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.name.trim()) found.name = 'Name is required.'
    if (!isEmail(values.email)) found.email = 'Enter a valid email.'
    if (values.phone && !isPhone(values.phone)) found.phone = 'Enter a valid 10-digit number.'
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setSaving(true)
    try {
      await updateProfile(values)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const memberSince = user ? formatDate(orders[orders.length - 1]?.createdAt || new Date().toISOString()) : '—'

  return (
    <section className="relative overflow-hidden bg-blob-lavender py-10 sm:py-14">
      <div className="container-sistara">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <span className="pill border-2 border-dashed border-lavender-300 bg-white/80 text-grape-500">
            <UserCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Profile
          </span>
          <h1 className="mt-4 text-balance text-3xl sm:text-4xl">Your Account</h1>
          <p className="mx-auto mt-2.5 max-w-md text-pretty font-body text-base text-ink-soft">
            Keep your details up to date so we can reach you about your orders.
          </p>
        </motion.header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_0.85fr]">
          {/* form */}
          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-5xl border-2 border-white bg-white p-5 shadow-card sm:p-7"
          >
            <h2 className="text-xl">Edit details</h2>

            <div className="mt-5 space-y-4">
              <Input
                label="Full Name"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                value={values.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Phone"
                type="tel"
                inputMode="tel"
                value={values.phone}
                onChange={set('phone')}
                error={errors.phone}
                placeholder="98765 43210"
                autoComplete="tel"
                hint="We only use this for order updates."
              />
            </div>

            {saved && (
              <p className="mt-4 flex items-center gap-1.5 rounded-2xl border-2 border-mint-300 bg-mint-100 p-3 font-body text-sm font-bold text-mint-500">
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                Saved!
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button type="submit" loading={saving} icon={Save} className="w-full sm:w-auto">
                Save changes
              </Button>
              <Button variant="secondary" icon={LogOut} onClick={signOut} className="w-full sm:w-auto">
                Log out
              </Button>
            </div>

            {isDemo && (
              <p className="mt-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-3 font-body text-xs font-semibold leading-relaxed text-sky-500">
                Demo mode — your profile is stored in this browser only. Connect Supabase to
                persist it for real.
              </p>
            )}
          </motion.form>

          {/* summary */}
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="space-y-4"
          >
            <div className="rounded-5xl border-2 border-white bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-lavender-300 font-display text-xl font-extrabold text-ink">
                  {(user?.name || 'S').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold text-ink">
                    {user?.name}
                  </p>
                  <p className="truncate font-body text-xs font-semibold text-ink-muted">
                    {user?.email}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2.5 border-t-2 border-dashed border-lavender-100 pt-4 font-body text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-soft">Total orders</dt>
                  <dd className="font-bold text-ink">{orders.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-soft">Orders since</dt>
                  <dd className="font-bold text-ink">{memberSince}</dd>
                </div>
              </dl>
            </div>

            {/* favourite palette */}
            <div className="rounded-5xl border-2 border-dashed border-lavender-300 bg-white/70 p-5">
              <p className="flex items-center gap-1.5 font-display text-sm font-extrabold text-grape-500">
                <Palette className="h-4 w-4" aria-hidden="true" />
                Our pastel palette
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['#FFB3C7', '#CBBDFA', '#A6D8F2', '#FFDE84', '#9EE0BF', '#FFFBF6'].map((c) => (
                  <span
                    key={c}
                    className="h-9 w-9 rounded-xl border-2 border-white shadow-soft"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* support */}
            <div className="rounded-5xl border-2 border-white bg-white p-5 shadow-card">
              <p className="font-display text-sm font-extrabold text-ink">Need help?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button href={siteConfig.social.whatsapp.url} variant="secondary" size="sm" icon={MessageCircle}>
                  WhatsApp
                </Button>
                <Button href={siteConfig.social.instagram.url} variant="secondary" size="sm" icon={Instagram}>
                  Instagram
                </Button>
                <Button href={siteConfig.social.email.url} variant="secondary" size="sm" icon={Mail}>
                  Email
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Logo size="sm" />
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

export default Profile
