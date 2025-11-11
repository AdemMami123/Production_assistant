'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { KanbanCard } from './KanbanCard'

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

interface Column {
  id: TaskStatus
  title: string
  color: string
}

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map(task => task.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <Card
        className={`flex flex-col h-full transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
        }`}
      >
        {/* Column Header */}
        <div className={`p-4 rounded-t-lg bg-gradient-to-r ${column.color}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white text-lg">{column.title}</h3>
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {tasks.length}
            </Badge>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddTask}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Tasks Container */}
        <div
          ref={setNodeRef}
          className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[400px] max-h-[calc(100vh-300px)]"
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="text-center">
                  <p>No tasks</p>
                  <p className="text-xs mt-1">Drag tasks here or click Add Task</p>
                </div>
              </div>
            ) : (
              tasks.map(task => (
                <KanbanCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
              ))
            )}
          </SortableContext>
        </div>
      </Card>
    </motion.div>
  )
}
