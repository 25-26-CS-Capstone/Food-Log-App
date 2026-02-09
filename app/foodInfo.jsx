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
import { searchFood as searchUSDA, getFoodDetails as getUSDADetails, formatFoodSearchResult as formatUSDA } from '../utils/usdaAPI';
import { searchFood as searchOFF, getFoodDetails as getOFFDetails, formatFoodSearchResult as formatOFF } from '../utils/openFoodFactsAPI';
import { NO_INGREDIENTS_LISTED, NO_KNOWN_ALLERGENS } from './constants';

const FoodInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [useOpenFoodFacts, setUseOpenFoodFacts] = useState(true); // Default to OpenFoodFacts

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedFood(null);
    
    try {
      let results;
      let formattedResults;
      
      if (useOpenFoodFacts) {
        results = await searchOFF(searchQuery, 'en', 20); // English language filter
        formattedResults = results.map(formatOFF);
      } else {
        results = await searchUSDA(searchQuery);
        formattedResults = results.map(formatUSDA);
      }
      
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
      let details;
      
      if (useOpenFoodFacts) {
        details = await getOFFDetails(foodItem.code);
      } else {
        details = await getUSDADetails(foodItem.fdcId);
      }
      
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
  
  const getNutriscoreColor = (grade) => {
    const colors = {
      'a': '#038141',
      'b': '#85BB2F',
      'c': '#FECB02',
      'd': '#EE8100',
      'e': '#E63E11'
    };
    return colors[grade?.toLowerCase()] || '#666';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Food Information Lookup</Text>
      <Text style={styles.subtitle}>
        Search {useOpenFoodFacts ? 'OpenFoodFacts' : 'USDA'} for nutritional and allergen information
      </Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, !useOpenFoodFacts && styles.toggleButtonActive]}
          onPress={() => setUseOpenFoodFacts(false)}
        >
          <Text style={[styles.toggleText, !useOpenFoodFacts && styles.toggleTextActive]}>USDA</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, useOpenFoodFacts && styles.toggleButtonActive]}
          onPress={() => setUseOpenFoodFacts(true)}
        >
          <Text style={[styles.toggleText, useOpenFoodFacts && styles.toggleTextActive]}>OpenFoodFacts</Text>
        </TouchableOpacity>
      </View>
      
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
          <Text style={styles.loadingText}>
            Searching {useOpenFoodFacts ? 'OpenFoodFacts' : 'USDA'} database...
          </Text>
        </View>
      )}

      {searchResults.length > 0 && !selectedFood && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results ({searchResults.length})</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => (item.code || item.fdcId).toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => showFoodDetails(item)}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{item.displayName}</Text>
                  {item.hasAllergens && (
                    <Text style={styles.allergenBadge}>⚠️</Text>
                  )}
                </View>
                {item.category && (
                  <Text style={styles.resultCategory}>{item.category}</Text>
                )}
                {item.hasAllergens && useOpenFoodFacts && (
                  <Text style={styles.allergenPreview} numberOfLines={1}>
                    Allergens: {item.allergens}
                  </Text>
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
          
          {selectedFood.allergens && selectedFood.allergens !== NO_KNOWN_ALLERGENS && (
            <View style={styles.allergenSection}>
              <Text style={styles.allergenTitle}>⚠️ Allergens</Text>
              <Text style={styles.allergenText}>{selectedFood.allergens}</Text>
            </View>
          )}
          
          {selectedFood.nutriscoreGrade && (
            <View style={styles.nutriscoreContainer}>
              <Text style={styles.nutriscoreLabel}>Nutri-Score: </Text>
              <Text style={[styles.nutriscoreGrade, { color: getNutriscoreColor(selectedFood.nutriscoreGrade) }]}>
                {selectedFood.nutriscoreGrade.toUpperCase()}
              </Text>
            </View>
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
              
              {selectedFood.fiber && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fiber</Text>
                  <Text style={styles.macroValue}>{selectedFood.fiber}g</Text>
                </View>
              )}
              
              {selectedFood.sugar && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Sugar</Text>
                  <Text style={styles.macroValue}>{selectedFood.sugar}g</Text>
                </View>
              )}
              
              {selectedFood.sodium && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Sodium</Text>
                  <Text style={styles.macroValue}>{selectedFood.sodium}mg</Text>
                </View>
              )}
            </View>
            
            {useOpenFoodFacts && (
              <Text style={styles.per100gNote}>Per 100g</Text>
            )}
          </View>

          {selectedFood.ingredients && selectedFood.ingredients !== NO_INGREDIENTS_LISTED && (
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
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  toggleTextActive: {
    color: '#fff',
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  allergenBadge: {
    fontSize: 18,
    marginLeft: 8,
  },
  allergenPreview: {
    fontSize: 12,
    color: '#E63E11',
    marginTop: 4,
    fontStyle: 'italic',
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
  allergenSection: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E63E11',
  },
  allergenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  allergenText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  nutriscoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutriscoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nutriscoreGrade: {
    fontSize: 24,
    fontWeight: 'bold',
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
  per100gNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
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