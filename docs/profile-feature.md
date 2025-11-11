# Profile Management Feature

## Overview

Complete profile management system with CRUD operations and avatar upload functionality using Supabase Storage.

## Features

- ✅ View and edit user profile (name, bio, phone, location)
- ✅ Upload/update avatar image (stored in Supabase Storage)
- ✅ Delete avatar
- ✅ Delete account (soft delete with confirmation)
- ✅ Real-time profile sync across the app
- ✅ Secure RLS policies for profile data
- ✅ Strong API endpoints with authentication

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket

- **Bucket Name**: `avatars`
- **Public**: Yes (read-only)
- **File Structure**: `{user_id}/{timestamp}.{ext}`
- **Max File Size**: 5MB
- **Allowed Types**: Images only (image/\*)

## API Endpoints

### Backend API (Express)

#### GET /api/profile

Get the authenticated user's profile.

**Headers:**

```
Authorization: Bearer {supabase_jwt_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "bio": "Software developer",
    "avatar_url": "https://...",
    "phone": "+1234567890",
    "location": "New York, NY",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/profile

Update the authenticated user's profile.

**Headers:**

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

**Body:**

```json
{
  "full_name": "John Doe",
  "bio": "Software developer and coffee enthusiast",
  "phone": "+1234567890",
  "location": "San Francisco, CA"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* updated profile */
  },
  "message": "Profile updated successfully"
}
```

#### POST /api/profile/avatar

Upload or update avatar image.

**Headers:**

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: multipart/form-data
```

**Body:**

- `avatar`: Image file (max 5MB)

**Response:**

```json
{
  "success": true,
  "data": {
    "avatar_url": "https://...",
    "path": "{user_id}/{timestamp}.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

#### DELETE /api/profile/avatar

Delete the user's avatar.

**Headers:**

```
Authorization: Bearer {supabase_jwt_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

#### DELETE /api/profile

Delete the user's account and all associated data.

**Headers:**

```
Authorization: Bearer {supabase_jwt_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Frontend Implementation

### Profile Page (`/profile`)

Located at: `apps/frontend/src/app/profile/page.tsx`

**Features:**

- Avatar display with upload/delete functionality
- Profile form with validation
- Real-time preview of avatar changes
- Delete account with confirmation dialog

**Components Used:**

- Avatar (shadcn/ui)
- Card, Input, Textarea, Button, Label (shadcn/ui)
- Framer Motion for animations

### Navigation

Profile link added to main navigation bar in:

- `apps/frontend/src/app/dashboard/DashboardClient.tsx`

## Security

### Row Level Security (RLS)

All profile operations require authentication and users can only access their own data:

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Storage Policies

```sql
-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration to create profiles table and storage bucket
psql -d your_database < supabase/migrations/002_create_profiles_and_storage.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. Install Dependencies

```bash
# Backend
cd apps/backend
npm install multer @types/multer

# Frontend (Avatar component already added)
cd apps/frontend
npx shadcn@latest add avatar label
```

### 3. Build Shared Package

```bash
cd packages/shared
npm run build
```

### 4. Start Services

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

## Testing Checklist

### Profile CRUD

- [ ] Navigate to `/profile` page
- [ ] Verify profile data loads correctly
- [ ] Update full name and save
- [ ] Update bio, phone, location
- [ ] Verify changes persist after page refresh

### Avatar Upload

- [ ] Click camera icon on avatar
- [ ] Select an image file (JPG, PNG, etc.)
- [ ] Click "Upload Avatar" button
- [ ] Verify avatar appears in UI
- [ ] Check Supabase Storage bucket for uploaded file
- [ ] Upload a different image to replace existing avatar

### Avatar Delete

- [ ] Click "Delete Avatar" button
- [ ] Confirm deletion
- [ ] Verify avatar is removed from UI
- [ ] Check that file is deleted from Supabase Storage

### Account Deletion

- [ ] Click "Delete Account" button
- [ ] Verify confirmation dialog appears
- [ ] Cancel and verify nothing is deleted
- [ ] Click delete again and confirm
- [ ] Verify user is logged out
- [ ] Verify profile and tasks are deleted from database

## File Structure

```
productivity_assistant/
├── supabase/
│   └── migrations/
│       └── 002_create_profiles_and_storage.sql  # Database schema
├── packages/
│   └── shared/
│       └── src/
│           ├── types/
│           │   └── profile.ts                   # TypeScript types
│           └── validation/
│               └── profile.ts                   # Zod schemas
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── controllers/
│   │       │   └── profile.controller.ts        # API handlers
│   │       └── routes/
│   │           └── profile.routes.ts            # Route definitions
│   └── frontend/
│       └── src/
│           └── app/
│               └── profile/
│                   └── page.tsx                 # Profile page UI
└── docs/
    └── profile-feature.md                       # This file
```

## Troubleshooting

### Avatar Upload Fails

1. Check Supabase Storage bucket exists and is public
2. Verify RLS policies are applied
3. Check file size is under 5MB
4. Ensure file is a valid image format

### Profile Data Not Loading

1. Verify user is authenticated
2. Check browser console for errors
3. Verify migration was applied successfully
4. Check RLS policies allow SELECT for authenticated users

### Backend Errors

1. Verify Supabase environment variables are set
2. Check that shared package is built (`npm run build`)
3. Verify multer middleware is configured correctly
4. Check authentication middleware is working

## Future Enhancements

- [ ] Profile picture crop/resize before upload
- [ ] Additional profile fields (website, social links)
- [ ] Email change with verification
- [ ] Profile visibility settings (public/private)
- [ ] Activity history
- [ ] Export profile data
