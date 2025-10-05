# Food Log App — Notifications (prototype)

This repository is an Expo React Native project. I added a small prototype to schedule a local test notification from the home screen.

What I changed
- `app/home.jsx` — added a button that schedules a local notification after ~10 seconds. It requests notification permission on mount.

Install and run (local)
1. Install dependencies:

```powershell
npm install
npx expo install expo-notifications
```

2. Start the dev server and open the app in Expo Go or a simulator:

```powershell
npm start
```

3. On the Home screen press "Schedule Test Notification (10s)" — you should receive a local notification about 10 seconds later.

Notes and limitations
- On iOS simulators, notifications may not behave like real devices. Use a real device or the iOS Simulator configured with push simulation.
- For Android and bare workflow, additional setup (manifest changes or native configuration) may be required. See Expo Notifications docs: https://docs.expo.dev/versions/latest/sdk/notifications/

Next steps (if you want)
- Add a simple UI to schedule reminders at specific dates/times.
- Persist reminders to local storage and register them on app start.
- Add calendar integration or remote notifications.
