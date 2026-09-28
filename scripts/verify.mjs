/* Temporary verification harness — not part of the app bundle. */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'

const ROUTES = [
  '/', '/services', '/how-it-works', '/contact', '/order',
  '/login', '/signup', '/dashboard', '/my-orders', '/profile', '/payment',
]

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
}

const problems = []

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    for (const route of ROUTES) {
      const page = await browser.newPage()
      await page.setViewport(vp)
      const logs = []

      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') {
          logs.push(`[${m.type()}] ${m.text()}`)
        }
      })
      page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
      page.on('requestfailed', (r) =>
        logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`),
      )

      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 700))

      // Horizontal overflow check — the #1 mobile layout bug.
      const overflow = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        offenders: Array.from(document.querySelectorAll('body *'))
          .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 2)
          .slice(0, 4)
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`),
      }))

      // Broken images
      const brokenImgs = await page.evaluate(() =>
        Array.from(document.images)
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.src),
      )

      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('root')
        return { chars: root?.innerText?.trim().length ?? 0, height: root?.scrollHeight ?? 0 }
      })

      const issues = []
      if (logs.length) issues.push(`console: ${logs.slice(0, 3).join(' | ')}`)
      if (overflow.scrollW > overflow.clientW + 2)
        issues.push(`H-OVERFLOW ${overflow.scrollW}>${overflow.clientW} :: ${overflow.offenders.join(', ')}`)
      if (brokenImgs.length) issues.push(`BROKEN IMG: ${brokenImgs.join(', ')}`)
      if (hasContent.chars < 40) issues.push(`EMPTY PAGE (${hasContent.chars} chars)`)

      const tag = `${vpName.padEnd(7)} ${route.padEnd(15)}`
      if (issues.length) {
        problems.push(`${tag} :: ${issues.join(' ;; ')}`)
        console.log(`FAIL ${tag} :: ${issues.join(' ;; ')}`)
      } else {
        console.log(`ok   ${tag} (${hasContent.chars} chars)`)
      }
      await page.close()
    }
  }

  await browser.close()

  console.log(`\n${'='.repeat(70)}`)
  if (problems.length) {
    console.log(`FOUND ${problems.length} PROBLEM(S):`)
    problems.forEach((p) => console.log(` - ${p}`))
    process.exitCode = 1
  } else {
    console.log('ALL ROUTES CLEAN — no console errors, no overflow, no broken images.')
  }
}

run().catch((e) => {
  console.error('HARNESS CRASHED:', e.message)
  process.exitCode = 1
})
