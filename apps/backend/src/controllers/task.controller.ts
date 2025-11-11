import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdSchema,
} from '@productivity-assistant/shared/validation/task'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '@productivity-assistant/shared/types/task'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /tasks
 * Get all tasks for the authenticated user with optional filters
 */
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Validate and parse query parameters
    const filters = taskQuerySchema.parse(req.query)

    // Build query
    let query = supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.due_before) {
      query = query.lte('due_date', filters.due_before)
    }

    if (filters.due_after) {
      query = query.gte('due_date', filters.due_after)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply ordering
    query = query.order(filters.order_by, { ascending: filters.order_direction === 'asc' })

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch tasks' })
    }

    return res.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: (count || 0) > filters.offset + filters.limit,
      },
    })
  } catch (error: any) {
    console.error('Error in getTasks:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid query parameters', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /tasks/:id
 * Get a specific task by ID
 */
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Task not found' })
      }
      console.error('Error fetching task:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch task' })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in getTaskById:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid task ID', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /tasks
 * Create a new task
 */
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Validate request body
    const taskData = createTaskSchema.parse(req.body)

    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return res.status(500).json({ success: false, error: 'Failed to create task' })
    }

    return res.status(201).json({ success: true, data, message: 'Task created successfully' })
  } catch (error: any) {
    console.error('Error in createTask:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid task data', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PUT /tasks/:id
 * Update an existing task
 */
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)
    const updates = updateTaskSchema.parse(req.body)

    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingTask) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return res.status(500).json({ success: false, error: 'Failed to update task' })
    }

    return res.json({ success: true, data, message: 'Task updated successfully' })
  } catch (error: any) {
    console.error('Error in updateTask:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid task data', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /tasks/:id
 * Delete a task
 */
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)

    // Delete task
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)

    if (error) {
      console.error('Error deleting task:', error)
      return res.status(500).json({ success: false, error: 'Failed to delete task' })
    }

    return res.json({ success: true, message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Error in deleteTask:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid task ID', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /tasks/stats
 * Get task statistics for the authenticated user
 */
export const getTaskStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { data, error } = await supabase
      .from('user_task_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching task stats:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch task statistics' })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in getTaskStats:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
