import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { addSampleData, hasSampleData } from '../utils/sampleData'
import { initNotifications, sendAppOpenNotification, sendCustomNotification } from '../utils/notifications'
import { getUserData, getAllLogs } from '../utils/storage'

const home = () => {
  const router = useRouter()
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)
  const [latestLogTimestamp, setLatestLogTimestamp] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-50)).current

  // Add sample data on first load and initialize notifications
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notification system
        console.log('Initializing notifications...')
        await initNotifications()
        
        // Send app open notification
        console.log('Sending app open notification...')
        await sendAppOpenNotification()
        
        // Load latest log timestamp for deep-linking
        try {
          const allLogs = await getAllLogs()
          if (allLogs && allLogs.length > 0) {
            setLatestLogTimestamp(new Date(allLogs[0].timestamp).toISOString())
          }
        } catch (e) {
          console.warn('Unable to load latest logs for popup deep-link', e)
        }
        
        // Check for user data and show welcome message
        const userData = await getUserData()
        if (userData && userData.username) {
          setWelcomeMessage(`Welcome back ${userData.username}!`)
          setShowWelcome(true)
          
          // Animate in
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            })
          ]).start()
          
          // Hide after 8 seconds (extended duration)
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: -50,
                duration: 400,
                useNativeDriver: true,
              })
            ]).start(() => setShowWelcome(false))
          }, 8000)
        }
        
        // Initialize sample data
        const hasData = await hasSampleData()
        if (!hasData) {
          console.log('No existing data found, adding sample data...')
          await addSampleData()
        } else {
          console.log('Existing data found, skipping sample data.')
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      }
    }
    
    initializeApp()
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

  const navigateToSymptomAnalysis = () => {
    router.push('/symptomAnalysis')
  }

  const navigateToSettings = () => {
    router.push('/settings')
  }

  const addTestData = async () => {
    console.log('Adding test data...')
    await addSampleData()
    
    // Also send a test notification
    await sendCustomNotification(
      '🧪 Test Data Added!',
      'Sample food and symptom entries have been added to your app'
    )
    
    console.log('Test data added and notification sent!')
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Food Log App</Text>
            {showWelcome && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setShowWelcome(false)
                  if (latestLogTimestamp) {
                    router.push({ pathname: '/viewLogs', params: { latest: latestLogTimestamp } })
                  } else {
                    router.push('/viewLogs')
                  }
                }}
                style={{ position: 'absolute' }}
              >
                <Animated.View 
                  style={[
                    styles.welcomePopup,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  <Text style={styles.welcomeEmoji}>👋</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <Text style={styles.welcomeText} numberOfLines={1}>{welcomeMessage}</Text>
                    <Text style={styles.welcomeDot}> · </Text>
                    <Text style={styles.welcomeLink}>Continue where you left off</Text>
                  </View>
                  <TouchableOpacity
                    accessibilityLabel="Dismiss welcome"
                    onPress={(e) => {
                      e.stopPropagation()
                      setShowWelcome(false)
                    }}
                    style={styles.dismissButton}
                  >
                    <Text style={styles.dismissButtonText}>✕</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle}>Track your food and symptoms</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
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

        <TouchableOpacity style={styles.analysisButton} onPress={navigateToSymptomAnalysis}>
          <Text style={styles.analysisButtonText}>🔬 Symptom Analysis</Text>
          <Text style={styles.buttonDescription}>Find potential food allergies</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginTop: 5,
  },
  settingsIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 40,
  },
  welcomePopup: {
    position: 'absolute',
    top: 35,
    right: -140,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1000,
  },
  welcomeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 180,
  },
  welcomeDot: {
    color: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    fontSize: 16,
  },
  welcomeLink: {
    color: '#E6F0FF',
    textDecorationLine: 'underline',
    fontWeight: '700',
    fontSize: 14,
  },
  dismissButton: {
    marginLeft: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
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
  analysisButton: {
    backgroundColor: '#FF3B30',
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
  analysisButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
})