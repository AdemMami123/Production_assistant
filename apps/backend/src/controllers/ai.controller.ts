import { Request, Response } from 'express'
import { categorizeTask, prioritizeTasks } from '../lib/ai'
import type {
  TaskCategorizationRequest,
  TaskPrioritizationRequest,
} from '@productivity-assistant/shared'

/**
 * POST /api/ai/categorize
 * Automatically categorize a task based on title, description, and priority
 */
export const categorizeTaskController = async (req: Request, res: Response) => {
  try {
    const { title, description, priority } = req.body as TaskCategorizationRequest

    if (!title) {
      return res.status(400).json({
        error: 'Task title is required for categorization',
      })
    }

    // Call AI to categorize
    const result = await categorizeTask(title, description, priority)

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error in categorizeTaskController:', error)
    return res.status(500).json({
      error: 'Failed to categorize task',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * POST /api/ai/prioritize
 * Analyze and prioritize a list of tasks
 */
export const prioritizeTasksController = async (req: Request, res: Response) => {
  try {
    const { tasks, userContext } = req.body as TaskPrioritizationRequest

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        error: 'Tasks array is required and must not be empty',
      })
    }

    // Validate task structure
    const invalidTasks = tasks.filter(
      task => !task.id || !task.title || !task.status || !task.priority
    )

    if (invalidTasks.length > 0) {
      return res.status(400).json({
        error: 'All tasks must have id, title, status, and priority',
        invalidTasks,
      })
    }

    // Call AI to prioritize
    const result = await prioritizeTasks(tasks, userContext)

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error in prioritizeTasksController:', error)
    return res.status(500).json({
      error: 'Failed to prioritize tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
