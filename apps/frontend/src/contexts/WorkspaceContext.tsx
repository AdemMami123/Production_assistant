'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type WorkspaceType = 'personal' | 'team'

interface WorkspaceContextType {
  workspace: WorkspaceType
  teamId: string | null
  teamName: string | null
  userRole: 'leader' | 'member' | null
  setWorkspace: (workspace: WorkspaceType) => void
  setTeamContext: (
    teamId: string | null,
    teamName: string | null,
    role: 'leader' | 'member' | null
  ) => void
  isPersonalWorkspace: () => boolean
  isTeamWorkspace: () => boolean
  isTeamLeader: () => boolean
  canCreateTasks: () => boolean
  canEditTasks: () => boolean
  canDeleteTasks: () => boolean
  canUpdateTaskStatus: () => boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<WorkspaceType>('personal')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'leader' | 'member' | null>(null)

  // Persist workspace selection to localStorage
  useEffect(() => {
    const savedWorkspace = localStorage.getItem('workspace') as WorkspaceType | null
    const savedTeamId = localStorage.getItem('teamId')
    const savedTeamName = localStorage.getItem('teamName')
    const savedUserRole = localStorage.getItem('userRole') as 'leader' | 'member' | null

    if (savedWorkspace) {
      setWorkspaceState(savedWorkspace)
    }
    if (savedTeamId) {
      setTeamId(savedTeamId)
    }
    if (savedTeamName) {
      setTeamName(savedTeamName)
    }
    if (savedUserRole) {
      setUserRole(savedUserRole)
    }
  }, [])

  const setWorkspace = (newWorkspace: WorkspaceType) => {
    setWorkspaceState(newWorkspace)
    localStorage.setItem('workspace', newWorkspace)

    // Clear team context when switching to personal
    if (newWorkspace === 'personal') {
      setTeamId(null)
      setTeamName(null)
      setUserRole(null)
      localStorage.removeItem('teamId')
      localStorage.removeItem('teamName')
      localStorage.removeItem('userRole')
    }
  }

  const setTeamContext = (
    newTeamId: string | null,
    newTeamName: string | null,
    role: 'leader' | 'member' | null
  ) => {
    if (newTeamId) {
      setTeamId(newTeamId)
      setTeamName(newTeamName)
      setUserRole(role)
      localStorage.setItem('teamId', newTeamId)
      localStorage.setItem('teamName', newTeamName || '')
      localStorage.setItem('userRole', role || '')
      setWorkspaceState('team')
      localStorage.setItem('workspace', 'team')
    } else {
      setTeamId(null)
      setTeamName(null)
      setUserRole(null)
      localStorage.removeItem('teamId')
      localStorage.removeItem('teamName')
      localStorage.removeItem('userRole')
      setWorkspaceState('personal')
      localStorage.setItem('workspace', 'personal')
    }
  }

  const isPersonalWorkspace = () => workspace === 'personal'
  const isTeamWorkspace = () => workspace === 'team'
  const isTeamLeader = () => workspace === 'team' && userRole === 'leader'

  // Permission helpers based on workspace and role
  const canCreateTasks = () => {
    if (workspace === 'personal') return true
    if (workspace === 'team') return userRole === 'leader'
    return false
  }

  const canEditTasks = () => {
    if (workspace === 'personal') return true
    if (workspace === 'team') return userRole === 'leader'
    return false
  }

  const canDeleteTasks = () => {
    if (workspace === 'personal') return true
    if (workspace === 'team') return userRole === 'leader'
    return false
  }

  const canUpdateTaskStatus = () => {
    // Everyone can update task status (via kanban board)
    return true
  }

  const value: WorkspaceContextType = {
    workspace,
    teamId,
    teamName,
    userRole,
    setWorkspace,
    setTeamContext,
    isPersonalWorkspace,
    isTeamWorkspace,
    isTeamLeader,
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canUpdateTaskStatus,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
