import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  // Don't throw in code so environment can still run in non-supabase contexts
  console.warn('SUPABASE_URL or SUPABASE_ANON_KEY not found in environment')
}

export const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '')
