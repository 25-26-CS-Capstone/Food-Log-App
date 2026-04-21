import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import moment from 'moment';
import { Stack } from 'expo-router';
import { supabase } from '../lib/supabase';

const SymptomLog = () => {
  const [foodLog, setFoodLog] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date_time', { ascending: false })
        .limit(10); // Only need recent meals for logging symptoms

      if (error) throw error;
      setFoodLog(data ?? []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFood || !symptom.trim()) {
      Alert.alert('Missing Info', 'Please select a meal and describe your symptom.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('symptom_log').insert({
        user_id: user.id,
        symptom: symptom.trim(),
        severity,
        date_time: new Date().toISOString(),
        food_log_ids: [selectedFood.id],
      });

      if (error) throw error;

      Alert.alert('Success', 'Symptom recorded.');
      setSymptom('');
      setSeverity(1);
      setSelectedFood(null);
    } catch (err) {
      Alert.alert('Error', 'Could not save log.');
    } finally {
      setLoading(false);
    }
  };

  const SeverityPicker = () => (
    <View style={styles.severityContainer}>
      <Text style={styles.label}>How severe is the symptom? ({severity}/10)</Text>
      <View style={styles.severityRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.severityCircle,
              severity === num && styles.severityCircleSelected,
              { backgroundColor: severity === num ? getSeverityColor(num) : '#fff' }
            ]}
            onPress={() => setSeverity(num)}
          >
            <Text style={[styles.severityNum, severity === num && { color: '#fff' }]}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getSeverityColor = (val) => {
    if (val <= 3) return '#22c55e'; // Green
    if (val <= 7) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: 'Log Symptoms',
          headerStyle: { backgroundColor: '#22c55e' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>1. Which meal triggered this?</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={foodLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.foodCard,
                selectedFood?.id === item.id && styles.foodCardSelected,
              ]}
              onPress={() => setSelectedFood(item)}
            >
              <Text style={styles.foodName} numberOfLines={1}>{item.food_name}</Text>
              <Text style={styles.foodTime}>{moment(item.date_time).format('ddd, h:mm a')}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No recent meals found.</Text>}
        />

        {selectedFood ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>2. Describe what happened</Text>
            <TextInput
              style={styles.textArea}
              placeholder="E.g. Bloating, itchy throat, headache..."
              placeholderTextColor="#999"
              value={symptom}
              onChangeText={setSymptom}
              multiline
            />

            <SeverityPicker />

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : 'Save Symptom Log'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>Select a meal above to start logging.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },

  // Food Cards
  foodCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    width: 140,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodCardSelected: {
    borderColor: '#224ec5',
    backgroundColor: '#eff6ff',
  },
  mealEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  foodName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#334155',
  },
  foodTime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },

  // Form
  formSection: {
    marginTop: 30,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 10,
  },

  // Severity
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityCircleSelected: {
    borderColor: 'transparent',
  },
  severityNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },

  // Button
  submitButton: {
    backgroundColor: '#224ec5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  instructionBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  instructionText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#94a3b8',
    padding: 20,
  },
});

export default SymptomLog;