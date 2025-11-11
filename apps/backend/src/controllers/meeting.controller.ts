import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import type {
  Meeting,
  CreateMeetingInput,
  UpdateMeetingInput,
  MeetingQueryFilters,
} from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /meetings
 * Get meetings for teams the user is a member of
 */
export const getMeetings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const filters = req.query as MeetingQueryFilters

    // Get user's teams
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)

    if (memberError) {
      console.error('Error fetching team members:', memberError)
      return res.status(500).json({ success: false, error: 'Failed to fetch meetings' })
    }

    const teamIds = teamMembers.map(tm => tm.team_id)

    if (teamIds.length === 0) {
      return res.json({ success: true, data: [] })
    }

    // Build query
    let query = supabase.from('meetings').select('*').in('team_id', teamIds)

    // Apply filters
    if (filters.team_id) {
      query = query.eq('team_id', filters.team_id)
    }

    if (filters.scheduled_after) {
      query = query.gte('scheduled_at', filters.scheduled_after)
    }

    if (filters.scheduled_before) {
      query = query.lte('scheduled_at', filters.scheduled_before)
    }

    // Order by scheduled date
    query = query.order('scheduled_at', { ascending: true })

    // Apply pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching meetings:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch meetings' })
    }

    return res.json({ success: true, data })
  } catch (error) {
    console.error('Error in getMeetings:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /meetings/:id
 * Get a specific meeting
 */
export const getMeetingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' })
    }

    // Check if user is a team member
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', meeting.team_id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this meeting' })
    }

    return res.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Error in getMeetingById:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /meetings
 * Create a new meeting (team leaders only)
 */
export const createMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: CreateMeetingInput = req.body

    if (!input.team_id || !input.title || !input.scheduled_at) {
      return res.status(400).json({
        success: false,
        error: 'Team ID, title, and scheduled time are required',
      })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', input.team_id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({
        success: false,
        error: 'Only team leaders can create meetings',
      })
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        team_id: input.team_id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes || 60,
        location: input.location?.trim() || null,
        meeting_url: input.meeting_url?.trim() || null,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating meeting:', error)
      return res.status(500).json({ success: false, error: 'Failed to create meeting' })
    }

    return res.status(201).json({ success: true, data: meeting })
  } catch (error) {
    console.error('Error in createMeeting:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PATCH /meetings/:id
 * Update a meeting (team leaders only)
 */
export const updateMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('team_id')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', meeting.team_id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({
        success: false,
        error: 'Only team leaders can update meetings',
      })
    }

    const input: UpdateMeetingInput = req.body

    const updateData: any = {}
    if (input.title) updateData.title = input.title.trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.scheduled_at) updateData.scheduled_at = input.scheduled_at
    if (input.duration_minutes !== undefined) updateData.duration_minutes = input.duration_minutes
    if (input.location !== undefined) updateData.location = input.location?.trim() || null
    if (input.meeting_url !== undefined) updateData.meeting_url = input.meeting_url?.trim() || null

    const { data: updatedMeeting, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating meeting:', error)
      return res.status(500).json({ success: false, error: 'Failed to update meeting' })
    }

    return res.json({ success: true, data: updatedMeeting })
  } catch (error) {
    console.error('Error in updateMeeting:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /meetings/:id
 * Delete a meeting (team leaders only)
 */
export const deleteMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('team_id')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', meeting.team_id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({
        success: false,
        error: 'Only team leaders can delete meetings',
      })
    }

    const { error } = await supabase.from('meetings').delete().eq('id', id)

    if (error) {
      console.error('Error deleting meeting:', error)
      return res.status(500).json({ success: false, error: 'Failed to delete meeting' })
    }

    return res.json({ success: true, message: 'Meeting deleted successfully' })
  } catch (error) {
    console.error('Error in deleteMeeting:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
