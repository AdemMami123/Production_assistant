import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { updateProfileSchema } from '@productivity-assistant/shared'
import type { Profile, UpdateProfileInput } from '@productivity-assistant/shared'

// Extend Express Request to include user and omit conflicting file property
export interface AuthenticatedRequest extends Omit<Request, 'file'> {
  user?: {
    id: string
    email: string
  }
  file?: {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    buffer: Buffer
  }
}

/**
 * GET /profile
 * Get the authenticated user's profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Profile not found' })
      }
      console.error('Error fetching profile:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch profile' })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in getProfile:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PUT /profile
 * Update the authenticated user's profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Validate request body
    const updates = updateProfileSchema.parse(req.body)

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return res.status(500).json({ success: false, error: 'Failed to update profile' })
    }

    return res.json({ success: true, data, message: 'Profile updated successfully' })
  } catch (error: any) {
    console.error('Error in updateProfile:', error)
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid profile data', details: error.errors })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /profile/avatar
 * Upload or update avatar image
 */
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const file = req.file
    const fileExt = file.originalname.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Delete old avatar if exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/').slice(-2).join('/')
      await supabase.storage.from('avatars').remove([oldPath])
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return res.status(500).json({ success: false, error: 'Failed to upload avatar' })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

    // Update profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError)
      return res.status(500).json({ success: false, error: 'Failed to update profile' })
    }

    return res.json({
      success: true,
      data: {
        avatar_url: urlData.publicUrl,
        path: fileName,
      },
      message: 'Avatar uploaded successfully',
    })
  } catch (error: any) {
    console.error('Error in uploadAvatar:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /profile/avatar
 * Delete the user's avatar
 */
export const deleteAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get current avatar URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (!profile?.avatar_url) {
      return res.status(404).json({ success: false, error: 'No avatar to delete' })
    }

    // Extract path from URL
    const path = profile.avatar_url.split('/').slice(-2).join('/')

    // Delete from storage
    const { error: deleteError } = await supabase.storage.from('avatars').remove([path])

    if (deleteError) {
      console.error('Error deleting avatar from storage:', deleteError)
      return res.status(500).json({ success: false, error: 'Failed to delete avatar' })
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile after avatar deletion:', updateError)
      return res.status(500).json({ success: false, error: 'Failed to update profile' })
    }

    return res.json({ success: true, message: 'Avatar deleted successfully' })
  } catch (error: any) {
    console.error('Error in deleteAvatar:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /profile
 * Delete the user's profile and account
 */
export const deleteProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Delete avatar if exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profile?.avatar_url) {
      const path = profile.avatar_url.split('/').slice(-2).join('/')
      await supabase.storage.from('avatars').remove([path])
    }

    // Delete user account (this will cascade delete profile and tasks due to FK constraints)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return res.status(500).json({ success: false, error: 'Failed to delete account' })
    }

    return res.json({ success: true, message: 'Account deleted successfully' })
  } catch (error: any) {
    console.error('Error in deleteProfile:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
