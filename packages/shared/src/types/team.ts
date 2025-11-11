// Team member role types
export type TeamMemberRole = 'leader' | 'member'

// Team interface
export interface Team {
  id: string
  name: string
  description?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Team member interface
export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamMemberRole
  joined_at: string
}

// Team with members (for detailed views)
export interface TeamWithMembers extends Team {
  members: TeamMember[]
  member_count: number
}

// Team member with user details
export interface TeamMemberWithProfile extends TeamMember {
  user: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
  }
}

// Create team input
export interface CreateTeamInput {
  name: string
  description?: string
}

// Update team input
export interface UpdateTeamInput {
  name?: string
  description?: string
}

// Add team member input
export interface AddTeamMemberInput {
  user_id: string
  role?: TeamMemberRole
}

// Update team member input
export interface UpdateTeamMemberInput {
  role: TeamMemberRole
}

// Team statistics
export interface TeamStats {
  team_id: string
  total_tasks: number
  completed_tasks: number
  todo_tasks: number
  in_progress_tasks: number
  overdue_tasks: number
  members_with_tasks: number
}

// Team member statistics
export interface TeamMemberStats {
  team_id: string
  user_id: string
  assigned_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  overdue_tasks: number
}
