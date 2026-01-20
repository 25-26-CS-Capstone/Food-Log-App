import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import moment from 'moment';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SymptomLog = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedFood, setSelectedFood] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [symptomLog, setSymptomLog] = useState([]);

  // Load selected food from route params
  useEffect(() => {
    if (params.selectedFood && params.selectedDate && params.selectedTime) {
      try {
        const food = JSON.parse(params.selectedFood);
        const date = new Date(params.selectedDate); // Parse the date string back to a Date object
        const time = new Date(params.selectedTime); // Parse the time string back to a Date object

        setSelectedFood(food);
        setSelectedDate(date);
        setSelectedTime(time);
      } catch (err) {
        console.log("Failed to parse selected data:", err);
      }
    }
  }, [params.selectedFood, params.selectedDate, params.selectedTime]);


  // Load saved symptom logs
  useEffect(() => {
    const loadSymptomLog = async () => {
      try {
        const stored = await AsyncStorage.getItem('symptomLog');
        if (stored) setSymptomLog(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading symptom log:', error);
      }
    };

    loadSymptomLog();
  }, []);

  const handleSymptomSubmit = async () => {
    if (!symptom || !selectedFood || !selectedDate || !selectedTime) {
      alert('Please select a food and enter a symptom.');
      return;
    }

    const newLog = {
      id: Date.now().toString(),
      food: selectedFood.foodName,
      symptom,
      time: moment(selectedTime).format('MMMM Do YYYY, h:mm a'), // format time for the symptom log
      date: moment(selectedDate).format('MMMM Do YYYY'), // format date for display
    };

    const updatedLog = [...symptomLog, newLog];
    setSymptomLog(updatedLog);

    try {
      await AsyncStorage.setItem('symptomLog', JSON.stringify(updatedLog));
    } catch (error) {
      console.error('Error saving symptom log:', error);
    }

    setSymptom(''); // Clear symptom input
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selected Food</Text>

      <Text style={styles.selectedFoodText}>
        {selectedFood
          ? `${selectedFood.foodName} — ${moment(selectedFood.date).format(
              'MMMM Do YYYY, h:mm a'
            )}`
          : 'No food selected'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter symptom"
        value={symptom}
        onChangeText={setSymptom}
      />

      <Button title="Submit Symptom" onPress={handleSymptomSubmit} />

      <Text style={styles.header}>Logged Symptoms</Text>
      <FlatList
        data={symptomLog}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.food}</Text>
            <Text>{item.symptom}</Text>
            <Text>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  selectedFoodText: { fontSize: 16, marginBottom: 10, color: 'gray' },
  input: { borderWidth: 1, padding: 10, marginVertical: 10 },
  logItem: { borderBottomWidth: 1, paddingVertical: 10 },
});

export default SymptomLog;
