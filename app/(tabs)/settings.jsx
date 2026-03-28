import { StyleSheet, Text, View, Pressable, Button, Platform, Alert } from 'react-native'; // Changed Button to Pressable
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../AuthContext'
import { router } from 'expo-router'

const settings = () => {
  const { setAuth } = useAuth();

  const onLogout = async ()=>{
    try {
      const {error} = await supabase.auth.signOut()
      if (error) {
        if (Platform.OS === 'web') {
          window.alert('Error signing out')
        } else {
          Alert.alert('Error signing out')
        }
        return
      }
      setAuth(null)
      router.replace('/welcome')
    } catch (err) {
      console.error('Error signing out:', err)
      Alert.alert('Error', 'Error signing out.')
    }
  }

  const removeUserData = async () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all food logs, symptoms, and evaluations. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
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

  const deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "user_name",
                "foodLog",
                "symptomLog",
                "evaluationHistory",
              ]);
              try {
                await supabase.rpc('delete_user');
              } catch (rpcError) {
                console.log('delete_user RPC not available:', rpcError);
              }
              const { error } = await supabase.auth.signOut();
              if (error) console.error('Sign out error during account deletion:', error);
              setAuth(null);
              router.replace('/welcome');
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[{justifyContent: 'center'}, {alignItems: 'center'}, {flex:1}]}>
      
      <Pressable 
        style={[styles.button, { backgroundColor: '#056f46' }]} 
        onPress={() => router.push("../dataExport")}
      >
        <Text style={styles.buttonText}>📤 Export Data</Text>
      </Pressable>

      {/* Logout - Warning Color */}
      <Pressable 
        style={[styles.button, { backgroundColor: '#076090' }]} 
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>🔑 Logout</Text>
      </Pressable>

      {/* Delete All Data */}
      <Pressable 
        style={[styles.button, { backgroundColor: '#e74c3c' }]} 
        onPress={removeUserData}
      >
        <Text style={styles.buttonText}>⚠️ Delete All Data</Text>
      </Pressable>

      {/* Delete Account */}
      <Pressable 
        style={[styles.button, { backgroundColor: '#7b0000' }]} 
        onPress={deleteAccount}
      >
        <Text style={styles.buttonText}>🗑️ Delete Account</Text>
      </Pressable>

    </View>
  );
};

export default settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: "#eef2ff",
  },
  header: {
    width: '100%',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: "#8e8e9c",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
  },
  button: {
    width: 250,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 8,
    // Add a slight shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});