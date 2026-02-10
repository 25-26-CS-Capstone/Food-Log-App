import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DietAndExercises() {
  // 🔹 Mock data (pretend this came from logs)
  const foodLogsCount = 6;
  const symptomCount = 3;
  const waterIntake = 4; // glasses per day
  const activityLevel = "Low"; // Low | Medium | High

  // 🔹 Risk evaluation
  const riskLevel =
    symptomCount >= 3 ? "High" : symptomCount === 2 ? "Medium" : "Low";

  // 🔹 Diet logic
  const dietRecommendation =
    riskLevel === "High"
      ? "Soft, non-spicy foods. Increase water intake. Avoid fried and processed food."
      : riskLevel === "Medium"
      ? "Balanced meals with vegetables, fruits, and lean protein."
      : "Normal diet with portion control and regular meal timings.";

  // 🔹 Exercise logic
  const exerciseRecommendation =
    riskLevel === "High"
      ? "Yoga, breathing exercises, light stretching (15–20 minutes)."
      : activityLevel === "Low"
      ? "Brisk walking or light cardio for 30 minutes."
      : "Strength training or cardio for 45 minutes.";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diet & Exercise Analysis</Text>

      {/* 🔹 Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Food Logs: {foodLogsCount}</Text>
        <Text style={styles.summaryText}>Symptoms Reported: {symptomCount}</Text>
        <Text style={styles.summaryText}>Water Intake: {waterIntake} glasses/day</Text>
        <Text style={styles.summaryText}>Activity Level: {activityLevel}</Text>
        <Text style={styles.risk}>
          Health Risk Level: <Text style={styles.riskValue}>{riskLevel}</Text>
        </Text>
      </View>

      {/* 🔹 Diet */}
      <View style={styles.card}>
        <Text style={styles.heading}>🥗 Diet Recommendation</Text>
        <Text>{dietRecommendation}</Text>
      </View>

      {/* 🔹 Exercise */}
      <View style={styles.card}>
        <Text style={styles.heading}>🏃 Exercise Recommendation</Text>
        <Text>{exerciseRecommendation}</Text>
      </View>

      {/* 🔹 Explanation */}
      <View style={styles.explainCard}>
        <Text style={styles.explainTitle}>Why this plan?</Text>
        <Text style={styles.explainText}>
          Recommendations are generated based on the number of food logs,
          reported symptoms, hydration level, and activity level. Higher
          symptoms trigger lighter diets and low-impact exercises.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  summaryCard: {
    padding: 15,
    backgroundColor: "#e8f0fe",
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  risk: {
    marginTop: 8,
    fontWeight: "bold",
  },
  riskValue: {
    color: "red",
  },
  card: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 15,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  explainCard: {
    padding: 15,
    backgroundColor: "#fff7e6",
    borderRadius: 8,
    marginTop: 10,
  },
  explainTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  explainText: {
    fontSize: 13,
  },
});
