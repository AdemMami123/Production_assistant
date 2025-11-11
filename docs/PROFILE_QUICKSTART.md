# Profile Feature - Quick Start Guide

## 🚀 Quick Start

### Step 1: Apply Database Migration

You need to run the migration to create the profiles table and avatars storage bucket in Supabase.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/002_create_profiles_and_storage.sql`
4. Paste into SQL Editor and run

**Option B: Using Supabase CLI**

```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Verify `avatars` bucket exists
3. Check that it's set to **Public** (read access)
4. Storage policies should be automatically created by the migration

### Step 3: Set Environment Variables

Ensure your backend has the required Supabase credentials:

**File: `apps/backend/.env`**

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Step 4: Install Dependencies & Build

```powershell
# Install backend dependencies (if not already done)
cd apps\backend
npm install

# Build shared package
cd ..\..\packages\shared
npm run build

# Return to root
cd ..\..
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**

```powershell
cd apps\backend
npm run dev
```

**Terminal 2 - Frontend:**

```powershell
cd apps\frontend
npm run dev
```

### Step 6: Test the Profile Feature

1. Open browser to `http://localhost:3000` (or `http://localhost:3001` if 3000 is taken)
2. Sign up or log in
3. Navigate to **Profile** in the navigation bar
4. Test the following:
   - ✅ View profile information
   - ✅ Edit name, bio, phone, location
   - ✅ Upload an avatar image
   - ✅ Change avatar (upload a different image)
   - ✅ Delete avatar
   - ✅ Save profile changes

## 📝 API Testing with cURL

If you want to test the backend API directly:

### Get Profile

```bash
curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "bio": "Full stack developer",
    "phone": "+1234567890",
    "location": "San Francisco, CA"
  }'
```

### Upload Avatar

```bash
curl -X POST http://localhost:4000/api/profile/avatar \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -F "avatar=@/path/to/your/image.jpg"
```

### Delete Avatar

```bash
curl -X DELETE http://localhost:4000/api/profile/avatar \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

## 🔍 Troubleshooting

### Backend Won't Start

**Error**: `Missing Supabase environment variables`

**Solution**:

1. Copy `apps/backend/.env.example` to `apps/backend/.env`
2. Fill in your Supabase credentials from the dashboard

### Avatar Upload Fails

**Error**: `Failed to upload avatar`

**Possible causes**:

1. Storage bucket doesn't exist → Run the migration
2. File too large → Max size is 5MB
3. Invalid file type → Only images allowed
4. RLS policies not applied → Check Supabase Dashboard → Authentication → Policies

### Profile Not Loading

**Error**: Profile page shows loading spinner indefinitely

**Solution**:

1. Check browser console for errors
2. Verify you're logged in (check `/dashboard` works)
3. Run the migration to create profiles table
4. Check that a profile was auto-created when you signed up

### TypeScript Errors

**Error**: Cannot find module '@productivity-assistant/shared'

**Solution**:

```bash
cd packages\shared
npm run build
```

## 🎯 Features Checklist

After starting the app, verify these features work:

### Profile Page (`/profile`)

- [ ] Page loads without errors
- [ ] Email is displayed (read-only)
- [ ] Can edit and save full name
- [ ] Can edit and save bio (max 500 chars)
- [ ] Can edit and save phone
- [ ] Can edit and save location
- [ ] Changes persist after page refresh

### Avatar Management

- [ ] Default avatar shows user's initial
- [ ] Camera icon is visible on avatar
- [ ] Can select image file from computer
- [ ] Image preview shows before upload
- [ ] "Upload Avatar" button appears after selecting file
- [ ] Avatar uploads successfully
- [ ] Uploaded avatar displays immediately
- [ ] Can upload different image to replace existing
- [ ] "Delete Avatar" button appears when avatar exists
- [ ] Avatar deletion works and reverts to default

### Navigation

- [ ] "Profile" link appears in navigation bar
- [ ] Clicking "Profile" navigates to `/profile`
- [ ] Navigation works from Dashboard, Tasks, and Kanban pages

### Security

- [ ] Cannot access profile page without logging in
- [ ] Cannot access other users' profiles
- [ ] Avatar file path includes user ID
- [ ] Old avatars are deleted when new one is uploaded

## 📚 Next Steps

Once the profile feature is working:

1. **Test Account Deletion** (use a test account!)
   - Creates a new test account
   - Upload an avatar
   - Create some tasks
   - Delete the account
   - Verify user is logged out
   - Check that profile and tasks are gone

2. **Integration Testing**
   - Verify profile avatar shows in navigation
   - Update profile from different pages
   - Test concurrent sessions (2 browser tabs)

3. **Production Considerations**
   - Set up CDN for avatar images
   - Implement image optimization/resizing
   - Add rate limiting to avatar uploads
   - Set up backup for storage bucket

## 🎉 Success!

If you've completed all the checklist items, your profile feature is fully functional!

The profile system now includes:

- ✅ Complete CRUD operations
- ✅ Avatar upload to Supabase Storage
- ✅ Secure RLS policies
- ✅ Strong backend API
- ✅ Beautiful frontend UI
- ✅ Type-safe shared code

Happy coding! 🚀
