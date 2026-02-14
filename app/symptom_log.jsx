import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Alert, } from 'react-native';
import moment from 'moment';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { evaluateAllergyRisk } from "../utils/risk_engine";

/* ---------------- COMPONENT ---------------- */

const SymptomLog = () => {
  const params = useLocalSearchParams();

  const [foodLog, setFoodLog] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [symptomLog, setSymptomLog] = useState([]);

  /* ---------------- LOAD FOOD LOG ---------------- */

  useEffect(() => {
    if (params.foodLogData) {
      try {
        setFoodLog(JSON.parse(params.foodLogData));
      } catch (err) {
        console.error('Failed to parse food log:', err);
      }
    }
  }, [params.foodLogData]);

  /* ---------------- LOAD SYMPTOMS ---------------- */

  useEffect(() => {
    const loadSymptoms = async () => {
      const stored = await AsyncStorage.getItem('symptomLog');
      if (stored) setSymptomLog(JSON.parse(stored));
    };
    loadSymptoms();
  }, []);

  /* ---------------- SUBMIT SYMPTOM ---------------- */

  const handleSubmit = async () => {
    if (!selectedFood || !symptom.trim()) {
      Alert.alert('Error', 'Please select a food and enter a symptom.');
      return;
    }

    // Temporary user profile (later replace with real profile screen)
    const userProfile = {
      familyHistory: 'No',
      previousReaction: 'None',
      severityScore: 3,
    };

    const risk = evaluateAllergyRisk({
      symptoms: [symptom],
      allergens: selectedFood.product?.allergens || [],
      previousReaction: userProfile.previousReaction,
      familyHistory: userProfile.familyHistory,
      severityScore: userProfile.severityScore,
    });

    const newEntry = {
      id: Date.now().toString(),
      foodName: selectedFood.foodName,
      mealType: selectedFood.mealType,
      symptom,
      riskLevel: risk.level,
      riskScore: risk.score,
      foodDate: selectedFood.date,
      symptomDate: new Date().toISOString(),
    };

    const updated = [...symptomLog, newEntry];
    setSymptomLog(updated);
    await AsyncStorage.setItem('symptomLog', JSON.stringify(updated));

    Alert.alert(
      'Symptom log has been saved.',
    );

    setSymptom('');
    setSelectedFood(null);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Food</Text>

      <FlatList
        data={foodLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.foodItem,
              selectedFood?.id === item.id && styles.selected,
            ]}
            onPress={() => setSelectedFood(item)}
          >
            <Text style={styles.foodName}>{item.foodName}</Text>
            <Text style={styles.foodSub}>
              {moment(item.date).format('MMM D, h:mm a')} · {item.mealType}
            </Text>
          </TouchableOpacity>
        )}
      />

        {selectedFood && (
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="Describe symptoms (e.g. hives, nausea)"
              value={symptom}
              onChangeText={setSymptom}
              multiline
            />

            <View style={styles.buttonWrapper}>
              <Button title="Submit Symptom" onPress={handleSubmit} />
            </View>
          </View>
        )}


    </View>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { fontSize: 18, fontWeight: '700', marginVertical: 10 },
  foodItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selected: { backgroundColor: '#e0f4ff' },
  foodName: { fontWeight: '600' },
  foodSub: { fontSize: 12, color: 'gray' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
  },
  logItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logFood: { fontWeight: '600' },
  logSub: { fontSize: 12, color: 'gray' },

  inputSection: {
  marginTop: 15,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#ddd',
},

input: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 12,
  borderRadius: 6,
  backgroundColor: 'white',
  minHeight: 60,
  textAlignVertical: 'top',
},

buttonWrapper: {
  marginTop: 10,
},

});

export default SymptomLog;
