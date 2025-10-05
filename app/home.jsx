import { StyleSheet, Text, View, Button, Alert } from 'react-native'
import React, { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

const home = () => {
  useEffect(() => {
    // Request notification permissions on mount
    ;(async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Notifications disabled', 'Permission not granted. You can still schedule notifications but the OS may block them.')
        }
      } catch (e) {
        // ignore for now, show a small alert
        console.warn('Permission request failed', e)
      }
    })()
  }, [])

  const scheduleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Food Log Reminder',
          body: 'This is a test reminder from your Food Log app.',
          data: { screen: 'Home' },
        },
        // deliver after ~10 seconds
        trigger: { seconds: 10 },
      })
      Alert.alert('Scheduled', 'Notification scheduled for about 10 seconds from now.')
    } catch (e) {
      console.warn('Failed to schedule notification', e)
      Alert.alert('Error', 'Could not schedule notification.')
    }
  }

  const sendNotificationNow = async () => {
    try {
      // presentNotificationAsync shows a notification immediately (no scheduling)
      await Notifications.presentNotificationAsync({
        title: 'Food Log — Immediate',
        body: 'This notification was sent immediately.',
        data: { screen: 'Home', immediate: true },
      })
      Alert.alert('Sent', 'Notification was sent immediately.')
    } catch (e) {
      console.warn('Failed to present notification', e)
      Alert.alert('Error', 'Could not send notification now.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title="Send Notification Now" onPress={sendNotificationNow} />
      <View style={{height:12}} />
      <Button title="Schedule Test Notification (10s)" onPress={scheduleTestNotification} />
    </View>
  )
}

export default home

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, marginBottom: 12 },
})