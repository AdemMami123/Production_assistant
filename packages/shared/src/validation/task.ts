import { z } from 'zod'

// Task status enum
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed', 'archived'])

// Task priority enum
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

// Create task validation schema
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  due_date: z.string().datetime().optional(),
})

// Update task validation schema
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  category: z.string().max(50).nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
})

// Task query filters schema
export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  category: z.string().optional(),
  due_before: z.string().datetime().optional(),
  due_after: z.string().datetime().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  order_by: z.enum(['created_at', 'updated_at', 'due_date', 'priority']).default('created_at'),
  order_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Task ID param schema
export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
})
