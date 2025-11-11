import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
} from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /tasks/:taskId/comments
 * Get all comments for a task
 */
export const getCommentsByTask = async (req: AuthenticatedRequest, res: Response) => {
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

    // Get comments with user profiles
    const { data: comments, error } = await supabase
      .from('comments')
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
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch comments' })
    }

    return res.json({ success: true, data: comments })
  } catch (error) {
    console.error('Error in getCommentsByTask:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /tasks/:taskId/comments
 * Create a new comment on a task
 */
export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { taskId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: CreateCommentInput = req.body

    if (!input.content || input.content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Comment content is required' })
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
        return res
          .status(403)
          .json({ success: false, error: 'Not authorized to comment on this task' })
      }
    } else {
      // Personal task - check if user owns it
      if (task.user_id !== userId) {
        return res
          .status(403)
          .json({ success: false, error: 'Not authorized to comment on this task' })
      }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: userId,
        content: input.content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return res.status(500).json({ success: false, error: 'Failed to create comment' })
    }

    return res.status(201).json({ success: true, data: comment })
  } catch (error) {
    console.error('Error in createComment:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PATCH /comments/:id
 * Update a comment (only the author can update)
 */
export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: UpdateCommentInput = req.body

    if (!input.content || input.content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Comment content is required' })
    }

    // Check if comment exists and user is the author
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' })
    }

    if (comment.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, error: 'Only the author can update this comment' })
    }

    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({ content: input.content.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return res.status(500).json({ success: false, error: 'Failed to update comment' })
    }

    return res.json({ success: true, data: updatedComment })
  } catch (error) {
    console.error('Error in updateComment:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /comments/:id
 * Delete a comment (only the author can delete)
 */
export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if comment exists and user is the author
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' })
    }

    if (comment.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, error: 'Only the author can delete this comment' })
    }

    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      console.error('Error deleting comment:', error)
      return res.status(500).json({ success: false, error: 'Failed to delete comment' })
    }

    return res.json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error in deleteComment:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
