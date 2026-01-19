import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getFlaggedFoods, getFoodLogs } from '../utils/storage';
import { generateRecommendation, getDietaryTip } from '../utils/dietRecommendations';

const DietRecommendations = () => {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const flaggedFoods = await getFlaggedFoods();
      const foodLogs = await getFoodLogs();

      if (flaggedFoods.length === 0) {
        setRecommendations([]);
      } else {
        const recs = generateRecommendation(flaggedFoods, foodLogs);
        setRecommendations(recs);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations');
      setLoading(false);
    }
  };

  const getReasonBadge = (reason) => {
    const colors = {
      'allergen': '#F44336',
      'trigger': '#FF9800',
      'intolerance': '#FF5722',
      'dislike': '#9C27B0',
    };
    return colors[reason] || '#999';
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      'low': '⬇️ Low',
      'medium': '➡️ Medium',
      'high': '⬆️ High',
    };
    return labels[severity] || severity;
  };

  const renderRecommendation = (rec, index) => {
    const isExpanded = expandedIndex === index;

    return (
      <View key={index} style={styles.recommendationCard}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
        >
          <View style={styles.headerContent}>
            <Text style={styles.flaggedFood}>{rec.flaggedFood}</Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.reasonBadge,
                  { backgroundColor: getReasonBadge(rec.reason) }
                ]}
              >
                <Text style={styles.badgeText}>{rec.reason.toUpperCase()}</Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(rec.severity) }
                ]}
              >
                <Text style={styles.badgeText}>{getSeverityLabel(rec.severity)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {rec.timesLogged > 0 && (
          <Text style={styles.frequency}>
            Logged {rec.timesLogged} time{rec.timesLogged !== 1 ? 's' : ''}
          </Text>
        )}

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Dietary Tip */}
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Dietary Tip</Text>
              <Text style={styles.tipText}>{getDietaryTip(rec.flaggedFood)}</Text>
            </View>

            {/* Alternatives */}
            <View style={styles.alternativesSection}>
              <Text style={styles.alternativesTitle}>✨ Try These Alternatives</Text>
              <View style={styles.alternativesList}>
                {rec.alternatives.map((alt, altIndex) => (
                  <TouchableOpacity
                    key={altIndex}
                    style={styles.alternativeItem}
                    onPress={() => {
                      router.push({
                        pathname: '/foodInfo',
                        params: { searchQuery: alt }
                      });
                    }}
                  >
                    <Text style={styles.alternativeText}>{alt}</Text>
                    <Text style={styles.searchIcon}>🔍</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  router.push({
                    pathname: '/foodInfo',
                    params: { searchQuery: rec.flaggedFood }
                  });
                }}
              >
                <Text style={styles.infoButtonText}>📊 Learn More</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => {
                  Alert.alert(
                    'Manage Flag',
                    `Options for ${rec.flaggedFood}`,
                    [
                      {
                        text: 'Remove Flag',
                        onPress: async () => {
                          const { unflagFood } = await import('../utils/storage');
                          await unflagFood(rec.flaggedFood);
                          loadRecommendations();
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={styles.flagButtonText}>🚩 Edit Flag</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return '#FFC107';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>🍽️ Diet Recommendations</Text>
      <Text style={styles.subtitle}>Personalized food alternatives based on your flags</Text>

      {recommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Flagged Foods</Text>
          <Text style={styles.emptySubtitle}>
            Flag foods as allergens or triggers to get personalized recommendations
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/foodLog')}
          >
            <Text style={styles.startButtonText}>Log Food & Flag Issues</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.recommendationCount}>
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} based on your flags
          </Text>
          {recommendations.map((rec, index) => renderRecommendation(rec, index))}
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
    paddingBottom: 40,
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
    marginBottom: 24,
  },
  recommendationCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flex: 1,
  },
  flaggedFood: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  reasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  expandIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  frequency: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  tipBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  alternativesSection: {
    marginBottom: 16,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  alternativesList: {
    gap: 8,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  alternativeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  searchIcon: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  infoButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  flagButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  flagButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 250,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default DietRecommendations;
