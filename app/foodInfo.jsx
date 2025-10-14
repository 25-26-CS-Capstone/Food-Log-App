import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { searchFood, getFoodDetails, formatFoodSearchResult } from '../utils/usdaAPI';

const FoodInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedFood(null);
    
    try {
      const results = await searchFood(searchQuery);
      const formattedResults = results.map(formatFoodSearchResult);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const showFoodDetails = async (foodItem) => {
    setIsLoadingDetails(true);
    
    try {
      const details = await getFoodDetails(foodItem.fdcId);
      setSelectedFood(details);
      setSearchResults([]); // Hide search results when showing details
    } catch (error) {
      console.error('Error getting food details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Food Information Lookup</Text>
      <Text style={styles.subtitle}>Search the USDA database for nutritional information</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter food name (e.g., banana, chicken breast)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching USDA database...</Text>
        </View>
      )}

      {searchResults.length > 0 && !selectedFood && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results ({searchResults.length})</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.fdcId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => showFoodDetails(item)}
              >
                <Text style={styles.resultName}>{item.displayName}</Text>
                {item.category && (
                  <Text style={styles.resultCategory}>{item.category}</Text>
                )}
              </TouchableOpacity>
            )}
            nestedScrollEnabled={true}
          />
        </View>
      )}

      {isLoadingDetails && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading food details...</Text>
        </View>
      )}

      {selectedFood && (
        <View style={styles.detailsContainer}>
          <Text style={styles.foodName}>{selectedFood.name}</Text>
          {selectedFood.brandName && (
            <Text style={styles.brandName}>Brand: {selectedFood.brandName}</Text>
          )}
          
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>📊 Nutritional Information</Text>
            
            <View style={styles.macroNutrients}>
              {selectedFood.calories && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Calories</Text>
                  <Text style={styles.macroValue}>{selectedFood.calories}</Text>
                </View>
              )}
              
              {selectedFood.protein && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{selectedFood.protein}g</Text>
                </View>
              )}
              
              {selectedFood.carbs && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{selectedFood.carbs}g</Text>
                </View>
              )}
              
              {selectedFood.fat && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{selectedFood.fat}g</Text>
                </View>
              )}
            </View>
          </View>

          {selectedFood.ingredients && selectedFood.ingredients !== 'No ingredients listed' && (
            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionTitle}>🥄 Ingredients</Text>
              <Text style={styles.ingredientsText}>{selectedFood.ingredients}</Text>
            </View>
          )}

          {selectedFood.nutrients && selectedFood.nutrients.length > 0 && (
            <View style={styles.nutrientsSection}>
              <Text style={styles.sectionTitle}>🔬 Other Nutrients</Text>
              {selectedFood.nutrients.slice(0, 8).map((nutrient, index) => (
                <View key={index} style={styles.nutrientItem}>
                  <Text style={styles.nutrientName}>
                    {nutrient.nutrient?.name || nutrient.nutrientName}
                  </Text>
                  <Text style={styles.nutrientValue}>
                    {nutrient.amount} {nutrient.nutrient?.unitName || nutrient.unitName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.newSearchButton} onPress={clearSearch}>
            <Text style={styles.newSearchButtonText}>New Search</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resultCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  nutritionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  macroNutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroItem: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ingredientsSection: {
    marginBottom: 20,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  nutrientsSection: {
    marginBottom: 20,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  newSearchButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  newSearchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodInfo;