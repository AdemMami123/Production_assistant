'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Loader2, Search, X, Check, Mail, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiUrl, authHeaders } from '@/lib/api'

interface UserProfile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
}

interface TeamMemberInviteModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  teamName: string
  onSuccess: () => void
}

export default function TeamMemberInviteModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  onSuccess,
}: TeamMemberInviteModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])
  const [selectedRole, setSelectedRole] = useState<'member' | 'leader'>('member')
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await searchUsers(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const searchUsers = async (query: string) => {
    setSearching(true)
    setError('')

    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/users/search?email=${encodeURIComponent(query)}`), {
        credentials: 'include',
        headers: {
          ...extra,
        },
      })

      // Safely parse response
      const { parseJsonSafe } = await import('@/lib/api')
      const parsed = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(parsed.json?.error || parsed.text || 'Failed to search users')
      }

      setSearchResults(parsed.json?.data || [])
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Failed to search users')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const toggleUserSelection = (user: UserProfile) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev.filter(u => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to invite')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Add each selected user to the team
      const promises = selectedUsers.map(user =>
        (async () => {
          const extra = await authHeaders()
          return fetch(apiUrl(`/api/teams/${teamId}/members`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...extra,
            },
            credentials: 'include',
            body: JSON.stringify({
              user_id: user.id,
              role: selectedRole,
            }),
          })
        })()
      )

      const responses = await Promise.all(promises)
      const failures = responses.filter(r => !r.ok)

      if (failures.length > 0) {
        const { parseJsonSafe } = await import('@/lib/api')
        const parsed = await parseJsonSafe(failures[0])
        throw new Error(parsed.json?.error || parsed.text || 'Failed to invite some users')
      }

      // Reset and close
      setSearchQuery('')
      setSelectedUsers([])
      setSearchResults([])
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to invite users')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSearchQuery('')
      setSelectedUsers([])
      setSearchResults([])
      setError('')
      onClose()
    }
  }

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(u => u.id === userId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Add members to <span className="font-semibold text-gray-700">{teamName}</span> by
            searching for their email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="email-search">Search by Email</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email-search"
                placeholder="Enter email address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={loading}
                className="pl-10"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">Users must have an account to be invited</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('member')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'member'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Member</p>
                    <p className="text-xs text-gray-500">Can view and update tasks</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('leader')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'leader'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Leader</p>
                    <p className="text-xs text-gray-500">Full team management</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Selected ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <span>{user.full_name || user.email}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {searchQuery.length >= 2 && <Label>Search Results</Label>}
            <AnimatePresence>
              {searchResults.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {searchResults.map(user => (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => toggleUserSelection(user)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        isUserSelected(user.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.full_name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {isUserSelected(user.id) && <Check className="w-5 h-5 text-blue-500" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !searching ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found with this email</p>
                  <p className="text-xs mt-1">Make sure they have an account</p>
                </div>
              ) : null}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading || selectedUsers.length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite {selectedUsers.length} {selectedUsers.length === 1 ? 'Member' : 'Members'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
