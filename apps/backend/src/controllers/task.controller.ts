import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdSchema,
} from '@productivity-assistant/shared'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /tasks?workspace=personal|team&team_id=xxx
 * Get all tasks for the authenticated user with workspace context
 * Personal workspace: user's private tasks only
 * Team workspace: team tasks filtered by team_id and user membership
 */
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Validate and parse query parameters
    const filters = taskQuerySchema.parse(req.query)
    const workspace = (req.query.workspace as string) || 'personal'
    const teamId = req.query.team_id as string

    // Build base query with count
    let query = supabase.from('tasks').select('*', { count: 'exact' })

    // Apply workspace filtering
    if (workspace === 'personal') {
      // Personal workspace: only user's own tasks with team_id NULL
      query = query.eq('user_id', userId).is('team_id', null)
    } else if (workspace === 'team') {
      // Team workspace: require team_id and verify membership
      if (!teamId) {
        return res
          .status(400)
          .json({ success: false, error: 'team_id is required for team workspace' })
      }

      // Verify user is a team member
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not a team member' })
      }

      // Filter for team tasks only
      query = query.eq('team_id', teamId)
    } else {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid workspace parameter. Use "personal" or "team"' })
    }

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
      workspace,
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
 * Get a specific task by ID with workspace awareness
 */
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)

    // Fetch task first to determine workspace
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Task not found' })
      }
      console.error('Error fetching task:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch task' })
    }

    // Check permissions based on workspace
    if (data.team_id === null) {
      // Personal task - must be owner
      if (data.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
    } else {
      // Team task - must be team member
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', data.team_id)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not a team member' })
      }
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
 * Create a new task in personal or team workspace
 * Personal tasks: any authenticated user
 * Team tasks: only team leaders can create
 */
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Validate request body
    const taskData = createTaskSchema.parse(req.body)
    const teamId = (req.body as any).team_id
    const assignedTo = (req.body as any).assigned_to

    // If creating a team task, verify user is team leader
    if (teamId) {
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not a team member' })
      }

      if (membership.role !== 'leader') {
        return res
          .status(403)
          .json({ success: false, error: 'Only team leaders can create team tasks' })
      }

      // For team tasks, verify assigned_to is a team member if provided
      if (assignedTo) {
        const { data: assignedMember, error: assignedError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', teamId)
          .eq('user_id', assignedTo)
          .single()

        if (assignedError || !assignedMember) {
          return res
            .status(400)
            .json({ success: false, error: 'Assigned user is not a team member' })
        }
      }
    } else {
      // Personal task - team_id should be null and no assigned_to
      if (assignedTo) {
        return res
          .status(400)
          .json({ success: false, error: 'Personal tasks cannot be assigned to others' })
      }
    }

    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: userId,
        team_id: teamId || null,
        assigned_to: assignedTo || null,
        assigned_by: teamId && assignedTo ? userId : null,
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
 * Update an existing task with role-based permissions
 * Personal tasks: owner has full edit
 * Team tasks: leader has full edit, members can ONLY update status (for kanban)
 */
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)
    const updates = updateTaskSchema.parse(req.body)

    // Fetch existing task to check workspace and permissions
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingTask) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Permission checks based on workspace
    if (existingTask.team_id === null) {
      // Personal task - must be owner
      if (existingTask.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
    } else {
      // Team task - check role
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', existingTask.team_id)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not a team member' })
      }

      // Team members (non-leaders) can ONLY update status (for kanban board)
      if (membership.role !== 'leader') {
        const allowedKeys = ['status']
        const updateKeys = Object.keys(updates)
        const hasDisallowedKeys = updateKeys.some(key => !allowedKeys.includes(key))

        if (hasDisallowedKeys) {
          return res.status(403).json({
            success: false,
            error:
              'Team members can only update task status. Full edit permissions are restricted to team leaders.',
          })
        }
      }
    }

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
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
 * Delete a task with role-based permissions
 * Personal tasks: owner can delete
 * Team tasks: ONLY team leaders can delete (members have NO delete permission)
 */
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = taskIdSchema.parse(req.params)

    // Fetch task to check workspace and permissions
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingTask) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Permission checks
    if (existingTask.team_id === null) {
      // Personal task - must be owner
      if (existingTask.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
    } else {
      // Team task - must be team leader
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', existingTask.team_id)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not a team member' })
      }

      if (membership.role !== 'leader') {
        return res
          .status(403)
          .json({ success: false, error: 'Only team leaders can delete team tasks' })
      }
    }

    // Delete task
    const { error } = await supabase.from('tasks').delete().eq('id', id)

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
