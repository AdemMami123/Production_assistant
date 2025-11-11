import { Router } from 'express'
import { getTaskProgress, addTaskProgress } from '../controllers/progress.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All progress routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/tasks/:taskId/progress
 * @desc    Get progress history for a task
 * @access  Private
 */
router.get('/tasks/:taskId/progress', getTaskProgress)

/**
 * @route   POST /api/tasks/:taskId/progress
 * @desc    Add a progress update for a task
 * @access  Private
 */
router.post('/tasks/:taskId/progress', addTaskProgress)

export default router
