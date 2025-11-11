// User types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Task types
export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'archived'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
}
