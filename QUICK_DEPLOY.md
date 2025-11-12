# 📋 Quick Deployment Reference Card

## 🎯 Deployment Order

1. **Backend First** (Render) → Get API URL
2. **Frontend Second** (Vercel) → Use backend URL
3. **Update Backend** → Add frontend URL to CORS

---

## 🔧 Backend (Render) - Quick Setup

**URL:** https://render.com

### Settings:
```
Name: productivity-backend
Root Directory: apps/backend
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables:
```bash
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # SECRET!
SUPABASE_ANON_KEY=eyJxxx...
FRONTEND_URL=https://your-app.vercel.app  # Add after frontend deploy
GOOGLE_API_KEY=AIzxxx...
```

### Test:
```bash
curl https://your-backend.onrender.com/health
```

---

## 🎨 Frontend (Vercel) - Quick Setup

**URL:** https://vercel.com

### Settings (MONOREPO):
```
Root Directory: . (root - DO NOT select apps/frontend!)
Build Command: npm run build:frontend
Output Directory: apps/frontend/.next
Install Command: npm install
```

> ⚠️ **This is a monorepo!** Must build from root to access packages/shared

### Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...  # PUBLIC KEY ONLY!
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Test:
- Visit https://your-app.vercel.app
- Sign up → Login → Create task

---

## ⚠️ Important Notes

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use ANON key in frontend | Use SERVICE_ROLE key in frontend |
| Deploy backend first | Deploy frontend first |
| Set FRONTEND_URL in backend | Forget to update FRONTEND_URL |
| Use HTTPS URLs | Use HTTP or localhost in production |
| Test /health endpoint | Skip backend verification |

---

## 🐛 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| "Failed to fetch" | Check `NEXT_PUBLIC_API_URL` |
| CORS error | Update `FRONTEND_URL` in backend |
| 401 Unauthorized | Check Supabase keys match |
| Build fails | ESLint ignored (fixed in next.config.js) |
| Backend sleeping | Upgrade to Render Starter ($7/mo) |

---

## 📍 Where to Get Keys

**Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API

**Google AI:**
1. Go to https://aistudio.google.com/app/apikey
2. Create new API key

---

## ✅ Success Verification

```bash
# Test backend
curl https://your-backend.onrender.com/health

# Check frontend
# 1. Open https://your-app.vercel.app
# 2. F12 → Console → No errors
# 3. Sign up → Login → Create task
```

---

## 🚀 Deploy Now!

Follow **DEPLOYMENT_STEPS.md** for complete instructions.

**Time estimate:** 15-20 minutes total
