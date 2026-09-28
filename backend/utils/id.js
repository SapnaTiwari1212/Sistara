/**
 * ID generation — friendly, collision-resistant, crypto-backed.
 * Mirrors the frontend's `generateOrderId` shape (SIST-XXXXXX) so a backend
 * order looks identical to a demo one. Payment refs use the same alphabet.
 */

import crypto from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const randomId = (length) => {
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

export const generateOrderId = () => `SIST-${randomId(6)}`
export const generatePaymentRef = () => `PAY-${randomId(8)}`