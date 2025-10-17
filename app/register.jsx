import { StyleSheet, Text, View, TextInput, Alert, AppState, Button, Platform } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const register = () => {
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail () {
    setLoading(true)
    const {error} = await supabase.auth.signUp({ email, password })

    if (Platform.OS === 'web') {
            if (error) window.alert(error.message)
    }
    if (error) Alert.alert(error.message) 
  
    setLoading(false)
  }

  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input}/>

      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry/>
  
      <Button title="Submit" onPress={signUpWithEmail} disabled={loading} />
    </View>
  )
}

export default register

const styles = StyleSheet.create({
    input: {
      marginBottom: 20,
      padding: 20,
      borderColor: '#000',
      borderWidth: 1
    }
})