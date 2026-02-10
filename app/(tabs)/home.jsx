import { StyleSheet, View, Button, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from "expo-router";
import { useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

const home = () => {
  const { user } = useAuth();
  const router = useRouter();
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
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center', paddingBottom: 30}}>
      {/* Welcome Message with User Info */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome back, {userName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Track your food journey</Text>
        {userEmail && (
          <Text style={styles.userEmail}>Logged in as: {userEmail}</Text>
        )}
        <Text style={styles.notificationTip}>
          💡 Tap on notifications to quickly jump to your logs!
        </Text>
      </View>

      {/* Quick Links to Logs */}
      <View style={styles.linksContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('../food_log')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>➕ Add New Food Log</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('../history')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonTextPrimary}>📋 View Your Logs & Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('../calendar')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>📅 View Food Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('../symptom_log')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>🩺 Log Symptoms</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  welcomeContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
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
    marginBottom: 12,
  },
  notificationTip: {
    fontSize: 13,
    color: '#27ae60',
    marginTop: 8,
    fontWeight: '500',
    fontStyle: 'italic',
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
  actionButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: '#3498db',
    borderLeftColor: '#2980b9',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    textAlign: 'center',
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});
