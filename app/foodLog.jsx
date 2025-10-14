import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveFoodEntry } from '../utils/storage';

const FoodLog = () => {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleLogFood = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    setIsLogging(true);
    
    try {
      // Create food entry
      const foodEntry = {
        id: Date.now().toString(),
        foodName: foodName.trim(),
        calories: calories ? parseInt(calories) : null,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        type: 'food'
      };

      // Save to AsyncStorage
      const success = await saveFoodEntry(foodEntry);
      
      if (success) {
        Alert.alert(
          'Success', 
          `${foodName} has been logged!`,
          [
            { text: 'Log Another', onPress: clearForm },
            { text: 'View Logs', onPress: () => router.push('/viewLogs') }
          ]
        );
      } else {
        throw new Error('Failed to save to storage');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to log food item');
      console.error('Error logging food:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const clearForm = () => {
    setFoodName('');
    setCalories('');
    setNotes('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Log Food Item</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Apple, Chicken Sandwich"
              value={foodName}
              onChangeText={setFoodName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="How did you feel? Any reactions?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.logButton, isLogging && styles.logButtonDisabled]}
            onPress={handleLogFood}
            disabled={isLogging}
          >
            <Text style={styles.logButtonText}>
              {isLogging ? 'Logging...' : 'Log Food'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearForm}
          >
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  notesInput: {
    height: 80,
  },
  logButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logButtonDisabled: {
    backgroundColor: '#ccc',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodLog;