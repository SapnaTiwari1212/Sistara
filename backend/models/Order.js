/**
 * Order model — mirrors the record shape the frontend already uses.
 * ---------------------------------------------------------------------------
 * `amount` is the single authoritative payable figure (recomputed server-side
 * at creation). `price` is the immutable quote snapshot the student agreed to,
 * display-only. `requirements` / `references` store file METADATA only — never
 * the blobs or paths to sensitive content.
 */

import mongoose from 'mongoose'
import { orderStatuses } from '../config/services.js'

const fileMetaSchema = new mongoose.Schema(
  { name: { type: String, default: '' }, size: { type: Number, default: 0 }, type: { type: String, default: '' } },
  { _id: false },
)

const priceSchema = new mongoose.Schema(
  {
    base: Number,
    extras: Number,
    rush: Number,
    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number,
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitLabel: { type: String, default: 'items' },
    unitSingular: { type: String, default: 'item' },
    requirements: { type: [fileMetaSchema], default: [] },
    references: { type: [fileMetaSchema], default: [] },
    instructions: { type: String, default: '' },
    deadline: { type: String, default: '3d' },
    notes: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    price: { type: priceSchema, default: null },
    deliveryDate: { type: Date },
    status: { type: String, enum: orderStatuses, default: 'Pending', index: true },
    paidAt: { type: Date, default: null },
    paymentRef: { type: String, default: null },
  },
  { timestamps: true },
)

orderSchema.set('toJSON', {
  versionKey: false,
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
})

export const Order = mongoose.model('Order', orderSchema)
export default Order