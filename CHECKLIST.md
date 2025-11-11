# ✅ Setup Checklist

Use this checklist to ensure your Productivity Assistant monorepo is properly configured and ready to use.

## 📋 Pre-Installation Checklist

- [ ] Node.js 18.0.0+ installed
  ```bash
  node --version
  ```
- [ ] npm 9.0.0+ installed
  ```bash
  npm --version
  ```
- [ ] Git installed (optional)
- [ ] Code editor installed (VS Code recommended)
- [ ] Docker installed (optional, for containerized deployment)

## 📦 Installation Checklist

- [ ] Navigate to project directory

  ```bash
  cd c:\Users\ademm\OneDrive\Desktop\Personal Projects\productivity_assistant
  ```

- [ ] Install dependencies

  ```bash
  npm install
  ```

- [ ] Build shared package

  ```bash
  cd packages/shared
  npm run build
  cd ../..
  ```

- [ ] Install tailwindcss-animate (for Shadcn UI)
  ```bash
  cd apps/frontend
  npm install tailwindcss-animate
  cd ../..
  ```

## 🔑 Supabase Setup Checklist

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create a new Supabase project
- [ ] Wait for project provisioning to complete
- [ ] Navigate to Settings → API
- [ ] Copy Project URL
- [ ] Copy `anon` `public` key
- [ ] Copy `service_role` key

## 🌍 Environment Variables Checklist

### Frontend

- [ ] Copy frontend environment template

  ```bash
  cp apps/frontend/.env.example apps/frontend/.env.local
  ```

- [ ] Edit `apps/frontend/.env.local` with:
  - [ ] NEXT_PUBLIC_SUPABASE_URL=`your-project-url`
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY=`your-anon-key`
  - [ ] NEXT_PUBLIC_API_URL=`http://localhost:4000`

### Backend

- [ ] Copy backend environment template

  ```bash
  cp apps/backend/.env.example apps/backend/.env
  ```

- [ ] Edit `apps/backend/.env` with:
  - [ ] PORT=`4000`
  - [ ] NODE_ENV=`development`
  - [ ] FRONTEND_URL=`http://localhost:3000`
  - [ ] SUPABASE_URL=`your-project-url`
  - [ ] SUPABASE_SERVICE_ROLE_KEY=`your-service-role-key`

## 🚀 First Run Checklist

- [ ] Start development servers

  ```bash
  npm run dev
  ```

- [ ] Verify backend health check
  - [ ] Visit http://localhost:4000/health
  - [ ] Should see: `{"status":"ok",...}`

- [ ] Verify frontend
  - [ ] Visit http://localhost:3000
  - [ ] Should see landing page with gradient text
  - [ ] Should see "Get Started" and "Learn More" buttons

- [ ] Verify API
  - [ ] Visit http://localhost:4000/api
  - [ ] Should see API information JSON

## 🐳 Docker Setup Checklist (Optional)

- [ ] Docker installed and running
- [ ] Copy Docker environment file

  ```bash
  cp .env.docker.example .env
  ```

- [ ] Edit `.env` with Supabase credentials
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY

- [ ] Start Docker services

  ```bash
  npm run docker:up
  ```

- [ ] Verify containers are running

  ```bash
  docker ps
  ```

- [ ] Check logs
  ```bash
  docker-compose logs -f
  ```

## 🎨 VS Code Setup Checklist (Recommended)

- [ ] Install recommended extensions (VS Code will prompt)
  - [ ] Prettier
  - [ ] ESLint
  - [ ] Tailwind CSS IntelliSense
  - [ ] TypeScript and JavaScript
  - [ ] Error Lens
  - [ ] Path Intellisense
  - [ ] Docker (if using Docker)

- [ ] Verify settings are loaded (`.vscode/settings.json`)
- [ ] Test format on save (edit a file and save)
- [ ] Test ESLint (should see squiggly lines for errors)

## 🧪 Testing Checklist

- [ ] Run linting

  ```bash
  npm run lint
  ```

  - [ ] No errors should appear

- [ ] Check code formatting

  ```bash
  npm run format:check
  ```

  - [ ] All files should be formatted

