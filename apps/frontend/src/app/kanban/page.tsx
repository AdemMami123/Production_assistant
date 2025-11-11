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
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { createClient } from '@/lib/supabase/client'
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const [onlineUsers, setOnlineUsers] = useState<number>(0)

  const supabase = createClient()
  const [_channel, setChannel] = useState<RealtimeChannel | null>(null)

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error('No user found')
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Setup Realtime subscriptions
  useEffect(() => {
    fetchTasks()

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
    setActiveId(event.active.id as string)
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

    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

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
        if (activeTask.status === overTask.status) {
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

    // Update status in database if changed
    if (newStatus && activeTask.status !== newStatus) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', activeId)

        if (error) throw error
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating task status:', error)
        // Revert optimistic update
        fetchTasks()
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // CRUD operations
  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      await supabase
        .from('tasks')
        .insert([{ ...taskData, status: defaultStatus, user_id: user.id }])
        .select()
        .single()

      // Realtime will handle adding the task to the list
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (taskData: UpdateTaskInput) => {
    if (!selectedTask) return

    try {
      await supabase.from('tasks').update(taskData).eq('id', selectedTask.id).select().single()

      // Realtime will handle updating the task
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
      await supabase.from('tasks').delete().eq('id', id)

      // Realtime will handle removing the task
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

          {/* Online Users Indicator */}
          <div className="flex items-center gap-2">
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
                  onAddTask={() => openCreateModal(column.id)}
                  onEditTask={openEditModal}
                  onDeleteTask={handleDeleteTask}
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
      />
    </div>
  )
}
