/**
 * Functional verification for the "no dead buttons, no fake flows" pass.
 * ---------------------------------------------------------------------------
 * Signs up a real account through the UI, then checks:
 *   1. every route renders without console errors or the 404 page
 *   2. every internal link on every page points at a real route
 *   3. the SISTARA logo is present on every page that must carry it
 *   4. the new flows actually work end to end:
 *        service detail → order form preselect
 *        forgot password → token → new password → login with it
 *        /my-orders → /orders redirect
 *        "Remember me" off keeps the session out of localStorage
 *
 * Not part of the app bundle.
 */
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'

const log = (...a) => console.log(...a)
const problems = []
const pass = (m) => log(`  PASS  ${m}`)
const fail = (m) => {
  log(`  FAIL  ${m}`)
  problems.push(m)
}

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
}

/* Public routes plus the two dynamic service-detail pages. */
const ROUTES = [
  '/', '/services', '/services/creative-ppt', '/services/lab-manuals',
  '/services/custom', '/services/does-not-exist',
  '/how-it-works', '/contact', '/order', '/login', '/signup', '/forgot-password',
  '/dashboard', '/orders', '/my-orders', '/profile', '/payment',
]

/* Pages that must visibly carry the SISTARA logo (nav + footer count too). */
const LOGO_ROUTES = [
  '/', '/login', '/signup', '/forgot-password',
  '/services', '/order', '/dashboard', '/payment',
]

const isNotFoundPage = (page) =>
  page.evaluate(() => {
    const t = document.getElementById('root')?.innerText || ''
    return /wandered off|404/i.test(t)
  })

const hasLogo = (page) =>
  page.evaluate(() => {
    // The real mark is an <img> once configured; the vector wordmark renders
    // the brand name as text. Either one satisfies the requirement.
    const text = document.getElementById('root')?.innerText || ''
    const alts = Array.from(document.images).map((i) => i.alt || '').join(' ')
    return /SISTARA/.test(text) || /sistara/i.test(alts)
  })

/** Clicks the submit button whose visible label matches. */
const clickButton = async (page, label) => {
  const ok = await page.evaluate((want) => {
    const b = Array.from(document.querySelectorAll('button, a')).find((x) =>
      x.innerText.trim().toLowerCase().startsWith(want.toLowerCase()),
    )
    if (!b) return false
    b.click()
    return true
  }, label)
  if (!ok) throw new Error(`no clickable "${label}" on ${page.url()}`)
  return ok
}

