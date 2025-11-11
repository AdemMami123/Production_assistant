'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// Task types
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

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: CreateTaskInput | UpdateTaskInput) => Promise<void>
  task?: Task | null
  mode: 'create' | 'edit'
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-400' },
]

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
]

const categoryOptions = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Learning',
  'Finance',
  'Home',
  'Other',
]

export function TaskModal({ isOpen, onClose, onSave, task, mode }: TaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: '',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when task changes
  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        category: task.category || '',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '', // Format for datetime-local input
      })
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        category: '',
        due_date: '',
      })
    }
    setErrors({})
  }, [mode, task, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Prepare data
      const taskData: CreateTaskInput | UpdateTaskInput = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        category: formData.category?.trim() || undefined,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      }

      await onSave(taskData)
      onClose()
    } catch (error: any) {
      console.error('Error saving task:', error)
      setErrors({ submit: error.message || 'Failed to save task' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof CreateTaskInput,
    value: string | TaskStatus | TaskPriority
  ) => {
    setFormData((prev: CreateTaskInput) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  const handleAICategorize = async () => {
    if (!formData.title.trim()) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        title: 'Please enter a title before using AI categorization',
      }))
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to categorize task')
      }

      const result = await response.json()

      // Update category with AI suggestion
      handleChange('category', result.category.toLowerCase())

      // Show success feedback (optional - could add a toast notification)
      console.log('AI categorization:', result)
    } catch (error) {
      console.error('Error with AI categorization:', error)
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        ai: 'Failed to get AI category suggestion. Please try again.',
      }))
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Add a new task to your list. Fill in the details below.'
                : 'Update the task details below.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
                disabled={loading}
                autoFocus
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-destructive"
                >
                  {errors.title}
                </motion.p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add task description..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
                rows={4}
                disabled={loading}
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-destructive"
                >
                  {errors.description}
                </motion.p>
              )}
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleChange('status', value as TaskStatus)}
                  disabled={loading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={value => handleChange('priority', value as TaskPriority)}
                  disabled={loading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="capitalize">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category and Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAICategorize}
                    disabled={loading || aiLoading || !formData.title.trim()}
                    className="h-6 gap-1 text-xs"
                  >
                    <Sparkles className={`w-3 h-3 ${aiLoading ? 'animate-pulse' : ''}`} />
                    {aiLoading ? 'Analyzing...' : 'AI Suggest'}
                  </Button>
                </div>
                <Select
                  value={formData.category}
                  onValueChange={value => handleChange('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(category => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ai && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-sm text-muted-foreground"
                  >
                    {errors.ai}
                  </motion.p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={e => handleChange('due_date', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive/10 text-destructive p-3 rounded-md text-sm"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Footer Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </span>
                ) : mode === 'create' ? (
                  'Create Task'
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
