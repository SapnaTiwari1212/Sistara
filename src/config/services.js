/**
 * SISTARA — services & pricing
 * ---------------------------------------------------------------------------
 * EDIT PRICES AND COPY HERE ONLY.
 *
 * Every service card, the order form dropdown, and the price calculator
 * read from this one array, so a price change lands everywhere instantly.
 *
 * Pricing model per service:
 *   basePrice      — flat starting price shown on the card ("Starting from ₹99")
 *   unit           — what one `quantity` means (slides, pages, cards, pieces)
 *   unitLabel      — plural noun for the quantity field
 *   perUnitPrice   — added per extra unit, on top of `basePrice`
 *   minQuantity    — smallest order allowed
 *   turnaround     — human delivery range shown on the card
 *   deliveryDays   — whole days used for the "ready by" estimate on /services/:id
 *   includes       — bullet list of what is included
 *   requirements   — what the customer should send in for this service
 *
 * All prices are placeholders in ₹ (INR) and are intentionally affordable.
 */

import {
  FileText,
  FlaskConical,
  Presentation,
  BookOpenCheck,
  Heart,
  NotebookPen,
  Bookmark,
  Sparkles,
} from 'lucide-react'

export const services = [
  {
    id: 'assignments',
    name: 'Assignments & Files',
    short: 'Assignments',
    description: 'Neat, creative and ready-to-submit academic files.',
    longDescription:
      'Handwritten-style or typed assignments, neatly formatted with proper headings, references and a cover page — ready to submit.',
    basePrice: 49,
    perUnitPrice: 2,
    unit: 'page',
    unitLabel: 'pages',
    minQuantity: 1,
    maxQuantity: 200,
    defaultQuantity: 5,
    turnaround: '2–4 days',
    deliveryDays: 4,
    includes: ['Neat formatting', 'Cover page', 'Reference list', 'PDF + DOCX'],
    requirements: [
      'Your topic or the question paper',
      'How many pages you need',
      'Any format your college follows',
      'Reference material or useful links',
    ],
    icon: FileText,
    accent: 'pink',
    popular: true,
  },
  {
    id: 'lab-manuals',
    name: 'Lab Manuals & Practical Files',
    short: 'Lab Manual',
    description: 'Organized practical work made according to your requirements.',
    longDescription:
      'Well-structured lab manuals with observations, calculations, viva questions and neat diagrams, matched to your college format.',
    basePrice: 79,
    perUnitPrice: 3,
    unit: 'experiment',
    unitLabel: 'experiments',
    minQuantity: 1,
    maxQuantity: 60,
    defaultQuantity: 6,
    turnaround: '3–5 days',
    deliveryDays: 5,
    includes: ['Observation tables', 'Calculations', 'Viva questions', 'Neat diagrams'],
    requirements: [
      'List of experiments to cover',
      'College practical format or a sample file',
      'Observation table format to follow',
      'Any diagrams you want included',
    ],
    icon: FlaskConical,
    accent: 'mint',
    popular: false,
  },
  {
    id: 'creative-ppt',
    name: 'Creative PPTs',
    short: 'Creative PPT',
    description: 'Beautiful and presentation-ready PowerPoint designs.',
    longDescription:
      'Cute, colourful, on-brand slide decks that actually hold attention — layouts, icons, animations and speaker notes included.',
    basePrice: 99,
    perUnitPrice: 8,
    unit: 'slide',
    unitLabel: 'slides',
    minQuantity: 5,
    maxQuantity: 120,
    defaultQuantity: 10,
    turnaround: '2–3 days',
    deliveryDays: 3,
    includes: ['Custom theme', 'Icons & graphics', 'Transitions', 'Speaker notes'],
    requirements: [
      'Your topic',
      'Number of slides',
      'Reference material or images to use',
      'College guidelines or a template',
    ],
    icon: Presentation,
    accent: 'lavender',
    popular: true,
  },
  {
    id: 'project-reports',
    name: 'Project Reports',
    short: 'Project Report',
    description: 'Clean, professional and well-structured project reports.',
    longDescription:
      'Synopsis to bibliography — structured, plagiarism-friendly project reports with clean tables, charts and a proper conclusion.',
    basePrice: 149,
    perUnitPrice: 4,
    unit: 'page',
    unitLabel: 'pages',
    minQuantity: 5,
    maxQuantity: 150,
    defaultQuantity: 20,
    turnaround: '4–6 days',
    deliveryDays: 6,
    includes: ['Synopsis & objectives', 'Charts & tables', 'Conclusion', 'Bibliography'],
    requirements: [
      'Project topic and objective',
      'College report format or a sample',
      'Data, results or references to include',
      'Page count and deadline',
    ],
    icon: BookOpenCheck,
    accent: 'sky',
    popular: false,
  },
  {
    id: 'handmade-cards',
    name: 'Handmade Cards',
    short: 'Handmade Card',
    description: 'Cute personalized cards for special moments.',
    longDescription:
      'Birthdays, thank-yous, festivals and apologies — illustrated, hand-finished cards written and sent with care.',
    basePrice: 99,
    perUnitPrice: 35,
    unit: 'card',
    unitLabel: 'cards',
    minQuantity: 1,
    maxQuantity: 100,
    defaultQuantity: 1,
    turnaround: '2–4 days',
    deliveryDays: 4,
    includes: ['Custom message', 'Illustration', 'Hand finishing', 'Gift wrap'],
    requirements: [
      'The occasion, or who the card is for',
      'The message you want written',
      'Favourite colours',
      'Size preference (A5 / A6)',
    ],
    icon: Heart,
    accent: 'pink',
    popular: false,
  },
  {
    id: 'stationery',
    name: 'Custom Stationery',
    short: 'Stationery',
    description: 'Personalized stationery and study accessories.',
    longDescription:
      'Name-personalised notebooks, folders, sticky notes and desk sets — designed so your stationery looks as good as your work.',
    basePrice: 129,
    perUnitPrice: 60,
    unit: 'piece',
    unitLabel: 'pieces',
    minQuantity: 1,
    maxQuantity: 200,
    defaultQuantity: 5,
    turnaround: '4–7 days',
    deliveryDays: 7,
    includes: ['Your name & font', 'Choice of colours', 'Design mockup first', 'Bulk friendly'],
    requirements: [
      'Item type and how many you need',
      'Name or text to print',
      'Favourite colours or theme',
      'Font preference (optional)',
    ],
    icon: NotebookPen,
    accent: 'butter',
    popular: false,
  },
  {
    id: 'bookmarks',
    name: 'Bookmarks',
    short: 'Bookmark',
    description: 'Cute custom bookmarks for students and readers.',
    longDescription:
      'Laminated, illustrated bookmarks for exam season, book club giveaways or as a small, thoughtful handmade gift.',
    basePrice: 29,
    perUnitPrice: 15,
    unit: 'bookmark',
    unitLabel: 'bookmarks',
    minQuantity: 5,
    maxQuantity: 300,
    defaultQuantity: 10,
    turnaround: '3–5 days',
    deliveryDays: 5,
    includes: ['Laminated finish', 'Quote or name', 'Cute illustrations', 'Bulk pricing'],
    requirements: [
      'Name or quote to print',
      'How many bookmarks you need',
      'Favourite colours or theme',
      'Any reference image to match',
    ],
    icon: Bookmark,
    accent: 'lavender',
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom Request',
    short: 'Custom Request',
    description: 'Have something different in mind? Tell us what you need.',
    longDescription:
      'Something off the list? Posters, worksheets, resumes, website content, event décor — send us the idea and we will quote it.',
    basePrice: 99,
    perUnitPrice: 0,
    unit: 'item',
    unitLabel: 'items',
    minQuantity: 1,
    maxQuantity: 100,
    defaultQuantity: 1,
    turnaround: 'Let’s discuss',
    deliveryDays: 5,
    includes: ['Free discussion', 'Custom quote', 'Flexible scope', 'Priority support'],
    requirements: [
      'What you need made',
      'Quantity or size',
      'Your deadline',
      'Reference examples, if any',
    ],
    icon: Sparkles,
    accent: 'grape',
    popular: false,
  },
]

