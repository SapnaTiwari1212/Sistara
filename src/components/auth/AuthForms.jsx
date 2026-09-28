import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, User, Phone, Check } from 'lucide-react'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { cn, isEmail } from '../../lib/utils'

/** Shared "Continue with Google" button + Google mark. */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.86 8.88 4.75 12 4.75z"
    />
  </svg>
)

export const GoogleButton = ({ onClick, loading, label = 'Continue with Google' }) => (
  <Button
    variant="secondary"
    fullWidth
    onClick={onClick}
    loading={loading}
    type="button"
    className="mt-3 bg-white"
  >
    {!loading && <GoogleIcon />}
    {label}
  </Button>
)

const Divider = ({ children }) => (
  <div className="my-5 flex items-center gap-3">
    <span className="h-0.5 flex-1 rounded-full bg-lavender-200" />
    <span className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
      {children}
    </span>
    <span className="h-0.5 flex-1 rounded-full bg-lavender-200" />
  </div>
)

/* ========================================================================== */
/* Login                                                                      */
/* ========================================================================== */

export const LoginForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle } = useAuth()

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.email.trim()) found.email = 'Email is required.'
    else if (!isEmail(values.email)) found.email = 'Enter a valid email address.'
    if (!values.password) found.password = 'Password is required.'
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setLoading(true)
    try {
      await signIn(values)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setFormError(null)
    try {
      await signInWithGoogle()
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0.36, 1] }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <Input
        label="Email"
        type="email"
        icon={Mail}
        placeholder="you@college.edu"
        value={values.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
        required
      />

      <div>
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="••••••••"
        value={values.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete="current-password"
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
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink-soft">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded-md border-2 border-lavender-300 text-pink-400 accent-pink-400"
          />
          Remember me
        </label>
        <button
          type="button"
          className="font-body text-sm font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
        >
          Forgot?
        </button>
      </div>

      {formError && (
        <p className="flex items-start gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50 p-3.5 font-body text-sm font-semibold text-pink-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading} icon={LogIn} className="mt-1">
        Login
      </Button>

      <Divider>or</Divider>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      <p className="pt-1 text-center font-body text-sm font-semibold text-ink-soft">
        Don’t have an account?{' '}
        <Link
          to="/signup"
          state={location.state}
          className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
        >
          Create Account
        </Link>
      </p>
    </motion.form>
  )
}

/* ========================================================================== */
/* Signup                                                                     */
/* ========================================================================== */

export const SignupForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signInWithGoogle } = useAuth()

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
    setFormError(null)
  }

  const strength = (() => {
    const p = values.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score += 1
    if (/[A-Z]/.test(p)) score += 1
    if (/[0-9]/.test(p)) score += 1
    if (/[^A-Za-z0-9]/.test(p)) score += 1
    return score
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.name.trim()) found.name = 'Please tell us your name.'
    else if (values.name.trim().length < 2) found.name = 'That name looks too short.'

    if (!values.email.trim()) found.email = 'Email is required.'
    else if (!isEmail(values.email)) found.email = 'Enter a valid email address.'

    if (!values.phone.trim()) found.phone = 'Phone number is required.'
    else if (values.phone.replace(/\D/g, '').length < 10) found.phone = 'Enter a valid 10-digit number.'

    if (!values.password) found.password = 'Password is required.'
    else if (values.password.length < 8) found.password = 'Use at least 8 characters.'

    if (values.confirmPassword !== values.password) found.confirmPassword = 'Passwords do not match.'

    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setLoading(true)
    try {
      await signUp(values)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setFormError(null)
    try {
      await signInWithGoogle()
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0.36, 1] }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <Input
        label="Name"
        icon={User}
        placeholder="Aarav Sharma"
        value={values.name}
        onChange={set('name')}
        error={errors.name}
        autoComplete="name"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@college.edu"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Phone"
          type="tel"
          inputMode="tel"
          icon={Phone}
          placeholder="98765 43210"
          value={values.phone}
          onChange={set('phone')}
          error={errors.phone}
          autoComplete="tel"
          required
        />
      </div>

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="At least 8 characters"
        value={values.password}
        onChange={set('password')}
        error={errors.password}
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

      {/* strength meter */}
      {values.password && !errors.password && (
        <div className="-mt-2 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  i < strength
                    ? strength <= 1
                      ? 'bg-pink-400'
                      : strength === 2
                        ? 'bg-butter-400'
                        : strength === 3
                          ? 'bg-sky-400'
                          : 'bg-mint-500'
                    : 'bg-lavender-100',
                )}
              />
            ))}
          </div>
          <span className="font-display text-[11px] font-bold text-ink-muted">
            {['Weak', 'Weak', 'Good', 'Good', 'Strong'][strength]}
          </span>
        </div>
      )}

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="Re-enter your password"
        value={values.confirmPassword}
        onChange={set('confirmPassword')}
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

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        icon={Check}
        className="mt-1"
      >
        Create Account
      </Button>

      <Divider>or</Divider>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

      <p className="pt-1 text-center font-body text-sm font-semibold text-ink-soft">
        Already have an account?{' '}
        <Link
          to="/login"
          state={location.state}
          className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
        >
          Login
        </Link>
      </p>
    </motion.form>
  )
}

export { Divider, GoogleIcon }
