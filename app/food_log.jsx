// food_log.jsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { offSearch } from  '../lib/openfoodfacts';
import { detectAllergensFromIngredients, mergeAllergens, } from '../lib/allergens';

const FoodLog = () => {
  const [foodName, setFoodName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [mealType, setMealType] = useState("Breakfast"); // default meal type
  const [log, setLog] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const router = useRouter();

    useEffect(() => {
    const loadLogs = async () => {
      try {
        const saved = await AsyncStorage.getItem("foodLog");
        if (saved) setLog(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading food logs:", err);
      }
    };
    loadLogs();
  }, []);

  const handleSearch = async () => {
    if (!foodName.trim()) {
      alert('Please enter a food name to search.');
      return;
    }

    try {
      const products = await offSearch(foodName.trim());
      setSearchResults(products);
    } catch (err) {
      console.error('Error searching OpenFoodFacts:', err);
      alert('Could not search foods.');
    }

    // Combine date and time into one Date object
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0
    );

    const newLog = {
      id: Date.now().toString(),
      foodName,
      mealType,
      date: combinedDateTime,
      mealType,
      color: MEAL_COLORS[mealType] || "#bbb",
    };

    const updatedLog = [...log, newLog];
    setLog(updatedLog);

    try {
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
      Alert.alert("Log Saved", "Your food log has been saved!");
    } catch (error) {
      console.error("Error saving food log:", error);
      Alert.alert("Error", "There was an error saving your log.");
    }

    // Reset inputs
    setFoodName("");
    setSelectedDate(null);
    setSelectedTime(null);
    setMealType("Breakfast");
  };

  // Delete log
  const deleteLog = async (id) => {
    try {
      const updatedLog = log.filter((item) => item.id !== id);
      setLog(updatedLog);
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
    } catch (error) {
      console.error("Error deleting food log:", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Log", "Are you sure you want to delete this food log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteLog(id), style: "destructive" },
    ]);
  };

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

  const handleSubmit = async () => {
    if (!foodName || !selectedDateTime) {
      alert('Please choose a food and a time.');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      foodName: selectedProduct?.name || foodName,
      date: selectedDateTime,
      product: selectedProduct,
      ingredients: selectedProduct?.ingredients || null,
      allergens: selectedProduct?.allergens || [],
      calories: selectedProduct?.calories ?? null,
      brand: selectedProduct?.brand || null,
    };

    const updated = [...log, newEntry];
    setLog(updated);

    await AsyncStorage.setItem("foodLog", JSON.stringify(updated));

    setFoodName('');
    setSelectedDateTime(null);
    setSelectedProduct(null);
  };

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Search for food..."
        value={foodName}
        onChangeText={setFoodName}
      />

      <Button title="Search Food" onPress={handleSearch} />

      <FlatList
        data={searchResults}
        keyExtractor={(item) =>
          item.code?.toString() || Math.random().toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.searchResult}
            onPress={() => handleSelectProduct(item)}
          >
            <Text style={styles.searchName}>
              {item.product_name_en || item.product_name || 'Unnamed product'}
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
          {selectedProduct.brand ? (
            <Text style={styles.selectedSub}>Brand: {selectedProduct.brand}</Text>
          ) : null}
          {selectedProduct.calories != null && (
            <Text>Calories: {selectedProduct.calories}</Text>
          )}
          <Text>Ingredients: {selectedProduct.ingredients || 'Not provided'}</Text>
          <Text>
            Allergens:{' '}
            {selectedProduct.allergens.length > 0
              ? selectedProduct.allergens.join(', ')
              : 'None detected'}
          </Text>
        </View>
      )}

      <Button
        title="Use Current Date & Time"
        onPress={() => setSelectedDateTime(new Date())}
        color="#4caf50"
      />

      <Button
        title="Pick Date & Time"
        onPress={() => setDatePickerVisible(true)}
        color="#2196f3"
      />

      <Text style={styles.label}>Select Meal Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={mealType}
          onValueChange={(itemValue) => setMealType(itemValue)}
          style={{ height: 50, marginBottom: 10 }}
          itemStyle={{ height: 60 }}
        >
          <Picker.Item label="Breakfast" value="breakfast" />
          <Picker.Item label="Lunch" value="lunch" />
          <Picker.Item label="Dinner" value="dinner" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>
      </View>

      <Button title="Pick Date" onPress={showDatePicker} />
      {selectedDate && (
        <Text style={styles.dateTimeText}>{moment(selectedDate).format("MMMM Do YYYY")}</Text>
      )}

      <Button title="Pick Time" onPress={showTimePicker} />
      {selectedTime && (
        <Text style={styles.dateTimeText}>{moment(selectedTime).format("h:mm a")}</Text>
      )}

      <Button title="Submit Log" onPress={handleSubmit} />

      <FlatList
        data={log}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.foodName}</Text>
            <Text>{moment(item.date).format('MMMM Do YYYY, h:mm a')}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <Button
        title="Go to Symptom Log"
        onPress={() =>
          router.push({
            pathname: '/symptom_log',
            params: { foodLogData: JSON.stringify(log) },
          })
        }
      />

      {/* Date Picker Modal */}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 },
  searchResult: {paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchName: { fontWeight: '600' },
  searchSub: { fonstSize: 12, color: 'gray' },
  selectedCard: { marginTop: 12, padding: 12, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  selectedTitle: { fontSize: 16, fontWeight: '700' },
  selectedSub: { fontSize: 13, color: 'gray', marginBottom: 4 },
  
  dateTimeText: { marginVertical: 10, fontSize: 16, color: 'gray' },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});

export default FoodLog;
