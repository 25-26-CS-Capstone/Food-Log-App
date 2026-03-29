import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Alert, } from 'react-native';
import moment from 'moment';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '../lib/supabase';

/* ---------------- COMPONENT ---------------- */

const SymptomLog = () => {
  const params = useLocalSearchParams();

  const [foodLog, setFoodLog] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [symptomLog, setSymptomLog] = useState([]);
  const [severity, setSeverity] = useState(1);

  /* ---------------- LOAD FOOD LOG ---------------- */

  useEffect(() => {
  const loadFoodLog = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date_time', { ascending: false });

      if (error) throw error;
      setFoodLog(data ?? []);
    } catch (err) {
      console.error('Failed to load food log:', err);
    }
  };
  loadFoodLog();
}, []);

  /* ---------------- LOAD SYMPTOMS ---------------- */

  useEffect(() => {
  const loadSymptoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('symptom_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date_time', { ascending: false });

      if (error) throw error;
      setSymptomLog(data ?? []);
    } catch (err) {
      console.error('Failed to load symptoms:', err);
    }
  };
  loadSymptoms();
}, []);

  /* ---------------- SUBMIT SYMPTOM ---------------- */

  const handleSubmit = async () => {
  if (!selectedFood || !symptom.trim()) {
    Alert.alert('Error', 'Please select a food and enter a symptom.');
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('symptom_log')
      .insert({
        user_id: user.id,
        symptom: symptom.trim(),
        severity,
        date_time: new Date().toISOString(),
        food_log_ids: [selectedFood.id],  
        notes: null,
      });

    if (error) throw error;

    Alert.alert('Saved', 'Symptom log has been saved.');
    setSymptom('');
    setSeverity(1);
    setSelectedFood(null);
  } catch (err) {
    console.error('Failed to save symptom:', err);
    Alert.alert('Error', 'Failed to save symptom.');
  }
    // Refresh symptom list
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
    .from('symptom_log')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('date_time', { ascending: false });
    setSymptomLog(data ?? []);
};

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          title: 'Symptom Log',
          headerStyle: { backgroundColor: '#22c55e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

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
            <Text style={styles.foodName}>{item.food_name}</Text>
            <Text style={styles.foodSub}>
              {moment(item.date_time).format('MMM D, h:mm a')} · {item.meal_type}
            </Text>
          </TouchableOpacity>
        )}
      />

        {selectedFood && (
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="Describe symptoms (e.g. hives, nausea)"
              placeholderTextColor={"#999"}
              value={symptom}
              onChangeText={setSymptom}
              multiline
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>
              Severity: {severity}/10
            </Text>
            <View style={styles.servingsRow}>
              <TouchableOpacity
                style={styles.severityButton}
                onPress={() => setSeverity(prev => Math.max(1, prev - 1))}
              >
            <Text style={styles.severityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.severityText}>{severity}</Text>
            <TouchableOpacity
              style={styles.severityButton}
              onPress={() => setSeverity(prev => Math.min(10, prev + 1))}
            >
            <Text style={styles.severityButtonText}>+</Text>
          </TouchableOpacity>
          
         </View>  

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
  container: { flex: 1, padding: 20, backgroundColor: '#eef2ff' },
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
servingsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
severityButton: {
  backgroundColor: '#224ec5',
  paddingHorizontal: 15,
  paddingVertical: 5,
  borderRadius: 8,
},
severityButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
severityText: { marginHorizontal: 15, fontSize: 16, fontWeight: '600' },
symptomItem: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  backgroundColor: 'white',
  borderRadius: 8,
  marginBottom: 8,
},
symptomRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
symptomText: { fontWeight: '600', fontSize: 15, flex: 1 },
symptomSub: { fontSize: 12, color: 'gray', marginTop: 4 },
severityBadge: {
  backgroundColor: '#224ec5',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 3,
},
severityBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
buttonWrapper: {
  marginTop: 10,
},

});

export default SymptomLog;
