/**
 * Seed an admin account.
 *   npm run seed:admin
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from the environment, defaulting to the
 * demo admin the SISTARA admin panel documents. Never stores a plaintext
 * password — always hashed with bcrypt. Idempotent: existing users are only
 * promoted to `admin`, never duplicated.
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { User } from '../models/User.js'

const email = String(process.env.ADMIN_EMAIL || 'admin@sistara.in').trim().toLowerCase()
const password = String(process.env.ADMIN_PASSWORD || 'Sistara@2026')

if (password.length < 8) {
  console.error('[seed-admin] Password must be at least 8 characters.')
  process.exit(1)
}

try {
  await connectDB()
  const existing = await User.findOne({ email })
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin'
      await existing.save()
      console.log(`[seed-admin] Promoted ${email} to admin.`)
    } else {
      console.log(`[seed-admin] ${email} is already an admin.`)
    }
  } else {
    await User.create({
      name: 'SISTARA Admin',
      email,
      phone: '9999999999',
      passwordHash: await bcrypt.hash(password, 10),
      role: 'admin',
    })
    console.log(`[seed-admin] Created admin account ${email}.`)
  }
} catch (err) {
  console.error('[seed-admin] Failed:', err.message)
  process.exitCode = 1
} finally {
  await disconnectDB()
}