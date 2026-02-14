import { StyleSheet, Text, Pressable, useColorScheme, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, Link, useRouter } from 'expo-router'
import { AuthProvider } from './AuthContext'
import { initNotifications, setNotificationNavigationCallback } from '../utils/notifications'

const _layout = ()=>{
  const router = useRouter()
  
  useEffect(() => {
    // Initialize notifications with navigation callback
    const navigationCallback = (data) => {
      console.log('Notification navigation data:', data)
      
      // Handle different notification types
      if (data.route) {
        router.push(`/${data.route}`)
      } else if (data.type === 'welcome_with_logs') {
        router.push('/history')
      } else if (data.type === 'meal_reminder') {
        router.push('/food_log')
      } else if (data.type === 'symptom_reminder') {
        router.push('/symptom_log')
      }
    }
    
    // Initialize notification system (only on native platforms)
    if (Platform.OS !== 'web') {
      try {
        initNotifications(navigationCallback)
        setNotificationNavigationCallback(navigationCallback)
      } catch (error) {
        console.log('Notification service not available:', error)
      }
    }
  }, [router])

  return (
      <AuthProvider>
        <RootLayout/>
      </AuthProvider>
  )
}

const helpButton = (colorScheme) => (
  <Link href="/help_modal" asChild>
    <Pressable style={({ pressed }) => [{ marginRight: 150, opacity: pressed ? 0.5 : 1 }]}>
      <Text style={{ fontSize: 18, color: colorScheme === 'white' ? 'dark' : 'blue' }}>
        Help
      </Text>
    </Pressable>
  </Link>
);

const RootLayout = () => {
  const colorScheme = useColorScheme();

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: true, title: '', headerLeft: () => null, headerBackVisible: false, headerRight: () => helpButton(colorScheme)}} />
        <Stack.Screen name="login" options={{title: 'Login'}} />
        <Stack.Screen name="register" options={{title: 'Register'}} />
        <Stack.Screen name="help_modal" options={{ presentation: 'modal', title: 'Help' }} />
        <Stack.Screen name="(tabs)" options={{title: 'Home', headerShown: false}}/>
        <Stack.Screen name="calendar" options={{title: 'Calendar'}} />
        <Stack.Screen name="food_log" options={{title: 'Food Log'}} />
        <Stack.Screen name="symptom_log" options={{title: 'Symptom Log'}} />
        <Stack.Screen name="previous_logs" options={{title: 'Previous Logs'}} />
        <Stack.Screen name="history" options={{ title: "History" }} />
      </Stack>
  )
}

export default _layout

const styles = StyleSheet.create({})