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
import { saveSymptomEntry } from '../utils/storage';

const SymptomsLog = () => {
  const router = useRouter();
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const severityLevels = ['Mild', 'Moderate', 'Severe'];
  const commonSymptoms = [
    'Nausea', 'Bloating', 'Stomach Pain', 'Heartburn', 
    'Diarrhea', 'Constipation', 'Headache', 'Fatigue',
    'Skin Rash', 'Itching', 'Gas', 'Other'
  ];

  const handleLogSymptom = async () => {
    if (!symptomType.trim()) {
      Alert.alert('Error', 'Please enter a symptom type');
      return;
    }

    if (!severity) {
      Alert.alert('Error', 'Please select a severity level');
      return;
    }

    setIsLogging(true);
    
    try {
      // Create symptom entry
      const symptomEntry = {
        id: Date.now().toString(),
        symptomType: symptomType.trim(),
        severity: severity,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        type: 'symptom'
      };

      // Save to AsyncStorage
      const success = await saveSymptomEntry(symptomEntry);
      
      if (success) {
        Alert.alert(
          'Success', 
          `${symptomType} (${severity}) has been logged!`,
          [
            { text: 'Log Another', onPress: clearForm },
            { text: 'View Logs', onPress: () => router.push('/viewLogs') }
          ]
        );
      } else {
        throw new Error('Failed to save to storage');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to log symptom');
      console.error('Error logging symptom:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const clearForm = () => {
    setSymptomType('');
    setSeverity('');
    setNotes('');
  };

  const selectSymptom = (symptom) => {
    setSymptomType(symptom);
  };

  const selectSeverity = (level) => {
    setSeverity(level);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Log Symptoms</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Symptom Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter symptom or select from below"
              value={symptomType}
              onChangeText={setSymptomType}
              autoCapitalize="words"
            />
            
            <Text style={styles.sectionLabel}>Quick Select:</Text>
            <View style={styles.buttonGrid}>
              {commonSymptoms.map((symptom, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickSelectButton,
                    symptomType === symptom && styles.quickSelectButtonActive
                  ]}
                  onPress={() => selectSymptom(symptom)}
                >
                  <Text style={[
                    styles.quickSelectText,
                    symptomType === symptom && styles.quickSelectTextActive
                  ]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Severity Level *</Text>
            <View style={styles.severityContainer}>
              {severityLevels.map((level, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.severityButton,
                    severity === level && styles.severityButtonActive,
                    level === 'Mild' && styles.severityMild,
                    level === 'Moderate' && styles.severityModerate,
                    level === 'Severe' && styles.severitySevere,
                  ]}
                  onPress={() => selectSeverity(level)}
                >
                  <Text style={[
                    styles.severityText,
                    severity === level && styles.severityTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Additional details about the symptom..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.logButton, isLogging && styles.logButtonDisabled]}
            onPress={handleLogSymptom}
            disabled={isLogging}
          >
            <Text style={styles.logButtonText}>
              {isLogging ? 'Logging...' : 'Log Symptom'}
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickSelectButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  quickSelectText: {
    fontSize: 14,
    color: '#333',
  },
  quickSelectTextActive: {
    color: '#fff',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityButtonActive: {
    borderWidth: 2,
  },
  severityMild: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  severityModerate: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  severitySevere: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  severityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  severityTextActive: {
    color: '#333',
  },
  logButton: {
    backgroundColor: '#FF6B6B',
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
    borderColor: '#FF6B6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SymptomsLog;