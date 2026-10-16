/**
 * Supabase client — browser-safe (anon key only).
 * Import this anywhere in the frontend.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Keep imports safe in local preview builds. Auth and data writes are disabled
// until real project credentials are provided.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
