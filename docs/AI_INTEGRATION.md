# AI Integration Guide - Google Gemini

This guide documents the AI-powered features integrated into the Productivity Assistant using Google's Gemini 2.0 Flash model.

## Features

### 1. Task Auto-Categorization

Automatically assigns categories to tasks based on their titles, descriptions, and priorities using natural language processing.

**How it works:**

- Analyzes task content using Gemini AI
- Suggests appropriate category from predefined list
- Provides confidence score and reasoning
- Reduces manual tagging effort

**Available categories:**

- Work, Personal, Health, Finance, Learning, Shopping, Home, Creative, Social, Travel, Other

### 2. Smart Task Prioritization

Uses AI to recommend task order by analyzing deadlines, impact, effort, and complexity.

**How it works:**

- Analyzes all tasks in the workspace
- Considers deadlines, current priority, status, and categories
- Returns prioritized list with scores and reasoning
- Can update task priorities automatically
- Provides overall prioritization strategy summary

## API Configuration

### Environment Variables

Add to `apps/backend/.env`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC9o24PG-jSSUPBOA7MSAbgnx5skc517JY
```

### Dependencies

- `ai` - Vercel AI SDK
- `@ai-sdk/google@^2.0.31` - Google provider for AI SDK (v2 compatible)

## API Endpoints

### POST /api/ai/categorize

Categorize a single task.

**Request Body:**

```json
{
  "title": "Complete project presentation",
  "description": "Prepare slides for Q4 review",
  "priority": "high"
}
```

**Response:**

```json
{
  "category": "work",
  "confidence": 95,
  "reasoning": "This is clearly a work-related task involving presentations and project reviews"
}
```

### POST /api/ai/prioritize

Prioritize multiple tasks.

**Request Body:**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Description",
      "status": "todo",
      "priority": "medium",
      "category": "work",
      "due_date": "2025-11-15T10:00:00Z",
      "created_at": "2025-11-11T08:00:00Z"
    }
  ],
  "userContext": {
    "pastBehavior": "Tends to complete urgent tasks first",
    "preferences": "Prefers morning work sessions"
  }
}
```

**Response:**

```json
{
  "prioritizedTasks": [
    {
      "taskId": "uuid",
      "recommendedOrder": 1,
      "score": 95,
      "reasoning": "High priority with approaching deadline",
      "suggestedPriority": "urgent"
    }
  ],
  "summary": "Focus on urgent tasks with deadlines this week, followed by high-impact work items"
}
```

## Frontend Integration

### Task Modal - AI Categorization

The task creation/edit modal includes an "AI Suggest" button next to the category field.

**Usage:**

1. Enter task title and optionally description
2. Click "AI Suggest" button (sparkles icon)
3. AI analyzes the task and auto-selects category
4. Review and adjust if needed

**Location:** `apps/frontend/src/components/tasks/TaskModal.tsx`

### Kanban Board - AI Prioritization

The Kanban board header includes an "AI Prioritize" button.

**Usage:**

1. Click "AI Prioritize" button in the header
2. AI analyzes all tasks
3. Priorities are automatically updated in the database
4. A summary of the prioritization strategy is displayed
5. Tasks refresh with new priorities

**Location:** `apps/frontend/src/app/kanban/page.tsx`

## Implementation Details

### Backend Files

**AI Utility (`apps/backend/src/lib/ai.ts`):**

- Initializes Gemini AI client with API key
- `categorizeTask()` - Categorization logic
- `prioritizeTasks()` - Prioritization logic
- Uses structured JSON prompts for consistent responses

**AI Controller (`apps/backend/src/controllers/ai.controller.ts`):**

- `categorizeTaskController` - Handles categorization requests
- `prioritizeTasksController` - Handles prioritization requests
- Input validation and error handling

**AI Routes (`apps/backend/src/routes/ai.routes.ts`):**

- Defines `/api/ai/categorize` and `/api/ai/prioritize` endpoints
- Integrated into main API router

### Frontend Files

**Task Modal (`apps/frontend/src/components/tasks/TaskModal.tsx`):**

- Added AI categorization button with Sparkles icon
- `handleAICategorize()` function calls backend API
- Loading states and error handling
- Auto-updates category field with AI suggestion

**Kanban Page (`apps/frontend/src/app/kanban/page.tsx`):**

- Added AI prioritization button in header
- `handleAIPrioritize()` function calls backend API
- Batch updates all task priorities
- Displays AI summary to user

