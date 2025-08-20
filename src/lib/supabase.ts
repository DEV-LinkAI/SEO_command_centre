import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use default (public) schema globally so auth/public tables work.
// For custom schema access, use per-query: supabase.schema('seocc').from(...)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
