import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to the Food Log App!</Text>

          {/* Food-Themed Quote */}
          <Text style={styles.quote}>
            "Every bite tells a story — let's make yours a healthy one."
          </Text>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Why You'll Love It:</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📝</Text>
              <Text style={styles.featureText}>Log your meals and track nutrition</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔔</Text>
              <Text style={styles.featureText}>Get smart notifications to stay on track</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Analyze patterns and improve your health</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>Get personalized recommendations</Text>
            </View>
          </View>

          {/* Notification Info */}
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Notifications & Quick Access</Text>
            <Text style={styles.notificationText}>
              After login, you'll receive a welcome notification. Tap it anytime to quickly jump to your logs and continue tracking your food!
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>CREATE NEW ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fff8f0", 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    padding: 25,
    borderRadius: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 10,
  },
  quote: {
    fontSize: 17,
    color: "#636e72", 
    marginVertical: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  featuresContainer: {
    width: "100%",
    marginVertical: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00b894",
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 12,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#636e72",
    flex: 1,
    fontWeight: "500",
  },
  notificationInfo: {
    width: "100%",
    marginVertical: 15,
    backgroundColor: "#e8f8f5",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0984e3",
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 13,
    color: "#636e72",
    lineHeight: 20,
    fontStyle: "italic",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#00b894", 
  },
  registerButton: {
    backgroundColor: "#0984e3", 
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
});
