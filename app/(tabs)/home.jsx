import { StyleSheet, View, Text, Pressable } from "react-native";
import React from "react";
import { navigate } from "expo-router/build/global-state/routing";

const home = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Food Log Dashboard</Text>
        <Text style={styles.subtitle}>
          Track food, symptoms & get health insights
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.cardContainer}>
        <Pressable
          style={[styles.card, styles.food]}
          onPress={() => navigate("../food_log")}
        >
          <Text style={styles.cardIcon}>🍽️</Text>
          <Text style={styles.cardText}>Add New Food Logs</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.allergy]}
          onPress={() => navigate("../evaluate")}
        >
          <Text style={styles.cardIcon}>🩺</Text>
          <Text style={styles.cardText}>Evaluate Symptoms</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.history]}
          onPress={() => navigate("../history")}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>View History</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.calendar]}
          onPress={() => navigate("../calendar")}
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardText}>Food Calendar</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.diet]}
          onPress={() => navigate("../dietandexercises")}
        >
          <Text style={styles.cardIcon}>💪</Text>
          <Text style={styles.cardText}>Diet & Exercises</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },

  /* 🔵 HEADER STYLES */
  header: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "#4f46e5",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 34,            // ⬅ BIGGER TITLE
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,            // ⬅ BIGGER SUBTITLE
    color: "#e0e7ff",
  },

  /* 🔵 CARDS */
  cardContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  /* 🔵 CARD COLORS */
  food: {
    backgroundColor: "#22c55e",
  },
  allergy: {
    backgroundColor: "#f40756",
  },
  history: {
    backgroundColor: "#0ea5e9",
  },
  calendar: {
    backgroundColor: "#f59e0b",
  },
  diet: {
    backgroundColor: "#ef4444",
  },
});

