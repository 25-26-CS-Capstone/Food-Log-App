# Testing Guide: Notification Feature

## Quick Test (5 minutes)

### Test Case 1: Welcome Notification on Login
**Expected Behavior**: User receives welcome notification after successful login

**Steps**:
1. Open app on device/emulator
2. Navigate to welcome screen
3. Click "LOGIN"
4. Enter valid email and password
5. Click "Login" button
6. **Expected**: Notification pops up: "👋 Welcome Back, [Name]!"
7. **Verify**: Notification shows correct user name

**Pass/Fail**:
- [ ] Notification appears within 2 seconds
- [ ] User name is personalized
- [ ] Notification body mentions "continue logging"
- [ ] Sound played (if enabled on device)

---

### Test Case 2: Notification Deep Linking
**Expected Behavior**: Tapping notification navigates to logs page

**Prerequisites**: Complete Test Case 1 (have notification displayed)

**Steps**:
1. Tap on the notification
2. **Expected**: App navigates to history page
3. Verify you can see food logs and symptoms

**Pass/Fail**:
- [ ] Notification tap triggers navigation
- [ ] Routes to /history page
- [ ] History page loads correctly
- [ ] Previous logs are visible

---

### Test Case 3: Home Page Notification Tip
**Expected Behavior**: Home page shows tip about notifications

**Steps**:
1. After login, view home screen
2. Look for notification tip message
3. **Expected**: See message: "💡 Tap on notifications to quickly jump to your logs!"

**Pass/Fail**:
- [ ] Tip message is visible
- [ ] Text is clear and positioned well
- [ ] Styling matches design

---

## Detailed Testing Scenarios

### Scenario 1: Login with Different User Names

#### Test 1a: User with Name in Metadata
**Setup**: User has name field in user_metadata

**Steps**:
1. Login with this user
2. Check notification title
3. **Expected**: "👋 Welcome Back, [Name from metadata]!"

**Verify**:
- [ ] Uses name from metadata
- [ ] Name not truncated
- [ ] Special characters handled correctly

#### Test 1b: User without Name (Email Only)
**Setup**: User has no name in metadata

**Steps**:
1. Login with this user
2. Check notification title
3. **Expected**: "👋 Welcome Back, [email prefix]!"

**Verify**:
- [ ] Falls back to email username
- [ ] Capitalizes correctly
- [ ] Works with all email formats

#### Test 1c: User with Special Characters in Name
**Setup**: User name contains: é, ñ, 中文, etc.

**Steps**:
1. Login with this user
2. Check notification
3. **Expected**: Characters display correctly

**Verify**:
- [ ] No garbled characters
- [ ] Unicode handled properly

---

### Scenario 2: Notification Persistence

#### Test 2a: App in Background
**Setup**: App is running but in background

**Steps**:
1. Login to app
2. See notification pop
3. Switch app to background
4. Notification remains on device
5. Return to app
6. Notification still visible
7. Tap it
8. **Expected**: Still navigates correctly

**Verify**:
- [ ] Notification doesn't disappear
- [ ] Works when app backgrounded
- [ ] Navigation still functional

#### Test 2b: App Closed and Reopened
**Setup**: App is fully closed

**Steps**:
1. Login and see notification
2. Close app completely
3. Reopen app
4. Check for notification
5. Notification should still exist
6. Tap it
7. **Expected**: Navigates to logs

**Verify**:
- [ ] Notification persists after app close
- [ ] Reopening shows notification
- [ ] Navigation works from closed state

---

### Scenario 3: Multiple Taps and Rapid Interactions

#### Test 3a: Tap Notification After Home Displayed
**Setup**: 
1. Login complete
2. Home page showing
3. Notification also visible

**Steps**:
1. From home screen, tap notification
2. **Expected**: Routes to /history
3. Go back to home
4. **Expected**: Home still accessible

**Verify**:
- [ ] Navigation is instant
- [ ] No lag or stuttering
- [ ] Back button works

#### Test 3b: Multiple Notifications (Future Enhancement)
**Setup**: If sending multiple notifications

**Expected Behavior**: All notifications queue and can be tapped individually

---

### Scenario 4: Network Scenarios

#### Test 4a: Login with Poor Network
**Setup**: Weak/intermittent connection

