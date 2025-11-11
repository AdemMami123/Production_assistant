# Tasks API Documentation

Complete REST API documentation for task management endpoints.

---

## Base URL

```
http://localhost:4000/api
```

## Authentication

All endpoints require a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a JWT Token

1. **Sign up/Login via Frontend**
   - Use the signup/login pages at `http://localhost:3000`
   - Open browser DevTools → Network tab
   - Look for Supabase auth requests
   - Copy the `access_token` from the response

2. **Via Supabase Client**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession()
   const token = session?.access_token
   ```

---

## Endpoints

### 1. Get All Tasks

**GET** `/api/tasks`

Get all tasks for the authenticated user with optional filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| `status` | string | Filter by status (todo, in_progress, completed, archived) | - | No |
| `priority` | string | Filter by priority (low, medium, high, urgent) | - | No |
| `category` | string | Filter by category | - | No |
| `due_before` | ISO datetime | Tasks due before this date | - | No |
| `due_after` | ISO datetime | Tasks due after this date | - | No |
| `search` | string | Search in title and description | - | No |
| `limit` | number | Number of results per page (max 100) | 50 | No |
| `offset` | number | Number of results to skip | 0 | No |
| `order_by` | string | Sort field (created_at, updated_at, due_date, priority) | created_at | No |
| `order_direction` | string | Sort direction (asc, desc) | desc | No |

#### Example Request

```bash
curl -X GET "http://localhost:4000/api/tasks?status=in_progress&priority=high&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
      "title": "Complete API documentation",
      "description": "Write comprehensive docs for all endpoints",
      "status": "in_progress",
      "priority": "high",
      "category": "development",
      "due_date": "2025-11-15T23:59:59Z",
      "created_at": "2025-11-10T10:00:00Z",
      "updated_at": "2025-11-11T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Get Task by ID

**GET** `/api/tasks/:id`

Get a specific task by its ID.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Task ID |

#### Example Request

