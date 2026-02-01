import { StyleSheet, View, Button, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { navigate } from 'expo-router/build/global-state/routing'
import { useRouter } from "expo-router";
import { useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

const home = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Fetch user information when component mounts
    if (user) {
      setUserEmail(user.email || 'User');
      // Extract name from email or use metadata if available
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      setUserName(name);
    }
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Welcome Message with User Info */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome back, {userName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Track your food journey</Text>
        {userEmail && (
          <Text style={styles.userEmail}>Logged in as: {userEmail}</Text>
        )}
      </View>

      {/* Quick Links to Logs */}
      <View style={styles.linksContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.buttonWrapper}>
          <Button title="Add New Food Log(s)" onPress={() => navigate('../food_log')} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="View History (Food + Symptoms)" onPress={() => navigate('../history')} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="View Food Calendar" onPress={() => navigate('../calendar')} />
        </View>
      </View>
    </View>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  welcomeContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  userEmail: {
    fontSize: 13,
    color: '#74b9ff',
    marginTop: 5,
  },
  linksContainer: {
    width: '90%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: 6,
  },
});
