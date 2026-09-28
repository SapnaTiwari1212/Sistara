/**
 * JWT helpers.
 * ---------------------------------------------------------------------------
 * The secret always comes from the environment. In development JWT_SECRET may
 * be unset, but then an EPHEMERAL random secret is generated at boot so
 * sessions never survive a restart. In production the server refuses to boot
 * without a real JWT_SECRET (enforced in server.js too).
 */

import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const EPHEMERAL_SECRET = process.env.NODE_ENV !== 'production'
  ? crypto.randomBytes(48).toString('hex')
  : null

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : EPHEMERAL_SECRET)
  if (!secret) {
    throw new Error('JWT_SECRET is required in production.')
  }
  return secret
}

export const generateToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )

export const verifyToken = (token) => jwt.verify(token, getJwtSecret())