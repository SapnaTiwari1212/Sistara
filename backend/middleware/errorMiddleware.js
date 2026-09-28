/**
 * Centralised error handling.
 * ---------------------------------------------------------------------------
 * Every error leaves the API as `{ message }` with an appropriate status.
 * Database / internal details are logged server-side but never sent to clients.
 */

import mongoose from 'mongoose'
import { ApiError } from '../utils/apiError.js'

/** 404 for any unknown /api/* route. */
export const notFound = (req, _res, next) => {
  next(new ApiError(404, 'Route not found.'))
}

export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500
  let message = err.message || 'Something went wrong.'

  if (!(err instanceof ApiError)) {
    if (err instanceof mongoose.Error.ValidationError) {
      status = 400
      message = Object.values(err.errors)[0]?.message || 'Validation failed.'
    } else if (err instanceof mongoose.Error.CastError) {
      status = 400
      message = 'Invalid identifier.'
    } else if (err.code === 11000) {
      status = 409
      message = 'That value is already in use.'
    } else if (err.type === 'entity.parse.failed') {
      status = 400
      message = 'Invalid JSON in request body.'
    } else {
      // Unknown / programming error: keep details server-side only.
      status = 500
      message = 'Something went wrong.'
    }
  }

  // Only log what is safe to say out loud (never a stack in production).
  const details = err instanceof ApiError ? null : err
  if (details) console.error('[api-error]', status, details?.message || details, details?.stack)

  res.status(status).json({ message })
}