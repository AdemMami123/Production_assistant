'use client'

import { motion } from 'framer-motion'
import { Calendar, Trash2, Edit, CheckCircle2, Clock } from 'lucide-react'
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

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  index: number
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const statusConfig: Record<TaskStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  todo: {
    label: 'To Do',
    icon: Clock,
    color: 'text-gray-500',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  archived: {
    label: 'Archived',
    icon: Clock,
    color: 'text-gray-400',
  },
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, index }: TaskCardProps) {
  const StatusIcon = statusConfig[task.status].icon
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
      }}
      layout
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <StatusIcon className={`w-4 h-4 ${statusConfig[task.status].color}`} />
                <span className={`text-xs ${statusConfig[task.status].color}`}>
                  {statusConfig[task.status].label}
                </span>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          {task.description && (
            <CardDescription className="line-clamp-3 text-sm">
              {task.description}
            </CardDescription>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {/* Priority Badge */}
            <Badge variant="secondary" className={priorityColors[task.priority]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {/* Category Badge */}
            {task.category && (
              <Badge variant="outline">
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-3 border-t">
          {/* Due Date */}
          {task.due_date ? (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue && 'Overdue: '}
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No due date</div>
          )}

          {/* Quick Status Change */}
          {task.status !== 'completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusChange(task.id, 'completed')}
              className="text-xs text-primary hover:underline"
            >
              Mark complete
            </motion.button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
