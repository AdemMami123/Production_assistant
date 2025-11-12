# Workspace Separation Implementation Guide

## Overview

This implementation provides complete workspace isolation between Personal and Team spaces with role-based access control (RBAC).

## Architecture

### Backend Implementation

#### Task Controller (`apps/backend/src/controllers/task.controller.ts`)

**Workspace Filtering:**

- All endpoints now accept `workspace` and `team_id` query parameters
- `workspace=personal`: Filters tasks with `team_id IS NULL`
- `workspace=team&team_id=<uuid>`: Filters tasks with `team_id = <uuid>` and verifies team membership

**Permission Model:**

| Action        | Personal Space    | Team Leader       | Team Member                   |
| ------------- | ----------------- | ----------------- | ----------------------------- |
| Create Task   | ✅ Yes            | ✅ Yes            | ❌ No                         |
| View Tasks    | ✅ Own tasks only | ✅ All team tasks | ✅ All team tasks (read-only) |
| Edit Task     | ✅ Full edit      | ✅ Full edit      | ❌ No                         |
| Update Status | ✅ Yes            | ✅ Yes            | ✅ Yes (kanban only)          |
| Delete Task   | ✅ Yes            | ✅ Yes            | ❌ No                         |

**Key Changes:**

1. **getTasks()**: Added workspace filtering logic

   ```typescript
   // Personal workspace
   query.eq('user_id', userId).is('team_id', null)

   // Team workspace (with membership check)
   query.eq('team_id', teamId)
   ```

2. **createTask()**: Enforces team leader permission for team tasks

   ```typescript
   if (teamId && membership.role !== 'leader') {
     return res.status(403).json({ error: 'Only team leaders can create team tasks' })
   }
   ```

3. **updateTask()**: Team members can ONLY update status

   ```typescript
   if (membership.role !== 'leader') {
     const allowedKeys = ['status']
     // Reject if trying to update other fields
   }
   ```

4. **deleteTask()**: Team members have NO delete permission
   ```typescript
   if (membership.role !== 'leader') {
     return res.status(403).json({ error: 'Only team leaders can delete team tasks' })
   }
   ```

### Frontend Implementation

#### Workspace Context (`apps/frontend/src/contexts/WorkspaceContext.tsx`)

**Features:**

- Global workspace state management
- LocalStorage persistence
- Permission helper functions
- Team context (ID, name, role)

**Key Methods:**

```typescript
const {
  workspace, // 'personal' | 'team'
  teamId, // Current team ID (null if personal)
  teamName, // Current team name
  userRole, // 'leader' | 'member' | null
  canCreateTasks, // Permission helpers
  canEditTasks,
  canDeleteTasks,
  canUpdateTaskStatus,
} = useWorkspace()
```

#### Workspace Switcher (`apps/frontend/src/components/WorkspaceSwitcher.tsx`)

**Features:**

- Dropdown UI to switch between Personal and Team workspaces
- Fetches user's teams
- Automatically determines user role when switching to a team
- Visual indicators for current workspace and role

## Usage Examples

### Backend API Calls

**Fetch Personal Tasks:**

```bash
GET /api/tasks?workspace=personal&status=todo
Authorization: Bearer <token>
```

**Fetch Team Tasks:**

```bash
GET /api/tasks?workspace=team&team_id=<uuid>&status=in_progress
Authorization: Bearer <token>
```

**Create Personal Task:**

```bash
POST /api/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My personal task",
  "status": "todo",
  "priority": "high"
}
```

**Create Team Task (Leader Only):**

```bash
POST /api/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Team task",
  "team_id": "<uuid>",
  "assigned_to": "<user_uuid>",
  "status": "todo",
  "priority": "high"
}
```

**Update Task Status (Members Can Do This):**

```bash
PUT /api/tasks/<task_id>
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "completed"
}
```

**Update Task Title (Leaders Only for Team Tasks):**

```bash
PUT /api/tasks/<task_id>
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated title",
  "description": "Updated description"
}
# Returns 403 if user is a team member (not leader)
```

### Frontend Usage

**In Tasks Page:**

```typescript
import { useWorkspace } from '@/contexts/WorkspaceContext'

function TasksPage() {
  const { workspace, teamId, canCreateTasks, canEditTasks } = useWorkspace()

  // Fetch tasks based on workspace
  const fetchTasks = async () => {
    const url = workspace === 'personal'
      ? '/api/tasks?workspace=personal'
      : `/api/tasks?workspace=team&team_id=${teamId}`

    const response = await fetch(apiUrl(url), {
      headers: await authHeaders()
    })
    // ...
  }

  return (
    <>
      {canCreateTasks() && (
        <Button onClick={openCreateModal}>Create Task</Button>
      )}

      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          canEdit={canEditTasks()}
          canDelete={canDeleteTasks()}
        />
      ))}
    </>
  )
}
```

**In Kanban Board:**

```typescript
import { useWorkspace } from '@/contexts/WorkspaceContext'

function KanbanPage() {
  const { workspace, teamId, canUpdateTaskStatus } = useWorkspace()

  // All users can update status via kanban
  const handleDragEnd = async (task, newStatus) => {
    if (!canUpdateTaskStatus()) return

    await fetch(apiUrl(`/api/tasks/${task.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
      body: JSON.stringify({ status: newStatus }),
    })
  }
}
```

## Database RLS Policies

The Supabase RLS policies ensure database-level enforcement:

**Tasks SELECT Policy:**

```sql
-- Users can view:
-- 1. Their personal tasks (team_id IS NULL)
-- 2. Team tasks where they are members
CREATE POLICY "Users can view accessible tasks"
  ON tasks FOR SELECT
  USING (
    (team_id IS NULL AND user_id = auth.uid())
    OR
    (team_id IS NOT NULL AND is_team_member(team_id, auth.uid()))
  );
