import { StyleSheet, Text, View, TextInput, Alert, Button, Platform } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const login = () => {
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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

    const {error} = await supabase.auth.signInWithPassword({ email, password })
    
    if (Platform.OS === 'web') {
        if (error) window.alert(error.message)
    }
    if (error) Alert.alert(error.message)

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

export default login

const styles = StyleSheet.create({
    input: {
      marginBottom: 20,
      padding: 20,
      borderColor: '#000',
      borderWidth: 1
    }
})