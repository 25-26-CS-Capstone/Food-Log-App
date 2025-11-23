import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
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

  // Function to delete a specific log entry
  const deleteLog = async (logId) => {
    const updatedLog = symptomLog.filter((log) => log.id !== logId);
    try {
      // Update the state
      setSymptomLog(updatedLog);

      // Save the updated log to AsyncStorage
      await AsyncStorage.setItem('symptomLog', JSON.stringify(updatedLog));

      Alert.alert('Log Deleted', 'The selected log has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting log:', error);
      Alert.alert('Error', 'There was an error deleting the log.');
    }
  };

  // Function to confirm deletion
  const confirmDelete = (logId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this log?',
      [
        { text: 'Cancel' },
        { text: 'Delete', onPress: () => deleteLog(logId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Logged Symptoms</Text>
      <FlatList
        data={symptomLog}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={styles.logText}>{`Food: ${item.food}`}</Text>
            <Text style={styles.logText}>{`Symptom: ${item.symptom}`}</Text>
            <Text style={styles.logText}>{`Time: ${item.time}`}</Text>
            <Button title="Delete" color="red" onPress={() => confirmDelete(item.id)} />
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
    marginBottom: 10,  // Added margin to separate each log item more clearly
  },
  logText: {
    fontSize: 16,
    marginBottom: 5,  // Space between each text line
  },
});

export default LoggedSymptomsScreen;
