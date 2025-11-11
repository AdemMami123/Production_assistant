import { Router } from 'express'
import multer from 'multer'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  deleteProfile,
} from '../controllers/profile.controller'
import { authenticateUser } from '../middleware/auth.middleware'

const router = Router()

// Configure multer for memory storage (files stored as Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// All profile routes require authentication
router.use(authenticateUser)

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', getProfile)

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/', updateProfile)

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload or update avatar image
 * @access  Private
 */
router.post('/avatar', upload.single('avatar'), uploadAvatar)

/**
 * @route   DELETE /api/profile/avatar
 * @desc    Delete avatar image
 * @access  Private
 */
router.delete('/avatar', deleteAvatar)

/**
 * @route   DELETE /api/profile
 * @desc    Delete user account and profile
 * @access  Private
 */
router.delete('/', deleteProfile)

export default router
