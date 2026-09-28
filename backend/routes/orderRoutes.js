import { Router } from 'express'
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { requireAuth, asyncHandler } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)

router.post('/', asyncHandler(createOrder))
router.get('/', asyncHandler(listOrders))
router.get('/:id', asyncHandler(getOrder))
router.patch('/:id/status', asyncHandler(updateOrderStatus))

export default router