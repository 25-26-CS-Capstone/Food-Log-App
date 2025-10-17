import { StyleSheet, View, Button } from 'react-native'
import { useRouter } from 'expo-router';
import React from 'react'

const index = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{marginVertical:5}}>
        <Button title="Login" onPress={() => router.navigate('/login')} />
      </View>
      <View style={{marginVertical:5}}>
        <Button title="New account" onPress={() => router.navigate('/register')} />
      </View>    
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      margin: 80,
    }
})