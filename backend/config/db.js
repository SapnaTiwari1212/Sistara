/**
 * Database connection.
 * ---------------------------------------------------------------------------
 * Uses `sistara_test` when NODE_ENV=test so the test suite never touches real
 * data. Falls back to a locally running MongoDB when MONGODB_URI is unset.
 */

import mongoose from 'mongoose'

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/sistara'

/** Resolve the connection string, swapping the database in test mode. */
export const resolveDbUri = () => {
  const base = process.env.MONGODB_URI || DEFAULT_URI
  if (process.env.NODE_ENV !== 'test') return base
  const url = new URL(base)
  url.pathname = '/sistara_test'
  return url.toString()
}

export const connectDB = async () => {
  mongoose.set('strictQuery', true)
  await mongoose.connect(resolveDbUri(), {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  })
  return mongoose.connection
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
}