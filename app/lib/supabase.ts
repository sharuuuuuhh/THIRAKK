/**
 * Supabase client — browser-safe (anon key only).
 * Import this anywhere in the frontend.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Thirakku] Missing Supabase env vars. Copy .env.local.example → .env.local and fill in your keys.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
