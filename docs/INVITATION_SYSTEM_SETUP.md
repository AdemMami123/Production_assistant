# Team Invitation System Setup

## Overview

Complete implementation of team invitation system with:

- ✅ In-app notifications
- ✅ Email notifications via Nodemailer
- ✅ Real-time notification bell with unread counter
- ✅ Beautiful HTML email templates

## What Was Implemented

### Backend

1. **Email Service** (`apps/backend/src/lib/email.ts`)
   - Nodemailer transporter configuration
   - Team invitation email template with gradient design
   - Generic notification email function

2. **Notifications System**
   - Database table with RLS policies
   - Notification types (team_invitation, task_assigned, etc.)
   - Notification controller with CRUD operations
   - API routes for notifications

3. **Enhanced Team Member Invitation**
   - Updated `addTeamMember` controller to:
     - Create in-app notification
     - Send email notification
     - Fetch user profiles for personalization
     - Handle errors gracefully

### Frontend

1. **NotificationBell Component**
   - Real-time unread counter badge
   - Dropdown with notification list
   - Mark as read functionality
   - Auto-polling every 30 seconds
   - Beautiful animations

2. **Dashboard Integration**
   - Added notification bell to dashboard header
   - Positioned next to logout button

### Database

- New migration: `004_create_notifications.sql`
- Notifications table with RLS policies
- Helper function for unread count
- Indexes for performance

## Setup Instructions

### 1. Run Database Migration

Execute the notification migration in your Supabase dashboard:

**Option A: Via Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy content from `supabase/migrations/004_create_notifications.sql`
5. Run the migration

**Option B: Via Supabase CLI** (if you have it installed)

```bash
supabase db push
```

### 2. Environment Variables

The SMTP configuration is already added to `apps/backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ademmami92@gmail.com
SMTP_PASSWORD=mzsg guex rzqb uzeo
```

**Important:** For Gmail, make sure:

- You're using an App Password (not your regular password)
- 2-Step Verification is enabled
- Less secure app access is enabled OR use an App Password

### 3. Start the Servers

```powershell
# Terminal 1 - Backend
cd "c:\Users\ademm\OneDrive\Desktop\Personal Projects\productivity_assistant\apps\backend"
npm run dev

# Terminal 2 - Frontend
cd "c:\Users\ademm\OneDrive\Desktop\Personal Projects\productivity_assistant\apps\frontend"
npm run dev
```

### 4. Test the System

1. **Login** to your account
2. **Create a Team** (if you haven't already)
3. **Invite a Member**:
   - Go to Teams page
   - Click on a team
   - Click "Invite Member"
   - Search for user by email
   - Select role (Member or Leader)
   - Click "Invite"

4. **Check Results**:
   - Invited user should receive:
     - ✅ In-app notification (click bell icon)
     - ✅ Email notification (check inbox)
   - Email should have:
     - Beautiful gradient design
     - Team name and role
     - Direct link to dashboard

## API Endpoints

### Notifications

- `GET /api/notifications` - Get all notifications (with ?read=true/false filter)
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/:id` - Get specific notification
- `PATCH /api/notifications/:id` - Update notification (mark as read)
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Teams (Enhanced)

- `POST /api/teams/:id/members` - Invite member (now sends notifications + email)

## Notification Types

Current supported types:

- `team_invitation` - User invited to team
- `task_assigned` - Task assigned to user
- `task_comment` - Comment on user's task
- `task_completed` - Task marked complete
- `meeting_scheduled` - Meeting created
- `meeting_reminder` - Meeting reminder
- `team_update` - Team settings updated
- `general` - General notifications

## Email Template Features

The invitation email includes:

- 🎨 Professional gradient header (purple to pink)
- 📧 Personalized greeting
- 👥 Team name and role details
- 🔑 Role-specific permissions info
- 🔗 Direct link to dashboard
- 📱 Responsive design
- 🌙 Clean, modern styling

## Troubleshooting

### Email Not Sending

1. Check Gmail App Password is correct
2. Verify SMTP credentials in `.env`
3. Check backend console for error messages
4. Try sending a test email via Nodemailer test

### Notifications Not Appearing

1. Verify migration ran successfully
2. Check browser console for errors
3. Verify auth token is being sent
4. Check Supabase RLS policies

### Notification Bell Shows 0

1. Refresh the page
2. Check if notifications exist in database
3. Verify user_id matches in notifications table
4. Check browser network tab for API calls

## Next Steps

You can extend this system by:

1. Adding push notifications (Web Push API)
2. Adding notification preferences (email on/off)
3. Adding notification grouping
4. Adding real-time updates (Supabase Realtime)
5. Adding more notification types (task deadline, etc.)

## Files Changed

**Backend:**

- ✅ `apps/backend/src/lib/email.ts` (new)
- ✅ `apps/backend/src/controllers/notification.controller.ts` (new)
- ✅ `apps/backend/src/routes/notification.routes.ts` (new)
- ✅ `apps/backend/src/controllers/team.controller.ts` (updated)
- ✅ `apps/backend/src/routes/index.ts` (updated)
- ✅ `apps/backend/.env` (updated)

**Frontend:**

- ✅ `apps/frontend/src/components/NotificationBell.tsx` (new)
- ✅ `apps/frontend/src/app/dashboard/DashboardClient.tsx` (updated)

**Shared:**

- ✅ `packages/shared/src/types/notification.ts` (new)
- ✅ `packages/shared/src/types/index.ts` (updated)

**Database:**

- ✅ `supabase/migrations/004_create_notifications.sql` (new)

**Dependencies:**

- ✅ nodemailer
- ✅ @types/nodemailer
