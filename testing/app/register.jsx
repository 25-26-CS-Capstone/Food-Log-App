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