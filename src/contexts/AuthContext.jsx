import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Try to get profile, but don't block on it
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

              if (mounted) {
                setProfile(profileData || {
                  user_id: session.user.id,
                  role: 'viewer',
                  full_name: ''
                })
              }
            } catch (profileError) {
              console.error('Profile fetch error:', profileError)
              if (mounted) {
                setProfile({
                  user_id: session.user.id,
                  role: 'viewer',
                  full_name: ''
                })
              }
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    // Initialize auth
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.id)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Try to get profile for new session
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (mounted) {
              setProfile(profileData || {
                user_id: session.user.id,
                role: 'viewer',
                full_name: ''
              })
            }
          } catch (profileError) {
            console.error('Profile fetch error on auth change:', profileError)
            if (mounted) {
              setProfile({
                user_id: session.user.id,
                role: 'viewer',
                full_name: ''
              })
            }
          }
        } else {
          setProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isAdmin = () => profile?.role === 'admin'
  const isAgent = () => profile?.role === 'agent'

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isAgent,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}