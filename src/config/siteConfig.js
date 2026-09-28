/**
 * SISTARA — central configuration
 * ---------------------------------------------------------------------------
 * EDIT EVERYTHING BRAND-RELATED HERE.
 *
 * This file is the single source of truth for:
 *   - brand name / tagline / copy
 *   - logo + mascot image paths (drop your real assets in /public/assets/brand)
 *   - Instagram / WhatsApp / Email links
 *   - payment provider settings
 *
 * No secrets belong in this file. Anything sensitive goes in a `.env` file
 * (see `.env.example`) and is read through `src/lib/env.js`.
 */

// Vite statically replaces `import.meta.env.VITE_*` at build time. The fallback
// keeps this module importable from plain Node (e.g. the pricing unit tests),
// where `import.meta.env` is undefined.
const env = import.meta.env || {}

export const siteConfig = {
  brand: {
    name: 'SISTARA',
    tagline: 'ZERO FAULT',
    promise: 'Your Ideas, Our Creativity',
    shortDescription:
      'Assignments, PPTs, Projects & Creative Work — made cute, simple and stress-free.',
    about:
      'SISTARA helps turn your ideas and academic work into neat, creative and ready-to-submit work — without making the process complicated.',
    audience: 'Made for students, creators and dreamers.',
    whyPhrase: 'Zero Fault. Zero Stress. Just Creativity.',
    copyrightYear: 2026,
  },

  /**
   * BRAND ASSETS
   * -----------------------------------------------------------------
   * Put your real reference/logo/mascot files in `public/assets/brand/`
   * and set the `src` paths below to `/assets/brand/<file>`.
   * Every place the logo appears reads from here, so one edit updates
   * the navbar, hero, login, footer and confirmation pages at once.
   *
   * While `src` is `null` the components fall back to the built-in
   * inline SVG placeholder, so the site never shows a broken image.
   */
  brandAssets: {
    logo: {
      // e.g. '/assets/brand/sistara-logo.png'
      src: null,
      alt: 'SISTARA — Zero Fault',
    },
    mascot: {
      // e.g. '/assets/brand/sistara-mascot.png'
      src: null,
      alt: 'SISTARA mascot',
    },
    ogImage: {
      src: null,
      alt: 'SISTARA — Your Ideas, Our Creativity',
    },
  },

  /** Social + support links — all in one place. */
  social: {
    instagram: {
      handle: '@SISTARA._OFFICIAL_',
      url: 'https://instagram.com/SISTARA._OFFICIAL_',
    },
    whatsapp: {
      // Replace 91XXXXXXXXXX with your real number (digits only, no '+')
      number: '919999999999',
      get url() {
        return `https://wa.me/${this.number}`
      },
      label: 'Chat on WhatsApp',
    },
    email: {
      address: 'hello@sistara.in',
      get url() {
        return `mailto:${this.address}`
      },
    },
  },

  /**
   * PAYMENT
   * -----------------------------------------------------------------
   * `provider: 'demo'` shows a clean, fully-working demo checkout.
   * To go live, install Razorpay (`npm i @razorpay/checkout`) and set
   * provider to 'razorpay' with your publishable key id in `.env`.
   *
   * NEVER put a secret key in frontend code — only a publishable key id.
   */
  payment: {
    provider: env.VITE_PAYMENT_PROVIDER || 'demo',
    currency: 'INR',
    razorpayKeyId: env.VITE_RAZORPAY_KEY_ID || '',
    taxRatePercent: 0,
    discountPercent: 0,
  },

  /** Order statuses, in the order a customer's job moves through them. */
  orderStatuses: ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed'],

  /** Map of status -> pastel badge styling. */
  statusStyles: {
    Pending: 'bg-butter-100 text-butter-500 border-butter-300',
    Confirmed: 'bg-sky-100 text-sky-500 border-sky-300',
    'In Progress': 'bg-lavender-100 text-grape-500 border-lavender-300',
    Ready: 'bg-pink-100 text-pink-600 border-pink-300',
    Completed: 'bg-mint-100 text-mint-500 border-mint-300',
  },

  /** Formats accepted for requirement + reference uploads. */
  upload: {
    accept:
      '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,application/zip',
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip'],
    maxSizeMb: 20,
    maxFiles: 6,
  },

  /** Default turnaround used on the order form. */
  deadlines: [
    { value: '24h', label: '24 hours', multiplier: 1.4, note: 'Rush delivery' },
    { value: '3d', label: '3 days', multiplier: 1, note: 'Standard' },
    { value: '5d', label: '5 days', multiplier: 0.9, note: 'Relaxed, better price' },
    { value: '7d', label: '7 days', multiplier: 0.85, note: 'Best value' },
    { value: 'custom', label: 'Something else', multiplier: 1.2, note: "I'll add a note" },
  ],
}
