import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import type { TaskProgress, CreateTaskProgressInput } from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /tasks/:taskId/progress
 * Get progress history for a task
 */
export const getTaskProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { taskId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Verify user has access to the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, team_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Check access permissions
    if (task.team_id) {
      // Team task - check if user is a team member
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', task.team_id)
        .eq('user_id', userId)
        .single()

      if (memberError || !membership) {
        return res.status(403).json({ success: false, error: 'Not authorized to view this task' })
      }
    } else {
      // Personal task - check if user owns it
      if (task.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to view this task' })
      }
    }

    // Get progress updates with user profiles
    const { data: progress, error } = await supabase
      .from('task_progress')
      .select(
        `
        *,
        profiles!inner (
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching task progress:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch task progress' })
    }

    return res.json({ success: true, data: progress })
  } catch (error) {
    console.error('Error in getTaskProgress:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /tasks/:taskId/progress
 * Add a progress update for a task
 */
export const addTaskProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { taskId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: CreateTaskProgressInput = req.body

    if (!input.status || input.status.trim() === '') {
      return res.status(400).json({ success: false, error: 'Status is required' })
    }

    // Verify user has access to the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, team_id, assigned_to')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Check if user can add progress (must be task owner or assignee)
    const canAddProgress = task.user_id === userId || task.assigned_to === userId

    if (!canAddProgress) {
      return res.status(403).json({
        success: false,
        error: 'Only the task owner or assignee can add progress updates',
      })
    }

    const { data: progress, error } = await supabase
      .from('task_progress')
      .insert({
        task_id: taskId,
        user_id: userId,
        status: input.status.trim(),
        progress_percentage: input.progress_percentage || 0,
        blocker: input.blocker?.trim() || null,
        notes: input.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating progress update:', error)
      return res.status(500).json({ success: false, error: 'Failed to create progress update' })
    }

    return res.status(201).json({ success: true, data: progress })
  } catch (error) {
    console.error('Error in addTaskProgress:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
