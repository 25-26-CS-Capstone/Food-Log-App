import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const home = () => {
  const router = useRouter()

  const navigateToFoodLog = () => {
    router.push('/foodLog')
  }

  const navigateToSymptomsLog = () => {
    router.push('/symptomsLog')
  }

  const navigateToViewLogs = () => {
    router.push('/viewLogs')
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Food Log App</Text>
      <Text style={styles.subtitle}>Track your food and symptoms</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={navigateToFoodLog}>
          <Text style={styles.primaryButtonText}>🍎 Log Food</Text>
          <Text style={styles.buttonDescription}>Record what you eat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={navigateToSymptomsLog}>
          <Text style={styles.secondaryButtonText}>🩺 Log Symptoms</Text>
          <Text style={styles.buttonDescription}>Track how you feel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={navigateToViewLogs}>
          <Text style={styles.tertiaryButtonText}>📊 View Logs</Text>
          <Text style={styles.buttonDescription}>Review your entries</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Monitor your food intake and track symptoms to identify potential food sensitivities and patterns.
        </Text>
      </View>
    </ScrollView>
  )
}

export default home

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  tertiaryButton: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tertiaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    textAlign: 'center',
  },
})