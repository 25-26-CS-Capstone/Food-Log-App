import { StyleSheet, Text, View, Button, Platform, Alert } from 'react-native';
import React from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { navigate } from 'expo-router/build/global-state/routing';

const settings = () => {
  const { setAuth } = useAuth();

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (Platform.OS === 'web') {
      if (error) window.alert('Error signing out');
    } else if (error) {
      Alert.alert('Error signing out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <Button title="Logout" onPress={onLogout} />
      </View>
    </View>
  )
}

export default settings

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonWrapper: {
    width: 250,
    marginVertical: 6,
  },
});
