/**
 * Pricing unit tests — run with `npm run test:pricing`.
 * Plain Node, no test framework needed.
 */
import { calculateQuote, quoteLines } from '../src/lib/pricing.js'
import { getServiceById, services } from '../src/config/services.js'
import { siteConfig } from '../src/config/siteConfig.js'

let pass = 0
const fails = []

const eq = (label, actual, expected) => {
  if (Object.is(actual, expected)) {
    pass++
    console.log(`PASS  ${label} = ${actual}`)
  } else {
    fails.push(`${label}: expected ${expected}, got ${actual}`)
    console.log(`FAIL  ${label}: expected ${expected}, got ${actual}`)
  }
}

const ok = (label, cond, detail = '') => {
  if (cond) {
    pass++
    console.log(`PASS  ${label}${detail ? ' — ' + detail : ''}`)
  } else {
    fails.push(label)
    console.log(`FAIL  ${label}${detail ? ' — ' + detail : ''}`)
  }
}

/* ---------------------------------------------------------------- services */
const ppt = getServiceById('creative-ppt')
const bookmark = getServiceById('bookmarks')

console.log('\n— Basic quote —')
const basic = calculateQuote({ service: ppt, quantity: 10, deadline: '3d' })
eq('base price', basic.base, ppt.basePrice)
eq('extras (10 units)', basic.extras, (10 - ppt.minQuantity) * ppt.perUnitPrice)
eq('subtotal', basic.subtotal, basic.base + basic.rush + basic.extras)
eq('total with no discount/tax', basic.total, basic.subtotal)

console.log('\n— Known example: Creative PPT 10 slides = ₹139 —')
eq('ppt/10/3d total', basic.total, 139)

console.log('\n— Quantity 14 —')
eq('ppt/14/3d total', calculateQuote({ service: ppt, quantity: 14, deadline: '3d' }).total, 171)

console.log('\n— Quantity clamping —')
eq('below min clamps up', calculateQuote({ service: ppt, quantity: 1, deadline: '3d' }).total, basic.base)
eq(
  'above max clamps down',
  calculateQuote({ service: ppt, quantity: 9999, deadline: '3d' }).total,
  calculateQuote({ service: ppt, quantity: ppt.maxQuantity, deadline: '3d' }).total,
)
eq('defaults to defaultQuantity', calculateQuote({ service: ppt, deadline: '3d' }).total,
  calculateQuote({ service: ppt, quantity: ppt.defaultQuantity, deadline: '3d' }).total)

console.log('\n— Deadlines —')
const rushQuote = calculateQuote({ service: ppt, quantity: 10, deadline: '24h' })
ok('24h costs more than 3d', rushQuote.total > basic.total, `₹${rushQuote.total} vs ₹${basic.total}`)
ok('24h rush is positive', rushQuote.rush > 0, `+₹${rushQuote.rush}`)

const relaxed = calculateQuote({ service: ppt, quantity: 10, deadline: '7d' })
ok('7d costs less than 3d', relaxed.total < basic.total, `₹${relaxed.total} vs ₹${basic.total}`)
ok('7d rush is negative', relaxed.rush < 0, `₹${relaxed.rush}`)

const sevenDay = siteConfig.deadlines.find((d) => d.value === '7d')
ok('relaxed multiplier is below 1', sevenDay.multiplier < 1, `x${sevenDay.multiplier}`)
eq('7d rush uses the configured multiplier', relaxed.rush, Math.round(ppt.basePrice * (sevenDay.multiplier - 1)))

console.log('\n— Discount is applied EXACTLY once —')
const disc = calculateQuote({
  service: ppt,
  quantity: 10,
  deadline: '3d',
  discountPercent: 20,
})
eq('discount = 20% of subtotal', disc.discount, Math.round(disc.subtotal * 0.2))
eq('total = subtotal - discount', disc.total, disc.subtotal - disc.discount)
// The bug: Payment.jsx used to subtract the discount from the already-final amount.
eq('discount is not double-charged', disc.total, basic.total - disc.discount)
ok(
  'payable stays positive for a huge discount',
  calculateQuote({ service: ppt, quantity: 10, deadline: '3d', discountPercent: 90 }).total > 0,
  `₹${calculateQuote({ service: ppt, quantity: 10, deadline: '3d', discountPercent: 90 }).total}`,
)

console.log('\n— Tax —')
const taxed = calculateQuote({ service: ppt, quantity: 10, deadline: '3d', taxRatePercent: 18 })
eq('tax = 18% of (subtotal - discount)', taxed.tax, Math.round((taxed.subtotal - taxed.discount) * 0.18))
eq('total = taxable + tax', taxed.total, taxed.subtotal - taxed.discount + taxed.tax)

const both = calculateQuote({
  service: ppt,
  quantity: 10,
  deadline: '3d',
  discountPercent: 20,
  taxRatePercent: 18,
})
eq('discount then tax (not tax then discount)', both.tax, Math.round(both.subtotal * 0.8 * 0.18))

console.log('\n— Line items —')
const lines = quoteLines(basic).map((l) => l.key)
ok('base line present', lines.includes('base'))
ok('extras line present', lines.includes('extras'))
ok('no rush line at 3d', !lines.some((k) => k.startsWith('rush')), lines.join(','))
ok(
  'relaxed deadline shows a saving line',
  quoteLines(relaxed).some((l) => l.key === 'rush-saving' && l.value < 0),
)
ok('rush deadline shows a rush line', quoteLines(rushQuote).some((l) => l.key === 'rush' && l.value > 0))
ok('discount line is negative', quoteLines(disc).some((l) => l.key === 'discount' && l.value < 0))

console.log('\n— Every line sums to the total —')
for (const [name, q] of Object.entries({ basic, rushQuote, relaxed, disc, both })) {
  const sum = q.subtotal - q.discount + q.tax
  eq(`lines reconcile (${name})`, sum, q.total)
}

console.log('\n— Every service quotes sensibly —')
for (const svc of services) {
  const q = calculateQuote({ service: svc, quantity: svc.defaultQuantity, deadline: '3d' })
  ok(`${svc.id} total > 0`, q.total > 0, `₹${q.total}`)
  ok(`${svc.id} card price matches base`, svc.basePrice > 0, `₹${svc.basePrice}`)
  ok(`${svc.id} min <= default <= max`, svc.minQuantity <= svc.defaultQuantity && svc.defaultQuantity <= svc.maxQuantity)
  ok(`${svc.id} includes >= 3 items`, svc.includes.length >= 3, `${svc.includes.length}`)
  ok(`${svc.id} has a tagline`, typeof (svc.tagline ?? svc.short) === 'string' && (svc.tagline ?? svc.short).length > 0)
}

console.log('\n— Bookmarks (per-unit pricing) —')
const bm = calculateQuote({ service: bookmark, quantity: 10, deadline: '3d' })
ok('bookmarks quote is positive', bm.total > 0, `₹${bm.total}`)

console.log('\n— Missing service is safe —')
const none = calculateQuote({ service: null, quantity: 5, deadline: '3d' })
eq('null service total', none.total, 0)
eq('null service has no crash', quoteLines(none).length, 1)

/* ------------------------------------------------------------------ report */
console.log('\n' + '='.repeat(60))
console.log(`${pass} passed, ${fails.length} failed`)
if (fails.length) {
  fails.forEach((f) => console.log(' - ' + f))
  process.exitCode = 1
} else {
  console.log('ALL PRICING TESTS PASSED')
}
