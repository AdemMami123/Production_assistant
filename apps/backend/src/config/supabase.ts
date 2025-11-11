import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

// Try to load dotenv from common locations when env vars are missing (developer convenience)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    // prefer backend .env, then repo root
    const candidates = [
      path.resolve(process.cwd(), 'apps/backend/.env'),
      path.resolve(process.cwd(), 'apps/backend/.env.local'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '.env.local'),
    ]

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        // load dotenv dynamically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('dotenv').config({ path: p })
        break
      }
    }
  } catch (err) {
    // ignore dotenv load errors and fallthrough to check below
  }
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  const msg = [
    'Missing Supabase environment variables. Please add them before starting the backend.',
    '',
    'Required variables:',
    '  SUPABASE_URL\n  SUPABASE_SERVICE_ROLE_KEY',
    '',
    'You can copy the example at `apps/backend/.env.example` to `apps/backend/.env` or create a `.env` at the repo root.',
  ].join('\n')

  throw new Error(msg)
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
