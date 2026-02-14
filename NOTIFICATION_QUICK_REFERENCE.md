# Quick Reference: Notification Feature

## Key Files Modified
| File | Purpose | Key Change |
|------|---------|-----------|
| `utils/notifications.js` | Core notification service | Added deep linking support with callbacks |
| `app/login.jsx` | Login page | Sends welcome notification on successful login |
| `app/_layout.jsx` | Root navigation | Initializes notifications and handles deep links |
| `app/(tabs)/home.jsx` | Home page | Enhanced UI with notification tips |
| `app/welcome.jsx` | Welcome screen | Added notification feature explanation |

## Quick Start: Add Notification to Any Page

### Step 1: Import the function
```jsx
import { sendWelcomeWithLogsLink } from '../utils/notifications'
// OR
import { sendNotificationWithDeepLink } from '../utils/notifications'
```

### Step 2: Send the notification
```jsx
// Welcome notification with user name
await sendWelcomeWithLogsLink('John')

// Custom notification with deep link
await sendNotificationWithDeepLink(
  'Title Here',
  'Body message here',
  'food_log' // route name
)
```

### Step 3: Users Can Tap to Navigate
The app automatically navigates to the specified route when they tap!

---

## Common Routes for Deep Linking
```
'history'      → Food logs and symptom history view
'food_log'     → Add new food log entry
'symptom_log'  → Log symptoms
'calendar'     → View food calendar by date
'home'         → Home screen
```

---

## Example: Send Meal Reminder Notification

```jsx
// In any component (e.g., useEffect in settings)
import { sendNotificationWithDeepLink } from '../utils/notifications'

const sendLunchReminder = async () => {
  await sendNotificationWithDeepLink(
    'Time for Lunch!',
    'Don\'t forget to log your meal',
    'food_log',
    { mealType: 'lunch' }
  )
}
```

---

## Data Structure Received in Navigation Callback

When user taps a notification, the callback receives:
```javascript
{
  type: 'welcome_with_logs',        // notification type
  username: 'john',                  // user name (if welcome)
  route: 'history',                  // where to navigate
  mealType: 'lunch',                 // custom data (optional)
  timestamp: '2024-02-10T...'        // when sent
}
```

---

## Customizing Notification Routes

To add new routes, edit `app/_layout.jsx`:

```jsx
const navigationCallback = (data) => {
  // Existing routes
  if (data.type === 'welcome_with_logs') {
    router.push('/history')
  }
  // NEW: Add your custom route
  else if (data.type === 'my_custom_notification') {
    router.push('/my_custom_page')
  }
}
```

---

## Permission Requirements

The app automatically requests notification permissions when initialized. 
- **iOS**: Will prompt user on first launch
- **Android**: Permissions set in AndroidManifest.xml
- **Web**: Not supported (gracefully handled)

---

## Testing Notifications Locally

### Test 1: Welcome Notification
1. Open app on device/emulator
2. Go to Login page
3. Enter valid credentials
4. Should see notification popup → "Welcome Back, [Name]!"
5. Tap notification → navigates to history page

### Test 2: Custom Notification
```jsx
// Temporarily add to a component useEffect:
import { sendNotificationWithDeepLink } from '../utils/notifications'

useEffect(() => {
  // This will fire 2 seconds after component mounts
  const timeout = setTimeout(() => {
    sendNotificationWithDeepLink(
      'Test Notification',
      'Does this navigate correctly?',
      'food_log'
    )
  }, 2000)
  
  return () => clearTimeout(timeout)
}, [])
```

---

## Troubleshooting

### Issue: Notification doesn't appear
- [ ] Check that permissions are granted
- [ ] Check that app is running (or in background for Android)
- [ ] Verify notification service is initialized in `_layout.jsx`

### Issue: Tapping notification doesn't navigate
- [ ] Verify route name matches exactly (case-sensitive)
- [ ] Check navigation callback is set properly
- [ ] Verify router.push is being called with correct path

### Issue: User name not showing
- [ ] Check user metadata includes name field
- [ ] If not, email prefix is used as fallback
- [ ] Verify setAuth is called with full user object

---

## Best Practices

1. **Always include a route** when sending notifications
   - ```jsx
     // Good
     await sendNotificationWithDeepLink(title, body, 'food_log')
     // Bad - no navigation
     await sendCustomNotification(title, body)
     ```

2. **Use personalized names** when possible
   - ```jsx
     // Good - personalized
     await sendWelcomeWithLogsLink(userName)
     // Generic
     await sendWelcomeWithLogsLink('User')
     ```

3. **Include meaningful data** for your use case
   - ```jsx
     // Good - includes context
     await sendNotificationWithDeepLink(
       'Lunch Time!',
       'Log your meal',
       'food_log',
       { mealType: 'lunch', time: '12:30' }
     )
     ```

---

## Permission Levels

| Feature | Required | Handled by |
|---------|----------|-----------|
| Local notifications | ✅ YES | Expo/OS |
| Push notifications | ✅ YES | Expo |
| Deep linking | ✅ YES | expo-router |
| Sound | ✅ YES | Notification config |
| Badge | ⚠️ OPTIONAL | User preference |

---

## Notification Structure

Each notification sent includes:
- **Title**: Main heading (personalized when possible)
- **Body**: Detailed message
- **Sound**: Device notification sound
- **Data**: Object containing route, type, and custom fields
- **Trigger**: When to send (null = immediately, or time-based)

---

## Integration Checklist

- [x] Notification service initialized in _layout.jsx
- [x] Login page sends welcome notification
- [x] Home page explains notification feature
- [x] Welcome page highlights notification benefits
- [x] Deep linking routes configured
- [x] Navigation callback handles all types
- [x] User permissions requested on app start

---

## API Reference

### sendWelcomeWithLogsLink(username)
Sends welcome notification that links to history
```jsx
await sendWelcomeWithLogsLink('John')
// Triggers: Push notification → tap → navigate to /history
```

### sendNotificationWithDeepLink(title, body, route, data)
Sends custom notification with routing
```jsx
await sendNotificationWithDeepLink(
  'Reminder',
  'Log your food',
  'food_log',
  { mealType: 'lunch' }
)
```

### sendCustomNotification(title, body, data)
Sends notification without automatic routing
```jsx
await sendCustomNotification('Title', 'Body', { data: 'value' })
// User still gets notification but no automatic navigation
```

### initNotifications(navigationCallback)
Initialize notification system with routing
```jsx
initNotifications((data) => {
  // Handle notification taps
})
```

### setNotificationNavigationCallback(callback)
Update the navigation handler
```jsx
setNotificationNavigationCallback((data) => {
  // New handler
})
```

---

## Performance Notes

- Notifications are sent immediately (non-blocking)
- Deep linking is instant once user taps
- No database queries needed for notifications
- Minimal overhead in app initialization
- Safe to call multiple times (no duplicates)

---

## Future Enhancements

- [ ] Rich notifications with images
- [ ] Sound/vibration customization
- [ ] Do Not Disturb scheduling
- [ ] Notification delivery analytics
- [ ] User preferences for notification types
- [ ] Local-only notifications (no server needed)

---

## Reference Files
- **Full Documentation**: [NOTIFICATION_FEATURE.md](./NOTIFICATION_FEATURE.md)
- **Implementation Summary**: [NOTIFICATION_IMPLEMENTATION_SUMMARY.md](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)
- **Code**: Check modified files listed in first table above
