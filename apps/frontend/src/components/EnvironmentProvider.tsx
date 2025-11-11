'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { EnvironmentMode, Team } from '@productivity-assistant/shared'

interface EnvironmentContextType {
  mode: EnvironmentMode
  selectedTeamId: string | null
  teams: Team[]
  setMode: (mode: EnvironmentMode, teamId?: string) => void
  setTeams: (teams: Team[]) => void
  isLoading: boolean
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined)

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<EnvironmentMode>('personal')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load saved preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('environment_mode') as EnvironmentMode | null
    const savedTeamId = localStorage.getItem('selected_team_id')

    if (savedMode) {
      setModeState(savedMode)
    }
    if (savedTeamId && savedMode === 'work') {
      setSelectedTeamId(savedTeamId)
    }
    setIsLoading(false)
  }, [])

  const setMode = (newMode: EnvironmentMode, teamId?: string) => {
    setModeState(newMode)

    if (newMode === 'work' && teamId) {
      setSelectedTeamId(teamId)
      localStorage.setItem('selected_team_id', teamId)
    } else {
      setSelectedTeamId(null)
      localStorage.removeItem('selected_team_id')
    }

    localStorage.setItem('environment_mode', newMode)
  }

  return (
    <EnvironmentContext.Provider
      value={{
        mode,
        selectedTeamId,
        teams,
        setMode,
        setTeams,
        isLoading,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext)
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider')
  }
  return context
}
