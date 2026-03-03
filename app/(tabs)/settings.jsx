import { StyleSheet, Text, View, Pressable, Platform, Alert } from 'react-native'; // Changed Button to Pressable
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

const settings = () => {
  const { setAuth } = useAuth();

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      const msg = 'Error signing out';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert(msg);
    }
  };

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

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <Pressable 
        style={[styles.button, { backgroundColor: '#056f46' }]} 
        onPress={() => {}}
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

      {/* Delete - Danger Color */}
      <Pressable 
        style={[styles.button, { backgroundColor: '#e74c3c' }]} 
        onPress={removeUserData}
      >
        <Text style={styles.buttonText}>⚠️ Delete All Data</Text>
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