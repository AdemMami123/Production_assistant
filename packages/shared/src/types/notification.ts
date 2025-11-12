// Notification types
export type NotificationType =
  | 'team_invitation'
  | 'task_assigned'
  | 'task_comment'
  | 'task_completed'
  | 'meeting_scheduled'
  | 'meeting_reminder'
  | 'team_update'
  | 'general'

// Notification interface
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  updated_at: string
}

// Input interfaces
export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

export interface UpdateNotificationInput {
  read?: boolean
}
