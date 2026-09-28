import mongoose from 'mongoose'
import { ApiError } from '../utils/apiError.js'
import { orderStatuses, serviceById, deadlines, uploadLimits } from '../config/services.js'
import { quoteFor } from '../utils/pricing.js'
import { sanitizeFileMeta, isPositiveInt } from '../utils/validators.js'
import { generateOrderId } from '../utils/id.js'
import { Order } from '../models/Order.js'

const DAYS_BY_DEADLINE = Object.fromEntries(deadlines.map((d) => [d.value, d.days]))

const findOrderOr404 = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Order not found.')
  const order = await Order.findById(id)
  if (!order) throw new ApiError(404, 'Order not found.')
  return order
}

/** Only the owner sees their orders; malformed/foreign ids look identical. */
const assertCanView = (order, user) => {
  if (user.role === 'admin') return
  if (String(order.userId) !== String(user.id)) throw new ApiError(404, 'Order not found.')
}

export const createOrder = async (req, res) => {
  const {
    serviceId,
    quantity,
    requirements,
    references,
    instructions,
    deadline,
    notes,
    deliveryDate,
  } = req.body || {}

  const service = serviceById(serviceId)
  if (!service) throw new ApiError(400, 'Unknown service.')

  const qty = Number(quantity)
  if (!isPositiveInt(qty)) throw new ApiError(400, 'Quantity must be a positive number.')
  if (qty < service.minQuantity || qty > service.maxQuantity) {
    throw new ApiError(400, `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}.`)
  }

  const dl = deadlines.find((d) => d.value === deadline)
  if (!dl) throw new ApiError(400, 'Unknown deadline.')

  // Authoritative server-side quote; the client never decides the amount.
  const quote = quoteFor({ serviceId: service.id, quantity: qty, deadline: dl.value })

  const delivery = deliveryDate
    ? new Date(deliveryDate)
    : (() => {
        const d = new Date()
        d.setDate(d.getDate() + (DAYS_BY_DEADLINE[dl.value] ?? 3))
        return d
      })()
  if (Number.isNaN(delivery.getTime())) throw new ApiError(400, 'Invalid delivery date.')

  const files = sanitizeFileMeta(requirements, uploadLimits)
  const refs = sanitizeFileMeta(references, uploadLimits)

  // Friendly id with a unique index; retry a few times on a rare collision.
  let order = null
  for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
    try {
      order = await Order.create({
        orderId: generateOrderId(),
        userId: req.user.id,
        serviceId: service.id,
        serviceName: service.name,
        quantity: qty,
        unitLabel: quote.unitLabel,
        unitSingular: quote.unitSingular,
        requirements: files,
        references: refs,
        instructions: String(instructions || '').slice(0, 2000),
        deadline: dl.value,
        notes: String(notes || '').slice(0, 2000),
        amount: quote.total,
        price: quote,
        deliveryDate: delivery,
        status: 'Pending',
      })
    } catch (err) {
      if (err.code !== 11000 || attempt === 2) throw err
    }
  }

  res.status(201).json({ order })
}

export const listOrders = async (req, res) => {
  const filter = {}
  if (req.user.role !== 'admin') {
    filter.userId = req.user.id
  } else if (req.query.userId) {
    if (!mongoose.isValidObjectId(req.query.userId)) {
      throw new ApiError(400, 'Invalid user id.')
    }
    filter.userId = req.query.userId
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 })
  res.json({ orders })
}

export const getOrder = async (req, res) => {
  const order = await findOrderOr404(req.params.id)
  assertCanView(order, req.user)
  res.json({ order })
}

export const updateOrderStatus = async (req, res) => {
  const order = await findOrderOr404(req.params.id)
  const { status } = req.body || {}

  if (!orderStatuses.includes(status)) {
    throw new ApiError(400, 'Unknown order status.')
  }
  if (status === order.status) {
    throw new ApiError(400, 'Order is already in that status.')
  }

  // Owner may adjust their own order; admins manage everyone's.
  const isOwner = String(order.userId) === String(req.user.id)
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not allowed to change this order.')

  order.status = status
  await order.save()
  res.json({ order })
}