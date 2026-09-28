/**
 * SISTARA backend — service catalogue mirror (READ-ONLY).
 * ---------------------------------------------------------------------------
 * The single source of truth for services is the frontend
 * `src/config/services.js`. This file only mirrors the fields the SERVER needs
 * to validate requests and recompute authoritative quotes — it must never be
 * edited as the source of pricing. When a database-driven catalogue lands,
 * these values should be loaded from the DB instead.
 *
 * Mirror of `src/config/services.js` fields: basePrice, perUnitPrice, unit,
 * unitLabel, minQuantity, maxQuantity. Plus shared config constants that the
 * frontend keeps in `src/config/siteConfig.js`.
 */

export const services = [
  { id: 'assignments', name: 'Assignments & Files', short: 'Assignments', accent: 'pink', basePrice: 49, perUnitPrice: 2, unit: 'page', unitLabel: 'pages', minQuantity: 1, maxQuantity: 200, defaultQuantity: 5 },
  { id: 'lab-manuals', name: 'Lab Manuals & Practical Files', short: 'Lab Manual', accent: 'mint', basePrice: 79, perUnitPrice: 3, unit: 'experiment', unitLabel: 'experiments', minQuantity: 1, maxQuantity: 60, defaultQuantity: 6 },
  { id: 'creative-ppt', name: 'Creative PPTs', short: 'Creative PPT', accent: 'lavender', basePrice: 99, perUnitPrice: 8, unit: 'slide', unitLabel: 'slides', minQuantity: 5, maxQuantity: 120, defaultQuantity: 10 },
  { id: 'project-reports', name: 'Project Reports', short: 'Project Report', accent: 'sky', basePrice: 149, perUnitPrice: 4, unit: 'page', unitLabel: 'pages', minQuantity: 5, maxQuantity: 150, defaultQuantity: 20 },
  { id: 'handmade-cards', name: 'Handmade Cards', short: 'Handmade Card', accent: 'pink', basePrice: 99, perUnitPrice: 35, unit: 'card', unitLabel: 'cards', minQuantity: 1, maxQuantity: 100, defaultQuantity: 1 },
  { id: 'stationery', name: 'Custom Stationery', short: 'Stationery', accent: 'butter', basePrice: 129, perUnitPrice: 60, unit: 'piece', unitLabel: 'pieces', minQuantity: 1, maxQuantity: 200, defaultQuantity: 5 },
  { id: 'bookmarks', name: 'Bookmarks', short: 'Bookmark', accent: 'lavender', basePrice: 29, perUnitPrice: 15, unit: 'bookmark', unitLabel: 'bookmarks', minQuantity: 5, maxQuantity: 300, defaultQuantity: 10 },
  { id: 'custom', name: 'Custom Request', short: 'Custom Request', accent: 'grape', basePrice: 99, perUnitPrice: 0, unit: 'item', unitLabel: 'items', minQuantity: 1, maxQuantity: 100, defaultQuantity: 1 },
]

export const serviceById = (id) => services.find((s) => s.id === id) || null

/** Order statuses, in the order a job moves through them (mirror of siteConfig). */
export const orderStatuses = ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed']

/** Deadline values + multipliers / payable days (mirror of siteConfig). */
export const deadlines = [
  { value: '24h', label: '24 hours', multiplier: 1.4, days: 1 },
  { value: '3d', label: '3 days', multiplier: 1, days: 3 },
  { value: '5d', label: '5 days', multiplier: 0.9, days: 5 },
  { value: '7d', label: '7 days', multiplier: 0.85, days: 7 },
  { value: 'custom', label: 'Something else', multiplier: 1.2, days: 3 },
]

/** Payment settings used by the quote calculator (mirror of siteConfig.payment). */
export const paymentDefaults = {
  currency: 'INR',
  taxRatePercent: 0,
  discountPercent: 0,
}

/** Upload limits used to sanitise file metadata (mirror of siteConfig.upload). */
export const uploadLimits = {
  maxFiles: 6,
  maxSizeMb: 20,
}