import { StyleSheet, Text, View, TextInput, Alert, Button, Platform } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sendWelcomeWithLogsLink } from '../utils/notifications'
import { useAuth } from './AuthContext'
import { getUserData, recordTodayLoginDay, saveUserData } from '../utils/storage'
import { router } from 'expo-router'

const Login = () => {
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()

  async function signInWithEmail () {
    if (email.trim() === '' || password.trim() === '') {
      if (Platform.OS === 'web') {
          window.alert('Please enter both email and password.')
          return
      }
      Alert.alert('Error', 'Please enter both email and password.');
      return
    }

    setLoading(true)

    const {data, error} = await supabase.auth.signInWithPassword({ email, password })
    
    if (Platform.OS === 'web') {
        if (error) window.alert(error.message)
    }
    if (error) {
      Alert.alert(error.message)
    } else {
      router.replace('/(tabs)/home') 
      // Login successful - set auth and send welcome notification
      if (data?.user) {
        setAuth(data.user)

        const existingUserData = await getUserData()
        const loginDayCount = await recordTodayLoginDay()

        // Get user's name from metadata or email
        const userName = data.user.user_metadata?.name || email.trim().split('@')[0] || 'User'

        await saveUserData({
          ...existingUserData,
          userId: data.user.id,
          email: data.user.email || email.trim(),
          name: userName,
          lastLogin: new Date().toISOString(),
          loginDayCount: loginDayCount ?? existingUserData?.loginDayCount ?? 0,
          notificationsEnabled: existingUserData?.notificationsEnabled !== false,
        })

        try {
          await sendWelcomeWithLogsLink(userName)
        } catch (error) {
          console.log('Notification not available:', error)
        }

        if (Platform.OS === 'web') {
          window.alert(`Login successful. Welcome back, ${userName}!`)
        } else {
          Alert.alert('Login successful', `Welcome back, ${userName}!`)
        }
      }
    }

    setLoading(false)
  }

  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput testID="Email" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="gray" style={styles.input}/>
      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput testID="Password" value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="gray" style={styles.input} secureTextEntry/>
      <Button testID="Login" title="Login" onPress={signInWithEmail} disabled={loading} />
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
    input: {
      marginBottom: 20,
      padding: 20,
      borderColor: '#000',
      borderWidth: 1
    }
})