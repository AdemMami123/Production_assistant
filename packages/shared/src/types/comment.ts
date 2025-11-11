// Comment interface
export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// Comment with user details
export interface CommentWithUser extends Comment {
  user: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
  }
}

// Create comment input
export interface CreateCommentInput {
  task_id: string
  content: string
}

// Update comment input
export interface UpdateCommentInput {
  content: string
}
