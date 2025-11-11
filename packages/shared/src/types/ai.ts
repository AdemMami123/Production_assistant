export interface TaskCategorizationRequest {
  title: string
  description?: string
  priority?: string
}

export interface TaskCategorizationResponse {
  category: string
  confidence: number
  reasoning?: string
}

export interface TaskForPrioritization {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  category?: string
  due_date?: string
  created_at: string
}

export interface TaskPrioritizationRequest {
  tasks: TaskForPrioritization[]
  userContext?: {
    pastBehavior?: string
    preferences?: string
  }
}

export interface PrioritizedTask {
  taskId: string
  recommendedOrder: number
  score: number
  reasoning: string
  suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface TaskPrioritizationResponse {
  prioritizedTasks: PrioritizedTask[]
  summary: string
}
