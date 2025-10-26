import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoggedSymptomsScreen = () => {
  const [symptomLog, setSymptomLog] = useState([]);

  // Load symptom log from AsyncStorage
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

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default LoggedSymptomsScreen;
