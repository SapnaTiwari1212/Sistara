import mongoose from 'mongoose'
import { ApiError } from '../utils/apiError.js'
import { generatePaymentRef } from '../utils/id.js'
import { Payment } from '../models/Payment.js'
import { Order } from '../models/Order.js'

const PAYMENT_METHODS = ['card', 'upi', 'netbanking', 'wallet', 'other']

export const createPayment = async (req, res) => {
  const { orderId, method, amount } = req.body || {}

  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(404, 'Order not found.')
  if (!PAYMENT_METHODS.includes(method)) {
    throw new ApiError(400, 'Unknown payment method.')
  }

  const order = await Order.findById(orderId)
  if (!order || order.userId.toString() !== req.user.id) {
    throw new ApiError(404, 'Order not found.')
  }
  if (order.status !== 'Pending') {
    throw new ApiError(400, 'Only pending orders can be paid.')
  }

  // Amount must match the order's authoritative total; the server never trusts
  // a client-supplied payable figure.
  if (amount !== undefined && Number(amount) !== order.amount) {
    throw new ApiError(400, 'Amount does not match the order total.')
  }

  // STATUS IS 'initiated' — NOT paid. A real provider's verified webhook is
  // what later flips this to 'completed' and moves the order to 'Confirmed'.
  // No card numbers, CVV or UPI PIN ever reach this model.
  let payment = null
  for (let attempt = 0; attempt < 3 && !payment; attempt += 1) {
    try {
      payment = await Payment.create({
        paymentRef: generatePaymentRef(),
        orderId: order._id,
        userId: order.userId,
        amount: order.amount,
        currency: 'INR',
        method,
        status: 'initiated',
        provider: 'manual',
      })
    } catch (err) {
      if (err.code !== 11000 || attempt === 2) throw err
    }
  }

  res.status(201).json({
    payment: {
      paymentRef: payment.paymentRef,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    },
  })
}