# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to Vercel and Render.

## ✅ Backend (Render) Checklist

### Code Quality

- [ ] No console.log() statements left in production code
- [ ] All error handling implemented
- [ ] TypeScript types complete (npm run type-check passes)
- [ ] Linting passes (npm run lint)
- [ ] All environment variables used from process.env
- [ ] Database migrations applied (if any)

### Configuration

- [ ] `PORT` environment variable is respected
- [ ] `FRONTEND_URL` CORS setting configured
- [ ] All required Supabase keys available
- [ ] Google AI API key available
- [ ] Error handler middleware is last in chain

### Security

- [ ] No hardcoded secrets in code
- [ ] Helmet security headers enabled ✅
- [ ] CORS properly configured ✅
- [ ] Input validation on all endpoints ✅
- [ ] JWT authentication implemented ✅
- [ ] Rate limiting considered (optional)

### Testing

- [ ] Health endpoint works: `GET /health`
- [ ] All API endpoints tested locally
- [ ] Database queries optimized
- [ ] Error responses follow standard format

### Build & Start

- [ ] `npm run build` completes without errors
- [ ] `npm start` starts server successfully
- [ ] Logs show "Server running on port X"

---

## ✅ Frontend (Vercel) Checklist

### Code Quality

- [ ] No console.log() in production code
- [ ] All TypeScript types correct (npm run type-check passes)
- [ ] Linting passes (npm run lint)
- [ ] No hardcoded API URLs (use env variables)
- [ ] All auth flows tested

### Performance

- [ ] Images optimized (use next/image)
- [ ] Bundle size acceptable (npm run build shows size)
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive tested

### Configuration

- [ ] `next.config.js` has `output: 'standalone'` ✅
- [ ] `NEXT_PUBLIC_SUPABASE_*` variables ready
- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] No API URL hardcoded (use env variable)

### Security

- [ ] No sensitive data in public vars
- [ ] Only ANON key exposed (not service role)
- [ ] API URLs protected in backend only
- [ ] Auth tokens properly handled

### UI/UX

- [ ] Landing page displays correctly
- [ ] Login/signup pages work
- [ ] Dashboard accessible after login
- [ ] Header hidden on public pages ✅
- [ ] Dark mode tested
- [ ] Mobile navigation works

### Testing

- [ ] Can create account
- [ ] Can login
- [ ] Can create/edit/delete tasks
- [ ] Can switch workspaces
- [ ] Notifications work
- [ ] AI features work
- [ ] Page refresh maintains session

### Build & Start

- [ ] `npm run build` completes without errors
- [ ] Build output shows "Export successful"
- [ ] No warnings in build output

---

## 🔧 Environment Variables Setup

### Before Deployment

1. **Verify Supabase Keys**

   ```bash
   # In Supabase dashboard → Settings → API
   - Copy SUPABASE_URL (starts with https://)
   - Copy anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy service_role key (SUPABASE_SERVICE_ROLE_KEY - backend only!)
   ```

2. **Get Google AI Key**

   ```bash
   # Go to https://aistudio.google.com/app/apikey
   - Create new API key
   - Copy it (GOOGLE_API_KEY)
   ```

3. **Prepare Frontend Env Vars**

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_API_URL=... (set after backend deployed)
   ```

4. **Prepare Backend Env Vars**
   ```
   NODE_ENV=production
   PORT=4000
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_ANON_KEY=...
   FRONTEND_URL=... (set after frontend deployed)
   GOOGLE_API_KEY=...
   ```

---

## 📋 Deployment Order

1. **Deploy backend first** (Render)
   - Get the backend URL (e.g., `https://app-api.onrender.com`)
2. **Update frontend env vars** in Vercel
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Trigger redeploy

3. **Verify connection**
   - Frontend should reach backend successfully

---

## 🧪 Post-Deployment Testing

After both are live:

1. **Test Health Endpoint**

   ```bash
   curl https://your-backend.onrender.com/health
   ```

   Expected: 200 status with JSON

2. **Test Frontend Load**
   - Visit frontend URL
   - Check no 401/403 errors in DevTools
   - Network tab should show API calls

3. **Test User Flow**
   - [ ] Create new account
   - [ ] Login works
   - [ ] Can view dashboard
   - [ ] Can create task
   - [ ] Task appears in list
   - [ ] Can edit task
   - [ ] Can delete task
   - [ ] Logout works
   - [ ] Header disappears after logout

4. **Test Features**
   - [ ] Workspace switching works
   - [ ] Team creation works
   - [ ] AI prioritize shows toast
   - [ ] Notifications load
   - [ ] Kanban drag-drop works

5. **Test Mobile**
   - [ ] Responsive on iPhone
   - [ ] Responsive on Android
   - [ ] Touch interactions work

---

## 🐛 Common Issues & Fixes

| Issue                        | Cause                  | Fix                                                 |
| ---------------------------- | ---------------------- | --------------------------------------------------- |
| "Failed to fetch" in console | Backend URL wrong      | Check `NEXT_PUBLIC_API_URL` in Vercel env vars      |
| 401 errors from API          | Invalid Supabase key   | Verify ANON key matches in Supabase dashboard       |
| 403 "Forbidden"              | Service role key issue | Use SERVICE_ROLE_KEY on backend only                |
| Render service sleeps        | Free tier hibernates   | Upgrade to paid plan or ping `/health` every 14 min |
| Build fails on Vercel        | Missing env vars       | Check all NEXT*PUBLIC*\* vars are set               |
| Build fails on Render        | TypeScript errors      | Run `npm run type-check` locally first              |
| Header shows on login page   | Auth check broken      | Verify ConditionalHeader implementation             |

---

## 📞 Support Links

- **Vercel Issues:** https://vercel.com/support
- **Render Issues:** https://render.com/docs/support
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs/deployment/vercel

---

## ✨ Success Criteria

You're ready for production when:

- ✅ All checklist items completed
- ✅ No errors in browser console
- ✅ No errors in server logs
- ✅ Full user flow works end-to-end
- ✅ Mobile responsive
- ✅ Performance acceptable
- ✅ Security review passed

**Good luck! 🚀**
