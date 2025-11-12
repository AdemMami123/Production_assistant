'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Users, Calendar, MessageSquare, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiUrl, authHeaders, parseJsonSafe } from '@/lib/api'
import type { Notification } from '@productivity-assistant/shared'

interface NotificationBellProps {
  onNotificationClick?: () => void
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl('/api/notifications/unread-count'), {
        credentials: 'include',
        headers: { ...extra },
      })

      const parsed = await parseJsonSafe(response)
      if (response.ok && parsed.json?.data) {
        setUnreadCount(parsed.json.data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const extra = await authHeaders()
      const response = await fetch(apiUrl('/api/notifications?read=false'), {
        credentials: 'include',
        headers: { ...extra },
      })

      const parsed = await parseJsonSafe(response)
      if (response.ok && parsed.json?.data) {
        setNotifications(parsed.json.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    if (!showDropdown) {
      fetchNotifications()
    }
    setShowDropdown(!showDropdown)
    onNotificationClick?.()
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const extra = await authHeaders()
      await fetch(apiUrl(`/api/notifications/${notificationId}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...extra,
        },
        body: JSON.stringify({ read: true }),
      })

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const extra = await authHeaders()
      await fetch(apiUrl('/api/notifications/mark-all-read'), {
        method: 'POST',
        credentials: 'include',
        headers: { ...extra },
      })

      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team_invitation':
        return <Users className="w-5 h-5 text-purple-500" />
      case 'task_assigned':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'task_comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return <Calendar className="w-5 h-5 text-orange-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={handleBellClick} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-12 w-96 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                      <Check className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm mb-1">{notification.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
