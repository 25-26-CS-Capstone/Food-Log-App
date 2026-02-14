import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { clearAllLogs } from '../utils/storage';
import { 
  scheduleMealReminders, 
  sendDailyReminder, 
  sendSymptomReminder,
  cancelAllNotifications,
  getScheduledNotifications,
  sendCustomNotification,
  sendAppOpenNotification
} from '../utils/notifications';

const Settings = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual sign out logic when authentication is fully integrated
            Alert.alert('Signed Out', 'You have been signed out successfully');
            router.push('/login');
          }
        }
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your food and symptom logs. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllLogs();
              if (success) {
                Alert.alert('Success', 'All data has been cleared');
              } else {
                Alert.alert('Error', 'Failed to clear data');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export functionality coming soon! This will allow you to backup your food and symptom data.',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    if (value) {
      // Enable notifications - schedule meal reminders
      await scheduleMealReminders();
      await sendCustomNotification(
        '🔔 Notifications Enabled!', 
        'You\'ll now receive meal and symptom reminders'
      );
    } else {
      // Disable notifications - cancel all scheduled
      await cancelAllNotifications();
      Alert.alert('Notifications Disabled', 'All scheduled notifications have been cancelled');
    }
  };

  const handleTestNotification = async () => {
    await sendCustomNotification(
      '🧪 Test Notification',
      'This is a test notification from Food Log App!'
    );
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const handleWelcomeNotification = async () => {
    await sendAppOpenNotification();
    Alert.alert('Welcome Notification Sent', 'Check your notifications for the welcome message!');
  };

  const handleScheduleMealReminders = async () => {
    try {
      await scheduleMealReminders();
      Alert.alert(
        'Meal Reminders Scheduled',
        'You\'ll receive reminders for breakfast (8:00 AM), lunch (12:30 PM), and dinner (6:00 PM)'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule meal reminders');
    }
  };

  const handleSymptomReminder = async () => {
    try {
      await sendSymptomReminder();
      Alert.alert('Symptom Reminder Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send symptom reminder');
    }
  };

  const handleViewScheduledNotifications = async () => {
    try {
      const scheduled = await getScheduledNotifications();
      const count = scheduled.length;
      Alert.alert(
        'Scheduled Notifications',
        `You have ${count} scheduled notification${count !== 1 ? 's' : ''}.\n\nCheck console for details.`
      );
      console.log('Scheduled notifications:', scheduled);
    } catch (error) {
      Alert.alert('Error', 'Failed to get scheduled notifications');
    }
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Privacy policy details would be displayed here. Your data is stored locally on your device and is not shared with third parties.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Food Log App',
      'Food Log App v1.0\n\nDeveloped by CS Capstone Team\n\nTrack your food intake and symptoms to identify potential food sensitivities and patterns.',
      [{ text: 'OK' }]
    );
  };

  const SettingsItem = ({ title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showArrow && <Text style={styles.arrow}>›</Text>)}
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <SettingsSection title="Preferences">
          <SettingsItem
            title="Notifications"
            subtitle="Get reminders to log your food and symptoms"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            title="Data Sync"
            subtitle="Sync data across devices (coming soon)"
            showArrow={false}
            rightComponent={
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={dataSync ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Notification Management">
          <SettingsItem
            title="Send Welcome Notification"
            subtitle='Send "Welcome to the food app" message'
            onPress={handleWelcomeNotification}
          />
          <SettingsItem
            title="Test Notification"
            subtitle="Send a test notification now"
            onPress={handleTestNotification}
          />
          <SettingsItem
            title="Schedule Meal Reminders"
            subtitle="Set up daily meal time notifications"
            onPress={handleScheduleMealReminders}
          />
          <SettingsItem
            title="Send Symptom Reminder"
            subtitle="Get reminded to log symptoms"
            onPress={handleSymptomReminder}
          />
          <SettingsItem
            title="View Scheduled Notifications"
            subtitle="See all upcoming notifications"
            onPress={handleViewScheduledNotifications}
          />
        </SettingsSection>

        <SettingsSection title="Data Management">
          <SettingsItem
            title="Export Data"
            subtitle="Backup your food and symptom logs"
            onPress={handleExportData}
          />
          <SettingsItem
            title="Clear All Data"
            subtitle="Delete all your logs permanently"
            onPress={handleClearAllData}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={handlePrivacyPolicy}
          />
          <SettingsItem
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Food Log App v1.0</Text>
          <Text style={styles.versionSubtext}>CS Capstone Project</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#c7c7cc',
    fontWeight: '300',
  },
  signOutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default Settings;