import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { supabase } from '../lib/supabase';

export default function DietAndExercises() {

  const [foodLogs, setFoodLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [evaluationHistory, setEvaluationHistory] = useState([]);

  useEffect(() => {
  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: foodData } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      const { data: symptomData } = await supabase
        .from('symptom_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      const { data: evalData } = await supabase
        .from('evaluation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('evaluated_at', { ascending: false });

      setFoodLogs(foodData ?? []);
      setSymptomLogs(symptomData ?? []);
      setEvaluationHistory(evalData ?? []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };
  loadData();
}, []);

  // ---- REAL DATA CALCULATIONS ----
  const foodLogsCount = foodLogs.length;
  const symptomCount = symptomLogs.length;

  const highRiskCount = evaluationHistory.filter(e => e.risk === 'High').length;
  const moderateRiskCount = evaluationHistory.filter(e => e.risk === 'Medium').length;

  let riskLevel = "Low";

  if (highRiskCount >= 1) riskLevel = "High";
  else if (moderateRiskCount >= 2) riskLevel = "Medium";

  // ---- DIET LOGIC ----
  let dietRecommendation = "";

  if (riskLevel === "High") {
    dietRecommendation =
      "• Soft, non-spicy foods\n" +
      "• Avoid dairy, fried and processed food\n" +
      "• Increase water intake (8–10 glasses/day)\n" +
      "• Include boiled vegetables and soups";
  } else if (riskLevel === "Medium") {
    dietRecommendation =
      "• Balanced meals with vegetables and fruits\n" +
      "• Lean protein (chicken, fish, legumes)\n" +
      "• Reduce sugar and spicy food\n" +
      "• Drink at least 6–8 glasses of water";
  } else {
    dietRecommendation =
      "• Maintain portion control\n" +
      "• Regular meal timings\n" +
      "• Include whole grains and protein\n" +
      "• Stay hydrated";
  }

  // ---- EXERCISE LOGIC ----
  let exerciseRecommendation = "";

  if (riskLevel === "High") {
    exerciseRecommendation =
      "• Light yoga (15–20 minutes)\n" +
      "• Breathing exercises\n" +
      "• Gentle stretching\n" +
      "• Avoid intense workouts";
  } else if (riskLevel === "Medium") {
    exerciseRecommendation =
      "• Brisk walking (30 minutes)\n" +
      "• Light cardio\n" +
      "• Basic strength exercises";
  } else {
    exerciseRecommendation =
      "• Cardio (30–45 minutes)\n" +
      "• Strength training\n" +
      "• Regular stretching\n" +
      "• Maintain active lifestyle";
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Diet & Exercises",
          headerStyle: { backgroundColor: "#ef4444" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <Text style={styles.title}>Diet & Exercise Analysis</Text>

      {/* SUMMARY */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Food Logs: {foodLogsCount}</Text>
        <Text style={styles.summaryText}>Symptoms Reported: {symptomCount}</Text>
        <Text style={styles.summaryText}>
          High Risk Symptoms: {highRiskCount}
        </Text>

        <Text style={styles.risk}>
          Health Risk Level:{" "}
          <Text
            style={[
              styles.riskValue,
              riskLevel === "High"
                ? { color: "red" }
                : riskLevel === "Medium"
                ? { color: "orange" }
                : { color: "green" },
            ]}
          >
            {riskLevel}
          </Text>
        </Text>
      </View>

      {/* DIET */}
      <View style={styles.card}>
        <Text style={styles.heading}>🥗 Diet Recommendation</Text>
        <Text style={styles.bodyText}>{dietRecommendation}</Text>
      </View>

      {/* EXERCISE */}
      <View style={styles.card}>
        <Text style={styles.heading}>🏃 Exercise Recommendation</Text>
        <Text style={styles.bodyText}>{exerciseRecommendation}</Text>
      </View>

      {/* EXPLANATION */}
      <View style={styles.explainCard}>
        <Text style={styles.explainTitle}>Why this plan?</Text>
        <Text style={styles.explainText}>
          Recommendations are dynamically generated based on your logged
          symptoms and risk levels. Higher risk symptoms result in lighter
          diet plans and low-impact exercises.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  summaryCard: {
    padding: 15,
    backgroundColor: "#ffffff",
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
    fontWeight: "bold",
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
  bodyText: {
    lineHeight: 20,
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
