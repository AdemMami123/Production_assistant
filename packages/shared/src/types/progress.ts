// Task progress interface
export interface TaskProgress {
  id: string
  task_id: string
  user_id: string
  status: string
  progress_percentage: number
  blocker?: string | null
  notes?: string | null
  created_at: string
}

// Task progress with user details
export interface TaskProgressWithUser extends TaskProgress {
  user: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
  }
}

// Create task progress input
export interface CreateTaskProgressInput {
  task_id: string
  status: string
  progress_percentage?: number
  blocker?: string
  notes?: string
}

// Task progress history
export interface TaskProgressHistory {
  task_id: string
  progress_updates: TaskProgressWithUser[]
}
