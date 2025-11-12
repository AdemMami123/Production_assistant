# 🚀 Complete Deployment Guide - Step by Step

## Overview
This guide provides **complete step-by-step instructions** to deploy:
- **Frontend**: Vercel (apps/frontend)
- **Backend**: Render (apps/backend)

---

## 📦 PART 1: Backend Deployment (Deploy First!)

> ⚠️ **Deploy backend FIRST** to get the API URL for frontend configuration.

### Step 1.1: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### Step 1.2: Create New Web Service

1. From Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect GitHub"**
   - Authorize Render to access your repositories
   - Select your repository: `Production_assistant`

### Step 1.3: Configure Web Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `productivity-backend` (or your choice) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `apps/backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (for testing) or `Starter $7/month` (for production) |

> 💡 **Free tier hibernates after 15 min of inactivity**. Use Starter ($7/mo) for production.

### Step 1.4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add each:

```bash
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_API_KEY=your-google-ai-api-key
```

**Where to get these values:**

- **SUPABASE_URL**: Supabase Dashboard → Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → `service_role` key (secret!)
- **SUPABASE_ANON_KEY**: Supabase Dashboard → Settings → API → `anon` / `public` key
- **GOOGLE_API_KEY**: https://aistudio.google.com/app/apikey
- **FRONTEND_URL**: Leave as placeholder for now, update after frontend deployment

### Step 1.5: Create Web Service

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Watch the logs - look for:
   ```
   Server running on port 4000
   ```

### Step 1.6: Test Backend

1. Copy your Render URL (e.g., `https://productivity-backend.onrender.com`)
2. Test health endpoint:
   ```bash
   curl https://your-backend.onrender.com/health
   ```
3. Expected response:
   ```json
   {"status":"ok","timestamp":"...","uptime":123}
   ```

✅ **Backend is now live!** Copy the URL for frontend setup.

---

## 🎨 PART 2: Frontend Deployment (Vercel)

### Step 2.1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### Step 2.2: Create New Project

1. From Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select your GitHub repository: `Production_assistant`
3. Click **"Import"**

### Step 2.3: Configure Build Settings

**IMPORTANT:** Configure these settings for monorepo deployment:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | Leave as `.` (root) - DO NOT select apps/frontend |
| **Build Command** | `npm run build:frontend` |
| **Output Directory** | `apps/frontend/.next` |
| **Install Command** | `npm install` |

> ⚠️ **CRITICAL:** Do NOT set root directory to `apps/frontend`! This is a monorepo and needs to build from root to access the shared package.

### Step 2.4: Add Environment Variables

Click **"Environment Variables"** section and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Important Notes:**
- Use the **backend URL** from Step 1.6 for `NEXT_PUBLIC_API_URL`
- Use **ANON key** (NOT service role key) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- All `NEXT_PUBLIC_*` variables are exposed to browser (safe for public keys only)

### Step 2.5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Vercel will show build logs - watch for:
   ```
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages
   ```

### Step 2.6: Test Frontend

1. Click **"Visit"** or copy the deployment URL (e.g., `https://your-app.vercel.app`)
2. Test the application:
   - ✅ Landing page loads
   - ✅ Sign up works
   - ✅ Login works
   - ✅ Dashboard loads after login
   - ✅ Can create tasks
   - ✅ Header appears when logged in

---

## 🔄 PART 3: Update Backend with Frontend URL

### Step 3.1: Update Render Environment Variable

1. Go to Render dashboard
2. Select your backend service
3. Click **"Environment"** (left sidebar)
4. Find `FRONTEND_URL` variable
5. Click **"Edit"**
6. Update value to your Vercel URL: `https://your-app.vercel.app`
7. Click **"Save Changes"**

### Step 3.2: Redeploy Backend

1. Render will auto-redeploy with new env var
2. Wait 1-2 minutes
3. Backend will restart with correct CORS settings

---

## ✅ PART 4: Verification & Testing

