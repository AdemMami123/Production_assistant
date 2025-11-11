# AI Productivity Assistant — Vibecode Prompts for Node.js/Next.js/Supabase/Framer Motion/Shadcn

This guide provides stepwise Copilot-ready prompts to build a task management & productivity web app integrating Node.js, Next.js, Supabase, Framer Motion, and Shadcn UI.

## 1. Project Structure & Libraries
**Prompt:**
"Create a monorepo with Next.js (frontend), Node.js (API backend), and shared utils folder. Set up Tailwind CSS, Framer Motion, Shadcn UI, and Supabase. Include ESLint, Prettier, .env, Docker config."

## 2. Install Dependencies
**Prompt:**
"List all npm/yarn commands for: next, react, react-dom, @supabase/supabase-js, framer-motion, @shadcn/ui, tailwindcss, nodemailer, dotenv, express, cors."

## 3. Supabase Project Setup
**Prompt:**
"Show how to create a new Supabase project and configure database, authentication, and RLS for a task management app."

## 4. Supabase Auth Integration
**Prompt:**
"Implement Supabase Auth with Next.js App Router: email/password signup/login, SSR session, protecting routes, and retrieving user profile."

## 5. Node.js Express API Setup
**Prompt:**
"Generate Express server in Node.js with TypeScript, CORS, dotenv. Connect to Supabase using service role key for backend operations."

## 6. Supabase Table Schema
**Prompt:**
"Create tables in Supabase: users, tasks (title, description, status, due_date, priority, category, user_id). Enable RLS and foreign key constraints."

## 7. Tasks CRUD API (Node.js)
**Prompt:**
"Build REST endpoints: GET/POST /tasks, GET/PUT/DELETE /tasks/:id with Supabase client. Validate user ID from JWT/session."

## 8. Framer Motion Animated Layout
**Prompt:**
"Create an animated task dashboard in Next.js using Framer Motion for page transitions, modals, and animated task cards."

## 9. Shadcn UI Integration
**Prompt:**
"Show how to use Shadcn for inputs, modals, buttons, toast notifications, and sidebar navigation in your dashboard."

## 10. User Registration & Login UI
**Prompt:**
"Build registration, login, and logout forms in Next.js using Shadcn UI and Supabase Auth client. Display error and success toasts."

## 11. Task Creation Modal
**Prompt:**
"Implement task add/edit modal component using Shadcn forms and Framer Motion for animation and transitions."

## 12. Task List & Kanban Board
**Prompt:**
"Create a Kanban task list UI with drag-and-drop, grouping by status or category, using Shadcn cards and Framer Motion."

## 13. Real-Time Sync (Supabase)
**Prompt:**
"Connect frontend to Supabase Realtime API: receive updates for task changes and refresh list. Handle presence/broadcast."

## 14. Calendar Integration
**Prompt:**
"Integrate public Google Calendar API to fetch user events and display alongside tasks. Add button to sync task deadlines."

## 15. Notion/Todoist API Basics
**Prompt:**
"Write backend endpoints and OAuth flows for integrating Notion and Todoist APIs for reading/writing external tasks."

## 16. Task Auto-Categorization (AI)
**Prompt:**
"Implement backend route to call OpenAI (or Supabase Edge Function w/ AI) to auto-categorize a task based on description and priority."

## 17. Task Prioritization (AI)
**Prompt:**
"Create backend endpoint to receive list of tasks, pass to AI prompt for auto-prioritization by deadline, impact, and effort."

## 18. Cron Jobs (Node.js)
**Prompt:**
"Set up node-cron or Supabase Edge Function to run every morning, call prioritization/categorization endpoints and update tasks."

## 19. Dashboard UI Responsiveness
**Prompt:**
"Add Tailwind/CSS classes to make dashboard and modals responsive for mobile and desktop layouts."

## 20. Daily Email Summary
**Prompt:**
"Generate email template for daily summary, call backend to create summary, and send via Nodemailer to user emails."

## 21. Notification Center
**Prompt:**
"Build notification popover component in Next.js with unread counter, Framer Motion for dismiss animations, subscribe to notification changes via Supabase."

## 22. OAuth SSO
**Prompt:**
"Implement OAuth login with Google for Supabase Auth, handle callback and store tokens for third-party API sync."

## 23. API Rate Limiting
**Prompt:**
"Add Express middleware to limit repeated API calls (e.g., Max 30/min per user). Respond with toast/UI error."

## 24. Error Handling Middleware
**Prompt:**
"Apply error boundary components for frontend, Express error logging for backend (log to file/console)."

## 25. Unit Tests (API)
**Prompt:**
"Generate Jest unit tests for tasks CRUD APIs and Supabase client code, include sample auth test."

## 26. Integration Tests (Frontend)
**Prompt:**
"Write Playwright or Cypress test for main dashboard workflow: login, task add/edit/delete, AI categorize, view changes."

## 27. Docker Compose Setup
**Prompt:**
"Create docker-compose.yml for Next.js, Node API, and include support for local Supabase dev setup."

## 28. Environment Variables
**Prompt:**
"List all required .env variables for Supabase, third-party APIs, OpenAI (if used), email SMTP, and usage points."

## 29. Dashboard Animations
**Prompt:**
"Use Framer Motion to animate sidebar open/close, modal entrance, task card mount, and UI transitions."

## 30. Pagination & Filtering
**Prompt:**
"Implement paginated tasks API and filtering by status, category, deadline on frontend components."

## 31. Feedback Form
**Prompt:**
"Create a feedback form modal in Next.js using Shadcn UI, store feedback to Supabase and email summary to admin."

## 32. Loading States
**Prompt:**
"Show how to add skeleton loaders and spinners with Framer Motion/Shadcn during data fetch and mutation."

## 33. Custom Hooks (Frontend)
**Prompt:**
"Write reusable React hooks for fetching tasks, user info, notifications from Supabase."

## 34. Task Detail Drawer
**Prompt:**
"Create a side drawer to show task details and comments using Shadcn UI, animate open/close with Framer Motion."

## 35. Settings Page
**Prompt:**
"Build a settings page for user profile, notification opt-in, integrations, using Shadcn UI and Supabase update."

## 36. Avatar & Profile
**Prompt:**
"Add profile avatar upload for users, store in Supabase Storage, display with Shadcn UI component."

## 37. Admin Panel
**Prompt:**
"Implement admin dashboard to view all users, feedback, and system reports using Next.js pages and Shadcn UI tables."

## 38. Sentry/Error Monitor
**Prompt:**
"Set up Sentry or other error tracking in Node.js/Next.js app for logging frontend and backend errors."

## 39. Pre-Launch Checklist
**Prompt:**
"Prepare QA checklist: test all auth flows, CRUD, realtime sync, emails, responsiveness, integrations and monitor logs."

## 40. Deployment Steps
**Prompt:**
"Show steps and scripts to deploy frontend (Vercel), backend (Render/AWS), set env variables, connect Supabase, and verify live app."

---

> Use each prompt at every stage, adapt details to your feature set and stack, and reference the relevant official docs. The resulting structure supports a modern, real-time, AI-powered productivity dashboard using Node.js, Next.js, Framer Motion, Shadcn, and Supabase.
