import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to the Food Log App!</Text>

        {/* 🍎 Food-Themed Quote */}
        <Text style={styles.quote}>
          “Every bite tells a story — let’s make yours a healthy one.” 🍇
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>NEW ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff8f0", 
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    padding: 25,
    borderRadius: 20,
    width: "85%",
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
  },
  quote: {
    fontSize: 17,
    color: "#636e72", 
    marginVertical: 18,
    textAlign: "center",
    fontStyle: "italic",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginVertical: 8,
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
