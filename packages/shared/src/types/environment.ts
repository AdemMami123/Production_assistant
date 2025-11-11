// Environment mode types
export type EnvironmentMode = 'personal' | 'work'

// Environment context
export interface EnvironmentContext {
  mode: EnvironmentMode
  selectedTeamId?: string | null
}

// User preferences
export interface UserPreferences {
  default_environment: EnvironmentMode
  last_selected_team_id?: string | null
}
