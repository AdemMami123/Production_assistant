import { Router } from 'express'
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meeting.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All meeting routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for teams user is a member of
 * @access  Private
 */
router.get('/', getMeetings)

/**
 * @route   GET /api/meetings/:id
 * @desc    Get a specific meeting
 * @access  Private
 */
router.get('/:id', getMeetingById)

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting (team leaders only)
 * @access  Private
 */
router.post('/', createMeeting)

/**
 * @route   PATCH /api/meetings/:id
 * @desc    Update a meeting (team leaders only)
 * @access  Private
 */
router.patch('/:id', updateMeeting)

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete a meeting (team leaders only)
 * @access  Private
 */
router.delete('/:id', deleteMeeting)

export default router
