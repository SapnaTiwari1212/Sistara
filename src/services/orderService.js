/**
 * Order service — demo persistence, shaped like a real orders table.
 * ---------------------------------------------------------------------------
 * An order record looks like:
 * {
 *   id, userId, serviceId, serviceName, quantity, unitLabel,
 *   requirements: [{ name, size, type }],   // metadata only, never the blob
 *   instructions, deadline, notes,
 *   amount,                                  // authoritative payable figure
 *   price: { base, extras, rush, subtotal, discount, tax, total },  // quote snapshot
 *   deliveryDate, status,
 *   createdAt, paidAt, paymentRef
 * }
 *
 * TO CONNECT A BACKEND: replace the method bodies with your API/Supabase
 * calls — insert into `orders`, select by `user_id`, patch `status`.
 * The component-facing signatures do not change.
 */

import store from '../lib/storage'
import { generateOrderId } from '../lib/utils'
import { getServiceById } from '../config/services'
import { siteConfig } from '../config/siteConfig'

const ORDERS_KEY = 'orders'

/** Simulated network latency, so loading states reflect a real flow. */
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const getOrders = () => store.get(ORDERS_KEY, [])
const saveOrders = (orders) => store.set(ORDERS_KEY, orders)

/** File metadata is serialisable; File objects are intentionally dropped. */
const serialiseFiles = (files = []) =>
  files.map((f) => ({ name: f.name, size: f.size, type: f.type }))

/** Map files to their placeholder URLs once, on creation. */
const withPreviews = (files = []) =>
  files.map((f) => ({ ...f, url: f.type?.startsWith('image/') ? URL.createObjectURL(f) : null }))

export const orderService = {
  isDemo: true,

  /** All orders for a user, newest first. */
  async listByUser(userId) {
    await delay(250)
    return getOrders()
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getById(orderId) {
    await delay(200)
    return getOrders().find((o) => o.id === orderId) || null
  },

  /**
   * Creates an order in `Pending`.
   * `requirements` are uploaded as real objects by the file uploader, but only
   * their metadata is persisted so localStorage never blows its quota.
   */
  async create({
    userId,
    serviceId,
    quantity,
    requirements = [],
    references = [],
    instructions = '',
    deadline = '3d',
    notes = '',
    amount = 0,
    price = null,
    deliveryDate = null,
  }) {
    await delay(500)
    const service = getServiceById(serviceId)
    const order = {
      id: generateOrderId(),
      userId,
      serviceId,
      serviceName: service?.name || 'Custom Request',
      serviceIcon: service?.accent || 'pink',
      quantity: Number(quantity) || 1,
      unitLabel: service?.unitLabel || 'items',
      unitSingular: service?.unit || 'item',
      requirements: serialiseFiles(requirements),
      references: serialiseFiles(references),
      instructions,
      deadline,
      notes,
      amount: Number(amount) || 0,
      // Immutable snapshot of the quote the student agreed to. `amount` above is
      // always the authoritative payable figure; `price` is display-only detail.
      price: price ? { ...price, total: Number(price.total) || Number(amount) || 0 } : null,
      deliveryDate,
      status: siteConfig.orderStatuses[0],
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentRef: null,
    }
    saveOrders([order, ...getOrders()])
    return order
  },

  async updateStatus(orderId, status) {
    await delay(250)
    const orders = getOrders()
    const index = orders.findIndex((o) => o.id === orderId)
    if (index === -1) throw new Error('Order not found.')
    orders[index] = { ...orders[index], status }
    saveOrders(orders)
    return orders[index]
  },

  /** Marks an order paid and moves it to `Confirmed`. */
  async markPaid(orderId, paymentRef) {
    await delay(300)
    const orders = getOrders()
    const index = orders.findIndex((o) => o.id === orderId)
    if (index === -1) throw new Error('Order not found.')
    orders[index] = {
      ...orders[index],
      paymentRef,
      paidAt: new Date().toISOString(),
      status: siteConfig.orderStatuses[1],
    }
    saveOrders(orders)
    return orders[index]
  },

  /**
   * Demo seeding so the dashboard is never empty on a first visit.
   * Only runs once per user, and only in demo mode.
   */
  async seedIfEmpty(userId) {
    const existing = getOrders().filter((o) => o.userId === userId)
    if (existing.length > 0) return existing

    const plan = [
      { serviceId: 'creative-ppt', qty: 12, status: 'In Progress', daysAgo: 3, amount: 167 },
      { serviceId: 'bookmarks', qty: 10, status: 'Ready', daysAgo: 8, amount: 164 },
      { serviceId: 'assignments', qty: 6, status: 'Completed', daysAgo: 16, amount: 59 },
    ]

    const seeded = plan.map((item) => {
      const service = getServiceById(item.serviceId)
      const created = new Date()
      created.setDate(created.getDate() - item.daysAgo)
      const delivery = new Date(created)
      delivery.setDate(delivery.getDate() + 4)
      return {
        id: generateOrderId(),
        userId,
        serviceId: item.serviceId,
        serviceName: service?.name || 'Custom Request',
        serviceIcon: service?.accent || 'pink',
        quantity: item.qty,
        unitLabel: service?.unitLabel || 'items',
        unitSingular: service?.unit || 'item',
        requirements: [{ name: 'brief.pdf', size: 248000, type: 'application/pdf' }],
        references: [],
        instructions: 'Please keep the pastel theme consistent.',
        deadline: '3d',
        notes: '',
        amount: item.amount,
        deliveryDate: delivery.toISOString(),
        status: item.status,
        createdAt: created.toISOString(),
        paidAt: created.toISOString(),
        paymentRef: `DEMO${Math.floor(Math.random() * 900000 + 100000)}`,
      }
    })

    saveOrders([...seeded, ...getOrders()])
    return seeded
  },

  /** Exposed for the file-preview helper in the order form. */
  withPreviews,
}

export default orderService
