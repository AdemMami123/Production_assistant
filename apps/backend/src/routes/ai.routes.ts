import express from 'express'
import { categorizeTaskController, prioritizeTasksController } from '../controllers/ai.controller'

const router = express.Router()

// POST /api/ai/categorize - Categorize a single task
router.post('/categorize', categorizeTaskController)

// POST /api/ai/prioritize - Prioritize a list of tasks
router.post('/prioritize', prioritizeTasksController)

export default router
