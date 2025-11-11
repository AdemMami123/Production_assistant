'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Loader2 } from 'lucide-react'
import { apiUrl, authHeaders } from '@/lib/api'
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

interface TeamCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TeamCreateModal({ isOpen, onClose, onSuccess }: TeamCreateModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Team name is required')
      return
    }

    setLoading(true)

    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl('/api/teams'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...extra,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })

      // Parse response safely: some servers may return HTML error pages (Unexpected token '<')
      const contentType = response.headers.get('content-type') || ''
      let data: any = null
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        // Throw a descriptive error including the start of the response body
        throw new Error(`Unexpected non-JSON response from server: ${text.slice(0, 200)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team')
      }

      // Reset form
      setName('')
      setDescription('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setDescription('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Create a team to collaborate with others on shared tasks and projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">
              Team Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team-name"
              placeholder="e.g., Marketing Team, Engineering"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Description (Optional)</Label>
            <textarea
              id="team-description"
              placeholder="What is this team about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="text-xs text-gray-500">{description.length}/500 characters</p>
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

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Team
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
