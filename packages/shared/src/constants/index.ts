// API Routes
export const API_ROUTES = {
  TASKS: '/api/tasks',
  USERS: '/api/users',
  AUTH: '/api/auth',
  HEALTH: '/health'
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'An unexpected error occurred'
} as const

// Task Priority Levels
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

// Task Status Options
export const TASK_STATUSES = ['todo', 'in-progress', 'completed', 'archived'] as const

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
} as const
