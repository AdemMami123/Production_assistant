import { Router } from 'express'
import tasksRouter from './tasks'
import usersRouter from './users'

const router = Router()

// Mount route modules
router.use('/tasks', tasksRouter)
router.use('/users', usersRouter)

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Productivity Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      users: '/api/users'
    }
  })
})

export default router
