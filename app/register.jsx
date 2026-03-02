import { StyleSheet, Text, View, TextInput, Alert, Button, Platform } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { saveUserData } from '../utils/storage'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail () {
    if (email.trim() === '' || password.trim() === '') {
      if (Platform.OS === 'web') {
        window.alert('Please enter both email and password.')
          return
      }
      Alert.alert('Error', 'Please enter both email and password.');
      return
    }
    setLoading(true)

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()

    const signUpPayload = {
      email,
      password,
    }

    if (trimmedName) {
      signUpPayload.options = {
        data: {
          name: trimmedName,
        },
      }
    }

    const {data, error} = await supabase.auth.signUp(signUpPayload)

    if (Platform.OS === 'web') {
        if (error) window.alert(error.message)
    }
    if (error) {
      Alert.alert(error.message)
    } else {
      await saveUserData({
        userId: data?.user?.id || null,
        email: data?.user?.email || trimmedEmail,
        name: trimmedName || trimmedEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: null,
        notificationsEnabled: true,
      })
      Alert.alert('Success', 'Account created. You can now log in.')
    }
  
    setLoading(false)
  }

  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter name</Text>
      <TextInput testID="Name" value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="gray" style={styles.input}/>

      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput testID="Email" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="gray" style={styles.input}/>

      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput testID="Password" value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="gray" style={styles.input} secureTextEntry/>
  
      <Button testID="Submit" title="Submit" onPress={signUpWithEmail} disabled={loading} />
    </View>
  )
}

export default Register

const styles = StyleSheet.create({
    input: {
      marginBottom: 20,
      padding: 20,
      borderColor: '#000',
      borderWidth: 1
    }
})