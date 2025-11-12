'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { apiUrl, authHeaders, parseJsonSafe } from '@/lib/api'

interface Team {
  id: string
  name: string
  description?: string | null
}

interface TeamMember {
  role: 'leader' | 'member'
}

export function WorkspaceSwitcher() {
  const { workspace, teamId, teamName, userRole, setWorkspace, setTeamContext } = useWorkspace()

  const [showDropdown, setShowDropdown] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user's teams
  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl('/api/teams'), {
        credentials: 'include',
        headers: {
          ...extra,
        },
      })

      const parsed = await parseJsonSafe(response)
      if (response.ok) {
        setTeams(parsed.json?.data || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchToPersonal = () => {
    setTeamContext(null, null, null)
    setShowDropdown(false)
  }

  const handleSwitchToTeam = async (team: Team) => {
    try {
      // Fetch user's role in this team
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/teams/${team.id}/members`), {
        credentials: 'include',
        headers: {
          ...extra,
        },
      })

      const parsed = await parseJsonSafe(response)
      if (response.ok) {
        const members = parsed.json?.data || []
        // Find current user's membership
        const extra2 = await authHeaders()
        const userResponse = await fetch(apiUrl('/api/profile'), {
          credentials: 'include',
          headers: {
            ...extra2,
          },
        })
        const userParsed = await parseJsonSafe(userResponse)
        const userId = userParsed.json?.data?.id

        const myMembership = members.find((m: any) => m.user_id === userId)
        const role = myMembership?.role || 'member'

        setTeamContext(team.id, team.name, role)
        setWorkspace('team')
        setShowDropdown(false)
      }
    } catch (error) {
      console.error('Error switching to team:', error)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          {workspace === 'personal' ? (
            <>
              <Home className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Personal Workspace</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{teamName || 'Team Workspace'}</span>
                {userRole && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      userRole === 'leader'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {userRole === 'leader' ? 'Leader' : 'Member'}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Personal Workspace */}
              <button
                onClick={handleSwitchToPersonal}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  workspace === 'personal' ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <Home className="w-4 h-4 text-purple-500" />
                <span className="font-medium flex-1 text-left">Personal Workspace</span>
                {workspace === 'personal' && <Check className="w-4 h-4 text-purple-500" />}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* Team Workspaces */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Team Workspaces
              </div>

              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No teams yet. Create one to collaborate!
                </div>
              ) : (
                teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleSwitchToTeam(team)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      workspace === 'team' && teamId === team.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-xs text-gray-500 truncate">{team.description}</div>
                      )}
                    </div>
                    {workspace === 'team' && teamId === team.id && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
