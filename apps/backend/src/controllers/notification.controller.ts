import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
} from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /notifications
 * Get all notifications for authenticated user
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { read } = req.query

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Filter by read status if provided
    if (read === 'true') {
      query = query.eq('read', true)
    } else if (read === 'false') {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch notifications' })
    }

    return res.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Error in getNotifications:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /notifications/unread-count
 * Get unread notification count for authenticated user
 */
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      target_user_id: userId,
    })

    if (error) {
      console.error('Error fetching unread count:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch unread count' })
    }

    return res.json({ success: true, data: { count: data || 0 } })
  } catch (error) {
    console.error('Error in getUnreadCount:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /notifications/:id
 * Get a specific notification
 */
export const getNotificationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' })
    }

    return res.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error in getNotificationById:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /notifications (internal use - for creating notifications)
 * Create a new notification
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification | null> => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return notification as Notification
  } catch (error) {
    console.error('Error in createNotification:', error)
    return null
  }
}

/**
 * PATCH /notifications/:id
 * Update a notification (typically to mark as read)
 */
export const updateNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: UpdateNotificationInput = req.body

    const updateData: any = {}
    if (input.read !== undefined) updateData.read = input.read

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return res.status(500).json({ success: false, error: 'Failed to update notification' })
    }

    return res.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error in updateNotification:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /notifications/mark-all-read
 * Mark all notifications as read for authenticated user
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all as read:', error)
      return res.status(500).json({ success: false, error: 'Failed to mark all as read' })
    }

    return res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error in markAllAsRead:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting notification:', error)
      return res.status(500).json({ success: false, error: 'Failed to delete notification' })
    }

    return res.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    console.error('Error in deleteNotification:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
