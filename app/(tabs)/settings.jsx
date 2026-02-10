import { StyleSheet, Text, View, Button, Platform } from 'react-native'
import React from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../AuthContext'

const settings = () => {
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
    <View style={[{justifyContent: 'center'}, {alignItems: 'center'}, {flex:1}]}>
      <View style={styles.buttonWrapper}>
        <Button title = "Export Data" onPress={() => {}}/>
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Logout" onPress={onLogout}/>
      </View>
    </View>
  )
}

export default settings

const styles = StyleSheet.create({
  buttonWrapper: {
    width: 250,
    marginVertical: 6,
  }
})
