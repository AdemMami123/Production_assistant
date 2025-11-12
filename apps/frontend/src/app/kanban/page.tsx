'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Users, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { createClient } from '@/lib/supabase/client'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { apiUrl, authHeaders, parseJsonSafe } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  category?: string | null
  due_date?: string | null
  created_at: string
  updated_at: string
}

interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  category?: string
  due_date?: string
}

interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  category?: string
  due_date?: string | null
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'from-gray-500 to-gray-600' },
  { id: 'in_progress', title: 'In Progress', color: 'from-blue-500 to-blue-600' },
  { id: 'completed', title: 'Completed', color: 'from-green-500 to-green-600' },
  { id: 'archived', title: 'Archived', color: 'from-gray-400 to-gray-500' },
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [originalTaskStatus, setOriginalTaskStatus] = useState<TaskStatus | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const { addToast } = useToast()
  const [onlineUsers, setOnlineUsers] = useState<number>(0)

  const supabase = createClient()
  const [_channel, setChannel] = useState<RealtimeChannel | null>(null)
  const { workspace, teamId, canCreateTasks, canEditTasks } = useWorkspace()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)

      // Build URL with workspace parameters
      let url = '/api/tasks?workspace=' + workspace
      if (workspace === 'team' && teamId) {
        url += '&team_id=' + teamId
      }

      const extra = await authHeaders()
      const response = await fetch(apiUrl(url), {
        credentials: 'include',
        headers: { ...extra },
      })

      const parsed = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(parsed.json?.error || 'Failed to fetch tasks')
      }

      const data = parsed.json?.data || []
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [workspace, teamId])

  // Setup Realtime subscriptions
  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, teamId])

  useEffect(() => {
    // Subscribe to task changes
    const tasksChannel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        payload => {
          console.log('Realtime event:', payload)

          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(task => (task.id === payload.new.id ? (payload.new as Task) : task))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = tasksChannel.presenceState()
        const users = Object.keys(state).length
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // eslint-disable-next-line no-console
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // eslint-disable-next-line no-console
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            await tasksChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
          }
        }
      })

    setChannel(tasksChannel)

    return () => {
      tasksChannel.unsubscribe()
    }
  }, [supabase, fetchTasks])

  // Group tasks by status
  const tasksByStatus = columns.reduce(
    (acc, column) => {
      acc[column.id] = tasks.filter(task => task.status === column.id)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find(t => t.id === taskId)
    setActiveId(taskId)
    setOriginalTaskStatus(task?.status || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dragging over a column, update task status optimistically
    const overColumn = columns.find(col => col.id === overId)
    if (overColumn) {
      setTasks(tasks =>
        tasks.map(task =>
          task.id === activeId
            ? {
                ...task,
                status: overColumn.id,
              }
            : task
        )
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    const activeId = active.id as string
    setActiveId(null)
    setOriginalTaskStatus(null)

    if (!over) return

    const overId = over.id as string

    // Get current task state
    const currentTask = tasks.find(t => t.id === activeId)
    if (!currentTask) return

    // Determine new status
    let newStatus: TaskStatus | null = null

    // Check if dropped on a column
    const overColumn = columns.find(col => col.id === overId)
    if (overColumn) {
      newStatus = overColumn.id
    } else {
      // Dropped on another task, get that task's status
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) {
        newStatus = overTask.status

        // Reorder within the same column
        if (currentTask.status === overTask.status) {
          const columnTasks = tasksByStatus[newStatus]
          const oldIndex = columnTasks.findIndex(t => t.id === activeId)
          const newIndex = columnTasks.findIndex(t => t.id === overId)

          const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex)
          setTasks(tasks => {
            const otherTasks = tasks.filter(t => t.status !== newStatus)
            return [...otherTasks, ...reorderedTasks]
          })
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log('Drag end check:', {
      activeId,
      newStatus,
      originalTaskStatus,
      shouldUpdate: newStatus && originalTaskStatus && originalTaskStatus !== newStatus,
    })

    // Update status in database if changed (compare with original status)
    if (newStatus && originalTaskStatus && originalTaskStatus !== newStatus) {
      try {
        const extra = await authHeaders()
        const response = await fetch(apiUrl(`/api/tasks/${activeId}`), {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...extra,
          },
          body: JSON.stringify({ status: newStatus }),
        })

        const parsed = await parseJsonSafe(response)
        if (!response.ok) {
          throw new Error(parsed.json?.error || 'Failed to update task status')
        }

        // eslint-disable-next-line no-console
        console.log('Task status updated successfully:', { taskId: activeId, newStatus })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating task status:', error)
        // Revert to previous state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === activeId ? { ...task, status: originalTaskStatus } : task
          )
        )
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // CRUD operations
  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      const payload: any = { ...taskData, status: defaultStatus }
      if (workspace === 'team' && teamId) {
        payload.team_id = teamId
      }

      const extra = await authHeaders()
      const response = await fetch(apiUrl('/api/tasks'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...extra,
        },
        body: JSON.stringify(payload),
      })

      const parsed = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(parsed.json?.error || 'Failed to create task')
      }

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (taskData: UpdateTaskInput) => {
    if (!selectedTask) return

    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/tasks/${selectedTask.id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...extra,
        },
        body: JSON.stringify(taskData),
      })

      const parsed = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(parsed.json?.error || 'Failed to update task')
      }

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating task:', error)
      throw error
    }
  }

  const handleSaveTask = async (taskData: CreateTaskInput | UpdateTaskInput) => {
    if (modalMode === 'create') {
      await handleCreateTask(taskData as CreateTaskInput)
    } else {
      await handleUpdateTask(taskData as UpdateTaskInput)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl(`/api/tasks/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...extra },
      })

      const parsed = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(parsed.json?.error || 'Failed to delete task')
      }

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting task:', error)
    }
  }

  const openCreateModal = (status: TaskStatus) => {
    setDefaultStatus(status)
    setSelectedTask(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleAIPrioritize = async () => {
    if (tasks.length === 0) {
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/ai/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            category: task.category,
            due_date: task.due_date,
            created_at: task.created_at,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to prioritize tasks')
      }

      const result = await response.json()

      // Update tasks with suggested priorities
      if (result.prioritizedTasks && result.prioritizedTasks.length > 0) {
        const updates = result.prioritizedTasks.map(async (pt: any) => {
          if (pt.suggestedPriority) {
            await supabase
              .from('tasks')
              .update({ priority: pt.suggestedPriority })
              .eq('id', pt.taskId)
          }
        })

        await Promise.all(updates)

        // Refresh tasks
        await fetchTasks()

        // Show success message via toast (addToast is called from top-level hook)
        console.log('AI Prioritization summary:', result.summary)
        addToast({
          type: 'success',
          title: 'Tasks prioritized!',
          message: result.summary,
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error with AI prioritization:', error)
      addToast({
        type: 'error',
        title: 'AI prioritization failed',
        message: 'Failed to prioritize tasks with AI. Please try again.',
        duration: 4000,
      })
    } finally {
      setAiLoading(false)
    }
  }

  const activeTask = tasks.find(task => task.id === activeId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1800px] mx-auto"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Kanban Board
            </h1>
            <p className="text-muted-foreground">Drag and drop tasks to organize your workflow</p>
          </div>

          {/* Actions and Online Users */}
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIPrioritize}
                disabled={aiLoading || loading}
                className="gap-2"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-pulse' : ''}`} />
                {aiLoading ? 'Analyzing...' : 'AI Prioritize'}
              </Button>
            )}
            {onlineUsers > 0 && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                {onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online
              </Badge>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  onAddTask={canCreateTasks() ? () => openCreateModal(column.id) : undefined}
                  onEditTask={canEditTasks() ? openEditModal : undefined}
                  onDeleteTask={canEditTasks() ? handleDeleteTask : undefined}
                />
              ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 opacity-80">
                  <KanbanCard task={activeTask} onEdit={() => {}} onDelete={() => {}} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
        readOnly={!canEditTasks() && modalMode === 'edit'}
      />
    </div>
  )
}
