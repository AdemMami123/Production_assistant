import { Router } from 'express'
import {
  getCommentsByTask,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All comment routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/tasks/:taskId/comments
 * @desc    Get all comments for a task
 * @access  Private
 */
router.get('/tasks/:taskId/comments', getCommentsByTask)

/**
 * @route   POST /api/tasks/:taskId/comments
 * @desc    Create a new comment on a task
 * @access  Private
 */
router.post('/tasks/:taskId/comments', createComment)

/**
 * @route   PATCH /api/comments/:id
 * @desc    Update a comment (author only)
 * @access  Private
 */
router.patch('/comments/:id', updateComment)

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (author only)
 * @access  Private
 */
router.delete('/comments/:id', deleteComment)

export default router
