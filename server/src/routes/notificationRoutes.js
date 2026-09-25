import { Router } from 'express'
import { param } from 'express-validator'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = Router()
router.use(protect)
router.get('/', asyncHandler(listNotifications))
router.patch('/read-all', asyncHandler(markAllNotificationsRead))
router.patch('/:id/read', [param('id').isMongoId().withMessage('Notification id must be valid'), validate], asyncHandler(markNotificationRead))

export default router
