import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { sendTeamInvitationEmail } from '../lib/email'
import { createNotification } from './notification.controller'
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  AddTeamMemberInput,
  UpdateTeamMemberInput,
  TeamWithMembers,
  TeamMemberWithProfile,
} from '@productivity-assistant/shared'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * GET /teams
 * Get all teams the authenticated user is a member of
 */
export const getTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get teams where user is a member
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)

    if (memberError) {
      console.error('Error fetching team members:', memberError)
      return res.status(500).json({ success: false, error: 'Failed to fetch teams' })
    }

    const teamIds = teamMembers.map(tm => tm.team_id)

    if (teamIds.length === 0) {
      return res.json({ success: true, data: [] })
    }

    // Get team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('created_at', { ascending: false })

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return res.status(500).json({ success: false, error: 'Failed to fetch teams' })
    }

    return res.json({ success: true, data: teams })
  } catch (error) {
    console.error('Error in getTeams:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /teams/:id
 * Get a specific team with members
 */
export const getTeamById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team member
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership) {
      return res.status(403).json({ success: false, error: 'Not a team member' })
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (teamError || !team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    // Get team members with profiles
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)

    if (membersError) {
      console.error('Error fetching team members:', membersError)
      return res.status(500).json({ success: false, error: 'Failed to fetch team members' })
    }

    // Load profiles for the member user_ids and merge
    const userIds = (members || []).map((m: any) => m.user_id)
    let profiles: any[] = []
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError)
        return res.status(500).json({ success: false, error: 'Failed to fetch member profiles' })
      }

      profiles = profilesData || []
    }

    const membersWithProfiles = (members || []).map((m: any) => {
      const profile = profiles.find(p => p.id === m.user_id) || {
        id: m.user_id,
        email: null,
        full_name: null,
        avatar_url: null,
      }
      return { ...m, profiles: profile }
    })

    const teamWithMembers: TeamWithMembers = {
      ...team,
      members: membersWithProfiles,
      member_count: membersWithProfiles.length,
    }
    return res.json({ success: true, data: teamWithMembers })
  } catch (error) {
    console.error('Error in getTeamById:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /teams
 * Create a new team
 */
export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const input: CreateTeamInput = req.body

    if (!input.name || input.name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Team name is required' })
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return res.status(500).json({ success: false, error: 'Failed to create team' })
    }

    // Add the creator as a team member with role 'leader'
    try {
      const { error: addCreatorErr } = await supabase.from('team_members').insert({
        team_id: team.id,
        user_id: userId,
        role: 'leader',
      })

      if (addCreatorErr) {
        // If the creator is already a member (unique constraint) ignore, otherwise log
        if (addCreatorErr.code !== '23505') {
          console.warn('Warning: could not add creator to team_members:', addCreatorErr)
        }
      }
    } catch (e) {
      console.warn('Unexpected error adding creator as team member:', e)
    }

    return res.status(201).json({ success: true, data: team })
  } catch (error) {
    console.error('Error in createTeam:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PATCH /teams/:id
 * Update a team (leaders only)
 */
export const updateTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only team leaders can update teams' })
    }

    const input: UpdateTeamInput = req.body

    const updateData: any = {}
    if (input.name) updateData.name = input.name.trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null

    const { data: team, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return res.status(500).json({ success: false, error: 'Failed to update team' })
    }

    return res.json({ success: true, data: team })
  } catch (error) {
    console.error('Error in updateTeam:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /teams/:id
 * Delete a team (leaders only)
 */
export const deleteTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only team leaders can delete teams' })
    }

    const { error } = await supabase.from('teams').delete().eq('id', id)

    if (error) {
      console.error('Error deleting team:', error)
      return res.status(500).json({ success: false, error: 'Failed to delete team' })
    }

    return res.json({ success: true, message: 'Team deleted successfully' })
  } catch (error) {
    console.error('Error in deleteTeam:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /teams/:id/members
 * Get all members of a team
 */
export const getTeamMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team member
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership) {
      return res.status(403).json({ success: false, error: 'Not a team member' })
    }

    // Get team members (simple select)
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)

    if (error) {
      console.error('Error fetching team members:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch team members' })
    }

    // Fetch profiles for those members and merge
    const userIds = (members || []).map((m: any) => m.user_id)
    let profiles: any[] = []
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError)
        return res.status(500).json({ success: false, error: 'Failed to fetch member profiles' })
      }

      profiles = profilesData || []
    }

    const membersWithProfiles = (members || []).map((m: any) => {
      const profile = profiles.find(p => p.id === m.user_id) || {
        id: m.user_id,
        email: null,
        full_name: null,
        avatar_url: null,
      }
      return { ...m, profiles: profile }
    })

    return res.json({ success: true, data: membersWithProfiles })
  } catch (error) {
    console.error('Error in getTeamMembers:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * POST /teams/:id/members
 * Add a member to a team (leaders only)
 * Sends both in-app notification and email
 */
export const addTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (teamError || !team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only team leaders can add members' })
    }

    const input: AddTeamMemberInput = req.body

    if (!input.user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }

    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    // Get invited user profile
    const { data: invitedUserProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', input.user_id)
      .single()

    // Get invited user email from auth.users if not in profile
    let invitedUserEmail = invitedUserProfile?.email
    if (!invitedUserEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(input.user_id)
      invitedUserEmail = authUser?.user?.email
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_id: id,
        user_id: input.user_id,
        role: input.role || 'member',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding team member:', error)
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: 'User is already a team member' })
      }
      return res.status(500).json({ success: false, error: 'Failed to add team member' })
    }

    // Create in-app notification
    const inviterName = inviterProfile?.full_name || req.user?.email || 'A team member'
    const invitedUserName = invitedUserProfile?.full_name || invitedUserEmail || 'User'
    const roleText = input.role === 'leader' ? 'leader' : 'member'

    await createNotification({
      user_id: input.user_id,
      type: 'team_invitation',
      title: `You've been invited to ${team.name}!`,
      message: `${inviterName} has invited you to join ${team.name} as a ${roleText}.`,
      data: {
        team_id: id,
        team_name: team.name,
        inviter_id: userId,
        inviter_name: inviterName,
        role: input.role || 'member',
      },
    })

    // Send email notification (async, don't wait for it)
    if (invitedUserEmail) {
      sendTeamInvitationEmail(
        invitedUserEmail,
        invitedUserName,
        team.name,
        inviterName,
        input.role || 'member'
      ).catch(err => {
        console.error('Failed to send invitation email:', err)
        // Don't fail the request if email fails
      })
    }

    return res.status(201).json({ success: true, data: member })
  } catch (error) {
    console.error('Error in addTeamMember:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * PATCH /teams/:id/members/:memberId
 * Update a team member's role (leaders only)
 */
export const updateTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id, memberId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership || membership.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only team leaders can update members' })
    }

    const input: UpdateTeamMemberInput = req.body

    const { data: member, error } = await supabase
      .from('team_members')
      .update({ role: input.role })
      .eq('id', memberId)
      .eq('team_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team member:', error)
      return res.status(500).json({ success: false, error: 'Failed to update team member' })
    }

    return res.json({ success: true, data: member })
  } catch (error) {
    console.error('Error in updateTeamMember:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * DELETE /teams/:id/members/:memberId
 * Remove a member from a team (leaders only, or member can remove themselves)
 */
export const removeTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id, memberId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Get the member to be removed
    const { data: memberToRemove, error: fetchError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('id', memberId)
      .eq('team_id', id)
      .single()

    if (fetchError || !memberToRemove) {
      return res.status(404).json({ success: false, error: 'Member not found' })
    }

    // Check if user is a team leader or removing themselves
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    const isLeader = membership?.role === 'leader'
    const isRemovingSelf = memberToRemove.user_id === userId

    if (!isLeader && !isRemovingSelf) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' })
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', id)

    if (error) {
      console.error('Error removing team member:', error)
      return res.status(500).json({ success: false, error: 'Failed to remove team member' })
    }

    return res.json({ success: true, message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error in removeTeamMember:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * GET /teams/:id/stats
 * Get team statistics
 */
export const getTeamStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user is a team member
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .eq('user_id', userId)
      .single()

    if (memberError || !membership) {
      return res.status(403).json({ success: false, error: 'Not a team member' })
    }

    // Get team task statistics
    const { data: stats, error } = await supabase
      .from('team_task_stats')
      .select('*')
      .eq('team_id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching team stats:', error)
      return res.status(500).json({ success: false, error: 'Failed to fetch team stats' })
    }

    return res.json({
      success: true,
      data: stats || {
        team_id: id,
        total_tasks: 0,
        completed_tasks: 0,
        todo_tasks: 0,
        in_progress_tasks: 0,
        overdue_tasks: 0,
        members_with_tasks: 0,
      },
    })
  } catch (error) {
    console.error('Error in getTeamStats:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
