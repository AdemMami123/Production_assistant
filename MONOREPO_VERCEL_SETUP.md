# 🔧 IMPORTANT: Monorepo Vercel Setup

## ⚠️ Common Mistake - DON'T DO THIS!

**❌ WRONG:** Setting root directory to `apps/frontend`
- This causes error: `Cannot find module '@productivity-assistant/shared'`
- Vercel can't see the `packages/shared` folder

## ✅ Correct Setup for Monorepo

### Your Project Structure:
```
productivity_assistant/          ← Deploy from HERE (root)
├── packages/
│   └── shared/                 ← Frontend needs this!
├── apps/
│   ├── frontend/
│   └── backend/
├── package.json               ← Workspace config
└── vercel.json               ← Vercel config (created)
```

### Vercel Configuration Steps:

#### 1. Import Project in Vercel
- Go to https://vercel.com
- New Project → Select your GitHub repo
- Click **Import**

#### 2. Configure Build Settings

**DO NOT change Root Directory!** Leave it as `.` (root)

Fill in these settings exactly:

```
Framework Preset: Next.js
Root Directory: . (leave empty or ".")
Build Command: npm run build:frontend
Output Directory: apps/frontend/.next
Install Command: npm install
Node Version: 18.x or 20.x (auto-detected)
```

#### 3. Add Environment Variables

Same as before:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

#### 4. Deploy

Click **Deploy** and it will:
1. Install all packages (including `packages/shared`)
2. Build frontend with access to shared types
3. Deploy successfully! ✅

---

## 🎯 How It Works

The `vercel.json` file in the root tells Vercel:

```json
{
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "apps/frontend/.next"
}
```

This runs the script from root `package.json`:
```json
"build:frontend": "npm run build --workspace=apps/frontend"
```

Which:
1. Installs ALL workspace dependencies (including packages/shared)
2. Builds frontend with access to shared package
3. Outputs to `apps/frontend/.next`

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@productivity-assistant/shared'"

**Cause:** Root directory was set to `apps/frontend` instead of `.` (root)

**Fix:**
1. Go to Vercel project settings
2. Settings → General → Build & Development Settings
3. Root Directory: Change to `.` or leave blank
4. Redeploy

### Error: "No package.json found"

**Cause:** Wrong root directory

**Fix:**
1. Ensure root directory is `.` (root of repo)
2. Verify `package.json` exists at repo root
3. Check GitHub repo has all files committed

### Build succeeds but app doesn't work

**Check:**
1. Environment variables are set
2. `NEXT_PUBLIC_API_URL` points to correct backend
3. Check browser console for errors
4. Verify Supabase keys are correct

---

## ✅ Verification Checklist

Before deploying:
- [ ] `vercel.json` exists in root directory
- [ ] Root `package.json` has `workspaces` defined
- [ ] `packages/shared` folder exists
- [ ] All changes committed and pushed to GitHub

During Vercel setup:
- [ ] Root Directory is `.` (NOT `apps/frontend`)
- [ ] Build Command is `npm run build:frontend`
- [ ] Output Directory is `apps/frontend/.next`
- [ ] Environment variables added

After deployment:
- [ ] Build logs show "Installing dependencies..."
- [ ] Build logs show packages/shared being installed
- [ ] No "Cannot find module" errors
- [ ] App loads successfully

---

## 🚀 Ready to Deploy!

Now follow **DEPLOYMENT_STEPS.md** with the correct monorepo settings!

**Key takeaway:** Build from ROOT, not from `apps/frontend`! 🎯