**Steps**:
1. Open app on network with latency
2. Login
3. **Expected**: Notification still appears
4. Might be delayed but eventually shows

**Verify**:
- [ ] Notification doesn't timeout
- [ ] User sees loading/waiting state
- [ ] Notification appears even with delay

#### Test 4b: Offline When Notification Sent
**Setup**: Device goes offline during login

**Steps**:
1. Initiate login
2. Device goes offline mid-auth
3. **Expected**: Login fails or retries

**Verify**:
- [ ] Notification doesn't appear
- [ ] No crash or error
- [ ] Graceful failure handling

---

### Scenario 5: UI/UX Testing

#### Test 5a: Home Page Layout on Different Screen Sizes
**Devices to Test**:
- Small phone (4.5")
- Regular phone (5.5")
- Large phone (6.5"+)
- Tablet (if applicable)

**Expected**: Content is readable without horizontal scroll

**Verify for Each**:
- [ ] Welcome message fully visible
- [ ] All buttons accessible without scrolling
- [ ] Text is readable size
- [ ] Proper spacing maintained

#### Test 5b: Welcome Page Feature List
**Steps**:
1. Navigate to welcome page
2. Scroll down
3. View all features listed
4. **Expected**: 4 features visible with icons

**Verify**:
- [ ] All features display
- [ ] Icons visible
- [ ] Text is clear
- [ ] Notification info box is prominent

#### Test 5c: Button Styling and Feedback
**Steps**:
1. Home page - hover over buttons
2. **Expected**: Visual feedback on touch
3. Tap buttons
4. **Expected**: Responsive, not laggy

**Verify**:
- [ ] Visual feedback on press (opacity change)
- [ ] Buttons respond instantly
- [ ] No button overlap or collision

---

## Edge Cases

### Edge Case 1: Notification Permissions Denied
**Setup**: User denies notification permissions

**Steps**:
1. App asks for notification permissions
2. User clicks "Don't Allow"
3. Login
4. **Expected**: App continues gracefully

**Verify**:
- [ ] No crash
- [ ] App still functional
- [ ] User can still use app
- [ ] No error messages

### Edge Case 2: Notification Service Failure
**Setup**: Intentionally break notification service

**Steps**:
1. Comment out notification code temporarily
2. Login
3. **Expected**: App doesn't crash
4. Navigation still works

**Verify**:
- [ ] No console errors
- [ ] App continues
- [ ] Graceful degradation

### Edge Case 3: Very Long User Names
**Setup**: User name is 50+ characters

**Steps**:
1. Login with long-named user
2. Check notification
3. **Expected**: Name fits appropriately

**Verify**:
- [ ] No text overflow
- [ ] Notification still readable
- [ ] Styling maintained

### Edge Case 4: Empty or Null User Name
**Setup**: User metadata has null/empty name field

**Steps**:
1. Set user metadata name to ""
2. Login
3. Check notification
4. **Expected**: Falls back to email prefix

**Verify**:
- [ ] No blank notification title
- [ ] Fallback works
- [ ] Notification is still meaningful

---

## Performance Testing

### Performance Test 1: Notification Send Time
**Objective**: Measure how fast notification is sent

**Steps**:
1. Login
2. Measure time from successful auth to notification appearance
3. **Expected**: < 1 second usually

**Target**:
- [ ] < 500ms (ideal)
- [ ] < 1000ms (acceptable)
- [ ] > 3000ms (investigate)

### Performance Test 2: Navigation Performance
**Objective**: Measure notification tap to screen display time

**Steps**:
1. Notification visible
2. Tap notification
3. Measure time to history page render
4. **Expected**: < 300ms

**Target**:
- [ ] < 300ms (ideal)
- [ ] < 500ms (acceptable)
- [ ] > 1000ms (investigate)

### Performance Test 3: App Startup with Notifications
**Objective**: Ensure notifications don't slow startup

**Steps**:
1. Cold start app
2. Time to login screen
3. **Expected**: Same as before notifications

**Verify**:
- [ ] No startup delay
- [ ] Notification init in background
- [ ] App responsive

---

## Accessibility Testing

### Accessibility Test 1: Screen Reader Support
**Steps** (with screen reader enabled):
1. Open app with screen reader (TalkBack/VoiceOver)
2. Navigate to home page
3. **Expected**: All text read aloud
4. Buttons announced as tappable

**Verify**:
- [ ] Welcome message announced
- [ ] Buttons are announced
- [ ] Too much text not overwhelming
- [ ] Navigation clear

### Accessibility Test 2: Font Size Scaling
**Setup**: Device font size set to large

**Steps**:
1. Open app with scaled fonts
2. **Expected**: Text still readable
3. Layout doesn't break

**Verify**:
- [ ] Text scales appropriately
- [ ] No text cutoff
- [ ] Buttons remain functional

### Accessibility Test 3: High Contrast Mode
**Setup**: Enable high contrast mode

**Steps**:
1. Theme with high contrast
2. **Expected**: App remains usable

**Verify**:
- [ ] Colors have good contrast
- [ ] Text readable
- [ ] Buttons visible

---

## Device-Specific Testing

### iOS Testing
- [ ] Notification appears with sound
- [ ] Deep linking works from background
- [ ] No permission permission dialogs appear twice
- [ ] Notification styling correct for iOS

### Android Testing
- [ ] Notification follows Material Design
- [ ] Notification displays in notification shade
- [ ] Deep linking works from notification shade
- [ ] LED/vibration work if configured

### Web Testing (if applicable)
- [ ] Graceful degradation (notifications don't work)
- [ ] Still able to login
- [ ] App functions without notifications
- [ ] No console errors

---

## Regression Testing Checklist

After any future updates, verify:

- [ ] Welcome screen appears correctly
- [ ] Login page functional
- [ ] Notification sent after login
- [ ] Notification shows user name
- [ ] Home page displays
- [ ] Notification tip visible on home
- [ ] Can tap notification
- [ ] Navigation to history works
- [ ] History page displays logs
- [ ] Can navigate back
- [ ] Can logout and login again
- [ ] Multiple login cycles work

---

## Test Report Template

```
NOTIFICATION FEATURE TEST REPORT
Date: ___________
Tester: _________
Device: ________ (Android/iOS/Web)
OS Version: _____
App Version: ____

TEST RESULTS:
┌────────────────────────────────────────┐
│ Test Case      │ Expected │ Actual │   │
├────────────────────────────────────────┤
│ Welcome Notif  │ Shows    │        │ ✓ │
│ Deep Linking   │ Navigates│       │ ✓ │
│ Home Tip       │ Visible  │        │ ✓ │
│ ...            │          │        │   │
└────────────────────────────────────────┘

ISSUES FOUND:
1. _______________
2. _______________

PERFORMANCE:
- Notification send time: _____ ms
- Navigation time: _____ ms
- App startup: _____ seconds

NOTES:
_____________________________

OVERALL RESULT: [ PASS ] [ FAIL ]
```

---

## Automated Testing (Future Enhancement)

For CI/CD integration:

```javascript
// Example Jest test structure
describe('Notification Feature', () => {
  test('sends welcome notification on login', async () => {
    // Login user
    // Assert notification sent
    // Assert contains user name
  })

  test('navigates on notification tap', async () => {
    // Tap notification
    // Assert routed to /history
  })

  test('home page shows notification tip', async () => {
    // Check home screen
    // Assert notification tip visible
  })
})
```

---

## Troubleshooting During Testing

### Issue: Notification doesn't appear
**Fix**:
- [ ] Check notification permissions granted
- [ ] Check device notification settings
- [ ] Check notification service is initialized
- [ ] Check no console errors

### Issue: Wrong name in notification
**Fix**:
- [ ] Check user metadata includes name
- [ ] Check setAuth is called with full user object
- [ ] Check email fallback logic

### Issue: Tap notification doesn't navigate
**Fix**:
- [ ] Check route name matches Stack.Screen
- [ ] Check navigation callback is set
- [ ] Check router.push is being called
- [ ] Check no errors in console

---

## Sign Off

Once all tests pass:

- [ ] Tested on minimum 2 devices
- [ ] Tested login workflow
- [ ] Tested notification display
- [ ] Tested deep linking
- [ ] Tested edge cases
- [ ] No critical issues remaining
- [ ] Ready for production

**Tester**: ____________  
**Date**: ____________  
**Approved**: ____________
