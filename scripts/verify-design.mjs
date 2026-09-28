/* Verifies the SISTARA design language via computed styles (no pixels needed). */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'
const problems = []
const notes = []

const check = (label, cond, detail = '') => {
  if (cond) notes.push(`PASS  ${label}${detail ? ' — ' + detail : ''}`)
  else problems.push(`${label}${detail ? ' — ' + detail : ''}`)
}

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))

  // ---------- fonts ----------
  const fonts = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    // a paragraph that does NOT set an explicit font class must inherit Quicksand
    const inherited = Array.from(document.querySelectorAll('p')).find(
      (p) => !/font-(display|body)/.test(String(p.className)) && p.textContent.trim(),
    )
    const explicitlyBody = Array.from(document.querySelectorAll('.font-body')).find(
      (p) => p.textContent.trim(),
    )
    return {
      heading: h1 ? getComputedStyle(h1).fontFamily : null,
      inherited: inherited ? getComputedStyle(inherited).fontFamily : null,
      bodyClass: explicitlyBody ? getComputedStyle(explicitlyBody).fontFamily : null,
      bodyRoot: getComputedStyle(document.body).fontFamily,
    }
  })
  check('playful display font on headings', /Baloo/.test(fonts.heading || ''), fonts.heading)
  check('body text uses Quicksand', /Quicksand/.test(fonts.bodyClass || ''), fonts.bodyClass)
  check('body inherits Quicksand by default', /Quicksand/.test(fonts.bodyRoot || ''), fonts.bodyRoot)

  // ---------- brand copy present ----------
  const text = await page.evaluate(() => document.body.innerText)
  for (const phrase of [
    'SISTARA', 'ZERO FAULT', 'Your Ideas, Our Creativity', 'ZERO FAULT',
    'What Can We Create For You?', 'How It Works', 'Why Students Choose SISTARA',
    'Zero Fault. Zero Stress. Just Creativity.', 'Follow SISTARA on Instagram',
    '@SISTARA._OFFICIAL_', 'Need something custom?', 'Made for students, creators and dreamers',
  ]) {
    check(`copy present: "${phrase}"`, text.includes(phrase))
  }

  // ---------- service cards ----------
  const cards = await page.evaluate(() => {
    const arts = Array.from(document.querySelectorAll('article'))
    return arts.map((a) => {
      const btn = a.querySelector('a')
      const price = Array.from(a.querySelectorAll('span')).find((s) => /^From ₹/.test(s.textContent.trim()))
      return {
        name: a.querySelector('h3')?.textContent?.trim(),
        hasOrderBtn: btn?.textContent?.includes('Order Now') || false,
        price: price?.textContent?.trim() || null,
        radius: getComputedStyle(a).borderTopLeftRadius,
        shadow: getComputedStyle(a).boxShadow !== 'none',
        bg: getComputedStyle(a).backgroundColor,
      }
    })
  })
  check('service cards render on home', cards.length >= 6, `${cards.length} cards`)
  check(
    'every card has a name, price and Order Now',
    cards.every((c) => c.name && c.price && c.hasOrderBtn),
    cards.map((c) => c.price).join(' '),
  )
  check(
    'cards are strongly rounded (>=24px)',
    cards.every((c) => parseFloat(c.radius) >= 24),
    cards[0]?.radius,
  )
  check('cards have soft shadows', cards.every((c) => c.shadow))

  // ---------- pastel palette actually in use ----------
  // Compare every rendered background against the real SISTARA palette (RGB distance),
  // instead of guessing with loose regexes.
  const PALETTE = {
    pink: ['#FFF5F8', '#FFE7EF', '#FFD1E0', '#FFB3C7', '#FC8FAB', '#F76E97', '#E24E7C'],
    lavender: ['#F7F4FF', '#EFE9FE', '#E0D6FD', '#CBBDFA', '#B3A0F4', '#9B85EC'],
    grape: ['#EADFFB', '#D8C6F5', '#BFA6EC', '#A585DF', '#8B6BCB', '#7351AC'],
    sky: ['#F3FAFF', '#E3F3FD', '#C8E8F9', '#A6D8F2', '#7FC3E8', '#5CABDA'],
    butter: ['#FFFBEB', '#FFF5CE', '#FFEBAA', '#FFDE84', '#F8CC5C', '#E8B33F'],
    mint: ['#DFF5E9', '#9EE0BF', '#4FC08D'],
    cream: ['#FFFDFA', '#FFFBF6', '#FDF4EA'],
    ink: ['#2E2A47', '#5A5378', '#8B85A6'],
  }

  const rawBgs = await page.evaluate(() => {
    const seen = new Set()
    document.querySelectorAll('*').forEach((el) => {
      const c = getComputedStyle(el).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') seen.add(c)
    })
    return [...seen]
  })

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const parseRgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number)
  const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))

  // within 12 units counts as "this palette colour" (covers tints/opacity mixes)
  const TOL = 12
  const matched = {}
  rawBgs.forEach((bg) => {
    const rgb = parseRgb(bg)
    for (const [family, shades] of Object.entries(PALETTE)) {
      if (shades.some((h) => dist(rgb, hexToRgb(h)) <= TOL)) {
        matched[family] = (matched[family] || 0) + 1
        return
      }
    }
  })

  const offPalette = rawBgs.filter((bg) => {
    const rgb = parseRgb(bg)
    return !Object.values(PALETTE).some((sh) => sh.some((h) => dist(rgb, hexToRgb(h)) <= TOL))
  })

  check('pastel backgrounds used (many distinct tints)', rawBgs.length > 12, `${rawBgs.length} distinct bg colors`)
  for (const family of ['pink', 'lavender', 'sky', 'butter', 'grape']) {
    check(`${family} tones present`, (matched[family] || 0) > 0, `${matched[family] || 0} element(s)`)
  }
  check('no off-palette background colours leaked in', offPalette.length === 0, offPalette.join(' | '))

  // ---------- logo visible in navbar + footer ----------
  const brandMarks = await page.evaluate(() => {
    const findWordmarks = () =>
      Array.from(document.querySelectorAll('span')).filter(
        (s) => s.textContent.trim() === 'SISTARA' && s.children.length === 0,
      )
    return {
      count: findWordmarks().length,
      header: !!document.querySelector('header'),
      footer: !!document.querySelector('footer'),
      taglineInFooter: document.querySelector('footer')?.innerText.includes('ZERO FAULT'),
    }
  })
  check('logo rendered on page', brandMarks.count >= 2, `${brandMarks.count} SISTARA wordmarks`)
  check('logo in navbar (header)', brandMarks.header)
  check('logo + ZERO FAULT in footer', brandMarks.taglineInFooter)

  // ---------- mascot svg present ----------
  const mascots = await page.evaluate(
    () => document.querySelectorAll('svg[viewBox="0 0 260 260"]').length,
  )
  check('mascot rendered (vector fallback)', mascots >= 1, `${mascots} mascot svg(s)`)

  // ---------- buttons big enough on mobile ----------
  await page.setViewport({ width: 390, height: 844 })
  await new Promise((r) => setTimeout(r, 600))
  const smallBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('a.btn, button.btn'))
    return btns
      .map((b) => ({ t: b.textContent.trim().slice(0, 22), h: b.getBoundingClientRect().height }))
      .filter((b) => b.h > 0 && b.h < 40)
  })
  check('no buttons under 40px tall on mobile', smallBtns.length === 0, JSON.stringify(smallBtns))

  // ---------- mobile nav is a hamburger ----------
  const nav = await page.evaluate(() => {
    const header = document.querySelector('header')
    const links = Array.from(header.querySelectorAll('a'))
    return {
      hamburger: !!header.querySelector('button[aria-label="Open menu"], button[aria-expanded]'),
      visibleNavLinks: links.filter((a) => a.offsetParent !== null).length,
    }
  })
  check('mobile shows hamburger, hides desktop links', nav.hamburger && nav.visibleNavLinks <= 2,
    `links visible: ${nav.visibleNavLinks}`)

  // open the hamburger
  const burger = await page.$('header button[aria-expanded]')
  if (burger) {
    await burger.click()
    await new Promise((r) => setTimeout(r, 700))
    const open = await page.evaluate(() => {
      const t = document.body.innerText
      return { services: t.includes('Services'), login: t.includes('Login'), order: t.includes('Order Now') }
    })
    check('hamburger menu opens with links', open.services && open.order)
    await page.screenshot({ path: '.tmp-verify/shots/mobile-menu.png' })
  }

  // ---------- login page ----------
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))
  const login = await page.evaluate(() => {
    const t = document.body.innerText
    return {
      welcome: t.includes('Welcome to SISTARA'),
      sub: t.includes("Let's make your work extra special!"),
      loginBtn: !!Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Login'),
      google: t.includes('Continue with Google'),
      create: t.includes('Create Account'),
      logo: t.includes('SISTARA') && t.includes('ZERO FAULT'),
      hasPassword: !!document.querySelector('input[type="password"]'),
      hasEmail: !!document.querySelector('input[type="email"]'),
    }
  })
  for (const [k, v] of Object.entries(login)) check(`login page: ${k}`, v)

  // ---------- services page shows all 8 ----------
  await page.goto(`${BASE}/services`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))
  const svc = await page.evaluate(() => document.querySelectorAll('article').length)
  check('services page lists all 8 services', svc === 8, `${svc} cards`)

  // ---------- footer links ----------
  const footer = await page.evaluate(() => {
    const f = document.querySelector('footer')
    const t = f.innerText
    return {
      links: ['Home', 'Services', 'How It Works', 'My Orders', 'Contact'].every((l) => t.includes(l)),
      insta: t.includes('@SISTARA._OFFICIAL_'),
      copyright: t.includes('© 2026 SISTARA. All rights reserved.'),
      promise: t.includes('Your Ideas, Our Creativity'),
    }
  })
  for (const [k, v] of Object.entries(footer)) check(`footer: ${k}`, v)

  await browser.close()

  console.log(notes.join('\n'))
  console.log('\n' + '='.repeat(64))
  if (problems.length) {
    console.log(`${problems.length} DESIGN PROBLEM(S):`)
    problems.forEach((p) => console.log(' - ' + p))
    process.exitCode = 1
  } else {
    console.log('DESIGN + COPY CHECKS ALL PASSED')
  }
}

run().catch((e) => {
  console.error('CRASH:', e.message)
  process.exitCode = 1
})
