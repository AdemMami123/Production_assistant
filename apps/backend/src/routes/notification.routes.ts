import { Router } from 'express'
import {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  updateNotification,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All notification routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for authenticated user
 * @access  Private
 */
router.get('/', getNotifications)

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', getUnreadCount)

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/mark-all-read', markAllAsRead)

/**
 * @route   GET /api/notifications/:id
 * @desc    Get a specific notification
 * @access  Private
 */
router.get('/:id', getNotificationById)

/**
 * @route   PATCH /api/notifications/:id
 * @desc    Update a notification (mark as read/unread)
 * @access  Private
 */
router.patch('/:id', updateNotification)

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', deleteNotification)

export default router
