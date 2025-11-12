'use client'

import { useToast } from '@/contexts/ToastContext'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 100 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: index * 0.05,
            }}
            className={`mb-3 pointer-events-auto`}
          >
            <div
              className={`rounded-lg border shadow-lg backdrop-blur-sm ${getColors(
                toast.type
              )} p-4 flex items-start gap-3 min-w-[300px] max-w-[400px]`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {toast.title}
                </h3>
                {toast.message && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