```bash
curl -X GET "http://localhost:4000/api/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
    "title": "Complete API documentation",
    "description": "Write comprehensive docs for all endpoints",
    "status": "in_progress",
    "priority": "high",
    "category": "development",
    "due_date": "2025-11-15T23:59:59Z",
    "created_at": "2025-11-10T10:00:00Z",
    "updated_at": "2025-11-11T14:30:00Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 3. Create Task

**POST** `/api/tasks`

Create a new task for the authenticated user.

#### Request Body

```json
{
  "title": "Complete API documentation",
  "description": "Write comprehensive docs for all endpoints",
  "status": "todo",
  "priority": "high",
  "category": "development",
  "due_date": "2025-11-15T23:59:59Z"
}
```

#### Body Fields

| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `title` | string (max 200) | Task title | Yes | - |
| `description` | string (max 2000) | Task description | No | null |
| `status` | enum | Status (todo, in_progress, completed, archived) | No | todo |
| `priority` | enum | Priority (low, medium, high, urgent) | No | medium |
| `category` | string (max 50) | Task category | No | null |
| `due_date` | ISO datetime | Due date and time | No | null |

#### Example Request

```bash
curl -X POST "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write unit tests",
    "description": "Add test coverage for task controller",
    "status": "todo",
    "priority": "high",
    "category": "testing",
    "due_date": "2025-11-20T17:00:00Z"
  }'
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "234e5678-e89b-12d3-a456-426614174111",
    "user_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
    "title": "Write unit tests",
    "description": "Add test coverage for task controller",
    "status": "todo",
    "priority": "high",
    "category": "testing",
    "due_date": "2025-11-20T17:00:00Z",
    "created_at": "2025-11-11T15:00:00Z",
    "updated_at": "2025-11-11T15:00:00Z"
  },
  "message": "Task created successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid task data",
  "details": [
    {
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

---

### 4. Update Task

**PUT** `/api/tasks/:id`

Update an existing task. Only provided fields will be updated.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Task ID |

#### Request Body (All fields optional)

```json
{
  "title": "Updated task title",
  "status": "completed",
  "priority": "medium"
}
```

#### Example Request

```bash
curl -X PUT "http://localhost:4000/api/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "description": "Task has been completed successfully"
  }'
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
    "title": "Complete API documentation",
    "description": "Task has been completed successfully",
    "status": "completed",
    "priority": "high",
    "category": "development",
    "due_date": "2025-11-15T23:59:59Z",
    "created_at": "2025-11-10T10:00:00Z",
    "updated_at": "2025-11-11T16:00:00Z"
  },
  "message": "Task updated successfully"
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 5. Delete Task

**DELETE** `/api/tasks/:id`

Delete a task permanently.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Task ID |

#### Example Request

```bash
curl -X DELETE "http://localhost:4000/api/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 6. Get Task Statistics

**GET** `/api/tasks/stats`

Get aggregated statistics for the authenticated user's tasks.

#### Example Request

```bash
curl -X GET "http://localhost:4000/api/tasks/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
    "total_tasks": 45,
    "completed_tasks": 30,
    "todo_tasks": 10,
    "in_progress_tasks": 5,
    "overdue_tasks": 3
  }
}
```

---

## Error Responses

### 401 Unauthorized

Missing or invalid JWT token.

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 400 Bad Request

Validation error in request data.

```json
{
  "success": false,
  "error": "Invalid task data",
  "details": [
    {
      "path": ["priority"],
      "message": "Invalid enum value. Expected 'low' | 'medium' | 'high' | 'urgent'"
    }
  ]
}
```

### 404 Not Found

Task not found or doesn't belong to user.

```json
{
  "success": false,
  "error": "Task not found"
}
```

### 500 Internal Server Error

Server-side error.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing with cURL

### Create a Task

```bash
# Replace YOUR_JWT_TOKEN with actual token
TOKEN="YOUR_JWT_TOKEN"

curl -X POST "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task from cURL",
    "description": "Testing the API",
    "priority": "medium",
    "category": "testing"
  }'
```

### Get All Tasks

```bash
curl -X GET "http://localhost:4000/api/tasks?limit=5&status=todo" \
  -H "Authorization: Bearer $TOKEN"
```

### Update a Task

```bash
# Replace TASK_ID with actual task UUID
curl -X PUT "http://localhost:4000/api/tasks/TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### Delete a Task

```bash
curl -X DELETE "http://localhost:4000/api/tasks/TASK_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

1. **Create a new Collection** named "Productivity Assistant API"

2. **Add Environment Variables**
   - `base_url`: `http://localhost:4000/api`
   - `jwt_token`: Your JWT token from login

3. **Set Authorization**
   - Type: Bearer Token
   - Token: `{{jwt_token}}`

4. **Import Requests**
   - Create requests for each endpoint
   - Use `{{base_url}}/tasks` as URLs
   - Set appropriate HTTP methods

---

## Rate Limiting

Currently, there is no rate limiting implemented. This should be added in production.

Recommended limits:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Best Practices

1. **Always include Authorization header**
2. **Validate data on client-side** before sending
3. **Handle all error responses** appropriately
4. **Use proper HTTP methods** (GET, POST, PUT, DELETE)
5. **Include Content-Type header** for POST/PUT requests
6. **Use query parameters** for filtering/pagination
7. **Cache responses** when appropriate (GET requests)

---

## Common Use Cases

### Get Today's Tasks

```bash
curl -X GET "http://localhost:4000/api/tasks?due_before=2025-11-12T00:00:00Z&status=todo&order_by=due_date&order_direction=asc" \
  -H "Authorization: Bearer $TOKEN"
```

### Get High Priority Tasks

```bash
curl -X GET "http://localhost:4000/api/tasks?priority=high&priority=urgent&status=todo,in_progress" \
  -H "Authorization: Bearer $TOKEN"
```

### Search Tasks

```bash
curl -X GET "http://localhost:4000/api/tasks?search=documentation" \
  -H "Authorization: Bearer $TOKEN"
```

### Mark Task as Complete

```bash
curl -X PUT "http://localhost:4000/api/tasks/TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```
