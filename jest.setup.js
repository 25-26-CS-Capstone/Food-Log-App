jest.mock('expo-notifications', () => ({
	setNotificationHandler: jest.fn(),
	setNotificationChannelAsync: jest.fn(),
	getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
	requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
	getExpoPushTokenAsync: jest.fn(async () => ({ data: 'mock-expo-token' })),
	addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
	addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
	removeNotificationSubscription: jest.fn(),
	scheduleNotificationAsync: jest.fn(async () => 'mock-notification-id'),
	cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
	getAllScheduledNotificationsAsync: jest.fn(async () => []),
	AndroidImportance: { MAX: 'max' },
}));

jest.mock('expo-device', () => ({
	isDevice: true,
}));
