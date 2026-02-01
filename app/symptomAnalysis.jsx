import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSymptomLogs, getFoodLogs } from '../utils/storage';

const SymptomAnalysis = () => {
  const router = useRouter();
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Common allergens database
  const commonAllergens = {
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'lactose'],
    'gluten': ['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye', 'oats'],
    'nuts': ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'brazil nut', 'pistachio'],
    'eggs': ['egg', 'mayonnaise', 'custard', 'meringue'],
    'soy': ['soy', 'soybean', 'tofu', 'tempeh', 'soy sauce', 'edamame'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'oyster', 'clam', 'scallop'],
    'fish': ['salmon', 'tuna', 'cod', 'halibut', 'sardine', 'anchovy'],
    'citrus': ['orange', 'lemon', 'lime', 'grapefruit', 'citrus'],
    'nightshades': ['tomato', 'potato', 'eggplant', 'pepper', 'paprika'],
    'histamine': ['aged cheese', 'wine', 'beer', 'fermented', 'aged', 'cured']
  };

  // Symptom-allergen correlation patterns
  const symptomPatterns = {
    'nausea': ['dairy', 'gluten', 'eggs'],
    'bloating': ['dairy', 'gluten', 'soy'],
    'stomach pain': ['dairy', 'gluten', 'citrus', 'nightshades'],
    'diarrhea': ['dairy', 'gluten', 'soy'],
    'headache': ['histamine', 'citrus', 'nuts'],
    'skin rash': ['nuts', 'shellfish', 'eggs', 'soy'],
    'hives': ['nuts', 'shellfish', 'eggs'],
    'fatigue': ['gluten', 'dairy'],
    'joint pain': ['nightshades', 'gluten'],
    'congestion': ['dairy', 'histamine'],
    'throat irritation': ['nuts', 'citrus'],
    'digestive issues': ['dairy', 'gluten', 'soy'],
    'gas': ['dairy', 'gluten', 'soy'],
    'cramping': ['dairy', 'gluten'],
    'swelling': ['nuts', 'shellfish', 'eggs']
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const symptoms = await getSymptomLogs();
      const foods = await getFoodLogs();
      setSymptomLogs(symptoms);
      setFoodLogs(foods);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const analyzeSymptoms = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Please enter a symptom', 'Enter a symptom to analyze potential food allergies');
      return;
    }

    setLoading(true);
    const query = searchQuery.toLowerCase();
    
    // Find matching symptom patterns
    const potentialAllergens = new Set();
    
    // Direct pattern matching
    Object.keys(symptomPatterns).forEach(symptomKey => {
      if (query.includes(symptomKey) || symptomKey.includes(query)) {
        symptomPatterns[symptomKey].forEach(allergen => {
          potentialAllergens.add(allergen);
        });
      }
    });

    // Check user's actual symptom logs for patterns
    const userSymptomAnalysis = analyzeUserSymptoms(query);
    
    const results = Array.from(potentialAllergens).map(allergen => ({
      allergen,
      foods: commonAllergens[allergen],
      confidence: calculateConfidence(allergen, query, userSymptomAnalysis),
      userPattern: userSymptomAnalysis[allergen] || null
    })).sort((a, b) => b.confidence - a.confidence);

    setAnalysisResults(results);
    setLoading(false);
  };

  const analyzeUserSymptoms = (symptom) => {
    const analysis = {};
    
    // Find symptoms that match the search
    const matchingSymptoms = symptomLogs.filter(log => 
      log.symptomType.toLowerCase().includes(symptom) ||
      (log.notes && log.notes.toLowerCase().includes(symptom))
    );

    if (matchingSymptoms.length === 0) return analysis;

    // For each matching symptom, find foods eaten in the 24 hours before
    matchingSymptoms.forEach(symptomLog => {
      const symptomTime = new Date(symptomLog.timestamp);
      const windowStart = new Date(symptomTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before

      const suspiciousFoods = foodLogs.filter(foodLog => {
        const foodTime = new Date(foodLog.timestamp);
        return foodTime >= windowStart && foodTime <= symptomTime;
      });

      // Categorize foods by allergen type
      suspiciousFoods.forEach(food => {
        const foodName = food.foodName.toLowerCase();
        
        Object.keys(commonAllergens).forEach(allergenType => {
          if (commonAllergens[allergenType].some(allergenFood => 
            foodName.includes(allergenFood))) {
            
            if (!analysis[allergenType]) {
              analysis[allergenType] = {
                occurrences: 0,
                foods: new Set(),
                dates: []
              };
            }
            
            analysis[allergenType].occurrences++;
            analysis[allergenType].foods.add(food.foodName);
            analysis[allergenType].dates.push(new Date(symptomLog.timestamp).toLocaleDateString());
          }
        });
      });
    });

    return analysis;
  };

  const calculateConfidence = (allergen, symptom, userAnalysis) => {
    let confidence = 0;
    
    // Base confidence from symptom-allergen correlation
    if (symptomPatterns[symptom] && symptomPatterns[symptom].includes(allergen)) {
      confidence += 40;
    }

    // Boost confidence based on user's actual data
    if (userAnalysis[allergen]) {
      confidence += Math.min(userAnalysis[allergen].occurrences * 10, 50);
    }

    // Pattern matching boost
    Object.keys(symptomPatterns).forEach(pattern => {
      if (symptom.includes(pattern) && symptomPatterns[pattern].includes(allergen)) {
        confidence += 20;
      }
    });

    return Math.min(confidence, 100);
  };

  const renderAllergenResult = ({ item }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.allergenName}>{item.allergen.toUpperCase()}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(item.confidence) }]}>
          <Text style={styles.confidenceText}>{item.confidence}%</Text>
        </View>
      </View>
      
      <Text style={styles.foodsLabel}>Common foods containing {item.allergen}:</Text>
      <Text style={styles.foodsList}>{item.foods.join(', ')}</Text>
      
      {item.userPattern && (
        <View style={styles.userPatternContainer}>
          <Text style={styles.userPatternLabel}>Your Data:</Text>
          <Text style={styles.userPatternText}>
            Found {item.userPattern.occurrences} potential correlations
          </Text>
          <Text style={styles.userPatternFoods}>
            Foods: {Array.from(item.userPattern.foods).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return '#FF3B30';
    if (confidence >= 50) return '#FF9500';
    if (confidence >= 30) return '#FFCC00';
    return '#34C759';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Symptom Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Enter a symptom to analyze:</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="e.g., nausea, headache, bloating..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={analyzeSymptoms}
            disabled={loading}
          >
            <Text style={styles.analyzeButtonText}>
              {loading ? 'Analyzing...' : 'Analyze Potential Allergies'}
            </Text>
          </TouchableOpacity>
        </View>

        {analysisResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Potential Food Allergies/Sensitivities:</Text>
            <FlatList
              data={analysisResults}
              renderItem={renderAllergenResult}
              keyExtractor={(item) => item.allergen}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and should not replace professional medical advice. 
            Always consult with a healthcare provider or allergist for proper allergy testing and diagnosis.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  allergenName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  foodsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  foodsList: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userPatternContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  userPatternLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  userPatternText: {
    fontSize: 13,
    color: '#333',
  },
  userPatternFoods: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  disclaimerContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default SymptomAnalysis;