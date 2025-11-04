import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { saveUserData } from '../utils/storage'
import { sendLoginNotification } from '../utils/notifications'

const login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email')
      return
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password')
      return
    }

    try {
      // Extract username from email (part before @)
      const username = email.split('@')[0]
      
      // Save user data
      await saveUserData({
        email: email,
        username: username,
        lastLogin: new Date().toISOString()
      })

      // Send welcome back notification
      await sendLoginNotification(username)

      // Navigate to home
      router.push('/home')
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('Error', 'Failed to login. Please try again.')
    }
  }

  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput 
        placeholder="Email" 
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput 
        placeholder="Password" 
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  )
}

export default login

const styles = StyleSheet.create({
    input: {
      marginBottom: 20,
      padding: 20,
      borderColor: '#000',
      borderWidth: 1
    },
    button: {
      marginVertical: 10,
      padding: 15,
      backgroundColor: '#007AFF',
      borderRadius: 8,
      alignItems: 'center'
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600'
    }
})