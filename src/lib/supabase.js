import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eejmuwvwjehmpownslmq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlam11d3Z3amVobXBvd25zbG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTMzNjQsImV4cCI6MjA2NjY2OTM2NH0.TPwz9qbLyAy25oy9E14nmjhdikMAnRhNmGzAfq4wAAA'

// Simplified and more stable Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Enhanced connection test with better error handling
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('📍 URL:', supabaseUrl)
    
    // Simple connection test
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return { 
        success: false, 
        error: error.message,
        details: error
      }
    }
    
    console.log('✅ Connection test successful')
    return { 
      success: true, 
      data,
      message: 'Connection test passed'
    }
  } catch (error) {
    console.error('💥 Connection test exception:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown connection error',
      details: error
    }
  }
}

// Simplified query function with better error handling
export const safeQuery = async (queryFn, retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Query attempt ${i + 1}/${retries}`)
      const result = await queryFn()
      console.log('✅ Query successful')
      return result
    } catch (error) {
      console.error(`❌ Query attempt ${i + 1} failed:`, error)
      
      if (i === retries - 1) {
        console.error('💥 All query attempts failed')
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// Database health check function
export const checkDatabaseHealth = async () => {
  try {
    console.log('🏥 Checking database health...')
    
    const checks = {
      agents: false,
      reports: false,
      profiles: false
    }
    
    // Check agents table
    try {
      const { error } = await supabase
        .from('agents')
        .select('id')
        .limit(1)
      
      if (!error) {
        checks.agents = true
        console.log('✅ Agents table: OK')
      } else {
        console.log('❌ Agents table:', error.message)
      }
    } catch (e) {
      console.log('❌ Agents table exception:', e.message)
    }
    
    // Check reports table
    try {
      const { error } = await supabase
        .from('reports')
        .select('id')
        .limit(1)
      
      if (!error) {
        checks.reports = true
        console.log('✅ Reports table: OK')
      } else {
        console.log('❌ Reports table:', error.message)
      }
    } catch (e) {
      console.log('❌ Reports table exception:', e.message)
    }
    
    // Check profiles table
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (!error) {
        checks.profiles = true
        console.log('✅ Profiles table: OK')
      } else {
        console.log('❌ Profiles table:', error.message)
      }
    } catch (e) {
      console.log('❌ Profiles table exception:', e.message)
    }
    
    const healthScore = Object.values(checks).filter(Boolean).length
    console.log(`🏥 Database health: ${healthScore}/3 tables accessible`)
    
    return {
      healthy: healthScore === 3,
      checks,
      score: healthScore
    }
  } catch (error) {
    console.error('💥 Database health check failed:', error)
    return {
      healthy: false,
      checks: { agents: false, reports: false, profiles: false },
      score: 0,
      error: error.message
    }
  }
}