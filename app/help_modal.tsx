import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';  // Import useRouter

export default function help_modal() {
  const router = useRouter();  // Get router instance

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help</Text>

      <Text style={styles.content}>
        How to use the Food Log App:
        {'\n'}{'\n'}
        (1) Welcome Screen - Press [Login] or [Register] to proceed.{'\n'}
        {'\t'} (1.1) Login - Enter your credentials to access your account.{'\n'}
        {'\t'} (1.2) Register - Create a new account by providing necessary details.{'\n\n'}

        (2) Home Screen - Access different features of the app.{'\n'}
        {'\t'} (2.1) View Food Calendar - See your logged meals in a calendar view.{'\n'}
        {'\t'} (2.2) View Previous Food Log - See your logged meals.{'\n\n'}

        (3) Settings - Customize your app preferences and logout.{'\n'}
      </Text>

      <Pressable
        style={styles.closeButton}
        onPress={() => router.back()}  // Close the modal by going back
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'left',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});