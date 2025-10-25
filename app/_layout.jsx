import { StyleSheet, Text, Pressable, useColorScheme } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, Link, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const _layout = ()=>{
  return (
      <AuthProvider>
        <RootLayout/>
      </AuthProvider>
  )
}

const helpButton = (colorScheme) => (
  <Link href="/modal" asChild>
    <Pressable style={({ pressed }) => [{ marginRight: 150, opacity: pressed ? 0.5 : 1 }]}>
      <Text style={{ fontSize: 18, color: colorScheme === 'white' ? 'dark' : 'blue' }}>
        Help
      </Text>
    </Pressable>
  </Link>
);

const RootLayout = () => {
  const {setAuth} = useAuth()
  const router = useRouter()
  const colorScheme = useColorScheme();

  useEffect(()=>{
    supabase.auth.onAuthStateChange((_event, session) => { 

      if(session){
        setAuth(session?.user)
        router.replace('/home')
      } else {
        setAuth(null)
        router.replace('/welcome')
      }
    })
  },[])

  return (
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: true, title: '', headerLeft: () => null, headerBackVisible: false, headerRight: () => helpButton(colorScheme)}} />
        <Stack.Screen name="login" options={{title: 'Login'}} />
        <Stack.Screen name="register" options={{title: 'Register'}} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Help' }} />
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="index" options={{headerShown: false}}/>
      </Stack>
  )
}

export default _layout

const styles = StyleSheet.create({})