### Test Complete User Flow

1. **Visit frontend** → Should load landing page
2. **Sign up** → Create new account
3. **Login** → Use credentials
4. **Dashboard** → Should show welcome
5. **Create task** → Add new task
6. **Kanban** → Drag and drop tasks
7. **Workspace switching** → Switch between Personal/Team
8. **AI features** → Test AI prioritization
9. **Logout** → Header should disappear

### Check Browser Console

Open DevTools (F12) → Console tab:
- ❌ No 401/403 errors
- ❌ No CORS errors
- ❌ No "Failed to fetch" errors
- ✅ API calls succeed

### Check Network Tab

Open DevTools → Network tab:
- ✅ API calls go to correct backend URL
- ✅ Status 200 for API responses
- ✅ Supabase auth works

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch" in console

**Cause:** Wrong API URL or backend not running

**Fix:**
1. Check `NEXT_PUBLIC_API_URL` in Vercel env vars
2. Verify backend is running: `curl https://your-backend.onrender.com/health`
3. Redeploy frontend if env var changed

---

### Issue: CORS errors

**Cause:** `FRONTEND_URL` not set correctly in backend

**Fix:**
1. Update `FRONTEND_URL` in Render to match Vercel URL exactly
2. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Redeploy backend

---

### Issue: 401 Unauthorized from API

**Cause:** Supabase keys mismatch

**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches Supabase dashboard
2. Verify `SUPABASE_SERVICE_ROLE_KEY` (backend) is correct
3. Check both keys are from same Supabase project

---

### Issue: Build fails on Vercel

**Cause:** TypeScript or ESLint errors

**Fix:**
1. Already handled with `eslint.ignoreDuringBuilds: true` in `next.config.js`
2. If still failing, check build logs for specific error
3. Run `npm run build` locally first

---

### Issue: Render service "sleeping"

**Cause:** Free tier hibernates after 15 min inactivity

**Fix:**
1. Upgrade to Starter plan ($7/month)
2. Or: Use cron job to ping `/health` every 14 minutes

---

## 🎉 Success Checklist

- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ Environment variables configured correctly
- ✅ CORS working (no errors in console)
- ✅ Sign up / Login works
- ✅ Tasks CRUD operations work
- ✅ Workspace switching works
- ✅ AI features functional
- ✅ No errors in browser console
- ✅ Mobile responsive

---

## 🔐 Security Checklist

- ✅ **Service role key** only on backend (never in frontend)
- ✅ **ANON key** in frontend (safe for browser)
- ✅ **Supabase RLS** policies enabled
- ✅ **CORS** restricted to frontend URL only
- ✅ **HTTPS** enforced (automatic on Vercel/Render)
- ✅ **Environment variables** not in code

---

## 📊 Monitoring

### Vercel

1. Dashboard → Your Project → **Analytics**
2. View:
   - Page load times
   - Error rates
   - Traffic

### Render

1. Dashboard → Your Service → **Metrics**
2. View:
   - CPU usage
   - Memory usage
   - Response times

### Logs

**Vercel Logs:**
```bash
vercel logs https://your-app.vercel.app
```

**Render Logs:**
- Dashboard → Your Service → **Logs** tab
- Real-time streaming logs

---

## 🚀 Next Steps

1. **Custom Domain** (optional):
   - Vercel: Settings → Domains → Add custom domain
   - Render: Settings → Custom Domain

2. **Monitoring** (optional):
   - Set up Sentry for error tracking
   - Add analytics (Google Analytics, Plausible)

3. **Performance**:
   - Enable Vercel Edge caching
   - Optimize images with Next.js Image component

4. **Scaling**:
   - Upgrade Render plan as traffic grows
   - Consider database connection pooling

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎊 You're Done!

Your productivity assistant is now live in production!

**Frontend**: https://your-app.vercel.app
**Backend**: https://your-backend.onrender.com

Share it with your team and start being productive! 🚀
