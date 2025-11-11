'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Users, Plus, UserPlus, Trash2, Crown, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TeamCreateModal from '@/components/TeamCreateModal'
import TeamMemberInviteModal from '@/components/TeamMemberInviteModal'
import { apiUrl, parseJsonSafe, authHeaders } from '@/lib/api'

interface Team {
  id: string
  name: string
  description?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'leader' | 'member'
  joined_at: string
  profiles: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
  }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
  }, [selectedTeam])

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

  const fetchTeamMembers = async (teamId: string) => {
    setLoadingMembers(true)
    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/teams/${teamId}/members`), {
        credentials: 'include',
        headers: {
          ...extra,
        },
      })

      const parsed = await parseJsonSafe(response)
      if (response.ok) {
        setTeamMembers(parsed.json?.data || [])
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleTeamCreated = () => {
    fetchTeams()
  }

  const handleMemberInvited = () => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/teams/${selectedTeam.id}/members/${memberId}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...extra,
        },
      })

      if (response.ok) {
        setTeamMembers(prev => prev.filter(m => m.id !== memberId))
      }
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Teams
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your teams and collaborate with others
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Teams ({teams.length})
                </CardTitle>
                <CardDescription>Select a team to view details</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-4">No teams yet</p>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Team
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teams.map(team => (
                      <motion.button
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          selectedTeam?.id === team.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedTeam?.id === team.id
                                ? 'bg-white/20'
                                : 'bg-gradient-to-br from-purple-400 to-pink-400'
                            }`}
                          >
                            <Users
                              className={`w-5 h-5 ${
                                selectedTeam?.id === team.id ? 'text-white' : 'text-white'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{team.name}</p>
                            {team.description && (
                              <p
                                className={`text-xs truncate ${
                                  selectedTeam?.id === team.id ? 'text-white/80' : 'text-gray-500'
                                }`}
                              >
                                {team.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Team Info Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedTeam.name}</CardTitle>
                        {selectedTeam.description && (
                          <CardDescription className="mt-2">
                            {selectedTeam.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Members
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Members Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members ({teamMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingMembers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {teamMembers.map(member => (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                  {member.profiles.full_name?.[0]?.toUpperCase() ||
                                    member.profiles.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {member.profiles.full_name || 'No name'}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.profiles.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {member.role === 'leader' ? (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Leader
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Member
                                  </span>
                                )}
                                {member.role !== 'leader' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Team
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a team from the list to view details and manage members
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <TeamCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTeamCreated}
      />

      {selectedTeam && (
        <TeamMemberInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onSuccess={handleMemberInvited}
        />
      )}
    </div>
  )
}
