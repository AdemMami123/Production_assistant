import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
})

export const avatarUploadSchema = z.object({
  file: z.any(), // Will be validated as File/Buffer in controller
})
