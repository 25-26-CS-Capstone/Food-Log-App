import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'

const index = () => {
  return (
    <View style={styles.container}>
        <Link href="/login" style={styles.link}>Login</Link>
        <Link href="/register" style={styles.link}>New account</Link>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    link: {
      marginVertical: 10,
      padding: 10,
      margin: 80,
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'darkgrey'
    }
})