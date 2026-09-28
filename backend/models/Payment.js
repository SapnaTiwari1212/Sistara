/**
 * Payment model.
 * ---------------------------------------------------------------------------
 * FAST-PATH FOR REAL PAYMENTS: this model intentionally contains NO card
 * numbers, CVVs, UPI PINs, passwords or any other sensitive credential.
 * `method` is only the label the customer picked; the actual credentials are
 * handled entirely by the payment provider's secure checkout, and this record
 * simply tracks the lifecycle.
 *
 * Lifecycle: initiated -> pending -> (completed | failed | refunded).
 * A real provider's verified webhook is what flips a payment to `completed`
 * AND moves the order to `Confirmed` — this server never fabricates success.
 */

import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    paymentRef: { type: String, required: true, unique: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet', 'other'], default: 'upi' },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'completed', 'failed', 'refunded'],
      default: 'initiated',
    },
    provider: { type: String, default: 'manual' },
    gatewayOrderId: { type: String, default: null },
    gatewayPaymentId: { type: String, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true },
)

paymentSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.orderId
    return ret
  },
})

export const Payment = mongoose.model('Payment', paymentSchema)
export default Payment