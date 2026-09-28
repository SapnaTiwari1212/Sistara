import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, FileUp, CheckCircle2, Wallet } from 'lucide-react'
import { Input, Textarea, Select } from '../ui/Input'
import Button from '../ui/Button'
import FileUploader from './FileUploader'
import PriceSummary from './PriceSummary'
import { useOrders } from '../../context/OrderContext'
import { useAuth } from '../../context/AuthContext'
import { services } from '../../config/services'
import { siteConfig } from '../../config/siteConfig'
import { cn, isEmail, isPhone, formatINR } from '../../lib/utils'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  institution: '',
  instructions: '',
  notes: '',
}

/** Validates the order form and returns a field -> message map. */
const validate = (values, { requirements, quantity, service }) => {
  const errors = {}

  if (!values.name.trim()) errors.name = 'Please tell us your name.'
  else if (values.name.trim().length < 2) errors.name = 'That name looks a little short.'

  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.'

  if (!values.phone.trim()) errors.phone = 'Phone number is required.'
  else if (!isPhone(values.phone)) errors.phone = 'Enter a valid 10-digit number.'

  if (!values.institution.trim()) errors.institution = 'Where do you study?'

  if (!service) errors.service = 'Choose a service.'

  const min = service?.minQuantity ?? 1
  if (!quantity || Number(quantity) < min) {
    errors.quantity = `Minimum ${min} ${service?.unitLabel || 'items'}.`
  }

  if (requirements.length === 0) {
    errors.requirements = 'Please upload at least one file so we know what you need.'
  }

  return errors
}

/**
 * Order form.
 * On submit it creates the order and routes to /payment.
 */
const OrderForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { draft, updateDraft, pricing, service, placeOrder } = useOrders()

  const [values, setValues] = useState(() => ({
    ...EMPTY,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((err) => (err[key] ? { ...err, [key]: undefined } : err))
  }

  const bumpQuantity = (delta) => {
    if (!service) return
    const next = Math.min(
      Math.max((draft.quantity ?? service.defaultQuantity) + delta, service.minQuantity),
      service.maxQuantity,
    )
    updateDraft({ quantity: next })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!user) {
      // Send them to log in first, then straight back here.
      navigate('/login', { state: { from: { pathname: `/order?service=${draft.serviceId}` } } })
      return
    }

    const found = validate(values, {
      requirements: draft.requirements,
      quantity: draft.quantity,
      service,
    })
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      // Move focus to the first problem.
      const firstKey = Object.keys(found).find((k) => found[k])
      document.getElementById(`order-${firstKey}`)?.focus?.()
      return
    }

    setSubmitting(true)
    try {
      const order = await placeOrder()
      navigate('/payment', { state: { orderId: order.id } })
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      {/* ---------------- Left: details ---------------- */}
      <div className="space-y-5">
        {/* Service picker */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6"
        >
          <h2 className="text-xl">
            <span className="mr-1.5" aria-hidden="true">1️⃣</span> Pick your service
          </h2>

          <div className="mt-4 space-y-4">
            <div id="order-service">
              <Select
                label="Which service do you need?"
                value={draft.serviceId}
                onChange={(e) => updateDraft({ serviceId: e.target.value })}
                error={errors.service}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — from {formatINR(s.basePrice)}
                  </option>
                ))}
              </Select>
            </div>

            {service && (
              <p className="rounded-2xl bg-cream-200/70 p-3.5 font-body text-sm leading-relaxed text-ink-soft">
                {service.longDescription}
              </p>
            )}
          </div>
        </motion.section>

        {/* Quantity + deadline */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6"
        >
          <h2 className="text-xl">
            <span className="mr-1.5" aria-hidden="true">2️⃣</span> How much do you need?
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Quantity stepper */}
            <div id="order-quantity">
              <label htmlFor="qty-input" className="field-label">
                Quantity ({service?.unitLabel || 'items'})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bumpQuantity(-1)}
                  disabled={(draft.quantity ?? 0) <= (service?.minQuantity ?? 1)}
                  className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-2xl border-2 border-lavender-200 bg-white font-display text-2xl font-extrabold text-ink transition-transform hover:bg-lavender-50 active:scale-95 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <input
                  id="qty-input"
                  type="number"
                  inputMode="numeric"
                  className={cn('field h-[54px] text-center font-display text-lg font-extrabold', errors.quantity && 'field-error')}
                  value={draft.quantity ?? ''}
                  min={service?.minQuantity ?? 1}
                  max={service?.maxQuantity ?? 999}
                  onChange={(e) => {
                    updateDraft({ quantity: e.target.value === '' ? '' : Number(e.target.value) })
                    setErrors((err) => ({ ...err, quantity: undefined }))
                  }}
                  onBlur={() => {
                    if (service) {
                      const q = Number(draft.quantity) || service.minQuantity
                      updateDraft({
                        quantity: Math.min(Math.max(q, service.minQuantity), service.maxQuantity),
                      })
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => bumpQuantity(1)}
                  disabled={(draft.quantity ?? 0) >= (service?.maxQuantity ?? 999)}
                  className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-2xl border-2 border-lavender-200 bg-white font-display text-2xl font-extrabold text-ink transition-transform hover:bg-lavender-50 active:scale-95 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {errors.quantity ? (
                <p className="field-error-text">{errors.quantity}</p>
              ) : (
                <p className="field-hint">
                  {service ? `From ${service.minQuantity} ${service.unitLabel}` : ''}
                </p>
              )}
            </div>

            {/* Deadline */}
            <div id="order-deadline">
              <Select
                label="Deadline"
                value={draft.deadline}
                onChange={(e) => updateDraft({ deadline: e.target.value })}
                hint="Rush delivery costs a little extra"
              >
                {siteConfig.deadlines.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} · {d.note}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </motion.section>

        {/* About you */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6"
        >
          <h2 className="text-xl">
            <span className="mr-1.5" aria-hidden="true">3️⃣</span> Your details
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div id="order-name">
              <Input
                label="Full Name"
                placeholder="Aarav Sharma"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
                required
              />
            </div>

            <div id="order-email">
              <Input
                label="Email"
                type="email"
                placeholder="aarav@college.edu"
                value={values.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
                required
              />
            </div>

            <div id="order-phone">
              <Input
                label="Phone Number"
                type="tel"
                inputMode="tel"
                placeholder="98765 43210"
                value={values.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
                required
              />
            </div>

            <div id="order-institution">
              <Input
                label="College / School"
                placeholder="ABC University"
                value={values.institution}
                onChange={set('institution')}
                error={errors.institution}
                required
              />
            </div>
          </div>
        </motion.section>

        {/* Uploads + instructions */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-4xl border-2 border-white bg-white p-5 shadow-card sm:p-6"
        >
          <h2 className="text-xl">
            <span className="mr-1.5" aria-hidden="true">4️⃣</span> Files & instructions
          </h2>

          <div className="mt-4 space-y-5">
            <div id="order-requirements">
              <FileUploader
                files={draft.requirements}
                onChange={(files) => {
                  updateDraft({ requirements: files })
                  setErrors((err) => ({ ...err, requirements: undefined }))
                }}
                hint={`Up to ${siteConfig.upload.maxFiles} files · max ${siteConfig.upload.maxSizeMb} MB each`}
              />
              {errors.requirements && (
                <p className="field-error-text">{errors.requirements}</p>
              )}
            </div>

            <FileUploader
              label="Reference file (optional)"
              variant="reference"
              icon={FileUp}
              files={draft.references}
              onChange={(files) => updateDraft({ references: files })}
              hint="A sample or template you'd like us to match"
            />

            <Textarea
              label="Special Instructions"
              placeholder="Tell us the topic, page count, your college format, colours you like…"
              value={draft.instructions}
              onChange={set('instructions')}
              hint="The more detail you give, the closer we get first time."
            />

            <Textarea
              label="Anything else? (optional)"
              rows={3}
              placeholder="e.g. My submission is on 24th, please share a preview first."
              value={draft.notes}
              onChange={set('notes')}
            />
          </div>
        </motion.section>
      </div>

      {/* ---------------- Right: sticky price ---------------- */}
      <div className="lg:sticky lg:top-24">
        <PriceSummary
          service={service}
          pricing={pricing}
          quantity={draft.quantity}
          deadline={draft.deadline}
        />

        {submitError && (
          <p className="mt-4 rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 font-body text-sm font-semibold text-pink-600">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          icon={user ? Wallet : CheckCircle2}
          iconRight={Send}
          className="mt-4"
        >
          {user ? 'Continue to Payment' : 'Login to Continue'}
        </Button>

        {!user && (
          <p className="mt-2.5 text-center font-body text-xs font-semibold text-ink-muted">
            You’ll be asked to log in first — it takes 10 seconds.
          </p>
        )}

        {/* trust row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-display text-[11px] font-bold text-ink-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-mint-500" aria-hidden="true" />
            Zero Fault check
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
            Secure payment
          </span>
        </div>
      </div>
    </form>
  )
}

export default OrderForm
