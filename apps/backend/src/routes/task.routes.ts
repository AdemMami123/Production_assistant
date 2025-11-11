import { Router } from 'express'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/task.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All task routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for authenticated user
 * @access  Private
 */
router.get('/stats', getTaskStats)

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user with filters
 * @access  Private
 */
router.get('/', getTasks)

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', getTaskById)

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', createTask)

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 * @access  Private
 */
router.put('/:id', updateTask)

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', deleteTask)

export default router
