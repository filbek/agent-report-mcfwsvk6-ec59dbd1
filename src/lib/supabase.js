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

// Enhanced connection test with detailed logging
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('📍 URL:', supabaseUrl)
    console.log('🔑 Key length:', supabaseAnonKey.length)
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('agents')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return { 
        success: false, 
        error: error.message,
        details: error,
        step: 'connection_test'
      }
    }
    
    console.log('✅ Connection test successful')
    
    // Test 2: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('agents')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table structure test failed:', tableError)
      return { 
        success: false, 
        error: tableError.message,
        details: tableError,
        step: 'table_structure'
      }
    }
    
    console.log('✅ Table structure test successful')
    console.log('📊 Sample data:', tableInfo)
    
    return { 
      success: true, 
      data,
      tableInfo,
      message: 'All connection tests passed'
    }
  } catch (error) {
    console.error('💥 Connection test exception:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown connection error',
      details: error,
      step: 'exception'
    }
  }
}

// Enhanced query function with retry logic and better error handling
export const safeQuery = async (queryFn, retries = 3, delay = 1000) => {
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
      
      // Progressive delay
      const waitTime = delay * (i + 1)
      console.log(`⏳ Waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
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
      const { data, error } = await supabase
        .from('agents')
        .select('count(*)')
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
      const { data, error } = await supabase
        .from('reports')
        .select('count(*)')
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
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
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