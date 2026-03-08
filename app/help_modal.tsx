import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HelpModal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help & Guide</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Welcome Screen</Text>
          <Text style={styles.item}>• Press <Text style={styles.bold}>Login</Text> or <Text style={styles.bold}>Register</Text> to proceed.</Text>
          <Text style={styles.subItem}>Login – Enter your credentials to access your account.</Text>
          <Text style={styles.subItem}>Register – Create a new account with your details.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Home Screen</Text>
          <Text style={styles.item}>• Add New Food Logs – Search and log meals to track calories and symptoms.</Text>
          <Text style={styles.item}>• Evaluate Symptoms – Test possible allergens and intolerances.</Text>
          <Text style={styles.item}>• View History – Access and modify previous food logs.</Text>
          <Text style={styles.item}>• Food Calendar – View logged meals in a calendar format.</Text>
          <Text style={styles.item}>• Diet & Exercise – Get diet analysis and exercise recommendations.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Settings</Text>
          <Text style={styles.item}>• Export Data - Save logs in different ranges and formats.</Text>
          <Text style={styles.item}>• Logout – Return to the Welcome Screen.</Text>
          <Text style={styles.item}>• Delete All Data – Remove all stored food logs.</Text>
        </View>

      </ScrollView>

      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  scroll: {
    flex: 1,
  },

  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  item: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },

  subItem: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 4,
  },

  bold: {
    fontWeight: '600',
  },

  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },

  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});