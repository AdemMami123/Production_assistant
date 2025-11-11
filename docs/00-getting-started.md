# 🚀 Getting Started Guide

**Productivity Assistant Monorepo**  
**Date:** November 11, 2025

## Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git**
- **Supabase Account** (for backend services)
- **Docker** (optional, for containerized deployment)

### Installation

#### 1. Clone the Repository (if applicable)

```bash
cd c:\Users\ademm\OneDrive\Desktop\Personal Projects\productivity_assistant
```

#### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
npm install
```

This will install dependencies for:

- Root workspace
- Frontend (Next.js)
- Backend (Node.js/Express)
- Shared utilities package

#### 3. Set Up Environment Variables

##### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

##### Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 4. Build Shared Package

```bash
cd packages/shared
npm run build
```

### Running the Application

#### Option 1: Run All Services Concurrently

```bash
# From the root directory
npm run dev
```

This starts both frontend and backend simultaneously.

#### Option 2: Run Services Separately

##### Terminal 1 - Backend

```bash
npm run dev:backend
# Backend will run on http://localhost:4000
```

##### Terminal 2 - Frontend

```bash
npm run dev:frontend
# Frontend will run on http://localhost:3000
```

#### Option 3: Docker

```bash
# Copy Docker environment file
cp .env.docker.example .env

# Edit .env with your credentials

# Start all services
npm run docker:up

# Or manually:
docker-compose up -d
```

### Verify Installation

1. **Backend Health Check**  
   Visit: http://localhost:4000/health  
   Should return: `{"status":"ok",...}`

2. **Frontend**  
   Visit: http://localhost:3000  
   Should display the landing page

3. **API Endpoints**  
   Visit: http://localhost:4000/api  
   Should return API information

## Development Workflow

### 1. Create a New Feature

```bash
# Start development servers
npm run dev

# Make changes to code
# Hot reload will apply changes automatically
```

### 2. Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### 3. Type Checking

```bash
# Check types in all packages
npm run type-check --workspaces
```

### 4. Building for Production

```bash
# Build all packages
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

## Project Structure Overview

```
productivity-assistant/
├── apps/
│   ├── frontend/              # Next.js application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities & Supabase
│   │   │   └── styles/       # Global styles
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── backend/              # Express.js API
│       ├── src/
│       │   ├── routes/       # API routes
│       │   ├── middleware/   # Express middleware
│       │   ├── lib/          # Supabase & utilities
│       │   └── index.ts      # Server entry point
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/               # Shared utilities
│       ├── src/
│       │   ├── types/        # TypeScript types
│       │   ├── utils/        # Helper functions
│       │   ├── validation/   # Zod schemas
│       │   └── constants/    # App constants
│       └── package.json
│
├── docs/                     # Documentation
├── docker-compose.yml        # Docker orchestration
├── package.json              # Root workspace config
└── README.md                 # Main documentation
```

## Common Tasks

### Add a New npm Package

#### Frontend

```bash
npm install <package-name> --workspace=apps/frontend
```

#### Backend

```bash
npm install <package-name> --workspace=apps/backend
```

#### Shared

```bash
npm install <package-name> --workspace=packages/shared
```

### Add a Shadcn UI Component

```bash
cd apps/frontend

# Example: Add a Card component
npx shadcn-ui@latest add card
```

### Create a New API Endpoint

1. Create route file in `apps/backend/src/routes/`
2. Import and mount in `apps/backend/src/routes/index.ts`
3. Add authentication middleware if needed

### Add Shared Types

1. Edit `packages/shared/src/types/index.ts`
2. Rebuild shared package: `cd packages/shared && npm run build`
3. Types automatically available in frontend and backend

## Using Shared Package

### Import in Frontend

```typescript
import { Task, formatDate, TaskSchema } from '@productivity-assistant/shared'
```

### Import in Backend

```typescript
import { ApiResponse, HTTP_STATUS } from '@productivity-assistant/shared'
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be provisioned

### 2. Get API Credentials

1. Go to Settings → API
2. Copy:
   - Project URL
   - `anon` `public` key (for frontend)
   - `service_role` key (for backend)

### 3. Create Tables (Example)

```sql
-- Run in Supabase SQL Editor

CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

## Available Scripts

### Root Level

- `npm run dev` - Run all apps in development
- `npm run build` - Build all apps
- `npm run lint` - Lint all packages
- `npm run format` - Format all code
- `npm run clean` - Remove all node_modules and build outputs

### Frontend

- `npm run dev:frontend` - Run frontend dev server
- `npm run build:frontend` - Build frontend for production

### Backend

- `npm run dev:backend` - Run backend dev server
- `npm run build:backend` - Build backend for production

### Docker

- `npm run docker:up` - Start all services with Docker
- `npm run docker:down` - Stop all Docker services
- `npm run docker:build` - Build Docker images

## Troubleshooting

### Port Already in Use

```powershell
# Windows PowerShell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <pid> /F
```

### TypeScript Errors After Installation

```bash
# Rebuild shared package
cd packages/shared
npm run build

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Module Not Found Errors

```bash
# Clear and reinstall
npm run clean
npm install
```

### Environment Variables Not Loading

- Restart development server
- Check file names (`.env.local` for Next.js, `.env` for backend)
- Verify variables have correct prefix (`NEXT_PUBLIC_` for browser-exposed vars)

## Next Steps

1. **Customize the Application**
   - Modify `apps/frontend/src/app/page.tsx` for the home page
   - Add new API routes in `apps/backend/src/routes/`
   - Add shared types in `packages/shared/src/types/`

2. **Add More Shadcn Components**

   ```bash
   cd apps/frontend
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add toast
   ```

3. **Set Up Authentication**
   - Use Supabase Auth in frontend
   - Implement auth middleware in backend
   - Add protected routes

4. **Deploy to Production**
   - Frontend: Vercel, Netlify, or your hosting
   - Backend: Railway, Render, Heroku, or VPS
   - Or use Docker Compose for full stack deployment

## Helpful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Shadcn UI:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion
- **Supabase Docs:** https://supabase.com/docs
- **Express.js:** https://expressjs.com
- **TypeScript:** https://www.typescriptlang.org/docs

## Getting Help

1. Check the `/docs` folder for detailed documentation
2. Review the README.md in each package
3. Check environment variables are set correctly
4. Verify Supabase credentials are valid
5. Look at error logs in terminal

## Summary

You now have a fully functional monorepo with:

- ✅ Next.js frontend with Tailwind, Framer Motion, and Shadcn UI
- ✅ Node.js/Express backend with TypeScript
- ✅ Shared utilities package
- ✅ Supabase integration
- ✅ ESLint and Prettier
- ✅ Docker configuration
- ✅ Complete documentation

**Happy coding! 🚀**
