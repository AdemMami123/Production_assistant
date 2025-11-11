import { Router, Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { authenticateUser } from '../middleware/auth.middleware'
import { searchUsersByEmail, getUserById } from '../controllers/user.controller'

const router = Router()

// Search users by email (protected)
router.get('/search', authenticateUser, searchUsersByEmail)

// Get user by ID (protected)
router.get('/:id', authenticateUser, getUserById)

// Get current user profile (protected)
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: req.user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
    })
  }
})

// Update user profile (protected)
router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body

    // Example: Update user in database
    res.json({
      success: true,
      data: { ...req.user, ...updates },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile',
    })
  }
})

export default router
