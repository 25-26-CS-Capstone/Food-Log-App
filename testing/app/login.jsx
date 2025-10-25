/*
import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const login = () => {
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

export default login

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Login failed', error.message);
    } else {
      router.push('/home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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