- [ ] Format code

  ```bash
  npm run format
  ```

- [ ] Type check
  ```bash
  npm run type-check --workspace=apps/frontend
  npm run type-check --workspace=apps/backend
  ```

## 🏗️ Build Checklist

- [ ] Build all packages

  ```bash
  npm run build
  ```

- [ ] Verify frontend build
  - [ ] Check `apps/frontend/.next` folder exists

- [ ] Verify backend build
  - [ ] Check `apps/backend/dist` folder exists

- [ ] Verify shared package build
  - [ ] Check `packages/shared/dist` folder exists

## 📚 Documentation Checklist

- [ ] Read Getting Started guide (`docs/00-getting-started.md`)
- [ ] Review project structure (`docs/01-monorepo-structure.md`)
- [ ] Understand frontend setup (`docs/02-nextjs-frontend.md`)
- [ ] Understand backend setup (`docs/03-nodejs-backend.md`)
- [ ] Review shared package (`docs/04-shared-package.md`)
- [ ] Check environment variables guide (`docs/06-environment-variables.md`)

## 🔧 Common Issues Checklist

### Port Already in Use

- [ ] Check if port 3000 is in use

  ```powershell
  netstat -ano | findstr :3000
  ```

- [ ] Check if port 4000 is in use

  ```powershell
  netstat -ano | findstr :4000
  ```

- [ ] Kill process if needed
  ```powershell
  taskkill /PID <pid> /F
  ```

### Module Not Found Errors

- [ ] Clear and reinstall

  ```bash
  npm run clean
  npm install
  ```

- [ ] Rebuild shared package
  ```bash
  cd packages/shared
  npm run build
  cd ../..
  ```

### TypeScript Errors

- [ ] Verify all dependencies installed
- [ ] Rebuild shared package
- [ ] Restart VS Code / dev server

## 🎯 Next Steps Checklist

### Immediate Next Steps

- [ ] Customize landing page (`apps/frontend/src/app/page.tsx`)
- [ ] Add more Shadcn UI components
  ```bash
  cd apps/frontend
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add dialog
  ```
- [ ] Create database tables in Supabase
- [ ] Implement real CRUD operations

### Authentication Setup

- [ ] Create login page
- [ ] Create signup page
- [ ] Implement Supabase Auth
- [ ] Add protected routes
- [ ] Test authentication flow

### Database Setup

- [ ] Design database schema
- [ ] Create tables in Supabase SQL Editor
- [ ] Set up Row Level Security (RLS)
- [ ] Create database policies
- [ ] Test database operations

### Feature Development

- [ ] Add task creation functionality
- [ ] Add task list view
- [ ] Add task editing
- [ ] Add task deletion
- [ ] Add user profile page

## 🚢 Deployment Checklist

### Frontend (Vercel)

- [ ] Create Vercel account
- [ ] Import project from Git
- [ ] Add environment variables in Vercel
- [ ] Deploy
- [ ] Test deployed site

### Backend (Railway/Render)

- [ ] Create hosting account
- [ ] Create new project
- [ ] Connect Git repository
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test API endpoints

### Database (Supabase)

- [ ] Production database configured
- [ ] Row Level Security enabled
- [ ] Policies created
- [ ] Backup strategy in place

## ✅ Final Verification

- [ ] All environment files created and configured
- [ ] Development servers run without errors
- [ ] Frontend loads and displays correctly
- [ ] Backend API responds to requests
- [ ] Health check passes
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code formatting works
- [ ] Documentation reviewed

## 🎉 Congratulations!

If all items are checked, your Productivity Assistant monorepo is fully set up and ready for development!

### What's Next?

1. **Start building features** - Add your own pages and components
2. **Customize the design** - Make it yours with Tailwind CSS
3. **Implement authentication** - Use Supabase Auth
4. **Create database schema** - Design your data models
5. **Add tests** - Write unit and E2E tests
6. **Deploy** - Ship to production

---

**Need Help?** Check the [documentation](README.md) or [Getting Started guide](00-getting-started.md)

**Happy coding! 🚀**