/** Quick lookup by id. */
export const getServiceById = (id) => services.find((s) => s.id === id) || null

/**
 * "Ready by" date for a service detail page.
 * Uses `deliveryDays` (the slow end of the turnaround range) so the promise
 * on the detail page always matches what the order form can actually hit.
 */
export const getReadyByDate = (service) => {
  const days = Number.isFinite(service?.deliveryDays) ? service.deliveryDays : 3
  const d = new Date()
  d.setHours(18, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** Every service id, handy for route validation and tests. */
export const serviceIds = services.map((s) => s.id)

/** `null` id means "no selection yet" and the order flow falls back to this. */
export const DEFAULT_SERVICE_ID = 'creative-ppt'

/**
 * Accent → Tailwind class maps.
 * Kept here so cards, dropdowns and summaries stay visually consistent.
 */
export const accentStyles = {
  pink: {
    bg: 'bg-pink-100',
    softBg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    ring: 'group-hover:border-pink-300',
    gradient: 'from-pink-200 to-pink-100',
    blob: 'bg-pink-200/60',
  },
  lavender: {
    bg: 'bg-lavender-100',
    softBg: 'bg-lavender-50',
    text: 'text-grape-500',
    border: 'border-lavender-200',
    ring: 'group-hover:border-lavender-400',
    gradient: 'from-lavender-200 to-lavender-100',
    blob: 'bg-lavender-200/60',
  },
  sky: {
    bg: 'bg-sky-100',
    softBg: 'bg-sky-50',
    text: 'text-sky-500',
    border: 'border-sky-200',
    ring: 'group-hover:border-sky-300',
    gradient: 'from-sky-200 to-sky-100',
    blob: 'bg-sky-200/60',
  },
  butter: {
    bg: 'bg-butter-100',
    softBg: 'bg-butter-50',
    text: 'text-butter-500',
    border: 'border-butter-200',
    ring: 'group-hover:border-butter-300',
    gradient: 'from-butter-200 to-butter-100',
    blob: 'bg-butter-200/60',
  },
  mint: {
    bg: 'bg-mint-100',
    softBg: 'bg-mint-100/50',
    text: 'text-mint-500',
    border: 'border-mint-300',
    ring: 'group-hover:border-mint-300',
    gradient: 'from-mint-300 to-mint-100',
    blob: 'bg-mint-300/50',
  },
  grape: {
    bg: 'bg-grape-100',
    softBg: 'bg-lavender-50',
    text: 'text-grape-600',
    border: 'border-grape-200',
    ring: 'group-hover:border-grape-300',
    gradient: 'from-grape-200 to-grape-100',
    blob: 'bg-grape-200/50',
  },
}

export const getAccent = (key) => accentStyles[key] || accentStyles.pink
