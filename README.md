# SISTARA — Zero Fault

**Your Ideas, Our Creativity.**

A cute, pastel, fully responsive ordering website for a student creative studio:
services, ordering with file uploads, authentication, a dashboard, a demo
checkout and a success/tracking flow.

Built with **React 18 + Vite 6 + Tailwind CSS 3 + React Router 6 + Framer Motion**.

---

## Quick start

```bash
npm install
npm run dev
```

Then open **<http://localhost:5173/>**.

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the dev server on port 5173 (hot reload)     |
| `npm run build`     | Production build into `dist/`                      |
| `npm run preview`   | Serve the production build locally                 |
| `npm run lint`      | ESLint over the whole project                      |
| `npm test`          | Pricing unit tests (76 assertions, no framework)   |

Requires **Node 18+**.

---

## Project structure

```
src/
  config/
    services.js        8 services: copy, pricing, units, turnaround
    siteConfig.js      brand, contact, deadlines, statuses, payment + upload settings
  lib/
    pricing.js         calculateQuote() + quoteLines() — the single source of price truth
    storage.js         namespaced localStorage with an in-memory fallback
    utils.js           formatting, cn(), id generation
    env.js             reads VITE_* variables
  services/
    authService.js     demo auth  → swap for Supabase
    orderService.js    demo orders → swap for your API / Supabase
    paymentService.js  demo checkout → swap for Razorpay
    storageService.js  demo uploads → swap for Supabase Storage
  context/
    AuthContext.jsx    current user, login/logout/update
    OrderContext.jsx   order draft, live pricing, order lifecycle
  components/
    auth/  brand/  dashboard/  decor/  home/  layout/  order/  payment/  success/  ui/
  pages/               one file per route
test/
  pricing.test.mjs     pure-Node pricing tests
```

### Data flow

```
page  →  context  →  service  →  storage (localStorage in demo mode)
```

Every service exposes the same signatures it will keep when a real backend is
wired in, so screens do not change — only the service method bodies do.

---

## How pricing works

`src/lib/pricing.js` is the only place prices are computed:

```
base     = service.basePrice
extras   = (quantity - minQuantity) * perUnitPrice
rush     = round(base * (deadlineMultiplier - 1))   # negative for relaxed deadlines
subtotal = base + rush + extras
discount = round(subtotal * discountPercent / 100)
tax      = round((subtotal - discount) * taxRatePercent / 100)
total    = subtotal - discount + tax
```

Two rules worth keeping if you edit this:

1. **`order.amount` is the only payable figure.** It is computed once, at order
   creation. The order also stores an immutable `price` snapshot so the payment
   screen shows the same line items the student agreed to. Never re-apply a
   discount to `order.amount` — that double-charges.
2. **A relaxed deadline is a negative `rush`, not a hidden fee.** It renders as
   a "Relaxed-rate saving" line so the total is never quietly lower than the
   sum of what's displayed.

Edit prices in `src/config/services.js` and tax/discount in
`src/config/siteConfig.js`. Nothing else needs to change.

---

## Demo behaviour

| Area      | Demo implementation                          | Going live                                            |
| --------- | -------------------------------------------- | ----------------------------------------------------- |
| Auth      | localStorage, SHA-256 password               | `authService` → Supabase `signUp` / `signIn`         |
| Orders    | localStorage, seeded on first login          | `orderService` → your API or Supabase table           |
| Files     | validated in memory, metadata persisted only | `storageService` → private Supabase Storage bucket    |
| Payments  | simulated round-trip, fake reference         | `paymentService` → Razorpay Checkout (server-made order) |

Demo data is namespaced under `sistara:*` in localStorage. Clear those keys to
reset. Passwords are hashed only to avoid storing plaintext in the browser —
this is **not** real authentication, and there are **no live credentials in
this repo**.

### Supabase Storage note

The bucket path is `<userId>/<orderId>/<bucketKey>/<fileName>`, where `bucketKey`
is `requirements` or `references`. Bucket tags are held in a `WeakMap` rather
than written onto the `File` object, because `File` properties are prototype
getters and host objects should not be mutated.

### Razorpay note

The Razorpay **secret** key must never reach the browser. Create the order on
your server and pass only the order id plus a publishable key id
(`VITE_RAZORPAY_KEY_ID`) to the client.

---

## Environment

Copy `.env.example` to `.env`. Every variable is optional — the app runs with
sensible demo defaults when none are set.

| Variable                 | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key               |
| `VITE_PAYMENT_PROVIDER`  | `demo` (default) or `razorpay`           |
| `VITE_RAZORPAY_KEY_ID`   | Razorpay **publishable** key id          |

---

## Replacing the branding

The logo and mascot are swappable. Drop real files into
`public/assets/brand/` and point `siteConfig.brandAssets` at them:

```js
brandAssets: {
  logo: '/assets/brand/logo.png',
  mascot: '/assets/brand/mascot.png',
  favicon: '/assets/brand/favicon.svg',
}
```

`src/components/brand/Logo.jsx` and `Mascot.jsx` render the image when a path is
set and fall back to an inline SVG wordmark/mascot when it is `null`, so the
layout never breaks while assets are being prepared.

Brand copy lives in `src/config/siteConfig.js`; services and prices in
`src/config/services.js`.

---

## Accessibility & responsiveness

- Verified at 1440px and 390px with no horizontal overflow.
- Interactive targets are at least 40px tall on mobile.
- Mobile navigation collapses to an accessible hamburger menu.
- Focus-visible rings, labelled form fields and `aria-hidden` decorative marks.
- Status is never conveyed by colour alone — every badge has a label.

---

## Verification

```bash
npm test        # pricing maths
npm run lint    # ESLint
npm run build   # production build
```

The browser-driven checks used during development (`verify*.mjs`) require
`puppeteer-core` and a local Chrome install, and are not part of the app
bundle or the default scripts.
