/**
 * Supabase admin client — server-side ONLY.
 * Uses the service-role key. Never import this in client components.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Returns a dummy client that will error gracefully when called without keys.
// The page.tsx catch block renders the "not connected" state instead of crashing.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-key',
  { auth: { persistSession: false } }
)

export const isConfigured = Boolean(supabaseUrl && serviceRoleKey)
