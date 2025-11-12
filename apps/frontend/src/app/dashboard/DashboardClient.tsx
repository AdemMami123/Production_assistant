'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { apiUrl, parseJsonSafe, authHeaders } from '@/lib/api'
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher'
import { useEnvironment } from '@/components/EnvironmentProvider'
import NotificationBell from '@/components/NotificationBell'
import {
  ListTodo,
  Home,
  LayoutGrid,
  UserCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Users,
  Video,
} from 'lucide-react'

interface DashboardClientProps {
  user: User
}

interface TaskStats {
  total: number
  todo: number
  in_progress: number
  completed: number
  overdue: number
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  })
  const router = useRouter()
  const supabase = createClient()
  const { mode, selectedTeamId, teams, setMode, setTeams } = useEnvironment()

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/teams'), {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const extra = await authHeaders()
      // re-run request with auth if initial call was missing auth
      // (we include headers on the first attempt below)
      const responseWithAuth = await fetch(apiUrl('/api/teams'), {
        headers: { ...extra },
        credentials: 'include',
      })
      const parsed = await parseJsonSafe(responseWithAuth)
      if (responseWithAuth.ok) {
        setTeams(parsed.json?.data || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }, [setTeams])

  const fetchTaskStats = useCallback(async () => {
    try {
      let query = supabase.from('tasks').select('*')

      // Filter based on environment mode
      if (mode === 'personal') {
        query = query.is('team_id', null)
      } else if (mode === 'work' && selectedTeamId) {
        query = query.eq('team_id', selectedTeamId)
      }

      const { data: tasks, error } = await query

      if (error) throw error

      const now = new Date()
      const newStats = {
        total: tasks?.length || 0,
        todo: tasks?.filter(t => t.status === 'todo').length || 0,
        in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        overdue:
          tasks?.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed')
            .length || 0,
      }
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching task stats:', error)
    }
  }, [mode, selectedTeamId, supabase])

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Refresh stats when environment changes
  useEffect(() => {
    fetchTaskStats()
  }, [fetchTaskStats])

  const handleEnvironmentChange = (newMode: 'personal' | 'work', teamId?: string) => {
    setMode(newMode, teamId)
  }

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const personalQuickActions = [
    {
      title: 'Create Task',
      description: 'Add a new task to your list',
      icon: Target,
      href: '/tasks',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'View Kanban',
      description: 'Organize tasks by status',
      icon: LayoutGrid,
      href: '/kanban',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Update Profile',
      description: 'Manage your account',
      icon: UserCircle,
      href: '/profile',
      color: 'from-green-500 to-green-600',
    },
  ]

  const workQuickActions = [
    {
      title: 'Team Tasks',
      description: 'View and manage team tasks',
      icon: ListTodo,
      href: '/tasks',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Team Members',
      description: 'View team members',
      icon: Users,
      href: '/teams',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Meetings',
      description: 'Schedule and view meetings',
      icon: Video,
      href: '/meetings',
      color: 'from-green-500 to-green-600',
    },
  ]

  const quickActions = mode === 'personal' ? personalQuickActions : workQuickActions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Productivity Assistant
              </motion.h1>

              {/* Environment Switcher */}
              <EnvironmentSwitcher
                currentMode={mode}
                teams={teams}
                selectedTeamId={selectedTeamId}
                onModeChange={handleEnvironmentChange}
                onTeamCreated={fetchTeams}
              />

              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    <ListTodo className="w-4 h-4 mr-2" />
                    Tasks
                  </Button>
                </Link>
                <Link href="/kanban">
                  <Button variant="ghost" size="sm">
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Kanban
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="ghost" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Teams
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button variant="outline" onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + selectedTeamId}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Welcome Hero */}
            <motion.div variants={itemVariants}>
              <Card
                className={`border-none shadow-xl ${
                  mode === 'personal'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                } text-white overflow-hidden relative`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <span className="text-3xl font-bold">
                        {user.user_metadata?.name?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase()}
                      </span>
                    </motion.div>
                    <div>
                      <CardTitle className="text-3xl font-bold">
                        {mode === 'personal'
                          ? `Welcome back, ${user.user_metadata?.name || user.email?.split('@')[0]}!`
                          : `${teams.find(t => t.id === selectedTeamId)?.name || 'Team'} Dashboard`}
                      </CardTitle>
                      <CardDescription className="text-white/90 mt-1">
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {mode === 'work' && ' • Work Mode'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5" />
                    <p className="text-white/90">
                      {mode === 'personal'
                        ? `You have ${stats.total} total tasks • ${stats.in_progress} in progress`
                        : `Team has ${stats.total} total tasks • ${stats.in_progress} in progress`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.total}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {completionRate}% completed
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ListTodo className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.in_progress}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Currently working on</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.completed}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Tasks finished</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card
                  className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    stats.overdue > 0 ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.overdue}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.overdue > 0 ? 'Need attention!' : 'All caught up!'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Jump to your most used features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={action.href}>
                          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                            <CardContent className="pt-6">
                              <div
                                className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
                              >
                                <action.icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {action.description}
                              </p>
                              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                                Go now
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Overview */}
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>Overview of your productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm font-bold">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionRate}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {stats.total > 0 && (
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.todo}</p>
                          <p className="text-xs text-muted-foreground">To Do</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{stats.in_progress}</p>
                          <p className="text-xs text-muted-foreground">In Progress</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    )}

                    {stats.total === 0 && (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No tasks yet. Start by creating your first task!
                        </p>
                        <Link href="/tasks">
                          <Button>
                            <Target className="w-4 h-4 mr-2" />
                            Create Task
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
