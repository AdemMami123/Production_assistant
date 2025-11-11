import { Router, Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Get all tasks (protected)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Example: Fetch tasks from database
    const tasks = [
      { id: 1, title: 'Sample Task 1', completed: false },
      { id: 2, title: 'Sample Task 2', completed: true },
    ]

    res.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
    })
  }
})

// Create a new task (protected)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body

    // Example: Create task in database
    const newTask = {
      id: Date.now(),
      title,
      description,
      completed: false,
      userId: req.user?.id,
    }

    res.status(201).json({
      success: true,
      data: newTask,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    })
  }
})

// Update a task (protected)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Example: Update task in database
    res.json({
      success: true,
      data: { id, ...updates },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    })
  }
})

// Delete a task (protected)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Example: Delete task from database
    res.json({
      success: true,
      message: `Task ${id} deleted`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    })
  }
})

export default router
