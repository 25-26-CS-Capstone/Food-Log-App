# Notification Feature with Deep Linking

## Overview
The Food Log App now includes a comprehensive notification system with deep linking capabilities. When users log in, they receive a welcome notification that directly links them to their food logs and history.

## Features

### 1. Welcome Notification on Login
- **Trigger**: Automatically sent when a user successfully logs in
- **Content**: Personalized welcome message with the user's name
- **Action**: Tapping the notification navigates to the history/logs page
- **Purpose**: Encourages users to continue logging their food and tracking progress

### 2. Deep Linking in Notifications
Notifications can now include route data that automatically navigates users to specific pages when tapped:
- `history` - View food logs and symptom history
- `food_log` - Add a new food log entry
- `symptom_log` - Log symptoms
- `calendar` - View food calendar

### 3. Notification Types Supported
- **Welcome with Logs**: Login notification with link to logs
- **Meal Reminders**: Breakfast, lunch, and dinner reminders
- **Symptom Reminders**: Reminder to log symptoms
- **Daily Reminders**: General food logging reminders
- **Custom Notifications**: Send any notification with custom routes

## Implementation Details

### Updated Files

#### 1. `utils/notifications.js`
**Key Changes**:
- Added `navigationCallback` parameter to `init()` method
- Implemented `setupNotificationListeners()` to handle notification responses
- Added `sendWelcomeWithLogsLink()` method for login notifications
- Added `sendNotificationWithDeepLink()` for custom notifications with routing
- Added `setNavigationCallback()` to manage navigation handlers

**Key Methods**:
```javascript
// Send welcome notification when user logs in
sendWelcomeWithLogsLink(username)

// Send notification with custom route
sendNotificationWithDeepLink(title, body, route, data)

// Set navigation callback for handling notification taps
setNavigationCallback(callback)
```

#### 2. `app/login.jsx`
**Key Changes**:
- Imported notification functions
- Added `setAuth` hook from AuthContext
- Sends `sendWelcomeWithLogsLink()` after successful login
- Extracts user name from metadata or email

**Login Flow**:
1. User enters credentials
2. Login successful
3. User auth is set in context
4. Welcome notification is sent
5. App automatically transitions to home
6. User can tap notification to go to logs

#### 3. `app/_layout.jsx`
**Key Changes**:
- Added `useRouter` hook for navigation
- Added `useEffect` to initialize notifications
- Implemented navigation callback that handles different notification types
- Routes notifications to appropriate screens based on data

**Navigation Routes**:
```javascript
- data.type === 'welcome_with_logs' → /history
- data.type === 'meal_reminder' → /food_log
- data.type === 'symptom_reminder' → /symptom_log
- data.route → /{data.route} (generic route from data)
```

#### 4. `app/(tabs)/home.jsx`
**Key Changes**:
- Enhanced welcome message styling
- Added notification tip: "💡 Tap on notifications to quickly jump to your logs!"
- Improved button styling with visual hierarchy
- Made "View Your Logs & Progress" the primary action
- Added changelog/history note about notifications

**UI Improvements**:
- Welcome card with more prominent styling
- Color-coded action buttons
- Better visual feedback (activeOpacity on buttons)
- Scrollable layout for better mobile experience

## How Users Interact

### Login → Notification Flow
1. User logs in with email/password
2. Receives welcome notification: "👋 Welcome Back, [Name]! Tap to continue logging your food and track your progress."
3. Can tap notification at any time to jump directly to their logs/history
4. Home screen shows tip about notification feature

### From Home Screen
1. User sees quick action buttons
2. Primary action is "View Your Logs & Progress"
3. Can also use notification to quick-access logs

## Code Examples

### Sending a Welcome Notification
```javascript
import { sendWelcomeWithLogsLink } from '../utils/notifications'

// After successful login
const userName = data.user.user_metadata?.name || email.split('@')[0]
await sendWelcomeWithLogsLink(userName)
```

### Handling Notification Taps
```javascript
const navigationCallback = (data) => {
  // data contains: type, route, username, timestamp, etc.
  if (data.type === 'welcome_with_logs') {
    router.push('/history')
  }
}

initNotifications(navigationCallback)
```

### Sending Custom Notification with Route
```javascript
import { sendNotificationWithDeepLink } from '../utils/notifications'

await sendNotificationWithDeepLink(
  '🍽️ Lunch Time!',
  'Don\'t forget to log your meal',
  'food_log',
  { mealType: 'lunch' }
)
```

## Testing the Feature

### Manual Testing Steps
1. **Test Login Notification**:
   - Open app and go to welcome screen
   - Click login
   - Enter valid credentials
   - Watch for notification popup
   - Tap notification and verify it navigates to /history

2. **Test Home Page**:
   - After login, verify home screen shows notification tip
   - Click "View Your Logs & Progress" button
   - Verify it navigates to history page

3. **Test Different Notification Types**:
   - Modify notification service to test meal reminders
   - Verify each type routes to correct screen

## Future Enhancements

1. **Persistent Notifications**: Add option to keep notifications until dismissed
2. **Rich Notifications**: Add images/icons to notifications
3. **Scheduled Notifications**: Better integration with meal time scheduling
4. **Notification Preferences**: User settings to customize notification behavior
5. **Analytics**: Track notification tap-through rates
6. **Notification History**: Show past notifications in-app

## Troubleshooting

### Notification Not Appearing
- Check platform permissions are granted
- Verify app is in foreground or background state
- Check notification service is properly initialized

### Deep Link Not Working
- Verify route names match exactly with Stack.Screen names
- Check navigation callback is properly set in _layout.jsx
- Verify data object contains correct 'route' or 'type' fields

### Name Not Personalizing
- Check user metadata includes name field
- Fallback to email prefix if name not available
- Verify setAuth is called with user data

## Dependencies
- `expo-notifications`: For notification functionality
- `expo-router`: For navigation and deep linking
- React Context for auth state management
