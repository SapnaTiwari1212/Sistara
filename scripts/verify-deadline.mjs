/* Confirms the deadline-driven price lines render correctly in the order form. */
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:5173'
const problems = []
const notes = []

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1100 })

  // Seed a session so /order is reachable.
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const email = `deadline${Date.now()}@test.dev`
    localStorage.setItem(
      'sistara:session',
      JSON.stringify({ id: 'u_test', email, name: 'Test Student' }),
    )
  })

  await page.goto(`${BASE}/order?service=creative-ppt`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))

  const readSummary = () =>
    page.evaluate(() => {
      const aside = Array.from(document.querySelectorAll('aside')).find((a) =>
        a.innerText.includes('Estimated Price'),
      )
      if (!aside) return null
      const text = aside.innerText
      // The total is the largest rupee figure on the card.
      const amounts = (text.match(/₹\s*([\d,]+)/g) || []).map((s) =>
        Number(s.replace(/[^\d]/g, '')),
      )
      return {
        text,
        total: amounts.length ? Math.max(...amounts) : null,
        hasRush: text.includes('Rush delivery'),
        hasSaving: text.includes('Relaxed-rate saving'),
      }
    })

  const setDeadline = async (value) => {
    const ok = await page.evaluate((v) => {
      // Pick the deadline select specifically — the first <select> on the page
      // is the service picker.
      const select = Array.from(document.querySelectorAll('select')).find((s) =>
        Array.from(s.options).some((o) => o.value === '24h'),
      )
      if (!select) return false
      // React tracks the value node, so use the native setter then fire change.
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      ).set
      setter.call(select, v)
      select.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }, value)
    if (!ok) problems.push('deadline <select> not found')
    await new Promise((r) => setTimeout(r, 800))
    return readSummary()
  }

  const standard = await readSummary()
  notes.push(`3d  total ₹${standard?.total}  rush=${standard?.hasRush} saving=${standard?.hasSaving}`)
  if (standard?.hasRush) problems.push('3d should not show a rush line')
  if (standard?.hasSaving) problems.push('3d should not show a relaxed saving')
  if (!(standard?.total > 0)) problems.push('3d total missing')

  const rush = await setDeadline('24h')
  notes.push(`24h total ₹${rush?.total}  rush=${rush?.hasRush} saving=${rush?.hasSaving}`)
  if (!rush?.hasRush) problems.push('24h should show "Rush delivery"')
  if (!(rush?.total > standard.total)) {
    problems.push(`24h (${rush?.total}) should cost more than 3d (${standard.total})`)
  }

  const relaxed = await setDeadline('7d')
  notes.push(`7d  total ₹${relaxed?.total}  rush=${relaxed?.hasRush} saving=${relaxed?.hasSaving}`)
  if (!relaxed?.hasSaving) problems.push('7d should show "Relaxed-rate saving"')
  if (relaxed?.hasRush) problems.push('7d should not show a rush line')
  if (!(relaxed?.total < standard.total)) {
    problems.push(`7d (${relaxed?.total}) should cost less than 3d (${standard.total})`)
  }

  const five = await setDeadline('5d')
  notes.push(`5d  total ₹${five?.total}  saving=${five?.hasSaving}`)
  if (!five?.hasSaving) problems.push('5d should show "Relaxed-rate saving"')
  if (!(five?.total < standard.total)) {
    problems.push(`5d (${five?.total}) should cost less than 3d (${standard.total})`)
  }

  await page.screenshot({ path: '.tmp-verify/shots/deadline-relaxed.png', fullPage: true })

  await browser.close()
  notes.forEach((n) => console.log('  ' + n))
  console.log('\n' + '='.repeat(60))
  if (problems.length) {
    problems.forEach((p) => console.log(' - ' + p))
    process.exitCode = 1
  } else {
    console.log('DEADLINE PRICING UI OK')
  }
}

run().catch((e) => {
  console.error('CRASH:', e.message)
  process.exitCode = 1
})
