/* Confirms the browser console is free of React Router future-flag warnings. */
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:5173'
const problems = []
const seen = []

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })

  const logs = []
  page.on('console', (m) => logs.push({ type: m.type(), text: m.text() }))
  page.on('pageerror', (e) => logs.push({ type: 'pageerror', text: String(e) }))

  // Load, then navigate client-side across every public route so any
  // router warning raised on a transition is captured too.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1500))

  for (const path of ['/services', '/how-it-works', '/contact', '/order', '/login', '/signup', '/']) {
    await page.evaluate((p) => {
      const a = document.querySelector(`a[href="${p}"]`)
      if (a) a.click()
    }, path)
    await new Promise((r) => setTimeout(r, 900))
  }

  // Also hit them by URL (full loads).
  for (const path of ['/services', '/how-it-works', '/order', '/signup']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 700))
  }

  const futureFlag = logs.filter((l) => /Future Flag Warning/i.test(l.text))
  // Only genuine warnings/errors. Vite's "[vite] connecting..." comes through as
  // type "debug" and is dev-only noise, not a problem.
  const realIssues = logs.filter(
    (l) => ['warning', 'error', 'pageerror'].includes(l.type) && !/React DevTools/i.test(l.text),
  )
  const devtools = logs.filter((l) => /React DevTools/i.test(l.text))

  console.log(`total console messages: ${logs.length}`)
  console.log(`future-flag warnings:   ${futureFlag.length}`)
  console.log(`devtools nudge:         ${devtools.length} (informational, not an error)`)
  console.log(`real warnings/errors:   ${realIssues.length}`)

  if (futureFlag.length) {
    futureFlag.forEach((l) => console.log('  FLAG: ' + l.text.slice(0, 160)))
    problems.push(`${futureFlag.length} React Router future-flag warning(s) still present`)
  }
  realIssues.forEach((l) => console.log(`  ${l.type}: ${l.text.slice(0, 160)}`))
  if (realIssues.length) problems.push(`${realIssues.length} real warning/error message(s)`)

  await browser.close()

  console.log('\n' + '='.repeat(60))
  if (problems.length) {
    problems.forEach((p) => console.log(' - ' + p))
    process.exitCode = 1
  } else {
    console.log('CONSOLE CLEAN — no router warnings, no errors')
  }
}

run().catch((e) => {
  console.error('CRASH:', e.message)
  process.exitCode = 1
})
