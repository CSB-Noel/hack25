import { createClient } from '@supabase/supabase-js'

// Use service role key for server operations that need elevated privileges
export function createSupabaseServerClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment')
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Helper that returns a client from the request (for row-level security with JWT)
export function createSupabaseServerClientFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader ? authHeader.replace('Bearer ', '') : null

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment')
  }

  // Create a client scoped to the caller with their JWT (for RLS)
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  })

  return client
}
