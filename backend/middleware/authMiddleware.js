import { ApiError } from '../utils/apiError.js'
import { User } from '../models/User.js'
import { verifyToken } from '../utils/generateToken.js'

/**
 * Wrap async handlers so rejected promises land in the error middleware
 * instead of crashing Express (Express 4 does not forward them itself).
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/** Bearer-token guard. Attaches a lightweight `req.user` when valid. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new ApiError(401, 'Invalid or expired token.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'This account no longer exists.')

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
  }
  next()
})