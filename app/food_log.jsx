// app/food_log.jsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text, TouchableOpacity, Alert, Pressable, } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { offSearch } from '../lib/openfoodfacts';
import {
  detectAllergensFromIngredients,
  mergeAllergens,
} from '../lib/allergens';

import { useLocalSearchParams } from 'expo-router';

/* ---------------- CONSTANTS ---------------- */

const MEAL_COLORS = {
  breakfast: '#f9c74f',
  lunch: '#90dbf4',
  dinner: '#f94144',
  snack: '#bdb2ff',
};

/* ---------------- COMPONENT ---------------- */

const FoodLog = () => {
  const router = useRouter();

  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState('breakfast');

  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [log, setLog] = useState([]);

  const params = useLocalSearchParams();

  /* ---------------- LOAD SAVED LOGS ---------------- */

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const saved = await AsyncStorage.getItem('foodLog');
        if (saved) setLog(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading food logs:', err);
      }
    };
    loadLogs();
  }, []);

  useEffect(() => {
  if (params?.scannedName) {
    setFoodName(String(params.scannedName));
  }
}, [params?.scannedName]);

  /* ---------------- SEARCH FOOD ---------------- */

  const handleSearch = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name.');
      return;
    }

    try {
      const products = await offSearch(foodName.trim());
      setSearchResults(products);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not search foods.');
    }
  };

  /* ---------------- SELECT PRODUCT ---------------- */

  const handleSelectProduct = (product) => {
    const name =
      product.product_name_en ||
      product.product_name ||
      foodName.trim();

    const ingredients =
      product.ingredients_text_en ||
      product.ingredients_text ||
      '';

    const nutriments = product.nutriments || {};
    const calories = nutriments['energy-kcal'] ?? null;

    const offTags = product.allergens_tags || [];
    const detected = detectAllergensFromIngredients(ingredients);
    const mergedAllergens = mergeAllergens(offTags, detected);

    setSelectedProduct({
      code: product.code,
      name,
      ingredients,
      calories,
      allergens: mergedAllergens,
      brand: product.brands || '',
    });

    setFoodName(name);
    setSearchResults([]);
  };

  /* ---------------- SUBMIT LOG ---------------- */

  const handleSubmit = async () => {
    if (!foodName || !selectedDateTime) {
      Alert.alert('Error', 'Please choose a food and date/time.');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      foodName: selectedProduct?.name || foodName,
      date: selectedDateTime,
      mealType,
      color: MEAL_COLORS[mealType],
      product: selectedProduct || null,
    };

    const updated = [...log, newEntry];
    setLog(updated);

    try {
      await AsyncStorage.setItem('foodLog', JSON.stringify(updated));
      Alert.alert('Saved', 'Food log saved successfully.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save food log.');
    }

    setFoodName('');
    setSelectedProduct(null);
    setSelectedDateTime(null);
  };

  /* ---------------- DELETE LOG ---------------- */

  const deleteLog = async (id) => {
    const updated = log.filter((item) => item.id !== id);
    setLog(updated);
    await AsyncStorage.setItem('foodLog', JSON.stringify(updated));
  };

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Search for food..."
        value={foodName}
        onChangeText={setFoodName}
      />

      <Button title="Search Food" onPress={handleSearch} />
      <Button title="Scan Barcode" onPress={() => router.push('/barcode_scanner')} />


      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.code?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.searchResult}
            onPress={() => handleSelectProduct(item)}
          >
            <Text style={styles.searchName}>
              {item.product_name_en || item.product_name || 'Unnamed'}
            </Text>
            {item.brands && (
              <Text style={styles.searchSub}>{item.brands}</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {selectedProduct && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>{selectedProduct.name}</Text>
          {selectedProduct.brand && (
            <Text style={styles.selectedSub}>
              Brand: {selectedProduct.brand}
            </Text>
          )}
          {selectedProduct.calories != null && (
            <Text>Calories: {selectedProduct.calories}</Text>
          )}
          <Text>Ingredients: {selectedProduct.ingredients || 'N/A'}</Text>
          <Text>
            Allergens:{' '}
            {selectedProduct.allergens.length > 0
              ? selectedProduct.allergens.join(', ')
              : 'None detected'}
          </Text>
        </View>
      )}

      {selectedProduct && (
        <>
          <Text style={styles.label}>Meal Type</Text>
          <Picker
            selectedValue={mealType}
            onValueChange={setMealType}
          >
            <Picker.Item label="Breakfast" value="breakfast" />
            <Picker.Item label="Lunch" value="lunch" />
            <Picker.Item label="Dinner" value="dinner" />
            <Picker.Item label="Snack" value="snack" />
          </Picker>

          <Button
            title={
              selectedDateTime
                ? moment(selectedDateTime).format('MMMM Do YYYY, h:mm a')
                : 'Pick Date & Time'
            }
            onPress={() => setDatePickerVisible(true)}
          />
        </>
      )}

      {selectedProduct && selectedDateTime && (
        <Button title="Submit Log" onPress={handleSubmit} />
      )}

      <Text style={[styles.label, { marginTop: 20 }]}>Recent Logs:</Text>

      <FlatList
        data={log}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.foodName}</Text>
            <Text>{moment(item.date).format('MMMM Do YYYY, h:mm a')}</Text>
            <Button title="Delete" onPress={() => deleteLog(item.id)} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginVertical: 20, color: '#999' }}>No logs yet</Text>
        }
      />

      <Pressable
          style={[styles.button, { borderRadius:15, backgroundColor: 'midnightblue', padding: 10, marginTop: 30, marginBottom:10, width: 200, alignItems: 'center' }]}
          onPress={() =>
            router.push({
              pathname: '/symptom_log',
              params: { foodLogData: JSON.stringify(log) },
            })
          }
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go to Symptom Log</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={selectedDateTime || new Date()}
        onConfirm={(date) => {
          setSelectedDateTime(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  searchResult: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchName: { fontWeight: '600' },
  searchSub: { fontSize: 12, color: 'gray' },
  selectedCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedTitle: { fontSize: 16, fontWeight: '700' },
  selectedSub: { fontSize: 13, color: 'gray' },
  label: { marginTop: 10, fontWeight: '600' },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    alignSelf: 'center',
  },
});

export default FoodLog;
