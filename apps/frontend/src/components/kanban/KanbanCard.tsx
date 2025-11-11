'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Edit, Trash2, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { format } from 'date-fns'

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

interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isDragging?: boolean
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function KanbanCard({ task, onEdit, onDelete, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`group cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          isDragging ? 'shadow-2xl rotate-3' : ''
        } ${isSortableDragging ? 'opacity-50' : ''}`}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold line-clamp-2">{task.title}</CardTitle>
            </div>

            {/* Drag Handle & Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => {
                  e.stopPropagation()
                  onEdit(task)
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {task.description && (
            <CardDescription className="text-xs line-clamp-2 mb-2">
              {task.description}
            </CardDescription>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>

        {task.due_date && (
          <CardFooter className="p-3 pt-0">
            <div
              className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {isOverdue && 'Overdue: '}
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
