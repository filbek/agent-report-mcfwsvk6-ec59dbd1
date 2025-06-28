import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eejmuwvwjehmpownslmq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlam11d3Z3amVobXBvd25zbG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTMzNjQsImV4cCI6MjA2NjY2OTM2NH0.TPwz9qbLyAy25oy9E14nmjhdikMAnRhNmGzAfq4wAAA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'saglik-turizmi-admin',
    },
  },
})

// Test connection function with better error handling
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Simple health check
    const { data, error } = await supabase
      .from('agents')
      .select('count(*)')
      .limit(1)
      .single()
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { 
        success: false, 
        error: error.message,
        details: error
      }
    }
    
    console.log('Supabase connection test successful:', data)
    return { 
      success: true, 
      data,
      message: 'Connection successful'
    }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown connection error',
      details: error
    }
  }
}

// Enhanced query function with retry logic
export const safeQuery = async (queryFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await queryFn()
      return result
    } catch (error) {
      console.error(`Query attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}