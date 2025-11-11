# Supabase Database Setup Guide

This guide will help you set up the database schema for the Productivity Assistant application.

## Prerequisites

- Supabase account and project created
- Supabase project URL and keys configured in `.env` files

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the entire contents of `supabase/migrations/001_create_tasks_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see the `tasks` table
   - Click on it to verify columns

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run specific migration
supabase db execute -f supabase/migrations/001_create_tasks_schema.sql
```

---

## Database Schema Overview

### Tables

#### `tasks`

| Column        | Type        | Description               | Constraints                                   |
| ------------- | ----------- | ------------------------- | --------------------------------------------- |
| `id`          | UUID        | Primary key               | Auto-generated                                |
| `user_id`     | UUID        | Foreign key to auth.users | NOT NULL, ON DELETE CASCADE                   |
| `title`       | TEXT        | Task title                | NOT NULL                                      |
| `description` | TEXT        | Task description          | Nullable                                      |
| `status`      | TEXT        | Task status               | CHECK: todo, in_progress, completed, archived |
| `priority`    | TEXT        | Task priority             | CHECK: low, medium, high, urgent              |
| `category`    | TEXT        | Task category             | Nullable                                      |
| `due_date`    | TIMESTAMPTZ | Task due date             | Nullable                                      |
| `created_at`  | TIMESTAMPTZ | Creation timestamp        | Default: NOW()                                |
| `updated_at`  | TIMESTAMPTZ | Last update timestamp     | Auto-updated                                  |

### Indexes

```sql
tasks_user_id_idx      -- Fast queries by user
tasks_status_idx       -- Fast filtering by status
tasks_due_date_idx     -- Fast sorting by due date
tasks_category_idx     -- Fast filtering by category
```

### Row Level Security (RLS)

All policies enforce user isolation - users can only access their own tasks.

#### Policies

1. **View Own Tasks** (`SELECT`)
   - Users can only view tasks where `user_id` matches their auth ID

2. **Insert Own Tasks** (`INSERT`)
   - Users can only create tasks with their own `user_id`

3. **Update Own Tasks** (`UPDATE`)
   - Users can only update their own tasks

4. **Delete Own Tasks** (`DELETE`)
   - Users can only delete their own tasks

### Views

#### `user_task_stats`

Aggregated statistics per user:

- `total_tasks` - Total number of tasks
- `completed_tasks` - Tasks with status 'completed'
- `todo_tasks` - Tasks with status 'todo'
- `in_progress_tasks` - Tasks with status 'in_progress'
- `overdue_tasks` - Tasks past due date and not completed

---

## Verification

### Test RLS Policies

1. **Sign up a test user** via your frontend
2. **Get the user's JWT token** from the browser (inspect network requests)
3. **Test queries in SQL Editor**:

```sql
-- This should show only the test user's tasks
SELECT * FROM tasks;

-- Try to insert a task
INSERT INTO tasks (user_id, title, status, priority)
VALUES (auth.uid(), 'Test Task', 'todo', 'medium');

-- Verify RLS is working - this should fail
SELECT * FROM tasks WHERE user_id != auth.uid();
```

### Test from Backend API

```bash
# Start the backend server
cd apps/backend
npm run dev

# Test health endpoint
curl http://localhost:4000/health

# Test tasks endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:4000/api/tasks
```

---

## Task Status Flow

```
todo → in_progress → completed
  ↓
archived
```

- **todo**: New tasks start here
- **in_progress**: Tasks being worked on
- **completed**: Finished tasks
- **archived**: Old/cancelled tasks

## Task Priority Levels

- **urgent**: Critical, needs immediate attention
- **high**: Important, should be done soon
- **medium**: Normal priority (default)
- **low**: Can be done later

---

## Common SQL Queries

### Get All Tasks for a User

```sql
SELECT * FROM tasks
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get Tasks by Status

```sql
SELECT * FROM tasks
WHERE user_id = auth.uid()
  AND status = 'in_progress'
ORDER BY priority DESC, due_date ASC;
```

### Get Overdue Tasks

```sql
SELECT * FROM tasks
WHERE user_id = auth.uid()
  AND due_date < NOW()
  AND status != 'completed'
ORDER BY due_date ASC;
```

### Get Task Statistics

```sql
SELECT * FROM user_task_stats
WHERE user_id = auth.uid();
```

---

## Troubleshooting

### RLS Policies Not Working

If you can see other users' tasks:

1. Verify RLS is enabled: `ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'tasks';`
3. Ensure you're authenticated when querying

### Foreign Key Constraint Errors

If insertions fail with FK errors:

1. Verify the user exists in `auth.users`
2. Check the `user_id` value matches an existing user
3. Ensure you're using `auth.uid()` for current user

### Migration Fails

If the migration script fails:

1. Check for existing tables: `DROP TABLE IF EXISTS tasks CASCADE;`
2. Verify UUID extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
3. Run parts of the script separately to identify the issue

---

## Next Steps

After setting up the database:

1. ✅ Verify tables exist in Supabase Dashboard
2. ✅ Test RLS policies work correctly
3. ✅ Start the backend server
4. ✅ Test API endpoints with Postman/cURL
5. ✅ Build frontend task management UI

---

## API Endpoints (Backend)

Once the database is set up, these endpoints will be available:

- `GET /api/tasks` - Get all tasks with filters
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.
