import { Router } from 'express'
import { createPayment } from '../controllers/paymentController.js'
import { requireAuth, asyncHandler } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/create', requireAuth, asyncHandler(createPayment))

export default router