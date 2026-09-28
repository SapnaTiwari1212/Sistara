import { Router } from 'express'
import { register, login, getMe } from '../controllers/authController.js'
import { requireAuth, asyncHandler } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/me', requireAuth, asyncHandler(getMe))

export default router