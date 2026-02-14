import { StyleSheet, Text, View, TextInput, Alert, Button, Platform } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sendWelcomeWithLogsLink } from '../utils/notifications'
import { useAuth } from './AuthContext'

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
      // Login successful - set auth and send welcome notification
      if (data?.user) {
        setAuth(data.user)
        // Get user's name from metadata or email
        const userName = data.user.user_metadata?.name || email.split('@')[0] || 'User'
        // Send welcome notification with deep link to logs (only on native)
        if (Platform.OS !== 'web') {
          try {
            await sendWelcomeWithLogsLink(userName)
          } catch (error) {
            console.log('Notification not available:', error)
          }
        }
      }
    }

    setLoading(false)
  }

  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="gray" style={styles.input}/>
      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="gray" style={styles.input} secureTextEntry/>
      <Button title="Login" onPress={signInWithEmail} disabled={loading} />
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