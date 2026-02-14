import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification system
  async init(navigationCallback) {
    try {
      // Register for push notifications
      await this.registerForPushNotificationsAsync();
      
      // Set up notification listeners with navigation callback
      this.setupNotificationListeners(navigationCallback);
      
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with actual project ID if needed
        });
        console.log('Push token:', token);
      } catch (e) {
        console.log('Error getting push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    return token;
  }

  // Set up notification event listeners
  setupNotificationListeners(navigationCallback) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      // Handle deep linking when user taps notification
      const data = response.notification.request.content.data;
      if (data && navigationCallback) {
        navigationCallback(data);
      }
    });
  }

  // Set navigation callback for handling notification taps
  setNavigationCallback(callback) {
    this.navigationCallback = callback;
    // Re-setup listeners with new callback if already initialized
    if (this.notificationListener && this.responseListener) {
      this.cleanup();
      this.setupNotificationListeners(callback);
    }
  }

  // Send app open notification
  async sendAppOpenNotification() {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍎 Welcome to the Food App!',
          body: `Welcome to the food app! Opened at ${timeString}`,
          sound: 'default',
          data: {
            type: 'app_open',
            timestamp: now.toISOString(),
          },
        },
        trigger: null, // Send immediately
      });

      console.log('App open notification sent');
    } catch (error) {
      console.error('Error sending app open notification:', error);
    }
  }

  // Send login welcome back notification with deep link to logs
  async sendWelcomeWithLogsLink(username) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `👋 Welcome Back, ${username}!`,
          body: 'Tap to continue logging your food and track your progress.',
          sound: 'default',
          data: {
            type: 'welcome_with_logs',
            username: username,
            route: 'history', // Deep link to history/logs page
            timestamp: new Date().toISOString(),
          },
        },
        trigger: null, // Send immediately
      });

      console.log('Welcome with logs link notification sent for user:', username);
    } catch (error) {
      console.error('Error sending welcome with logs link notification:', error);
    }
  }

  // Send custom notification with deep link
  async sendNotificationWithDeepLink(title, body, route, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: {
            ...data,
            route: route,
            timestamp: new Date().toISOString(),
          },
        },
        trigger: null, // Send immediately
      });

      console.log('Notification with deep link sent:', title);
    } catch (error) {
      console.error('Error sending notification with deep link:', error);
    }
  }

  // Send daily reminder notification
  async sendDailyReminder() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍽️ Don\'t Forget to Log Your Food!',
          body: 'Track your meals and symptoms to identify patterns',
          sound: 'default',
          data: {
            type: 'daily_reminder',
            timestamp: new Date().toISOString(),
          },
        },
        trigger: {
          hours: 19, // 7 PM
          minutes: 0,
          repeats: true,
        },
      });

      console.log('Daily reminder notification scheduled');
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  // Send meal time reminders
  async scheduleMealReminders() {
    try {
      // Breakfast reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Breakfast Time!',
          body: 'Good morning! Remember to log your breakfast',
          sound: 'default',
          data: { type: 'meal_reminder', meal: 'breakfast' },
        },
        trigger: {
          hours: 8,
          minutes: 0,
          repeats: true,
        },
      });

      // Lunch reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Lunch Time!',
          body: 'Time for lunch! Don\'t forget to log what you eat',
          sound: 'default',
          data: { type: 'meal_reminder', meal: 'lunch' },
        },
        trigger: {
          hours: 12,
          minutes: 30,
          repeats: true,
        },
      });

      // Dinner reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Dinner Time!',
          body: 'Evening meal time! Remember to track your dinner',
          sound: 'default',
          data: { type: 'meal_reminder', meal: 'dinner' },
        },
        trigger: {
          hours: 18,
          minutes: 0,
          repeats: true,
        },
      });

      console.log('Meal reminder notifications scheduled');
    } catch (error) {
      console.error('Error scheduling meal reminders:', error);
    }
  }

  // Send symptom tracking reminder
  async sendSymptomReminder() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🩺 How Are You Feeling?',
          body: 'Take a moment to log any symptoms you\'re experiencing',
          sound: 'default',
          data: {
            type: 'symptom_reminder',
            timestamp: new Date().toISOString(),
          },
        },
        trigger: {
          seconds: 2, // Send after 2 seconds for testing
        },
      });

      console.log('Symptom reminder notification sent');
    } catch (error) {
      console.error('Error sending symptom reminder:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Get scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Send custom notification
  async sendCustomNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        },
        trigger: null, // Send immediately
      });

      console.log('Custom notification sent:', title);
    } catch (error) {
      console.error('Error sending custom notification:', error);
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// Helper functions for easy access
export const initNotifications = (navigationCallback) => notificationService.init(navigationCallback);
export const sendAppOpenNotification = () => notificationService.sendAppOpenNotification();
export const sendWelcomeWithLogsLink = (username) => notificationService.sendWelcomeWithLogsLink(username);
export const sendNotificationWithDeepLink = (title, body, route, data) => 
  notificationService.sendNotificationWithDeepLink(title, body, route, data);
export const sendDailyReminder = () => notificationService.sendDailyReminder();
export const scheduleMealReminders = () => notificationService.scheduleMealReminders();
export const sendSymptomReminder = () => notificationService.sendSymptomReminder();
export const cancelAllNotifications = () => notificationService.cancelAllNotifications();
export const getScheduledNotifications = () => notificationService.getScheduledNotifications();
export const sendCustomNotification = (title, body, data) => 
  notificationService.sendCustomNotification(title, body, data);
export const setNotificationNavigationCallback = (callback) => 
  notificationService.setNavigationCallback(callback);

export default notificationService;