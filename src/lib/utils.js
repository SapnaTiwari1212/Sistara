/** Tiny classnames helper. Falsy values are dropped. */
export const cn = (...classes) => classes.filter(Boolean).join(' ')

/** ₹ formatting with Indian digit grouping. */
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)

/** e.g. "1.4 MB" */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/** Human-readable order id, e.g. SIST-8F3K2Q */
export const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return `SIST-${out}`
}

/** e.g. "26 Sep 2026" */
export const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/** "in 3 days" / "tomorrow" for delivery estimates. */
export const deliveryLabel = (iso) => {
  if (!iso) return 'To be confirmed'
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days <= 0) return 'Due today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

/** Simple, readable email check used for client-side validation only. */
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())

/** Indian 10-digit mobile check (accepts an optional +91 / leading 0). */
export const isPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  const local = digits.length > 10 ? digits.slice(-10) : digits
  return local.length === 10
}

export const fileExtension = (name = '') => {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/** Triggers a client-side file download (used for demo invoices/receipts). */
export const downloadTextFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
