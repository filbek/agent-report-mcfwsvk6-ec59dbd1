import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eejmuwvwjehmpownslmq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlam11d3Z3amVobXBvd25zbG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTMzNjQsImV4cCI6MjA2NjY2OTM2NH0.TPwz9qbLyAy25oy9E14nmjhdikMAnRhNmGzAfq4wAAA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase connection test successful')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { success: false, error: error.message }
  }
}