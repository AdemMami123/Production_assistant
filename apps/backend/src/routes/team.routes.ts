import { Router } from 'express'
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamStats,
} from '../controllers/team.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// All team routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/teams
 * @desc    Get all teams for authenticated user
 * @access  Private
 */
router.get('/', getTeams)

/**
 * @route   GET /api/teams/:id
 * @desc    Get a specific team with members
 * @access  Private
 */
router.get('/:id', getTeamById)

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private
 */
router.post('/', createTeam)

/**
 * @route   PATCH /api/teams/:id
 * @desc    Update a team (leaders only)
 * @access  Private
 */
router.patch('/:id', updateTeam)

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete a team (leaders only)
 * @access  Private
 */
router.delete('/:id', deleteTeam)

/**
 * @route   GET /api/teams/:id/members
 * @desc    Get all members of a team
 * @access  Private
 */
router.get('/:id/members', getTeamMembers)

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add a member to a team (leaders only)
 * @access  Private
 */
router.post('/:id/members', addTeamMember)

/**
 * @route   PATCH /api/teams/:id/members/:memberId
 * @desc    Update a team member's role (leaders only)
 * @access  Private
 */
router.patch('/:id/members/:memberId', updateTeamMember)

/**
 * @route   DELETE /api/teams/:id/members/:memberId
 * @desc    Remove a member from a team (leaders only or self)
 * @access  Private
 */
router.delete('/:id/members/:memberId', removeTeamMember)

/**
 * @route   GET /api/teams/:id/stats
 * @desc    Get team statistics
 * @access  Private
 */
router.get('/:id/stats', getTeamStats)

export default router
