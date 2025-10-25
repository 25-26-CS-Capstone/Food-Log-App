/*
import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const register = () => {
  return (
    <View style={{margin:20}}>
      <Text style={{paddingBottom:5}}>Enter email</Text>
      <TextInput placeholder="Email" style={styles.input}/>

      <Text style={{paddingBottom:5}}>Enter password</Text>
      <TextInput placeholder="Password" style={styles.input}/>
      <Link href="/home" style={styles.link}>Submit</Link>
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
    },
    link: {
      marginVertical: 10,
      padding: 10,
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'darkgrey'
    }
})
*/

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '../app/lib/supabase';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Signup error', error.message);
    } else {
      Alert.alert('Success', 'Check your email to confirm your account!');
      router.push('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: 'darkgrey', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
