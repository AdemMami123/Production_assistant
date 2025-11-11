import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    })
  }
}
