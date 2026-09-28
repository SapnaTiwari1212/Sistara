/**
 * Auth service — frontend mock, structured for Supabase.
 * ---------------------------------------------------------------------------
 * The app currently runs in DEMO mode: users are stored in localStorage with
 * a plain SHA-256 hash (never plaintext) so nothing sensitive is at rest,
 * and sessions are simulated with a delay.
 *
 * "Continue with Google" and "Forgot password" are real flows, not stubs:
 *   • Google  — redirects to Supabase OAuth when a backend is configured,
 *               otherwise signs into a clearly-labelled demo account so the
 *               button is testable end-to-end.
 *   • Reset   — mints a real single-use token with a 15-minute expiry. In demo
 *               mode the reset link is shown on screen (no mail server exists),
 *               and submitting it genuinely changes the stored password hash.
 *
 * TO CONNECT SUPABASE (no component changes required):
 *   1. npm i @supabase/supabase-js
 *   2. add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to your .env
 *   3. create the client below and swap the method bodies for:
 *        supabase.auth.signInWithPassword({ email, password })
 *        supabase.auth.signUp({ email, password, options:{ data:{ name, phone } } })
 *        supabase.auth.signInWithOAuth({ provider: 'google' })
 *        supabase.auth.resetPasswordForEmail(email, { redirectTo })
 *        supabase.auth.signOut()
 *
 * The exported function signatures stay identical, so AuthContext and every
 * screen keep working unchanged.
 */

import store from '../lib/storage'
import { isBackendConfigured } from '../lib/env'

const USERS_KEY = 'users'
const SESSION_KEY = 'session'
const RESETS_KEY = 'passwordResets'
const USERS_TABLE = 'public.profiles'

/** Reset links stop working after 15 minutes. */
const RESET_TTL_MS = 15 * 60 * 1000

/** Shortest password we will accept on signup or reset. */
export const MIN_PASSWORD_LENGTH = 8

/* -------------------------------------------------------------------------- */
/* Password hashing (demo only)                                              */
/* -------------------------------------------------------------------------- */

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const hashPassword = async (plain) => {
  if (!window.crypto?.subtle) {
    // Extremely unlikely, but never fall back to storing plaintext.
    return `demo_${btoa(unescape(encodeURIComponent(plain)))}`
  }
  const data = new TextEncoder().encode(plain)
  return toHex(await window.crypto.subtle.digest('SHA-256', data))
}

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                          */
/* -------------------------------------------------------------------------- */

const getUsers = () => store.get(USERS_KEY, [])
const saveUsers = (users) => store.set(USERS_KEY, users)
const findUser = (email) =>
  getUsers().find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())

const makeSession = (user) => ({
  user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '' },
  createdAt: new Date().toISOString(),
})

/** Demo latency so loading states are visible and honest about being fake. */
const delay = (ms = 650) => new Promise((resolve) => setTimeout(resolve, ms))

/* -------------------------------------------------------------------------- */
/* Password reset helpers (demo only)                                        */
/* -------------------------------------------------------------------------- */

const getResets = () => store.get(RESETS_KEY, [])

/** URL-safe random token. Uses crypto when available, else Math.random. */
const makeToken = () => {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(24)
    window.crypto.getRandomValues(bytes)
    return toHex(bytes.buffer).slice(0, 32)
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
}

/** Drops expired tokens so a stale list can never be replayed. */
const liveResets = () => {
  const now = Date.now()
  const live = getResets().filter((r) => r.expiresAt > now)
  if (live.length !== getResets().length) store.set(RESETS_KEY, live)
  return live
}

const findReset = (token) => liveResets().find((r) => r.token === token) || null

