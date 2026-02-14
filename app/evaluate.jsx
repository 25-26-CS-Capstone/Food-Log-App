import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Button, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Alert, } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluateAllergyRisk } from '../utils/risk_engine';

/* ---------------- OPTIONS ---------------- */

const genderOptions = ['Male', 'Female', 'Other'];
const foodTypeOptions = ['Dairy', 'Nuts', 'Seafood', 'Gluten', 'Eggs'];
const yesNoOptions = ['Yes', 'No'];
const reactionOptions = ['None', 'Mild', 'Moderate', 'Severe'];
const medicalOptions = ['Asthma', 'Eczema'];

/* ---------------- MODAL ---------------- */

const SelectionModal = ({ visible, title, options, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>{title}</Text>

        <ScrollView keyboardShouldPersistTaps="handled">
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={styles.modalItem}
              onPress={() => {
                Keyboard.dismiss();
                onSelect(option);
                onClose();
              }}
            >
              <Text style={styles.modalText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button title="Done" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

/* ---------------- SCREEN ---------------- */

export default function SymptomEvaluate() {
  const [activeModal, setActiveModal] = useState(null);

  const [loggedEntries, setLoggedEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [previousReaction, setPreviousReaction] = useState('');
  const [foodType, setFoodType] = useState('');
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [severityScore, setSeverityScore] = useState('');
  const [result, setResult] = useState(null);

  /* ---------------- LOAD LOGGED CASES ---------------- */

  useEffect(() => {
    const loadLoggedSymptoms = async () => {
      try {
        const stored = await AsyncStorage.getItem('symptomLog');
        if (!stored) return;

        const parsed = JSON.parse(stored);
        setLoggedEntries(parsed);
      } catch (err) {
        console.error('Failed to load logged symptoms:', err);
      }
    };

    loadLoggedSymptoms();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const toggleItem = (item, setter) => {
    setter(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  /* ---------------- EVALUATE ---------------- */

  const handleEvaluate = async () => {
    if (!selectedEntry) {
      Alert.alert(
        'Select Case',
        'Please select a previously logged case to evaluate.'
      );
      return;
    }

    if (!foodType) {
      Alert.alert(
        'Missing Information',
        'Please select a food type.'
      );
      return;
    }

    const symptomsArray = selectedEntry.symptom
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const evaluation = evaluateAllergyRisk({
      symptoms: symptomsArray,
      gender,
      familyHistory,
      previousReaction,
      foodType,
      medicalConditions,
      severityScore: Number(severityScore) || 0,
    });

    setResult(evaluation);

    // Save evaluation to history
    try {
      const existing = await AsyncStorage.getItem('evaluationHistory');
      const parsed = existing ? JSON.parse(existing) : [];

      const newHistoryEntry = {
        id: Date.now().toString(),
        symptom: selectedEntry.symptom,
        foodName: selectedEntry.foodName,
        mealType: selectedEntry.mealType,
        risk: evaluation.risk,
        confidence: evaluation.confidence,
        evaluatedAt: new Date().toISOString(),
      };

      const updatedHistory = [...parsed, newHistoryEntry];

      await AsyncStorage.setItem(
        'evaluationHistory',
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      console.error('Failed to save evaluation history:', err);
    }

    Alert.alert(
      'Allergy Assessment',
      `Risk: ${evaluation.risk}
Confidence: ${evaluation.confidence}

${evaluation.reasons.join('\n')}`
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Evaluate Logged Reaction</Text>

        {/* LOGGED CASE DROPDOWN */}
        <Text style={styles.sectionTitle}>Previously Logged Case</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setActiveModal('loggedCases')}
        >
          <Text>
            {selectedEntry
              ? `${selectedEntry.symptom || 'Unknown'} – ${selectedEntry.foodName || 'Unknown'}`
              : 'Select Previously Logged Case'}
          </Text>
        </TouchableOpacity>


        {selectedEntry && (
          <View style={styles.selectedInfo}>
            <Text style={{ fontWeight: '600' }}>
              Selected Symptom:
            </Text>
            <Text>{selectedEntry.symptom}</Text>
            <Text style={{ color: 'gray', fontSize: 12 }}>
              {selectedEntry.foodName} · {selectedEntry.mealType}
            </Text>
          </View>
        )}


        <Text style={styles.sectionTitle}>General Information</Text>

        {/* AGE */}
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        {/* SELECTORS */}
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setActiveModal('gender')}
        >
          <Text>{gender || 'Select Gender'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setActiveModal('familyHistory')}
        >
          <Text>{familyHistory || 'Family History of Allergies?'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setActiveModal('previousReaction')}
        >
          <Text>{previousReaction || 'Previous Reaction'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setActiveModal('foodType')}
        >
          <Text>{foodType || 'Select Food Type'}</Text>
        </TouchableOpacity>

        {/* MEDICAL CONDITIONS */}
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        {medicalOptions.map(cond => (
          <TouchableOpacity
            key={cond}
            style={[
              styles.chip,
              medicalConditions.includes(cond) && styles.chipSelected,
            ]}
            onPress={() => toggleItem(cond, setMedicalConditions)}
          >
            <Text>{cond}</Text>
          </TouchableOpacity>
        ))}

        {/* SEVERITY */}
        <TextInput
          style={styles.input}
          placeholder="Severity Score (0–10)"
          keyboardType="numeric"
          value={severityScore}
          onChangeText={setSeverityScore}
        />

        <Button title="Evaluate Allergy Risk" onPress={handleEvaluate} />

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Result: {result.risk}</Text>
            <Text>Confidence: {result.confidence}</Text>
          </View>
        )}

        {/* MODALS */}
        <Modal
          visible={activeModal === 'loggedCases'}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Select Logged Case</Text>

              <ScrollView>
                {loggedEntries.map(entry => (
                  <TouchableOpacity
                    key={entry.id}   // ✅ UNIQUE KEY
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedEntry(entry);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalText}>
                      {entry.symptom || 'Unknown Symptom'}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'gray' }}>
                      {entry.foodName || 'Unknown Food'} · {entry.mealType || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button title="Close" onPress={() => setActiveModal(null)} />
            </View>
          </View>
        </Modal>


        <SelectionModal
          visible={activeModal === 'gender'}
          title="Select Gender"
          options={genderOptions}
          onSelect={setGender}
          onClose={() => setActiveModal(null)}
        />

        <SelectionModal
          visible={activeModal === 'familyHistory'}
          title="Family History"
          options={yesNoOptions}
          onSelect={setFamilyHistory}
          onClose={() => setActiveModal(null)}
        />

        <SelectionModal
          visible={activeModal === 'previousReaction'}
          title="Previous Reaction"
          options={reactionOptions}
          onSelect={setPreviousReaction}
          onClose={() => setActiveModal(null)}
        />

        <SelectionModal
          visible={activeModal === 'foodType'}
          title="Food Type"
          options={foodTypeOptions}
          onSelect={setFoodType}
          onClose={() => setActiveModal(null)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    marginVertical: 10,
  },
  loggedCase: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    backgroundColor: '#f4f8ff',
  },
  selectedCase: {
    backgroundColor: '#d6f0ff',
    borderColor: '#4da6ff',
  },
  selectedInfo: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  chip: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#d6f0ff',
    borderColor: '#4da6ff',
  },
  resultBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#eef9f0',
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