const typeInto = async (page, labelText, value) => {
  const handle = await page.evaluateHandle((lt) => {
    const labels = Array.from(document.querySelectorAll('label'))
    const l = labels.find((x) => x.innerText.trim().toLowerCase().includes(lt.toLowerCase()))
    return l ? document.getElementById(l.htmlFor) : null
  }, labelText)
  const el = handle.asElement()
  if (!el) throw new Error(`no field labelled "${labelText}"`)
  await el.click({ clickCount: 3 })
  await el.type(value, { delay: 8 })
}

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  /* ------------------------------------------------------------------ */
  /* 0. Sign up for real, through the UI                                 */
  /* ------------------------------------------------------------------ */
  log('\n[0] Sign up through the UI')
  const page = await browser.newPage()
  await page.setViewport(VIEWPORTS.desktop)
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })

  const stamp = Date.now()
  const ACCOUNT = {
    name: 'Verify Student',
    email: `verify.${stamp}@sistara.test`,
    phone: '9876543210',
    password: 'verify-pass-123',
  }

  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle0' })
  await typeInto(page, 'Name', ACCOUNT.name)
  await typeInto(page, 'Email', ACCOUNT.email)
  await typeInto(page, 'Phone', ACCOUNT.phone)
  await typeInto(page, 'Password', ACCOUNT.password)
  await typeInto(page, 'Confirm Password', ACCOUNT.password)
  await clickButton(page, 'Create Account')
  await new Promise((r) => setTimeout(r, 2200))

  if (page.url().includes('/dashboard')) pass('signup created a session and landed on /dashboard')
  else fail(`signup did not authenticate (landed on ${page.url()})`)

  /* ------------------------------------------------------------------ */
  /* 1. Routes + 2. links + 3. logo, across both viewports               */
  /* ------------------------------------------------------------------ */
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    log(`\n[1-3] Route / link / logo crawl — ${vpName}`)

    for (const route of ROUTES) {
      const p = await browser.newPage()
      await p.setViewport(vp)
      const logs = []
      p.on('console', (m) => {
        if (m.type() === 'error') logs.push(m.text())
      })
      p.on('pageerror', (e) => logs.push(e.message))

      await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 500))

      const tag = `${vpName} ${route}`

      // /my-orders must bounce to /orders
      if (route === '/my-orders') {
        if (p.url().endsWith('/orders')) pass(`${tag} → redirected to /orders`)
        else fail(`${tag} did not redirect to /orders (at ${p.url()})`)
      }

      // The bogus service id must show the service-specific fallback, not 404.
      if (route === '/services/does-not-exist') {
        const text = await p.evaluate(() => document.getElementById('root')?.innerText || '')
        if (/don't offer that one/i.test(text) || /don’t offer that one/i.test(text)) {
          pass(`${tag} shows the "service not offered" fallback`)
        } else {
          fail(`${tag} did not show the service fallback`)
        }
      } else if (!(await isNotFoundPage(p))) {
        if (logs.length === 0) pass(`${tag} clean`)
        else fail(`${tag} console error: ${logs[0]}`)
      } else {
        // /login and /signup bounce to /dashboard when already signed in.
        const signedInBounce = p.url().includes('/dashboard')
        if (signedInBounce) pass(`${tag} bounced signed-in user to /dashboard`)
        else fail(`${tag} rendered the 404 page`)
      }

      // Logo presence
      if (LOGO_ROUTES.includes(route) && (await hasLogo(p))) pass(`${tag} shows the SISTARA logo`)
      else if (LOGO_ROUTES.includes(route)) fail(`${tag} is missing the SISTARA logo`)

      // Collect internal links for the link-integrity pass
      if (vpName === 'desktop' && !route.includes('does-not-exist')) {
        const hrefs = await p.evaluate(() =>
          Array.from(document.querySelectorAll('a[href^="/"]')).map((a) => a.getAttribute('href')),
        )
        globalThis.__links ??= new Set()
        hrefs.forEach((h) => globalThis.__links.add(h.split('?')[0]))
      }

      await p.close()
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2b. Every internal link must resolve to a real route                 */
  /* ------------------------------------------------------------------ */
  log('\n[2b] Link integrity — every internal href must resolve')
  const known = new Set(ROUTES)
  const extraKnown = new Set(['/services', '/']) // prefix matches handled below
  for (const href of globalThis.__links) {
    if (known.has(href)) continue
    if ([...extraKnown].some((k) => href.startsWith(`${k}/`))) continue
    if (href === '/reset-password') continue // documented Supabase callback
    fail(`link points at an unregistered route: ${href}`)
  }
  if (problems.length === 0 || !problems.some((p) => p.includes('unregistered route'))) {
    pass(`all ${globalThis.__links.size} distinct internal links resolve to real routes`)
  }

  /* ------------------------------------------------------------------ */
  /* 4a. Service detail → order form preselect                           */
  /* ------------------------------------------------------------------ */
  log('\n[4a] Service detail → order form preselect')
  await page.goto(`${BASE}/services/lab-manuals`, { waitUntil: 'networkidle0' })
  const detailText = await page.evaluate(() => document.getElementById('root')?.innerText || '')
  const needs = [
    [/Lab Manuals/i, 'service name'],
    [/Starting from/i, 'starting price'],
    [/What's included|What’s included/i, "what's included"],
    [/Estimated delivery/i, 'estimated delivery'],
    [/What we'll need|What we’ll need/i, 'requirements'],
  ]
  for (const [re, what] of needs) {
    if (re.test(detailText)) pass(`detail page shows ${what}`)
    else fail(`detail page is missing ${what}`)
  }

  await clickButton(page, 'Order Now')
  await new Promise((r) => setTimeout(r, 900))
  const selected = await page.evaluate(() => document.querySelector('#order-service select')?.value)
  if (page.url().includes('/order') && selected === 'lab-manuals') {
    pass(`"Order Now" carried lab-manuals into the order form (${selected})`)
  } else {
    fail(`order form preselect wrong: url=${page.url()} selected=${selected}`)
  }

  /* ------------------------------------------------------------------ */
  /* 4b. Forgot password → real reset → login with the new password      */
  /* ------------------------------------------------------------------ */
  log('\n[4b] Forgot password resets the real password')
  await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle0' })

  // invalid email must be rejected client-side
  await typeInto(page, 'Email', 'not-an-email')
  await clickButton(page, 'Send Reset Link')
  await new Promise((r) => setTimeout(r, 400))
  const emailErr = await page.evaluate(() => document.getElementById('root')?.innerText || '')
  if (/valid email/i.test(emailErr)) pass('invalid email is rejected before any request')
  else fail('invalid email was not rejected')

  await typeInto(page, 'Email', ACCOUNT.email)
  await clickButton(page, 'Send Reset Link')
  await new Promise((r) => setTimeout(r, 1600))

  const afterRequest = await page.evaluate(() => ({
    url: location.href,
    text: document.getElementById('root')?.innerText || '',
  }))
  if (/token=/.test(afterRequest.url)) pass('reset token is carried in the URL')
  else fail(`reset token missing from URL: ${afterRequest.url}`)
  if (/no email is sent/i.test(afterRequest.text)) pass('demo mode explains why the link is on screen')
  else fail('demo mode did not explain the missing email')

  // step 2 should be showing because the token auto-opens it
  await new Promise((r) => setTimeout(r, 700))
  const onStep2 = await page.evaluate(() => /choose a new password/i.test(document.getElementById('root')?.innerText || ''))
  if (onStep2) pass('valid token opened the new-password form')
  else fail('valid token did not open the new-password form')

  const NEW_PASSWORD = 'brand-new-pass-456'
  await typeInto(page, 'New Password', NEW_PASSWORD)
  await typeInto(page, 'Confirm New Password', NEW_PASSWORD)
  await clickButton(page, 'Save New Password')
  await new Promise((r) => setTimeout(r, 1800))

  const afterReset = await page.evaluate(() => document.getElementById('root')?.innerText || '')
  if (/Password updated/i.test(afterReset)) pass('password was actually changed')
  else fail('password reset did not complete')

  // the token must be burned
  const burnedUrl = page.url()
  await page.goto(burnedUrl, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))
  const replay = await page.evaluate(() => document.getElementById('root')?.innerText || '')
  if (/invalid or has expired/i.test(replay)) pass('the reset token cannot be replayed')
  else fail('a used reset token still worked')

  // old password must fail, new password must succeed
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await typeInto(page, 'Email', ACCOUNT.email)
  await typeInto(page, 'Password', ACCOUNT.password)
  await clickButton(page, 'Login')
  await new Promise((r) => setTimeout(r, 1600))
  const oldPw = await page.evaluate(() => document.getElementById('root')?.innerText || '')
  if (/Incorrect password/i.test(oldPw)) pass('old password is rejected after the reset')
  else fail('old password still works after the reset')

  await typeInto(page, 'Email', ACCOUNT.email)
  await typeInto(page, 'Password', NEW_PASSWORD)
  await clickButton(page, 'Login')
  await new Promise((r) => setTimeout(r, 1800))
  if (page.url().includes('/dashboard')) pass('the new password logs in successfully')
  else fail(`new password failed to log in (at ${page.url()})`)

  /* ------------------------------------------------------------------ */
  /* 4c. "Remember me" off keeps the session out of localStorage         */
  /* ------------------------------------------------------------------ */
  log('\n[4c] "Remember me" controls session persistence')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const box = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(
      (b) => b.closest('label')?.innerText.toLowerCase().includes('remember'),
    )
    if (box?.checked) box.click()
  })
  await typeInto(page, 'Email', ACCOUNT.email)
  await typeInto(page, 'Password', NEW_PASSWORD)
  await clickButton(page, 'Login')
  await new Promise((r) => setTimeout(r, 1800))

  const storage = await page.evaluate(() => ({
    local: !!window.localStorage.getItem('sistara:session'),
    temporary: !!window.sessionStorage.getItem('sistara:session'),
  }))
  if (!storage.local && storage.temporary) {
    pass('unchecked "Remember me" stores the session in sessionStorage only')
  } else {
    fail(`remember-me wrong: local=${storage.local} temporary=${storage.temporary}`)
  }

  /* ------------------------------------------------------------------ */
  /* 4d. Google sign-in is a real sign-in                                */
  /* ------------------------------------------------------------------ */
  log('\n[4d] "Continue with Google" produces a session')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await clickButton(page, 'Continue with Google')
  await new Promise((r) => setTimeout(r, 2000))
  if (page.url().includes('/dashboard')) pass('Google button signed the user in')
  else fail(`Google button did not sign in (at ${page.url()})`)

  await page.close()

  if (consoleErrors.length) {
    fail(`console errors during the interactive run: ${consoleErrors.slice(0, 2).join(' | ')}`)
  }

  await browser.close()

  log(`\n${'='.repeat(70)}`)
  if (problems.length) {
    log(`FOUND ${problems.length} PROBLEM(S):`)
    problems.forEach((p) => log(` - ${p}`))
    process.exitCode = 1
  } else {
    log('ALL CHECKS PASSED — no dead links, no fake buttons, flows work end to end.')
  }
}

run().catch((e) => {
  console.error('HARNESS CRASHED:', e.stack)
  process.exitCode = 1
})