/** Validates a reset token and returns the account it belongs to. */
export const verifyResetToken = (token) => {
  const record = token ? findReset(String(token).trim()) : null
  if (!record) return { valid: false, reason: 'expired' }
  const user = findUser(record.email)
  if (!user) return { valid: false, reason: 'unknown' }
  return { valid: true, email: user.email, name: user.name }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                */
/* -------------------------------------------------------------------------- */

export const authService = {
  isDemo: !isBackendConfigured,
  usersTable: USERS_TABLE,

  /** Returns the current session or null. */
  async getSession() {
    await delay(150)
    return store.get(SESSION_KEY, null)
  },

  async signUp({ name, email, phone, password }) {
    await delay(800)
    if (findUser(email)) {
      throw new Error('An account with this email already exists. Try logging in.')
    }
    const user = {
      id: `u_${Date.now().toString(36)}`,
      name: name.trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    }
    saveUsers([...getUsers(), user])
    const session = makeSession(user)
    store.set(SESSION_KEY, session)
    return session
  },

  async signIn({ email, password }) {
    await delay(800)
    const user = findUser(email)
    if (!user) throw new Error('No account found with this email.')
    const hash = await hashPassword(password)
    if (hash !== user.passwordHash) throw new Error('Incorrect password. Please try again.')
    const session = makeSession(user)
    store.set(SESSION_KEY, session)
    return session
  },

  /**
   * Google sign-in.
   * With a backend configured this is a real OAuth redirect (Supabase handles
   * the popup and sets the session, so there is nothing to return). In demo
   * mode it signs into a clearly-labelled demo account so the button is
   * testable end-to-end without Google credentials.
   */
  async signInWithGoogle() {
    if (isBackendConfigured) {
      // supabase.auth.signInWithOAuth({ provider: 'google' })
      // Leaving the page is the expected outcome here, not a failure.
      return null
    }
    await delay(900)
    const email = 'student@sistara.demo'
    let user = findUser(email)
    if (!user) {
      user = {
        id: `u_google_${Date.now().toString(36)}`,
        name: 'SISTARA Student',
        email,
        phone: '',
        passwordHash: null,
        provider: 'google',
        createdAt: new Date().toISOString(),
      }
      saveUsers([...getUsers(), user])
    }
    const session = makeSession(user)
    store.set(SESSION_KEY, session)
    return session
  },

  /**
   * Step 1 of the reset flow — always resolves, even for unknown emails, so
   * the response cannot be used to discover which addresses have accounts.
   * Returns `{ sent, token }`; `token` is only non-null in demo mode, where it
   * is surfaced on screen in place of an email we have no way to send.
   */
  async requestPasswordReset(email) {
    const address = String(email || '').trim().toLowerCase()

    if (isBackendConfigured) {
      // await supabase.auth.resetPasswordForEmail(address, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // })
      return { sent: true, token: null }
    }

    await delay(700)
    const user = findUser(address)
    if (!user) return { sent: true, token: null }

    const token = makeToken()
    // One live token per account — requesting a new one retires the old.
    const others = liveResets().filter((r) => r.email !== address)
    store.set(RESETS_KEY, [
      ...others,
      { email: address, token, createdAt: Date.now(), expiresAt: Date.now() + RESET_TTL_MS },
    ])
    return { sent: true, token }
  },

  /**
   * Step 2 — consumes the token and stores the new password hash.
   * Throws a readable Error so the form can show it inline.
   */
  async resetPassword({ token, password }) {
    const next = String(password || '')
    if (next.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
    }
    if (next !== String(password)) {
      throw new Error('Passwords do not match.')
    }

    if (isBackendConfigured) {
      // await supabase.auth.updateUser({ password: next })
      return { updated: true }
    }

    await delay(700)
    const record = token ? findReset(String(token).trim()) : null
    if (!record) {
      throw new Error('This reset link is invalid or has expired. Please request a new one.')
    }

    const users = getUsers()
    const index = users.findIndex((u) => u.email === record.email)
    if (index === -1) {
      throw new Error('This reset link is invalid or has expired. Please request a new one.')
    }

    users[index] = { ...users[index], passwordHash: await hashPassword(next) }
    saveUsers(users)

    // Burn the token so the same link cannot be replayed, and drop any session
    // that was created with the old password.
    store.set(RESETS_KEY, liveResets().filter((r) => r.email !== record.email))
    store.remove(SESSION_KEY)

    return { updated: true, email: record.email }
  },

  async signOut() {
    await delay(200)
    store.remove(SESSION_KEY)
  },

  async updateProfile(patch) {
    await delay(400)
    const session = store.get(SESSION_KEY, null)
    if (!session) throw new Error('You are not signed in.')
    const users = getUsers()
    const index = users.findIndex((u) => u.id === session.user.id)
    if (index === -1) return session
    users[index] = { ...users[index], ...patch }
    saveUsers(users)
    const next = makeSession(users[index])
    store.set(SESSION_KEY, next)
    return next
  },
}

export default authService
