import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

// Initialize Google Gemini AI
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!apiKey) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables')
}

// Create Google provider with API key
const google = createGoogleGenerativeAI({
  apiKey,
})

/**
 * Categorize a task based on its title, description, and priority
 */
export async function categorizeTask(
  title: string,
  description?: string,
  priority?: string
): Promise<{ category: string; confidence: number; reasoning: string }> {
  const prompt = `You are a task categorization AI assistant. Analyze the following task and suggest an appropriate category.

Task Title: ${title}
${description ? `Description: ${description}` : ''}
${priority ? `Priority: ${priority}` : ''}

Common categories include: Work, Personal, Health, Finance, Learning, Shopping, Home, Creative, Social, Travel, Other.

Respond in JSON format with:
{
  "category": "suggested category name",
  "confidence": confidence score from 0-100,
  "reasoning": "brief explanation why this category fits"
}

Choose the most appropriate category based on the task content. Only respond with valid JSON.`

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.3, // Lower temperature for more consistent categorization
    })

    // Parse JSON response
    const cleaned = text.trim().replace(/```json\n?|\n?```/g, '')
    const result = JSON.parse(cleaned)

    return {
      category: result.category || 'Other',
      confidence: result.confidence || 50,
      reasoning: result.reasoning || 'AI-suggested category',
    }
  } catch (error) {
    console.error('Error categorizing task:', error)
    throw new Error('Failed to categorize task with AI')
  }
}

/**
 * Prioritize a list of tasks based on various factors
 */
export async function prioritizeTasks(
  tasks: Array<{
    id: string
    title: string
    description?: string
    status: string
    priority: string
    category?: string
    due_date?: string
    created_at: string
  }>,
  userContext?: {
    pastBehavior?: string
    preferences?: string
  }
): Promise<{
  prioritizedTasks: Array<{
    taskId: string
    recommendedOrder: number
    score: number
    reasoning: string
    suggestedPriority?: string
  }>
  summary: string
}> {
  const prompt = `You are a smart task prioritization AI assistant. Analyze the following tasks and recommend the optimal order to complete them.

Consider:
- Deadlines (due_date)
- Current priority level
- Task status
- Category and context
- Estimated impact and effort
${userContext?.pastBehavior ? `- User's past behavior: ${userContext.pastBehavior}` : ''}
${userContext?.preferences ? `- User's preferences: ${userContext.preferences}` : ''}

Tasks to prioritize:
${JSON.stringify(tasks, null, 2)}

Respond in JSON format with:
{
  "prioritizedTasks": [
    {
      "taskId": "task id",
      "recommendedOrder": 1,
      "score": 0-100 priority score,
      "reasoning": "why this task should be done at this order",
      "suggestedPriority": "low|medium|high|urgent (optional update)"
    }
  ],
  "summary": "Overall prioritization strategy and key insights"
}

Focus on high-value tasks, urgent deadlines, and minimizing context switching. Only respond with valid JSON.`

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.4, // Slightly higher for more nuanced prioritization
    })

    // Parse JSON response
    const cleaned = text.trim().replace(/```json\n?|\n?```/g, '')
    const result = JSON.parse(cleaned)

    return {
      prioritizedTasks: result.prioritizedTasks || [],
      summary: result.summary || 'AI-generated prioritization',
    }
  } catch (error) {
    console.error('Error prioritizing tasks:', error)
    throw new Error('Failed to prioritize tasks with AI')
  }
}
