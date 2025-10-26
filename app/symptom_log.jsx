import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import moment from 'moment';
import { useLocalSearchParams, useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const SymptomLog = () => {
  const { foodLogData } = useLocalSearchParams();
  const router = useRouter();

  // Deserialize the food data safely
  const parsedFoodLog = useMemo(() => {
    try {
      return foodLogData ? JSON.parse(foodLogData) : [];
    } catch {
      return [];
    }
  }, [foodLogData]);

  const [symptom, setSymptom] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [symptomLog, setSymptomLog] = useState([]);

  // Load the symptom log from AsyncStorage on component mount
  useEffect(() => {
    const loadSymptomLog = async () => {
      try {
        const storedSymptomLog = await AsyncStorage.getItem('symptomLog');
        if (storedSymptomLog) {
          setSymptomLog(JSON.parse(storedSymptomLog));
        }
      } catch (error) {
        console.error('Error loading symptom log:', error);
      }
    };

    loadSymptomLog();
  }, []);

  const handleSymptomSubmit = async () => {
    if (!symptom || !selectedFood) {
      alert('Please select a food and enter a symptom.');
      return;
    }

    const newLog = {
      id: Date.now().toString(),
      food: selectedFood.foodName,
      symptom,
      time: moment().format('MMMM Do YYYY, h:mm a'),
    };

    const updatedLog = [...symptomLog, newLog];
    setSymptomLog(updatedLog);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('symptomLog', JSON.stringify(updatedLog));
    } catch (error) {
      console.error('Error saving symptom log:', error);
    }

    setSymptom('');
    setSelectedFood(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Foods You Logged</Text>
      <FlatList
        data={parsedFoodLog}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Button
            title={`${item.foodName} (${moment(item.date).format('MMMM Do YYYY, h:mm a')})`}
            onPress={() => setSelectedFood(item)}
            color={selectedFood?.id === item.id ? '#4caf50' : undefined}
          />
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter symptom (e.g., headache, nausea)"
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
            <Text>{`Food: ${item.food}`}</Text>
            <Text>{`Symptom: ${item.symptom}`}</Text>
            <Text>{`Time: ${item.time}`}</Text>
          </View>
        )}
      />

      <Button title="Back to Home" onPress={() => router.push('/home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingLeft: 10,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default SymptomLog;
