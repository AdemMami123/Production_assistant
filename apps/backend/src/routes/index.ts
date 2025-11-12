import { Router } from 'express'
import taskRouter from './task.routes'
import usersRouter from './users'
import profileRouter from './profile.routes'
import aiRouter from './ai.routes'
import teamRouter from './team.routes'
import meetingRouter from './meeting.routes'
import commentRouter from './comment.routes'
import progressRouter from './progress.routes'
import notificationRouter from './notification.routes'

const router = Router()

// Mount route modules
router.use('/tasks', taskRouter)
router.use('/users', usersRouter)
router.use('/profile', profileRouter)
router.use('/ai', aiRouter)
router.use('/teams', teamRouter)
router.use('/meetings', meetingRouter)
router.use('/notifications', notificationRouter)
router.use('/', commentRouter) // Comments are nested under tasks
router.use('/', progressRouter) // Progress is nested under tasks

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Productivity Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      users: '/api/users',
      profile: '/api/profile',
      ai: '/api/ai',
      teams: '/api/teams',
      meetings: '/api/meetings',
      notifications: '/api/notifications',
      comments: '/api/tasks/:taskId/comments',
      progress: '/api/tasks/:taskId/progress',
    },
  })
})

export default router
