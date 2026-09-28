/**
 * SISTARA backend integration tests.
 * Run with `npm test` inside backend/ — uses the `sistara_test` database.
 *
 * Runs as a plain node script (no test-runner dependency): executes each
 * scenario sequentially, prints PASS/FAIL, and exits non-zero on failure.
 */

process.env.NODE_ENV = 'test'

import { connectDB, disconnectDB } from '../config/db.js'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Order } from '../models/Order.js'
import { Payment } from '../models/Payment.js'

let base = ''
let server = null
let passed = 0
let failed = 0

const main = async () => {
  await connectDB()
  const app = createApp()
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${server.address().port}`

  const scenarios = [
    ['GET /api/health reports ok + connected db', testHealth],
    ['register returns token + safe user (no hash anywhere)', testRegisterSafe],
    ['register lowercases + trims the email', testRegisterNormalizes],
    ['register rejects bad input', testRegisterBad],
    ['register rejects a duplicate email with 409', testRegisterDuplicate],
    ['login succeeds with valid credentials and fails otherwise', testLogin],
    ['/api/auth/me requires a valid token', testMe],
    ['create order returns a server-quoted order (amount authoritative)', testCreateOrder],
    ['create order rejects bad service / quantity / deadline', testCreateOrderBad],
    ['orders are private to their owner, newest first', testOrderPrivacy],
    ["owner can advance their own order status", testOwnerStatus],
    ["non-owner cannot change someone else's status (403)", testStatusForbidden],
    ['admin can see all orders and change any status', testAdminPowers],
    ['create payment -> initiated, amount must match the order', testCreatePayment],
    ['create payment rejects non-pending and non-owned orders', testPaymentRejects],
    ['protected routes reject missing tokens', testAuthRequired],
    ['unknown api routes return a json 404', testNotFound],
  ]

  for (const [name, fn] of scenarios) {
    await User.deleteMany({})
    await Order.deleteMany({})
    await Payment.deleteMany({})
    try {
      await fn()
      passed += 1
      console.log(`PASS  ${name}`)
    } catch (err) {
      failed += 1
      console.log(`FAIL  ${name}`)
      console.log(`      ${err && err.stack ? err.stack.split('\n').slice(0, 3).join('\n      ') : err}`)
    }
  }

  await new Promise((resolve) => server.close(resolve))
  await disconnectDB()

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const request = async (method, path, { token, body } = {}) => {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(base + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

const register = async (overrides = {}) => {
  const payload = {
    name: 'Aarav Sharma',
    email: 'aarav@sistara.test',
    phone: '9876543210',
    password: 'Sistara@2026',
    ...overrides,
  }
  const res = await request('POST', '/api/auth/register', { body: payload })
  return { res, payload }
}

const orderPayload = (overrides = {}) => ({
  serviceId: 'creative-ppt',
  quantity: 10,
  deadline: '3d',
  instructions: 'Keep the pastel theme consistent.',
  requirements: [{ name: 'brief.pdf', size: 248000, type: 'application/pdf' }],
  ...overrides,
})

const assert = (cond, message) => {
  if (!cond) throw new Error(message || 'assertion failed')
}

/* ------------------------------------------------------------------ */
/* scenarios                                                           */
/* ------------------------------------------------------------------ */

const testHealth = async () => {
  const { status: s, data } = await request('GET', '/api/health')
  assert(s === 200, `health status ${s}`)
  assert(data.status === 'ok', 'health status not ok')
  assert(data.db === 'connected', `db state ${data.db}`)
}

const testRegisterSafe = async () => {
  const { res, payload } = await register()
  assert(res.status === 201, `register status ${res.status}`)
  assert(res.data.token, 'no token')
  assert(res.data.user.email === payload.email, 'email mismatch')
  assert(res.data.user.name === payload.name, 'name mismatch')
  assert(res.data.user.role === 'user', `role ${res.data.user.role}`)
  assert(res.data.user.phone === payload.phone, 'phone mismatch')
  const raw = JSON.stringify(res.data)
  assert(!raw.includes('passwordHash'), 'passwordHash leaked')
  assert(!raw.includes('password'), 'password leaked')
}

const testRegisterNormalizes = async () => {
  const { res } = await register({ email: '  Aarav@Test.com ' })
  assert(res.status === 201, `status ${res.status}`)
  assert(res.data.user.email === 'aarav@test.com', `email ${res.data.user.email}`)
}

const testRegisterBad = async () => {
  for (const bad of [{ name: 'X' }, { email: 'not-an-email' }, { phone: '123' }, { password: 'short' }]) {
    const { res } = await register(bad)
    assert(res.status === 400, `expected 400 for ${JSON.stringify(bad)}, got ${res.status}`)
  }
}

const testRegisterDuplicate = async () => {
  await register()
  const { res } = await register()
  assert(res.status === 409, `duplicate status ${res.status}`)
}

const testLogin = async () => {
  await register({ email: 'login@sistara.test' })

  const wrong = await request('POST', '/api/auth/login', {
    body: { email: 'login@sistara.test', password: 'WrongPass123' },
  })
  assert(wrong.status === 401, `wrong password ${wrong.status}`)

  const unknown = await request('POST', '/api/auth/login', {
    body: { email: 'ghost@sistara.test', password: 'Sistara@2026' },
  })
  assert(unknown.status === 401, `unknown email ${unknown.status}`)

  const ok = await request('POST', '/api/auth/login', {
    body: { email: 'login@sistara.test', password: 'Sistara@2026' },
  })
  assert(ok.status === 200, `login ${ok.status}`)
  assert(ok.data.token, 'no token')
  assert(ok.data.user.email === 'login@sistara.test', 'email mismatch')
}

const testMe = async () => {
  const none = await request('GET', '/api/auth/me')
  assert(none.status === 401, `no token ${none.status}`)

  const garbage = await request('GET', '/api/auth/me', { token: 'not.a.real.token' })
  assert(garbage.status === 401, `garbage token ${garbage.status}`)

  const { res } = await register({ email: 'me@sistara.test' })
  const me = await request('GET', '/api/auth/me', { token: res.data.token })
  assert(me.status === 200, `me ${me.status}`)
  assert(me.data.user.email === 'me@sistara.test', 'me email mismatch')
}

const testCreateOrder = async () => {
  const { res } = await register({ email: 'order@sistara.test' })
  const token = res.data.token

  const { status, data } = await request('POST', '/api/orders', { token, body: orderPayload() })
  assert(status === 201, `create order ${status}`)
  const order = data.order
  assert(/^SIST-[A-Z2-9]{6}$/.test(order.orderId), `orderId ${order.orderId}`)
  assert(order.serviceName === 'Creative PPTs', `serviceName ${order.serviceName}`)
  assert(order.status === 'Pending', `status ${order.status}`)
  assert(order.quantity === 10, `quantity ${order.quantity}`)
  assert(order.amount === 139, `amount=${order.amount} (expected 139: 99 base + 5x8 extras)`)
  assert(order.price.total === order.amount, 'price.total !== amount')
  assert(order.deliveryDate, 'no deliveryDate')
}

const testCreateOrderBad = async () => {
  const { res } = await register({ email: 'orderbad@sistara.test' })
  const token = res.data.token

  for (const body of [
    orderPayload({ serviceId: 'made-up' }),
    orderPayload({ quantity: 0 }),
    orderPayload({ quantity: 5000 }),
    orderPayload({ deadline: 'forever' }),
  ]) {
    const { status } = await request('POST', '/api/orders', { token, body })
    assert(status === 400, `expected 400 for ${JSON.stringify(body)}, got ${status}`)
  }
}

const testOrderPrivacy = async () => {
  const a = await register({ email: 'aaa@sistara.test' })
  const b = await register({ email: 'bbb@sistara.test' })

  await request('POST', '/api/orders', { token: a.res.data.token, body: orderPayload() })
  await request('POST', '/api/orders', { token: a.res.data.token, body: orderPayload({ quantity: 12 }) })
  await request('POST', '/api/orders', { token: b.res.data.token, body: orderPayload() })

  const mine = await request('GET', '/api/orders', { token: a.res.data.token })
  assert(mine.status === 200, `mine ${mine.status}`)
  assert(mine.data.orders.length === 2, `mine count ${mine.data.orders.length}`)
  assert(
    new Date(mine.data.orders[0].createdAt) >= new Date(mine.data.orders[1].createdAt),
    'not newest first',
  )

  const theirs = await request('GET', '/api/orders', { token: b.res.data.token })
  assert(theirs.data.orders.length === 1, `theirs count ${theirs.data.orders.length}`)

  const otherOrderId = mine.data.orders[0].id
  const peek = await request('GET', `/api/orders/${otherOrderId}`, { token: b.res.data.token })
  assert(peek.status === 404, `cross-user peek ${peek.status} (should be 404)`)

  const missing = await request('GET', '/api/orders/665e00000000000000000000', {
    token: a.res.data.token,
  })
  assert(missing.status === 404, `missing order ${missing.status}`)
}

const testOwnerStatus = async () => {
  const { res } = await register({ email: 'status@sistara.test' })
  const token = res.data.token
  const created = await request('POST', '/api/orders', { token, body: orderPayload() })
  const orderId = created.data.order.id

  const ok = await request('PATCH', `/api/orders/${orderId}/status`, { token, body: { status: 'Confirmed' } })
  assert(ok.status === 200, `owner status update ${ok.status}`)
  assert(ok.data.order.status === 'Confirmed', `status ${ok.data.order.status}`)

  const same = await request('PATCH', `/api/orders/${orderId}/status`, { token, body: { status: 'Confirmed' } })
  assert(same.status === 400, `same status ${same.status}`)

  const invalid = await request('PATCH', `/api/orders/${orderId}/status`, { token, body: { status: 'Shipped' } })
  assert(invalid.status === 400, `invalid status ${invalid.status}`)
}

const testStatusForbidden = async () => {
  const a = await register({ email: 'owner@sistara.test' })
  const b = await register({ email: 'intruder@sistara.test' })
  const created = await request('POST', '/api/orders', { token: a.res.data.token, body: orderPayload() })
  const denied = await request('PATCH', `/api/orders/${created.data.order.id}/status`, {
    token: b.res.data.token,
    body: { status: 'Completed' },
  })
  assert(denied.status === 403, `non-owner status ${denied.status}`)
}

const testAdminPowers = async () => {
  const user = await register({ email: 'student@sistara.test' })
  const admin = await register({ email: 'admin@sistara.test' })
  await User.updateOne({ email: 'admin@sistara.test' }, { role: 'admin' })
  const login = await request('POST', '/api/auth/login', {
    body: { email: 'admin@sistara.test', password: 'Sistara@2026' },
  })
  const adminToken = login.data.token

  const created = await request('POST', '/api/orders', { token: user.res.data.token, body: orderPayload() })
  const orderId = created.data.order.id

  const all = await request('GET', '/api/orders', { token: adminToken })
  assert(all.status === 200, `admin list ${all.status}`)
  assert(all.data.orders.length === 1, `admin sees ${all.data.orders.length} orders`)

  const changed = await request('PATCH', `/api/orders/${orderId}/status`, {
    token: adminToken,
    body: { status: 'Ready' },
  })
  assert(changed.status === 200, `admin status ${changed.status}`)
  assert(changed.data.order.status === 'Ready', `status ${changed.data.order.status}`)
}

const testCreatePayment = async () => {
  const { res } = await register({ email: 'pay@sistara.test' })
  const token = res.data.token
  const created = await request('POST', '/api/orders', { token, body: orderPayload() })
  const order = created.data.order

  const pay = await request('POST', '/api/payments/create', {
    token,
    body: { orderId: order.id, method: 'upi' },
  })
  assert(pay.status === 201, `pay ${pay.status}`)
  assert(/^PAY-[A-Z2-9]{8}$/.test(pay.data.payment.paymentRef), `ref ${pay.data.payment.paymentRef}`)
  assert(pay.data.payment.status === 'initiated', `status ${pay.data.payment.status}`)
  assert(pay.data.payment.amount === order.amount, 'amount mismatch')
  assert(pay.data.payment.currency === 'INR', 'currency')

  const raw = JSON.stringify(pay.data).toLowerCase()
  for (const forbidden of ['cardnumber', 'cvv', 'upipin', 'password', 'gatewaysecret']) {
    assert(!raw.includes(forbidden), `leaked ${forbidden}`)
  }

  const mismatch = await request('POST', '/api/payments/create', {
    token,
    body: { orderId: order.id, method: 'upi', amount: 1 },
  })
  assert(mismatch.status === 400, `mismatch ${mismatch.status}`)
}

const testPaymentRejects = async () => {
  const a = await register({ email: 'payer@sistara.test' })
  const b = await register({ email: 'bystander@sistara.test' })
  const created = await request('POST', '/api/orders', { token: a.res.data.token, body: orderPayload() })
  const orderId = created.data.order.id

  const notOwner = await request('POST', '/api/payments/create', {
    token: b.res.data.token,
    body: { orderId, method: 'card' },
  })
  assert(notOwner.status === 404, `not owner ${notOwner.status}`)

  await request('PATCH', `/api/orders/${orderId}/status`, { token: a.res.data.token, body: { status: 'Confirmed' } })
  const notPending = await request('POST', '/api/payments/create', {
    token: a.res.data.token,
    body: { orderId, method: 'upi' },
  })
  assert(notPending.status === 400, `not pending ${notPending.status}`)

  const badMethod = await request('POST', '/api/payments/create', {
    token: a.res.data.token,
    body: { orderId, method: 'cashapp' },
  })
  assert(badMethod.status === 400, `bad method ${badMethod.status}`)
}

const testAuthRequired = async () => {
  assert((await request('POST', '/api/orders', { body: orderPayload() })).status === 401, 'create order 401')
  assert((await request('GET', '/api/orders')).status === 401, 'list orders 401')
  assert((await request('POST', '/api/payments/create', { body: {} })).status === 401, 'create payment 401')
}

const testNotFound = async () => {
  const { status, data } = await request('GET', '/api/does-not-exist')
  assert(status === 404, `not found ${status}`)
  assert(data.message, 'no message')
}

main().catch((err) => {
  console.error('suite crashed:', err)
  process.exit(1)
})