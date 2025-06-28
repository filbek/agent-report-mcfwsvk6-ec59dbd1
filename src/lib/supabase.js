import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/supabase.js'

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)