### Shared Types

**AI Types (`packages/shared/src/types/ai.ts`):**

- `TaskCategorizationRequest` - Request format for categorization
- `TaskCategorizationResponse` - Response format with category and confidence
- `TaskForPrioritization` - Task structure for prioritization
- `TaskPrioritizationRequest` - Request format with tasks array
- `PrioritizedTask` - Individual task priority recommendation
- `TaskPrioritizationResponse` - Response with prioritized list and summary

## UI/UX Features

### Visual Indicators

- **Sparkles icon** (✨) - Indicates AI-powered features
- **Loading animations** - Pulsing effect during AI processing
- **Disabled states** - Prevents multiple simultaneous requests
- **Auto-fill** - Seamlessly updates form fields with AI suggestions

### User Experience

- **Non-blocking** - AI features are optional enhancements
- **Fast feedback** - Loading indicators during processing
- **Error handling** - Graceful degradation if AI fails
- **Transparency** - Shows AI reasoning and confidence scores

## Best Practices

### When to Use AI Categorization

- ✅ New tasks with descriptive titles
- ✅ Tasks with detailed descriptions
- ✅ Batch importing tasks from other sources
- ❌ Single-word tasks without context
- ❌ Tasks that need custom categories

### When to Use AI Prioritization

- ✅ Large task lists (10+ tasks)
- ✅ Multiple deadlines to manage
- ✅ Unclear which tasks to tackle first
- ✅ Beginning of work day/week
- ❌ Single task in list
- ❌ Already well-organized tasks

## Performance Considerations

- **API Calls:** AI requests are made to Google's servers
- **Response Time:** Typically 1-3 seconds per request
- **Rate Limits:** Google API has usage quotas
- **Caching:** Consider implementing for frequently categorized terms
- **Batch Processing:** Prioritization processes all tasks at once

## Future Enhancements

Potential improvements:

1. **Smart Scheduling** - AI suggests optimal times to work on tasks
2. **Task Dependencies** - AI detects task relationships
3. **Effort Estimation** - AI estimates time required
4. **Context Learning** - AI learns from user behavior over time
5. **Natural Language Input** - Create tasks via conversational interface
6. **Smart Reminders** - AI-powered notification timing
7. **Task Breakdown** - AI splits complex tasks into subtasks

## Troubleshooting

### AI Categorization Not Working

- ✅ Check backend server is running (`npm run dev` in apps/backend)
- ✅ Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`
- ✅ Ensure task has a title before clicking AI Suggest
- ✅ Check browser console for error messages
- ✅ Verify backend logs for API errors

### AI Prioritization Not Working

- ✅ Ensure at least one task exists
- ✅ Check tasks have required fields (id, title, status, priority)
- ✅ Verify backend API endpoint is accessible
- ✅ Check for CORS errors in browser console
- ✅ Confirm Supabase permissions for task updates

### API Key Issues

- 🔑 Ensure API key is valid and active
- 🔑 Check Google Cloud Console for quota limits
- 🔑 Verify API key has Gemini API enabled
- 🔑 Restart backend after updating `.env`

## Testing

### Manual Testing Checklist

**Task Categorization:**

- [ ] Create new task with work-related title
- [ ] Click "AI Suggest" button
- [ ] Verify category is auto-selected
- [ ] Test with different task types (personal, health, etc.)
- [ ] Test error handling (empty title)

**Task Prioritization:**

- [ ] Create 5+ tasks with varied priorities and deadlines
- [ ] Click "AI Prioritize" button
- [ ] Verify priorities are updated
- [ ] Check summary message is displayed
- [ ] Confirm tasks refresh with new priorities

## Cost Considerations

Google Gemini API pricing (as of November 2025):

- Gemini 2.0 Flash: Free tier available
- Check current pricing at: https://ai.google.dev/pricing
- Monitor usage in Google Cloud Console

## Security Notes

- ⚠️ API key is stored in backend `.env` (never expose to frontend)
- ⚠️ Backend validates all requests before calling AI
- ⚠️ User authentication required for all AI endpoints
- ⚠️ Task data is sent to Google's servers (review privacy policy)
- ⚠️ Consider data sanitization for sensitive information

---

**Last Updated:** November 11, 2025
**AI Model:** Google Gemini 2.0 Flash (v2)
**Integration Status:** ✅ Complete and Functional
