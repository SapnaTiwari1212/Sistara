import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/brand/Logo'
import Mascot from '../components/brand/Mascot'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../config/siteConfig'
import { verifyResetToken, MIN_PASSWORD_LENGTH } from '../services/authService'
import { isEmail } from '../lib/utils'

/**
 * Forgot password — /forgot-password
 * ---------------------------------------------------------------------------
 * Two real steps, no stubs:
 *   1. Ask for the account email. The service always reports success (so the
 *      form can't be used to discover who has an account) and mints a
 *      single-use token with a 15-minute expiry.
 *   2. Set a new password. Submitting the token genuinely rewrites the stored
 *      password hash and burns the token, so the old password stops working.
 *
 * Step 2 is reachable two ways, both real:
 *   • In demo mode there is no mail server, so the reset link is printed on
 *     screen and "Open reset link" carries the token in the URL.
 *   • With Supabase configured the emailed link lands on `/reset-password`,
 *     which redirects here with `?token=` — the same code path handles it.
 *
 * The token also lives in the URL so the flow survives a refresh, and is kept
 * in sync with the address bar via `replace` so Back doesn't replay it.
 */
const ForgotPassword = () => {
  const { requestPasswordReset, resetPassword, isDemo } = useAuth()
  const [params, setParams] = useSearchParams()
  const urlToken = params.get('token')

  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* ---------- the token in the URL is the source of truth ---------- */
  const tokenState = useMemo(
    () => (urlToken ? verifyResetToken(urlToken) : { valid: false }),
    [urlToken],
  )

  // A valid token drops you straight into step 2.
  useEffect(() => {
    if (tokenState.valid) setStep('reset')
  }, [tokenState.valid])

  // An invalid or expired token must not leave the user on a dead form.
  useEffect(() => {
    if (urlToken && !tokenState.valid) {
      setStep('request')
      setFormError('That reset link is invalid or has expired. Request a new one below.')
    }
  }, [urlToken, tokenState.valid])

  useEffect(() => {
    document.title = `Forgot password · ${siteConfig.brand.name}`
    return () => {
      document.title = siteConfig.brand.tagline
    }
  }, [])

  const openToken = (value) => {
    setParams(value ? { token: value } : {}, { replace: true })
  }

  /* ---------------- step 1: request a reset ---------------- */
  const handleRequest = async (e) => {
    e.preventDefault()
    const found = {}
    if (!email.trim()) found.email = 'Email is required.'
    else if (!isEmail(email)) found.email = 'Enter a valid email address.'
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setLoading(true)
    setFormError(null)
    try {
      const { token } = await requestPasswordReset(email.trim())
      setStep('sent')
      // Demo mode has no mail server, so hand the link straight over.
      if (token) openToken(token)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- step 2: set the new password ---------------- */
  const handleReset = async (e) => {
    e.preventDefault()
    const found = {}
    if (!newPassword) found.newPassword = 'Password is required.'
    else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      found.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (confirmPassword !== newPassword) found.confirmPassword = 'Passwords do not match.'
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setLoading(true)
    setFormError(null)
    try {
      await resetPassword({ token: urlToken, password: newPassword })
      openToken(null)
      setDone(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetToStart = () => {
    setStep('request')
    setDone(false)
    setFormError(null)
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    openToken(null)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-lavender-100 to-sky-100 py-10 sm:py-14">
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
        <div className="mx-auto max-w-lg">
          {/* brand header — same logo as every other auth screen */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <Mascot size={128} floatDelay={0.3} />
            <div className="mt-3 flex justify-center">
              <Link to="/" aria-label={`${siteConfig.brand.name} home`}>
                <Logo size="md" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-6 text-center"
          >
            <h1 className="text-balance text-3xl sm:text-4xl">
              {done ? 'Password updated!' : step === 'reset' ? 'Choose a new password' : 'Forgot your password?'}{' '}
              <span aria-hidden="true">💕</span>
            </h1>
            <p className="mt-2.5 text-pretty font-body text-base text-ink-soft sm:text-lg">
              {done
                ? 'You can now log in with your new password.'
                : step === 'reset'
                  ? `Pick something memorable — at least ${MIN_PASSWORD_LENGTH} characters.`
                  : 'No worries. Tell us your email and we’ll get you back in.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 rounded-5xl border-2 border-white bg-white/90 p-5 shadow-card backdrop-blur-md sm:p-7"
          >
            {/* ---------------- success ---------------- */}
            {done && (
              <div className="space-y-4">
                <p className="flex items-start gap-2 rounded-2xl border-2 border-mint-300 bg-mint-100/60 p-3.5 font-body text-sm font-semibold text-mint-500">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Password changed. Your old password no longer works.</span>
                </p>
                <Button to="/login" size="lg" fullWidth icon={KeyRound}>
                  Go to Login
                </Button>
                <p className="text-center font-body text-sm font-semibold text-ink-soft">
                  Wrong account?{' '}
                  <button
                    type="button"
                    onClick={resetToStart}
                    className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
                  >
                    Reset another one
                  </button>
                </p>
              </div>
            )}

            {/* ---------------- step 1 ---------------- */}
            {!done && step !== 'reset' && (
              <motion.form
                key="request"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                onSubmit={handleRequest}
                noValidate
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((err) => ({ ...err, email: undefined }))
                    setFormError(null)
                  }}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                {formError && (
                  <p className="flex items-start gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50 p-3.5 font-body text-sm font-semibold text-pink-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <Button type="submit" fullWidth size="lg" loading={loading} icon={Send}>
                  Send Reset Link
                </Button>

                <p className="pt-1 text-center font-body text-sm font-semibold text-ink-soft">
                  Remembered it?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </p>
              </motion.form>
            )}

            {/* ---------------- step 1.5: link sent ---------------- */}
            {!done && step === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                <p className="flex items-start gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 p-3.5 font-body text-sm font-semibold text-sky-500">
                  <Send className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    If an account exists for{' '}
                    <span className="font-extrabold">{email.trim().toLowerCase()}</span>, a reset link
                    is on its way. The link expires in 15 minutes.
                  </span>
                </p>

                {isDemo ? (
                  <div className="rounded-3xl border-2 border-dashed border-lavender-300 bg-lavender-50/70 p-4">
                    <p className="font-display text-sm font-extrabold text-grape-500">
                      Demo mode — no email is sent
                    </p>
                    <p className="mt-1.5 font-body text-xs font-semibold leading-relaxed text-ink-soft">
                      A browser can&rsquo;t send mail, so your reset link is right here. On a live
                      site this arrives in the inbox instead. If that email has no SISTARA account,
                      the next step will tell you so.
                    </p>
                    <Button
                      onClick={() => setStep('reset')}
                      variant="secondary"
                      fullWidth
                      className="mt-3"
                      icon={KeyRound}
                    >
                      Open reset link
                    </Button>
                  </div>
                ) : (
                  <p className="rounded-2xl border-2 border-dashed border-lavender-300 bg-lavender-50/70 p-3.5 font-body text-xs font-semibold leading-relaxed text-ink-soft">
                    Tip: keep this tab open, then follow the link in the email on this device.
                  </p>
                )}

                <p className="pt-1 text-center font-body text-sm font-semibold text-ink-soft">
                  Wrong email, or no link?{' '}
                  <button
                    type="button"
                    onClick={resetToStart}
                    className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
                  >
                    Try again
                  </button>
                </p>
              </motion.div>
            )}

            {/* ---------------- step 2 ---------------- */}
            {!done && step === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                onSubmit={handleReset}
                noValidate
                className="space-y-4"
              >
                {tokenState.valid && (
                  <p className="flex items-start gap-2 rounded-2xl border-2 border-mint-300 bg-mint-100/60 p-3.5 font-body text-sm font-semibold text-mint-500">
                    <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Resetting the password for{' '}
                      <span className="font-extrabold">{tokenState.email}</span>.
                    </span>
                  </p>
                )}

                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setErrors((err) => ({ ...err, newPassword: undefined }))
                    setFormError(null)
                  }}
                  error={errors.newPassword}
                  autoComplete="new-password"
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition-colors hover:text-pink-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((err) => ({ ...err, confirmPassword: undefined }))
                    setFormError(null)
                  }}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />

                {formError && (
                  <p className="flex items-start gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50 p-3.5 font-body text-sm font-semibold text-pink-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <Button type="submit" fullWidth size="lg" loading={loading} icon={CheckCircle2}>
                  Save New Password
                </Button>

                <p className="pt-1 text-center font-body text-sm font-semibold text-ink-soft">
                  Changed your mind?{' '}
                  <button
                    type="button"
                    onClick={resetToStart}
                    className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
                  >
                    Start over
                  </button>
                </p>
              </motion.form>
            )}
          </motion.div>

          {/* back to home — required on every auth screen */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-body text-sm font-bold text-ink-soft underline decoration-lavender-200 decoration-2 underline-offset-4 transition-colors hover:text-pink-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword
