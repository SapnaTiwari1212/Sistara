/**
 * Small, dependency-free request validators.
 * Return booleans so controllers can decide how to word the 400 error.
 */

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())

/** Indian 10-digit mobile (tolerates +91 / leading 0 / spaces / dashes). */
export const isPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  const local = digits.length > 10 ? digits.slice(-10) : digits
  return local.length === 10
}

export const isFiniteAmount = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

export const isPositiveInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 1

/** Sanitise a file-metadata array, keeping only name / size / type. */
export const sanitizeFileMeta = (files, { maxFiles } = {}) => {
  if (!files || typeof files !== 'object') return []
  const list = [...files].filter((f) => f && typeof f === 'object')
  return list.slice(0, maxFiles).map((f) => {
    const name = String(f.name || '').slice(0, 255)
    const size = Number(f.size)
    const type = String(f.type || '').slice(0, 120)
    return { name, size: Number.isFinite(size) && size >= 0 ? size : 0, type }
  })
}