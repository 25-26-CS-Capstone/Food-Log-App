import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

export default function RootIndex() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setAuth(session.user)
          router.replace('/(tabs)/home')
        } else {
          setAuth(null)
          router.replace('/welcome')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/welcome')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setAuth(session.user)
          router.replace('/(tabs)/home')
        } else {
          setAuth(null)
          router.replace('/welcome')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router, setAuth])

  return <View style={{ flex: 1 }} />
}