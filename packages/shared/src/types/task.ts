// Task status types
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

// Task priority types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Task interface
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  category?: string | null
  due_date?: string | null
  created_at: string
  updated_at: string
}

// Task creation input (without auto-generated fields)
export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  category?: string
  due_date?: string
}

// Task update input (all fields optional except id)
export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  category?: string
  due_date?: string | null
}

// Task query filters
export interface TaskQueryFilters {
  status?: TaskStatus
  priority?: TaskPriority
  category?: string
  due_before?: string
  due_after?: string
  search?: string
  limit?: number
  offset?: number
  order_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority'
  order_direction?: 'asc' | 'desc'
}

// Task statistics
export interface TaskStats {
  user_id: string
  total_tasks: number
  completed_tasks: number
  todo_tasks: number
  in_progress_tasks: number
  overdue_tasks: number
}
