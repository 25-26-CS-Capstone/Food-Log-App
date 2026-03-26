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

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
	router: {
		replace: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	},
	useRouter: () => ({
		replace: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	}),
	Stack: {
		Screen: () => null,
	},
}));
