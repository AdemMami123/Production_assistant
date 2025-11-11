import { z } from 'zod'

// Export task validation schemas
export * from './task'

// User validation schemas
export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export const UpdateUserSchema = UserSchema.partial()

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

// Export types
export type UserInput = z.infer<typeof UserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
