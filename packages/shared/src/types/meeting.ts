// Meeting interface
export interface Meeting {
  id: string
  team_id: string
  title: string
  description?: string | null
  scheduled_at: string
  duration_minutes: number
  location?: string | null
  meeting_url?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Meeting with team details
export interface MeetingWithTeam extends Meeting {
  team: {
    id: string
    name: string
  }
  created_by_user: {
    id: string
    email: string
    full_name?: string | null
  }
}

// Create meeting input
export interface CreateMeetingInput {
  team_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes?: number
  location?: string
  meeting_url?: string
}

// Update meeting input
export interface UpdateMeetingInput {
  title?: string
  description?: string
  scheduled_at?: string
  duration_minutes?: number
  location?: string
  meeting_url?: string
}

// Meeting query filters
export interface MeetingQueryFilters {
  team_id?: string
  scheduled_after?: string
  scheduled_before?: string
  limit?: number
  offset?: number
}
