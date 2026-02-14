import { StyleSheet, Text, View, Button, Platform, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  const removeUserData = async () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all food logs, symptoms, and evaluations. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "user_name",
                "foodLog",
                "symptomLog",
                "evaluationHistory",
              ]);

              Alert.alert("Success", "All data has been deleted.");
            } catch (error) {
              console.error("Error deleting data:", error);
              Alert.alert("Error", "Failed to delete data.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[{justifyContent: 'center'}, {alignItems: 'center'}, {flex:1}]}>
      <View style={styles.buttonWrapper}>
        <Button title="Logout" onPress={onLogout}/>
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Delete All Data" onPress={removeUserData}/>
      </View>
    </View>
    
  )
}

export default settings

const styles = StyleSheet.create({
  buttonWrapper: {
    width: 250
  }
})
