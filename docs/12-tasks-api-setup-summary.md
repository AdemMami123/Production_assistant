# Tasks API Setup - Quick Start Guide

## ✅ What Was Implemented

### 1. Database Schema (`supabase/migrations/001_create_tasks_schema.sql`)

✅ **Tasks Table** with columns:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `title` (text, required)
- `description` (text, optional)
- `status` (enum: todo, in_progress, completed, archived)
- `priority` (enum: low, medium, high, urgent)
- `category` (text, optional)
- `due_date` (timestamp with timezone)
- `created_at` / `updated_at` (auto-managed)

✅ **Row Level Security (RLS)** enabled with policies:
- Users can only view/insert/update/delete their own tasks
- Automatic user isolation based on JWT

✅ **Indexes** for performance:
- user_id, status, due_date, category

✅ **View** for task statistics:
- `user_task_stats` - aggregated counts per user

---

### 2. TypeScript Types (`packages/shared/src/types/task.ts`)

```typescript
Task
CreateTaskInput
UpdateTaskInput
TaskQueryFilters
TaskStats
TaskStatus
TaskPriority
```

---

### 3. Validation Schemas (`packages/shared/src/validation/task.ts`)

Zod schemas for:
- `createTaskSchema` - validates new tasks
- `updateTaskSchema` - validates task updates
- `taskQuerySchema` - validates query parameters
- `taskIdSchema` - validates UUID parameters

---

### 4. Backend API

#### Authentication Middleware (`apps/backend/src/middleware/auth.middleware.ts`)

✅ `authenticateUser` - Validates JWT tokens from Supabase
✅ Attaches user info to request object
✅ Returns 401 for invalid/missing tokens

#### Task Controller (`apps/backend/src/controllers/task.controller.ts`)

✅ `getTasks` - GET /api/tasks (with filters, pagination, sorting)
✅ `getTaskById` - GET /api/tasks/:id
✅ `createTask` - POST /api/tasks
✅ `updateTask` - PUT /api/tasks/:id
✅ `deleteTask` - DELETE /api/tasks/:id
✅ `getTaskStats` - GET /api/tasks/stats

#### Routes (`apps/backend/src/routes/task.routes.ts`)

All routes protected by `authenticateUser` middleware

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

**Option A: Supabase Dashboard (Easiest)**

1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Copy contents of `supabase/migrations/001_create_tasks_schema.sql`
5. Paste and click "Run"

**Option B: Supabase CLI**

```bash
supabase db push
```

### Step 2: Verify Database Setup

1. Go to "Table Editor" in Supabase Dashboard
2. You should see the `tasks` table
3. Click on it to verify columns and RLS policies

### Step 3: Update Environment Variables

Your backend `.env` should already have:
```env
SUPABASE_URL=https://yfsrklzmbymaaytntrsw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Start the Backend Server

```bash
cd apps/backend
npm run dev
```

Server will start on `http://localhost:4000`

### Step 5: Test the API

#### Get a JWT Token

1. Go to `http://localhost:3000/login`
2. Sign in with your account
3. Open DevTools → Network tab
4. Look for Supabase auth request
5. Copy the `access_token`

#### Test with cURL

```bash
# Set your token
TOKEN="your-access-token-here"

# Create a task
curl -X POST "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My first task",
    "description": "Testing the API",
    "priority": "high",
    "status": "todo"
  }'

# Get all tasks
curl -X GET "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer $TOKEN"

# Get task statistics
curl -X GET "http://localhost:4000/api/tasks/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (with filters) | ✅ Yes |
| GET | `/api/tasks/:id` | Get specific task | ✅ Yes |
| POST | `/api/tasks` | Create new task | ✅ Yes |
| PUT | `/api/tasks/:id` | Update task | ✅ Yes |
| DELETE | `/api/tasks/:id` | Delete task | ✅ Yes |
| GET | `/api/tasks/stats` | Get task statistics | ✅ Yes |

---

## 🔍 Query Parameters (GET /api/tasks)

- `status` - Filter by status (todo, in_progress, completed, archived)
- `priority` - Filter by priority (low, medium, high, urgent)
- `category` - Filter by category
- `due_before` - Tasks due before date
- `due_after` - Tasks due after date
- `search` - Search in title/description
- `limit` - Results per page (max 100, default 50)
- `offset` - Skip results (for pagination)
- `order_by` - Sort field (created_at, updated_at, due_date, priority)
- `order_direction` - Sort direction (asc, desc)

**Example:**
```
GET /api/tasks?status=in_progress&priority=high&limit=10&order_by=due_date
```

---

## 📝 Request Body Examples

### Create Task

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "status": "todo",
  "priority": "high",
  "category": "documentation",
  "due_date": "2025-11-20T17:00:00Z"
}
```

### Update Task

```json
{
  "status": "completed",
  "description": "Updated description"
}
```

---

## 🧪 Testing Checklist

- [ ] Database migration ran successfully
- [ ] Tasks table exists in Supabase
- [ ] RLS policies are enabled
- [ ] Backend server starts without errors
- [ ] Health check works: `GET /health`
- [ ] Can create a task with valid JWT
- [ ] Can get all tasks
- [ ] Can update a task
- [ ] Can delete a task
- [ ] Can get task statistics
- [ ] Invalid JWT returns 401
- [ ] Invalid data returns 400
- [ ] Task not found returns 404

---

## 🎯 Next Steps

1. **Test all endpoints** using Postman or cURL
2. **Build frontend UI** for task management
3. **Add real-time updates** using Supabase Realtime
4. **Implement task search** with full-text search
5. **Add task categories** management
6. **Create task templates** functionality
7. **Add file attachments** to tasks

---

## 📚 Documentation Files

- `docs/10-database-setup.md` - Detailed database setup guide
- `docs/11-tasks-api-documentation.md` - Complete API reference
- `supabase/migrations/001_create_tasks_schema.sql` - Database schema

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** - Users can only access their own tasks
✅ **JWT Authentication** - All endpoints require valid Supabase token
✅ **Input Validation** - Zod schemas validate all inputs
✅ **Foreign Key Constraints** - Data integrity enforced at DB level
✅ **SQL Injection Protection** - Supabase client uses parameterized queries

---

## 🐛 Troubleshooting

### "Task not found" when task exists
- Check RLS policies are enabled
- Verify user_id matches authenticated user
- Ensure JWT token is valid

### "Unauthorized" errors
- Check JWT token is included in Authorization header
- Verify token format: `Bearer <token>`
- Token might be expired (login again)

### Database connection errors
- Verify SUPABASE_URL in .env
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Test connection in Supabase dashboard

---

## ✅ Implementation Complete!

You now have a fully functional Tasks CRUD API with:
- ✅ Secure database schema with RLS
- ✅ Complete REST API endpoints
- ✅ JWT authentication
- ✅ Input validation
- ✅ Comprehensive documentation
- ✅ TypeScript types
- ✅ Error handling

**Ready to build the frontend task management UI!** 🚀
