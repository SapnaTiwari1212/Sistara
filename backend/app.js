/**
 * Express app factory — exported separately from server.js so the test suite
 * can boot the app on an ephemeral port without side effects.
 */

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

export const createApp = () => {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())

  const origins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  app.use(
    cors({
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )

  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      db: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/payments', paymentRoutes)

  // Unknown /api/* routes -> JSON 404 (frontend routes are out of scope here).
  app.use('/api', notFound)

  app.use(errorHandler)

  return app
}