# Environment Variables Setup - Completed ✅

**Date:** November 11, 2025

## What Was Accomplished

### Environment Files Created

All environment template files (`.env.example`) have been created for each application in the monorepo:

1. ✅ **apps/frontend/.env.example** - Frontend environment variables
2. ✅ **apps/backend/.env.example** - Backend environment variables

### Frontend Environment Variables

**Location:** `apps/frontend/.env.example`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Variables Explained

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
  - Get from: Supabase Dashboard → Settings → API
  - Example: `https://xxxxx.supabase.co`

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous/public key
  - Get from: Supabase Dashboard → Settings → API
  - Safe to expose in browser (rate-limited)

- **NEXT_PUBLIC_API_URL**: Backend API URL
  - Development: `http://localhost:4000`
  - Production: Your deployed backend URL

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Backend Environment Variables

**Location:** `apps/backend/.env.example`

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database Configuration (if using direct connection)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

#### Variables Explained

- **PORT**: Server port number (default: 4000)
- **NODE_ENV**: Environment mode (`development`, `production`, `test`)
- **FRONTEND_URL**: Frontend URL for CORS configuration
  - Development: `http://localhost:3000`
  - Production: Your deployed frontend URL

- **SUPABASE_URL**: Your Supabase project URL (same as frontend)
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key
  - Get from: Supabase Dashboard → Settings → API
  - **NEVER expose in browser** (has admin privileges)

- **DATABASE_URL**: Direct PostgreSQL connection string (optional)
  - Only needed if bypassing Supabase client

## Setup Instructions

### 1. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing project
3. Navigate to: Settings → API
4. Copy the following:
   - Project URL
   - `anon` `public` key (for frontend)
   - `service_role` key (for backend)

### 2. Create Environment Files

#### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
```

Edit `.env.local` and replace values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` and replace values:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verify Setup

#### Test Frontend

```bash
cd apps/frontend
npm run dev
```

Visit: http://localhost:3000

#### Test Backend

```bash
cd apps/backend
npm run dev
```

Visit: http://localhost:4000/health

## Security Best Practices

### ✅ DO:

- Keep `.env` and `.env.local` in `.gitignore`
- Use different keys for development and production
- Rotate keys regularly
- Use `NEXT_PUBLIC_` prefix only for browser-safe variables
- Keep service role keys server-side only
- Use environment-specific files (`.env.development`, `.env.production`)

### ❌ DON'T:

- Commit `.env` files to Git
- Share service role keys publicly
- Use production keys in development
- Expose service role keys to the browser
- Hardcode sensitive values in source code

## Production Deployment

### Environment Variables by Platform

#### Vercel (Frontend)

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your backend URL)

#### Railway/Render/Heroku (Backend)

1. Go to Environment Variables section
2. Add each variable:
   - `PORT` (usually auto-set)
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your frontend URL)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Docker

Use `.env` file or docker-compose environment section (see Docker docs).

## Troubleshooting

### Frontend Can't Connect to Backend

- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running on specified port
- Check CORS settings in backend

### Supabase Authentication Fails

- Verify Supabase URL is correct
- Check keys are not truncated
- Ensure using correct key for frontend/backend

### Environment Variables Not Loading

- Restart development server after changes
- Check file is named correctly (`.env.local` for Next.js)
- Verify variables have correct prefix (`NEXT_PUBLIC_` for browser)

## File Structure

```
productivity-assistant/
├── apps/
│   ├── frontend/
│   │   ├── .env.example       ✅ Template
│   │   └── .env.local         ❌ Not in Git (create locally)
│   └── backend/
│       ├── .env.example       ✅ Template
│       └── .env               ❌ Not in Git (create locally)
└── .gitignore                 ✅ Includes .env files
```

## Additional Features

### Multiple Environments

You can create environment-specific files:

```
apps/frontend/
├── .env.local              # Local overrides
├── .env.development        # Development
├── .env.production         # Production
└── .env.test              # Testing
```

Next.js loads them in this priority (highest to lowest):

1. `.env.local`
2. `.env.[NODE_ENV]`
3. `.env`

### Type Safety (Optional Enhancement)

Create a types file for environment variables:

```typescript
// apps/frontend/src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_API_URL: string
  }
}
```

## Checklist

Before running the project:

- [ ] Supabase project created
- [ ] Frontend `.env.local` created and configured
- [ ] Backend `.env` created and configured
- [ ] All keys copied correctly
- [ ] Backend URL updated in frontend env
- [ ] Frontend URL updated in backend env
- [ ] `.env` files are in `.gitignore`
- [ ] Development servers start without errors

## Notes

- Frontend uses `.env.local` (Next.js convention)
- Backend uses `.env` (standard convention)
- All `.env` files are already in `.gitignore`
- Service role key has full database access - keep it secure
- Environment variables are loaded at build time in Next.js
