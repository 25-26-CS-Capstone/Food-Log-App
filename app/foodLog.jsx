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
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveFoodEntry } from '../utils/storage';
import { searchFood, getFoodDetails, formatFoodSearchResult } from '../utils/usdaAPI';
import BarcodeScannerModal from './barcodeScanner';

const FoodLog = () => {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  
  // Food search states
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Barcode scanner state
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const handleLogFood = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    setIsLogging(true);
    
    try {
      // Create food entry with enhanced data
      const foodEntry = {
        id: Date.now().toString(),
        foodName: foodName.trim(),
        calories: calories ? parseInt(calories) : null,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        type: 'food',
        // Enhanced USDA data
        usdaData: selectedFood ? {
          fdcId: selectedFood.fdcId,
          brandName: selectedFood.brandName,
          protein: selectedFood.protein,
          carbs: selectedFood.carbs,
          fat: selectedFood.fat,
          ingredients: selectedFood.ingredients,
          allergens: selectedFood.allergens
        } : null
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
    setSearchResults([]);
    setShowSearch(false);
    setSelectedFood(null);
  };

  const handleFoodSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    setIsSearching(true);
    setShowSearch(true);
    
    try {
      const results = await searchFood(query);
      const formattedResults = results.map(formatFoodSearchResult);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for food items');
    } finally {
      setIsSearching(false);
    }
  };

  const selectFoodFromSearch = async (foodItem) => {
    setIsSearching(true);
    
    try {
      const details = await getFoodDetails(foodItem.fdcId);
      if (details) {
        setFoodName(details.name);
        setCalories(details.calories ? details.calories.toString() : '');
        setSelectedFood(details);
        setShowSearch(false);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error getting food details:', error);
      Alert.alert('Error', 'Failed to get food details');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFoodNameChange = (text) => {
    setFoodName(text);
    // Trigger search after user stops typing
    setTimeout(() => {
      if (text === foodName) { // Only search if text hasn't changed
        handleFoodSearch(text);
      }
    }, 400);
  };

  const handleBarcodeDetected = (foodData) => {
    setFoodName(foodData.name);
    setCalories(foodData.calories?.toString() || '');
    
    // Create selected food object similar to USDA search results
    const barcodeFood = {
      fdcId: foodData.code,
      displayName: foodData.name,
      brandName: foodData.brands,
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      barcode: foodData.barcode,
      source: foodData.source,
      allergens: foodData.allergens || [],
    };
    
    setSelectedFood(barcodeFood);
    setShowBarcodeScanner(false);
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
            <View style={styles.labelRow}>
              <Text style={styles.label}>Food Name *</Text>
              <TouchableOpacity
                style={styles.barcodeButton}
                onPress={() => setShowBarcodeScanner(true)}
              >
                <Text style={styles.barcodeButtonText}>📷 Scan</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Search for food (e.g., Apple, Chicken Sandwich)"
              value={foodName}
              onChangeText={handleFoodNameChange}
              autoCapitalize="words"
            />
            
            {isSearching && (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.searchingText}>Searching USDA database...</Text>
              </View>
            )}
            
            {showSearch && searchResults.length > 0 && (
              <View style={styles.searchResults}>
                <Text style={styles.searchResultsTitle}>Search Results:</Text>
                <FlatList
                  data={searchResults.slice(0, 5)} // Show top 5 results
                  keyExtractor={(item) => item.fdcId.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => selectFoodFromSearch(item)}
                    >
                      <Text style={styles.searchResultName}>{item.displayName}</Text>
                      {item.brandName && (
                        <Text style={styles.searchResultBrand}>{item.brandName}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  nestedScrollEnabled={true}
                  style={styles.searchResultsList}
                />
              </View>
            )}
            
            {selectedFood && (
              <View style={styles.foodDetailsCard}>
                <Text style={styles.foodDetailsTitle}>📊 Nutrition Info</Text>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Calories:</Text>
                  <Text style={styles.nutritionValue}>
                    {selectedFood.calories ? `${selectedFood.calories} kcal` : 'N/A'}
                  </Text>
                </View>
                {selectedFood.protein && (
                  <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Protein:</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.protein}g</Text>
                  </View>
                )}
                {selectedFood.carbs && (
                  <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Carbs:</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.carbs}g</Text>
                  </View>
                )}
                {selectedFood.fat && (
                  <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Fat:</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.fat}g</Text>
                  </View>
                )}
              </View>
            )}
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
      
      <BarcodeScannerModal
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onBarcodeDetected={handleBarcodeDetected}
      />
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  barcodeButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  barcodeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  searchResults: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultsList: {
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  searchResultBrand: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  foodDetailsCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  foodDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#555',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default FoodLog;