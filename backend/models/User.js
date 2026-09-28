/**
 * User model.
 * ---------------------------------------------------------------------------
 * Passwords are stored ONLY as bcrypt hashes — never plaintext. `passwordHash`
 * is `select: false` everywhere by default, so an accidental `.find()` can
 * never serialize it.
 */

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
        message: 'Enter a valid email address.',
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^\+?\d{10,}$/.test(value.replace(/[\s-]/g, '')),
        message: 'Enter a valid phone number.',
      },
    },
    passwordHash: { type: String, required: true, select: false },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
)

/** Default JSON projection — never include the hash or the mongo version key. */
userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.passwordHash
    return ret
  },
})

export const User = mongoose.model('User', userSchema)
export default User