```

**Tasks INSERT Policy:**

```sql
-- Users can create personal tasks
-- Team leaders can create team tasks
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (
      team_id IS NULL
      OR
      (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
    )
  );
```

**Tasks UPDATE Policy:**

```sql
-- Users can update their personal tasks
-- Team leaders can fully update team tasks
-- Team members can update (limited to status in backend)
CREATE POLICY "Users can update accessible tasks"
  ON tasks FOR UPDATE
  USING (
    (team_id IS NULL AND user_id = auth.uid())
    OR
    (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
    OR
    (team_id IS NOT NULL AND assigned_to = auth.uid())
  );
```

**Tasks DELETE Policy:**

```sql
-- Users can delete their personal tasks
-- ONLY team leaders can delete team tasks
CREATE POLICY "Users can delete accessible tasks"
  ON tasks FOR DELETE
  USING (
    (team_id IS NULL AND user_id = auth.uid())
    OR
    (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
  );
```

## Testing Checklist

### Personal Workspace

- [ ] User can create, view, edit, delete their own tasks
- [ ] User CANNOT see tasks from other users
- [ ] User CANNOT see team tasks in personal workspace
- [ ] Personal tasks have `team_id = NULL` in database

### Team Workspace (as Leader)

- [ ] Leader can create tasks for the team
- [ ] Leader can assign tasks to team members
- [ ] Leader can edit all team tasks (title, description, status, priority, etc.)
- [ ] Leader can delete team tasks
- [ ] Leader can view all team tasks
- [ ] Leader CANNOT see tasks from other teams

### Team Workspace (as Member)

- [ ] Member CANNOT create new tasks
- [ ] Member CAN view all team tasks (read-only)
- [ ] Member CAN update task status via kanban board
- [ ] Member CANNOT edit task title, description, priority, etc.
- [ ] Member CANNOT delete tasks
- [ ] Member CANNOT see tasks from other teams
- [ ] API returns 403 when member tries to create/edit/delete

### Workspace Isolation

- [ ] Personal tasks are NEVER visible in team workspace
- [ ] Team tasks are NEVER visible in personal workspace
- [ ] Tasks from Team A are NEVER visible when viewing Team B
- [ ] Switching workspaces updates UI and data immediately

## Error Messages

The implementation provides clear error messages for permission violations:

- **Not authenticated**: `401 Unauthorized`
- **Not a team member**: `403 Not a team member`
- **Team member trying to create task**: `403 Only team leaders can create team tasks`
- **Team member trying to edit task (non-status field)**: `403 Team members can only update task status. Full edit permissions are restricted to team leaders.`
- **Team member trying to delete task**: `403 Only team leaders can delete team tasks`

## Integration Steps

1. **Backend**: Already implemented in `task.controller.ts`
2. **Frontend Setup**:
   - Add `WorkspaceProvider` to root layout ✅
   - Import `useWorkspace` hook in task/kanban pages
   - Add `WorkspaceSwitcher` component to navigation
   - Update fetch calls to include `workspace` and `team_id` parameters
3. **UI Updates**:
   - Conditionally show Create/Edit/Delete buttons based on permissions
   - Add visual indicators for workspace type (Personal vs Team)
   - Show role badges for team members

## Next Steps for Full Integration

To complete the workspace separation in the frontend:

1. Update `apps/frontend/src/app/tasks/page.tsx`:
   - Import and use `useWorkspace` hook
   - Modify `fetchTasks` to include workspace parameters
   - Conditionally render create button: `{canCreateTasks() && <CreateButton />}`
   - Pass permissions to TaskCard: `canEdit={canEditTasks()}`

2. Update `apps/frontend/src/app/kanban/page.tsx`:
   - Import and use `useWorkspace` hook
   - Modify `fetchTasks` to include workspace parameters
   - Allow all users to drag/drop (status update)
   - Restrict edit modal based on `canEditTasks()`

3. Update `apps/frontend/src/components/tasks/TaskModal.tsx`:
   - Accept `canEdit` prop
   - Make form read-only for team members
   - Only show status dropdown for team members

4. Add `WorkspaceSwitcher` to dashboard navigation:
   - Replace or complement existing `EnvironmentSwitcher`
   - Show current workspace prominently

## API Reference

### Query Parameters

| Parameter   | Type   | Required    | Description                    |
| ----------- | ------ | ----------- | ------------------------------ |
| `workspace` | string | Yes         | `personal` or `team`           |
| `team_id`   | UUID   | Conditional | Required when `workspace=team` |
| `status`    | string | No          | Filter by task status          |
| `priority`  | string | No          | Filter by task priority        |
| `search`    | string | No          | Search in title/description    |

### Response Format

All task responses now include a `workspace` field:

```json
{
  "success": true,
  "data": [...],
  "workspace": "personal",
  "pagination": { ... }
}
```

Team tasks include additional fields:

```json
{
  "id": "...",
  "title": "Team task",
  "team_id": "uuid",
  "assigned_to": "user_uuid",
  "assigned_by": "leader_uuid",
  ...
}
```
