import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { addSampleData, hasSampleData } from '../utils/sampleData'
import { initNotifications, sendAppOpenNotification, sendCustomNotification } from '../utils/notifications'
import { getUserData, getAllLogs, getLoginDayCount, isWelcomeBannerDismissedToday, setWelcomeBannerDismissedToday } from '../utils/storage'

const home = () => {
  const router = useRouter()
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [lastLoginText, setLastLoginText] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)
  const [latestLogTimestamp, setLatestLogTimestamp] = useState(null)
  const [latestLogDate, setLatestLogDate] = useState(null)
  const [hasAnyLogs, setHasAnyLogs] = useState(false)
  const [loginDayCount, setLoginDayCount] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const { width } = useWindowDimensions()
  const isNarrow = width < 380
  const isTiny = width < 330

  // Add sample data on first load and initialize notifications
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Local flags to avoid state timing issues
        let hasLogsLocal = false
        let latestDateLocal = null
        // Initialize notification system
        console.log('Initializing notifications...')
        await initNotifications()
        
        // Send app open notification
        console.log('Sending app open notification...')
        await sendAppOpenNotification()
        
        // Load latest log timestamp for deep-linking
        try {
          const allLogs = await getAllLogs()
          const hasLogs = allLogs && allLogs.length > 0
          hasLogsLocal = !!hasLogs
          console.log('🔍 DEBUG: Total logs found:', allLogs?.length || 0)
          console.log('🔍 DEBUG: Has logs (local):', hasLogsLocal)
          setHasAnyLogs(hasLogsLocal)
          if (hasLogsLocal) {
            setLatestLogTimestamp(new Date(allLogs[0].timestamp).toISOString())
            // Also compute the latest date (YYYY-MM-DD)
            const d = new Date(allLogs[0].timestamp)
            const dateStr = d.toISOString().split('T')[0]
            setLatestLogDate(dateStr)
            latestDateLocal = dateStr
            console.log('🔍 DEBUG: Latest log date:', dateStr)
            console.log('🔍 DEBUG: Today date:', new Date().toISOString().split('T')[0])
          }
        } catch (e) {
          console.warn('Unable to load latest logs for popup deep-link', e)
        }
        
        // Check for user data and show welcome message
        const userData = await getUserData()
        const dismissedToday = await isWelcomeBannerDismissedToday()
        console.log('🔍 DEBUG: User data exists:', !!userData)
        console.log('🔍 DEBUG: Username:', userData?.username)
        console.log('🔍 DEBUG: Has any logs (state):', hasAnyLogs)
        console.log('🔍 DEBUG: Has logs (local):', hasLogsLocal)
        console.log('🔍 DEBUG: Banner dismissed today:', dismissedToday)
        console.log('🔍 DEBUG: Will show banner (using local):', !!(userData && userData.username && hasLogsLocal && !dismissedToday))
        
        if (userData && userData.username && hasLogsLocal && !dismissedToday) {
          // Fetch login day count and prepare last login string
          try {
            const count = await getLoginDayCount()
            setLoginDayCount(count)
            const last = userData.lastLogin ? new Date(userData.lastLogin) : null
            const lastText = last ? `${last.toLocaleDateString()} ${last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—'
            setWelcomeMessage(`Welcome back ${userData.username}! · ${count} days logged · Last login: ${lastText}`)
            setLastLoginText(lastText)
          } catch (e) {
            console.warn('Could not load login day count')
            setWelcomeMessage(`Welcome back ${userData.username}!`)
          }
          console.log('🔍 DEBUG: Welcome message set:', welcomeMessage)
          console.log('🔍 DEBUG: Last login text:', lastLoginText)
          setShowWelcome(true)
          console.log('🔍 DEBUG: setShowWelcome(true) called')
          
          // Animate in
          // set initial slide based on banner position (top vs bottom)
          slideAnim.setValue(isTiny ? 50 : -50)
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
          
          // Persist until dismissed: no auto-hide
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

  const navigateToReportGenerator = () => {
    router.push('/reportGenerator')
  }

  const navigateToSymptomSearch = () => {
    router.push('/symptomSearch')
  }

  const navigateToDietRecommendations = () => {
    router.push('/dietRecommendations')
  }

  const navigateToSettings = () => {
    router.push('/settings')
  }

  const navigateToUserProfile = () => {
    router.push('/userProfile')
  }

  const navigateToCalendarView = () => {
    router.push('/calendarView')
  }

  const navigateToDataExport = () => {
    router.push('/dataExport')
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

  const resetBannerForTesting = async () => {
    try {
      // Clear the dismissed date so banner shows again
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
      await AsyncStorage.removeItem('@ui_welcome_banner_dismissed_date')
      setShowWelcome(false)
      // Reload the page
      window.location.reload()
    } catch (error) {
      console.error('Error resetting banner:', error)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Food Log App</Text>
            {console.log('🔍 DEBUG: Rendering banner check - showWelcome:', showWelcome, 'hasAnyLogs (state):', hasAnyLogs)}
            {showWelcome && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setShowWelcome(false)
                  if (latestLogDate) {
                    router.push({ pathname: '/viewLogs', params: { latestDate: latestLogDate } })
                  } else {
                    router.push('/viewLogs')
                  }
                }}
                style={{ position: 'absolute' }}
              >
                <Animated.View 
                  style={[
                    styles.welcomePopup,
                    isTiny ? styles.welcomePopupBottom : (isNarrow ? styles.welcomePopupCentered : styles.welcomePopupRight),
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  <Text style={styles.welcomeEmoji}>👋</Text>
                  <View style={{ flexDirection: 'column', flexShrink: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                      <Text style={styles.welcomeText} numberOfLines={1}>{welcomeMessage}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Text style={styles.clockIcon}>🕒</Text>
                      <Text style={styles.lastLoginText}>Last login: {lastLoginText}</Text>
                      <Text style={styles.welcomeDot}> · </Text>
                      {latestLogDate && latestLogDate === new Date().toISOString().split('T')[0] ? (
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); setShowWelcome(false); router.push({ pathname: '/viewLogs', params: { latestDate: latestLogDate } }) }}
                        >
                          <Text style={styles.welcomeLink}>See today's logs</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation(); setShowWelcome(false); router.push('/foodLog') }}
                        >
                          <Text style={styles.todayPill}>Log today's food</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); setShowWelcome(false); router.push('/calendar') }}
                        style={{ marginLeft: 6 }}
                      >
                        <Text style={styles.calendarPill}>Calendar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    accessibilityLabel="Dismiss welcome"
                    onPress={(e) => {
                      e.stopPropagation()
                      setShowWelcome(false)
                      setWelcomeBannerDismissedToday()
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

        <TouchableOpacity style={styles.reportButton} onPress={navigateToReportGenerator}>
          <Text style={styles.reportButtonText}>📊 Generate Report</Text>
          <Text style={styles.buttonDescription}>View food & symptom patterns</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} onPress={navigateToSymptomSearch}>
          <Text style={styles.searchButtonText}>🔍 Search Symptoms</Text>
          <Text style={styles.buttonDescription}>Find & analyze symptom patterns</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dietButton} onPress={navigateToDietRecommendations}>
          <Text style={styles.dietButtonText}>🍽️ Diet Recommendations</Text>
          <Text style={styles.buttonDescription}>Get food alternatives & tips</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={navigateToUserProfile}>
          <Text style={styles.profileButtonText}>👤 My Profile</Text>
          <Text style={styles.buttonDescription}>View & edit your profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.calendarButton} onPress={navigateToCalendarView}>
          <Text style={styles.calendarButtonText}>📅 Calendar View</Text>
          <Text style={styles.buttonDescription}>Browse logs by date</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportButton} onPress={navigateToDataExport}>
          <Text style={styles.exportButtonText}>📊 Export Data</Text>
          <Text style={styles.buttonDescription}>Download logs as CSV/JSON</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={addTestData}>
          <Text style={styles.testButtonText}>🧪 Add Test Data</Text>
          <Text style={styles.buttonDescription}>Add sample entries for testing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={resetBannerForTesting}>
          <Text style={styles.testButtonText}>🔄 Reset Welcome Banner</Text>
          <Text style={styles.buttonDescription}>Clear dismissal and reload</Text>
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
  welcomePopupRight: {
    top: 35,
    right: -140,
  },
  welcomePopupCentered: {
    top: 35,
    alignSelf: 'center',
  },
  welcomePopupBottom: {
    bottom: 20,
    alignSelf: 'center',
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
  clockIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  lastLoginText: {
    color: '#E6F0FF',
    fontSize: 12,
    fontWeight: '600',
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
  todayPill: {
    backgroundColor: '#E6F0FF',
    color: '#0A3069',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
  },
  calendarPill: {
    backgroundColor: '#FFE8CC',
    color: '#8A4D00',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '700',
    fontSize: 12,
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
  reportButton: {
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
  reportButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchButton: {
    backgroundColor: '#6C63FF',
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
  searchButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  dietButton: {
    backgroundColor: '#00BCD4',
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
  dietButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileButton: {
    backgroundColor: '#9C27B0',
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
  profileButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  calendarButton: {
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
  calendarButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportButton: {
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
  exportButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
})