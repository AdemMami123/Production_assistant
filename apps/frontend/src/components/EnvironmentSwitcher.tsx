'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, User, ChevronDown, Plus } from 'lucide-react'
import type { EnvironmentMode, Team } from '@productivity-assistant/shared'
import TeamCreateModal from './TeamCreateModal'

interface EnvironmentSwitcherProps {
  currentMode: EnvironmentMode
  teams: Team[]
  selectedTeamId?: string | null
  onModeChange: (mode: EnvironmentMode, teamId?: string) => void
  onTeamCreated?: () => void
}

export default function EnvironmentSwitcher({
  currentMode,
  teams,
  selectedTeamId,
  onModeChange,
  onTeamCreated,
}: EnvironmentSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  const handleModeSwitch = (mode: EnvironmentMode, teamId?: string) => {
    setIsOpen(false)
    onModeChange(mode, teamId)
  }

  const handleCreateTeam = () => {
    setIsOpen(false)
    setShowCreateModal(true)
  }

  const handleTeamCreated = () => {
    if (onTeamCreated) {
      onTeamCreated()
    }
  }

  return (
    <div className="relative">
      {/* Current Mode Display */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: currentMode === 'work' ? 360 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {currentMode === 'personal' ? (
            <User className="w-5 h-5 text-blue-600" />
          ) : (
            <Briefcase className="w-5 h-5 text-purple-600" />
          )}
        </motion.div>

        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {currentMode === 'personal' ? 'Personal' : 'Work'}
          </span>
          {currentMode === 'work' && selectedTeam && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{selectedTeam.name}</span>
          )}
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Personal Mode */}
            <motion.button
              onClick={() => handleModeSwitch('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                currentMode === 'personal' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <User
                className={`w-5 h-5 ${currentMode === 'personal' ? 'text-blue-600' : 'text-gray-500'}`}
              />
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Personal
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Your private tasks</span>
              </div>
              {currentMode === 'personal' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-blue-600"
                />
              )}
            </motion.button>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Work Mode - Teams */}
            <div className="py-2">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Work - Teams
                </span>
              </div>

              {teams.length === 0 ? (
                <div className="px-4 py-3">
                  <button
                    onClick={handleCreateTeam}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first team
                  </button>
                </div>
              ) : (
                <>
                  {teams.map(team => (
                    <motion.button
                      key={team.id}
                      onClick={() => handleModeSwitch('work', team.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        currentMode === 'work' && selectedTeamId === team.id
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : ''
                      }`}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Briefcase
                        className={`w-5 h-5 ${
                          currentMode === 'work' && selectedTeamId === team.id
                            ? 'text-purple-600'
                            : 'text-gray-500'
                        }`}
                      />
                      <div className="flex flex-col items-start flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {team.name}
                        </span>
                        {team.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                            {team.description}
                          </span>
                        )}
                      </div>
                      {currentMode === 'work' && selectedTeamId === team.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-purple-600"
                        />
                      )}
                    </motion.button>
                  ))}
                </>
              )}

              {teams.length > 0 && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />
                  <button
                    onClick={handleCreateTeam}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create new team
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Create Team Modal */}
      <TeamCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTeamCreated}
      />
    </div>
  )
}
