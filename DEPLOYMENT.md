# Productivity Assistant - Deployment Guide

## 🚀 Overview

This guide covers deployment of the Productivity Assistant project on **Vercel** (frontend) and **Render** (backend).

---

## 📋 Prerequisites

- Git repository pushed to GitHub
- Vercel account (free tier available)
- Render account (free tier available)
- Supabase project with API keys
- Google AI API key (for AI features)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Vercel

The frontend is already configured for Vercel deployment:

- ✅ `next.config.js` with `output: 'standalone'`
- ✅ Environment variables are properly structured
- ✅ Build script in `package.json`

### Step 2: Environment Variables (Vercel)

Create a `.env.local` file in `apps/frontend/` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys).

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
npm i -g vercel
cd apps/frontend
vercel login
vercel deploy --prod
```

#### Option B: Using GitHub Integration (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Select your GitHub repository
4. Configure settings:
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (set to your Render backend URL)

6. Click **"Deploy"**

### Step 4: Verify Frontend

- Visit your Vercel deployment URL
- Check header appears (authenticated users)
- Verify API calls reach backend (check Network tab)

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Render

The backend includes:

- ✅ Proper error handling
- ✅ Health check endpoint (`/health`)
- ✅ Security headers (helmet)
- ✅ CORS configured
- ✅ Compression enabled

### Step 2: Create Render Configuration File

The backend is ready. Render auto-detects:

- Node.js runtime
- `package.json` scripts
- Port via `process.env.PORT` (default 4000)

### Step 3: Environment Variables (Render)

Prepare these environment variables:

```env
# Node Environment
NODE_ENV=production

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# AI Configuration
GOOGLE_API_KEY=your_google_ai_key

# Optional: Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password

# Port
PORT=4000
```

**Important:** Use `SUPABASE_SERVICE_ROLE_KEY` on backend (admin access), never expose on frontend.

### Step 4: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure settings:
   - **Name:** `productivity-assistant-api`
   - **Environment:** Node
   - **Region:** Choose closest to users
   - **Branch:** `main`
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

5. Add environment variables (copy from section above)

6. Choose plan:
   - **Free Plan:** OK for development/testing (will sleep after 15 min inactivity)
   - **Paid Plan:** Required for production (always running)

7. Click **"Create Web Service"**

### Step 5: Wait for Deployment

Render will:

1. Install dependencies
2. Build the TypeScript project
3. Start the server
4. Assign you a URL (e.g., `https://productivity-assistant-api.onrender.com`)

### Step 6: Verify Backend

Test the health endpoint:

```bash
curl https://your-backend.onrender.com/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "uptime": 123.45
}
```

---

## 🔗 Connect Frontend & Backend

After both deployments:

1. **Update frontend environment in Vercel:**
   - Go to Vercel Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Render backend URL
   - Trigger a redeploy

2. **Verify connection:**
   - Open frontend in browser
   - Login
   - Check Network tab in DevTools for API calls
   - Verify calls go to Render backend

---

## 📊 Monitoring & Logs

### Vercel Logs

```bash
vercel logs [project-name] --follow
```

### Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Real-time logs appear automatically

---

## 🔐 Security Checklist

### Frontend (Vercel)

- ✅ Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public (not service role)
- ✅ API base URL hidden in server environment variables
- ✅ All sensitive data in Supabase (backend validates)

### Backend (Render)

- ✅ `SUPABASE_SERVICE_ROLE_KEY` never exposed to frontend
- ✅ CORS restricted to your frontend URL
- ✅ Helmet headers enabled
- ✅ Environment variables never hardcoded
- ✅ Input validation with Zod on all endpoints

### Supabase

- ✅ RLS (Row Level Security) policies enabled
- ✅ JWT auth tokens short-lived
- ✅ API keys rotated regularly

---

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch" errors

**Problem:** Frontend can't reach backend

**Solution:**

1. Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Verify backend URL is accessible: `curl https://your-backend.onrender.com/health`
3. Check backend CORS settings (should allow your Vercel domain)

### Backend crashes on startup

**Problem:** Missing environment variables

**Solution:**

1. Go to Render Dashboard → Service Settings
2. Verify all required env vars are set (especially `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Check logs for specific error messages

### 401/403 Authentication Errors

**Problem:** Backend rejects requests

**Solution:**

1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches your Supabase key
2. Ensure user is logged in on frontend
3. Check JWT token expiration (should auto-refresh)

### "Render free tier hibernation"

**Problem:** Service sleeps after 15 min inactivity

**Solution:**

- Upgrade to Paid Plan ($7/month minimum) for production
- Or use free tier for development only

---

## 📈 Performance Tips

### Frontend (Vercel)

- Use Image Optimization: Enable `next/image`
- Enable ISR (Incremental Static Regeneration) for landing page
- Monitor Core Web Vitals in Vercel Analytics

### Backend (Render)

- Enable compression (already done ✅)
- Use caching headers for static data
- Monitor response times in Render logs
- Scale to multiple instances for high traffic (paid plans)

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

- **Vercel:** Auto-deploys on `main` branch push (configurable)
- **Render:** Auto-deploys on branch push (configurable)

To disable:

1. Go to Service Settings
2. Toggle "Auto-Deploy" to OFF
3. Deploy manually when ready

---

## 📱 Testing After Deployment

### Quick Checklist

- [ ] Frontend loads without errors
- [ ] Landing page displays correctly
- [ ] Can navigate to login/signup
- [ ] Can login successfully
- [ ] Dashboard displays (header appears)
- [ ] Can create, edit, delete tasks
- [ ] Kanban board works with drag-drop
- [ ] AI prioritize button shows toast notification
- [ ] Tasks persist (refresh page - data remains)
- [ ] Workspace switcher works
- [ ] Notifications load correctly
- [ ] Mobile responsive (test on phone)

---

## 💬 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎯 Next Steps

1. **Deploy frontend to Vercel**
2. **Deploy backend to Render**
3. **Connect them via environment variables**
4. **Run through testing checklist**
5. **Monitor logs for first 24 hours**
6. **Set up monitoring/alerts (optional)**

---

## ❓ FAQ

**Q: Can I use free tier for production?**
A: Frontend yes (Vercel free is good). Backend no - Render free tier hibernates.

**Q: How do I update code after deployment?**
A: Just push to main branch. Auto-deployment will handle the rest.

**Q: What if something breaks in production?**
A: Check logs in Vercel and Render dashboards immediately.

**Q: How much will it cost?**
A: Vercel free is sufficient for frontend. Render backend costs $7/month minimum.

---

**Last Updated:** November 12, 2025
**Project:** Productivity Assistant v1.0.0
