import { StyleSheet, Text, View, Button, Platform } from 'react-native'
import React from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../AuthContext'
import { navigate } from 'expo-router/build/global-state/routing'

const home = () => {
  const { setAuth } = useAuth()

  const onLogout = async ()=>{
    setAuth(null)
    const {error} = await supabase.auth.signOut()
    if (Platform.OS === 'web') {
        if (error) window.alert('Error signing out')
    }
    if (error) Alert.alert('Error signing out')
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
      <Button title="Enter New Food Log(s)" onPress={() => navigate('../food_log')}/>
      </View>

      <View style={styles.buttonWrapper}>
      <Button title="View Previous Food Log(s)" onPress={() => navigate('../previous_logs')}/>
      </View>

      <View style={styles.buttonWrapper}>
      <Button title="Logout" onPress={onLogout}/>
      </View>
    </View>
  )
}

export default home

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }, 
  buttonWrapper: {
    width: 250
  }
})