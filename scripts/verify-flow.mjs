/* Temporary end-to-end flow verification — not part of the app bundle. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'
const TMP = path.join(process.cwd(), '.tmp-verify')
const SHOTS = path.join(process.cwd(), '.tmp-verify', 'shots')

fs.mkdirSync(TMP, { recursive: true })
fs.mkdirSync(SHOTS, { recursive: true })

// A tiny valid-ish file for the uploader
fs.writeFileSync(path.join(TMP, 'my-brief.pdf'), '%PDF-1.4 fake brief for testing')
fs.writeFileSync(path.join(TMP, 'reference.png'), Buffer.from('89504e470d0a1a0a', 'hex'))

const log = (...a) => console.log(...a)
const problems = []
const fail = (m) => {
  problems.push(m)
  log('  FAIL: ' + m)
}

const typeInto = async (page, labelText, value) => {
  const handle = await page.evaluateHandle((lt) => {
    const labels = Array.from(document.querySelectorAll('label'))
    const l = labels.find((x) => x.textContent.trim().toLowerCase().includes(lt.toLowerCase()))
    return l ? document.getElementById(l.getAttribute('for')) : null
  }, labelText)
  const el = handle.asElement()
  if (!el) throw new Error(`field not found: ${labelText}`)
  await el.click({ clickCount: 3 })
  await el.type(value, { delay: 4 })
  return el
}

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })

  // ---------------------------------------------------------------- SIGNUP
  log('\n[1] SIGNUP')
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle0' })
  await typeInto(page, 'Name', 'Aarav Sharma')
  await typeInto(page, 'Email', 'aarav@college.edu')
  await typeInto(page, 'Phone', '9876543210')
  await typeInto(page, 'Password', 'Sunshine123!')
  await typeInto(page, 'Confirm Password', 'Sunshine123!')

  const [signupBtn] = await page.$$('button[type="submit"]')
  await signupBtn.click()
  await new Promise((r) => setTimeout(r, 2500))

  let url = page.url()
  log('  after signup ->', url)
  if (!url.includes('/dashboard')) fail(`signup did not reach dashboard (got ${url})`)
  else log('  PASS reached /dashboard')

  const welcomeText = await page.evaluate(() => document.body.innerText)
  if (!welcomeText.includes('Welcome, Aarav')) fail('dashboard missing personalised welcome')
  else log('  PASS welcome shows user name')

  await page.screenshot({ path: path.join(SHOTS, 'dashboard.png') })

  // ---------------------------------------------------------------- ORDER
  log('\n[2] ORDER FORM')
  await page.goto(`${BASE}/order?service=creative-ppt`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))

  const preselected = await page.evaluate(() => {
    const sel = document.querySelector('#order-service select')
    return sel ? { value: sel.value, text: sel.options[sel.selectedIndex]?.textContent } : null
  })
  if (preselected?.value !== 'creative-ppt') fail(`?service= did not preselect (got ${preselected?.value})`)
  else log(`  PASS ?service= preselects service: ${preselected.text}`)

  // quantity stepper
  const readQty = () =>
    page.$eval('#qty-input', (el) => el.value)
  const qty0 = await readQty()
  const plus = await page.$('button[aria-label="Increase quantity"]')
  for (let i = 0; i < 4; i++) await plus.click()
  const qty1 = await readQty()
  log(`  quantity ${qty0} -> ${qty1}`)
  if (Number(qty1) !== Number(qty0) + 4) fail('quantity stepper did not increment')
  else log('  PASS stepper works')

  // price should have grown
  const priceText = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('p'))
    return els.map((e) => e.textContent.trim()).find((t) => /^₹[\d,]+$/.test(t)) || null
  })
  log('  estimated price shown:', priceText)
  if (!priceText) fail('no estimated price rendered')
  else log('  PASS price renders')

  // fill details
  await typeInto(page, 'Full Name', 'Aarav Sharma')
  await typeInto(page, 'Email', 'aarav@college.edu')
  await typeInto(page, 'Phone', '9876543210')
  await typeInto(page, 'College', 'ABC University')

  // upload a real file
  const fileInput = await page.$('input[type="file"]')
  if (!fileInput) fail('no file input found')
  else {
    await fileInput.uploadFile(path.join(TMP, 'my-brief.pdf'))
    await new Promise((r) => setTimeout(r, 1400))
    const hasFile = await page.evaluate(() => document.body.innerText.includes('my-brief.pdf'))
    if (!hasFile) fail('uploaded file not listed')
    else log('  PASS uploaded file appears in list')
  }

  // instructions
  await typeInto(page, 'Special Instructions', 'Pastel theme, 12 slides please.')

  await page.screenshot({ path: path.join(SHOTS, 'order-filled.png'), fullPage: true })

  // submit
  const submitBtn = await page.$('button[type="submit"]')
  await submitBtn.click()
  await new Promise((r) => setTimeout(r, 2500))
  url = page.url()
  log('  after order submit ->', url)
  if (!url.includes('/payment')) fail(`order submit did not reach /payment (got ${url})`)
  else log('  PASS reached /payment')

  // ---------------------------------------------------------------- PAYMENT
  log('\n[3] PAYMENT')
  await new Promise((r) => setTimeout(r, 800))
  const payText = await page.evaluate(() => document.body.innerText)
  if (!payText.includes('Order Summary')) fail('payment page missing Order Summary')
  else log('  PASS Order Summary visible')
  if (!payText.includes('Final Amount')) fail('payment page missing Final Amount')
  else log('  PASS Final Amount visible')

  /*
   * Regression guard: the order is already stored with tax and any discount
   * applied, so the payable figure must equal the stored order amount exactly.
   * The payment screen used to subtract the discount a second time.
   */
  const money = (s) => Number(String(s).replace(/[^\d.]/g, ''))
  const quoteCheck = await page.evaluate(() => {
    const orders = JSON.parse(localStorage.getItem('sistara:orders') || '[]')
    const headline = document.querySelector('main, section')
    const text = document.body.innerText
    // "Final Amount" is followed by the amount on the same summary block
    const m = text.match(/Final Amount\s*₹\s*([\d,]+)/)
    return {
      stored: orders[0]?.amount ?? null,
      snapshotTotal: orders[0]?.price?.total ?? null,
      displayed: m ? Number(m[1].replace(/,/g, '')) : null,
      payLabel: Array.from(document.querySelectorAll('button'))
        .map((b) => b.textContent.trim())
        .find((t) => t.startsWith('Pay ₹')) || null,
      hasHeadline: !!headline,
    }
  })

  if (quoteCheck.stored == null) fail('could not read the stored order from localStorage')
  else if (quoteCheck.displayed == null) fail('could not read the Final Amount from the payment page')
  else {
    log(`    stored=${quoteCheck.stored} snapshot=${quoteCheck.snapshotTotal} shown=${quoteCheck.displayed}`)
    if (quoteCheck.snapshotTotal != null && quoteCheck.snapshotTotal !== quoteCheck.stored) {
      fail(`quote snapshot (${quoteCheck.snapshotTotal}) disagrees with order amount (${quoteCheck.stored})`)
    } else log('  PASS quote snapshot matches the stored order amount')

    if (quoteCheck.displayed !== quoteCheck.stored) {
      fail(`Final Amount ${quoteCheck.displayed} != stored order amount ${quoteCheck.stored} (double discount?)`)
    } else log('  PASS Final Amount equals the stored order amount (no double discount)')

    const payAmount = quoteCheck.payLabel ? money(quoteCheck.payLabel) : null
    if (payAmount !== quoteCheck.stored) {
      fail(`Pay button charges ${payAmount} but the order is ${quoteCheck.stored}`)
    } else log('  PASS Pay button charges exactly the order amount')
  }

  for (const m of ['UPI', 'Card', 'Net Banking']) {
    if (!payText.includes(m)) fail(`payment option missing: ${m}`)
  }
  log('  PASS all 3 payment methods listed')

  // switch method
  const cardBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('button[role="radio"]')).find((b) =>
      b.textContent.includes('Card'),
    ),
  )
  await cardBtn.asElement().click()
  await new Promise((r) => setTimeout(r, 600))
  const switched = await page.evaluate(() => document.body.innerText.includes('Card Number'))
  if (!switched) fail('switching to Card did not reveal card fields')
  else log('  PASS method switch reveals fields')

  // back to UPI and pay
  const upiBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('button[role="radio"]')).find((b) =>
      b.textContent.includes('UPI'),
    ),
  )
  await upiBtn.asElement().click()
  await new Promise((r) => setTimeout(r, 500))

  await page.screenshot({ path: path.join(SHOTS, 'payment.png'), fullPage: true })

  const payBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim().startsWith('Pay ₹')),
  )
  if (!payBtn.asElement()) {
    fail('Pay button not found')
  } else {
    await payBtn.asElement().click()
    await new Promise((r) => setTimeout(r, 4000))
    url = page.url()
    log('  after pay ->', url)
    if (!url.includes('/order-success')) fail(`payment did not reach success (got ${url})`)
    else log('  PASS reached /order-success')

    const successText = await page.evaluate(() => document.body.innerText)
    for (const phrase of ['Yay! Your order is confirmed!', 'Thank you for choosing SISTARA', 'View My Order', 'Back to Home']) {
      if (!successText.includes(phrase)) fail(`success page missing: "${phrase}"`)
    }
    log('  PASS success page content complete')
    await page.screenshot({ path: path.join(SHOTS, 'success.png'), fullPage: true })
  }

  // ---------------------------------------------------------------- ORDERS
  log('\n[4] MY ORDERS + TRACKING')
  await page.goto(`${BASE}/my-orders`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1500))
  const ordersText = await page.evaluate(() => document.body.innerText)
  if (!/SIST-[A-Z0-9]{6}/.test(ordersText)) fail('order ID not shown in My Orders')
  else log('  PASS order ID visible')
  if (!ordersText.includes('Confirmed')) fail('status badge missing')
  else log('  PASS status badge visible')

  const trackBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Track Order'),
    ),
  )
  if (!trackBtn.asElement()) fail('Track Order button missing')
  else {
    await trackBtn.asElement().click()
    await new Promise((r) => setTimeout(r, 1200))
    const modal = await page.evaluate(() => document.body.innerText.includes('Order Progress'))
    if (!modal) fail('order tracker did not open')
    else log('  PASS order tracker opens')
    await page.screenshot({ path: path.join(SHOTS, 'orders.png'), fullPage: true })
  }

  // ---------------------------------------------------------------- LOGOUT
  log('\n[5] LOGOUT GUARD')
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1000))
  const loggedIn = page.url().includes('/dashboard')
  if (!loggedIn) fail('lost session after navigation — session should persist')
  else log('  PASS session persists across navigation')

  // ---------------------------------------------------------------- SUMMARY
  log('\n' + '='.repeat(64))
  if (consoleErrors.length) {
    log(`CONSOLE ERRORS (${consoleErrors.length}):`)
    ;[...new Set(consoleErrors)].slice(0, 6).forEach((e) => log('  ! ' + e.slice(0, 220)))
    problems.push(`${consoleErrors.length} console error(s)`)
  } else {
    log('No console errors during the whole flow.')
  }

  if (problems.length) {
    log(`\n${problems.length} PROBLEM(S):`)
    problems.forEach((p) => log(' - ' + p))
    process.exitCode = 1
  } else {
    log('\nFULL ORDER JOURNEY PASSED.')
  }

  await browser.close()
}

run().catch((e) => {
  console.error('HARNESS CRASHED:', e.message)
  process.exitCode = 1
})
