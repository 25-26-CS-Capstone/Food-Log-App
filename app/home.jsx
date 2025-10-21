import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { addSampleData, hasSampleData } from '../utils/sampleData'

const home = () => {
  const router = useRouter()

  // Add sample data on first load
  useEffect(() => {
    const initializeSampleData = async () => {
      try {
        const hasData = await hasSampleData()
        if (!hasData) {
          console.log('No existing data found, adding sample data...')
          await addSampleData()
        } else {
          console.log('Existing data found, skipping sample data.')
        }
      } catch (error) {
        console.error('Error initializing sample data:', error)
      }
    }
    
    initializeSampleData()
  }, [])

  const navigateToFoodLog = () => {
    router.push('/foodLog')
  }

  const navigateToSymptomsLog = () => {
    router.push('/symptomsLog')
  }

  const navigateToViewLogs = () => {
    router.push('/viewLogs')
  }

  const navigateToFoodInfo = () => {
    router.push('/foodInfo')
  }

  const navigateToCalendar = () => {
    router.push('/calendar')
  }

  const addTestData = async () => {
    console.log('Adding test data...')
    await addSampleData()
    console.log('Test data added!')
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

        <TouchableOpacity style={styles.infoButton} onPress={navigateToFoodInfo}>
          <Text style={styles.infoButtonText}>🔍 Food Info Lookup</Text>
          <Text style={styles.buttonDescription}>Search nutritional database</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.calendarButton} onPress={navigateToCalendar}>
          <Text style={styles.calendarButtonText}>📅 Food Calendar</Text>
          <Text style={styles.buttonDescription}>View entries by date</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={addTestData}>
          <Text style={styles.testButtonText}>🧪 Add Test Data</Text>
          <Text style={styles.buttonDescription}>Add sample entries for testing</Text>
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
  testButton: {
    backgroundColor: '#9B59B6',
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
  testButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoButton: {
    backgroundColor: '#FF9500',
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
  infoButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  calendarButton: {
    backgroundColor: '#8E4EC6',
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
  calendarButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
})