import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /users/search?email=
 * Search for users by email
 */
export const searchUsersByEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { email } = req.query

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Email query parameter is required' })
    }

    // Search for users by email (case-insensitive partial match)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .ilike('email', `%${email}%`)
      .limit(10)

    if (error) {
      console.error('Error searching users:', error)
      return res.status(500).json({ success: false, error: 'Failed to search users' })
    }

    // Filter out the current user from results
    const filteredProfiles = profiles?.filter(p => p.id !== userId) || []

    return res.json({ success: true, data: filteredProfiles })
  } catch (error) {
    console.error('Error in searchUsersByEmail:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /users/:id
 * Get a user profile by ID
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('Error in getUserById:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
