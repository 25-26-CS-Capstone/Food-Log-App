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
        (1) Welcome Screen - Press [Continue] to proceed{'\n'}
        (2) Account Entry - Login or Register an account{'\n'}
        {'\t'} (2.1) Login - Enter your credentials to access your account{'\n'}
        {'\t'} (2.2) Register - Create a new account by providing necessary details{'\n'}
        (3) Home Screen - {'\n'}
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