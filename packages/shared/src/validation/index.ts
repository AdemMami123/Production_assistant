import { z } from 'zod'

// Task validation schemas
export const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().default(false)
})

export const CreateTaskSchema = TaskSchema.omit({ completed: true })
export const UpdateTaskSchema = TaskSchema.partial()

// User validation schemas
export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional()
})

export const UpdateUserSchema = UserSchema.partial()

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long')
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
})

// Export types
export type TaskInput = z.infer<typeof TaskSchema>
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type UserInput = z.infer<typeof UserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
