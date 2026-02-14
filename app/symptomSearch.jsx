import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSymptomLogs } from '../utils/storage';
import { SEVERITY_OPTIONS, DATE_RANGE_OPTIONS } from './constants';

const SymptomSearch = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'today', 'week', 'month', 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    filterSymptoms();
  }, [searchQuery, selectedSeverity, dateRange, symptomLogs]);

  const loadSymptoms = async () => {
    try {
      const logs = await getSymptomLogs();
      setSymptomLogs(logs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading symptoms:', error);
      Alert.alert('Error', 'Failed to load symptoms');
      setLoading(false);
    }
  };

  const filterSymptoms = () => {
    let filtered = [...symptomLogs];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.symptomType.toLowerCase().includes(query) ||
        (log.notes && log.notes.toLowerCase().includes(query))
      );
    }

    // Filter by severity
    if (selectedSeverity) {
      filtered = filtered.filter(log =>
        log.severity.toLowerCase() === selectedSeverity.toLowerCase()
      );
    }

    // Filter by date range
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp);
      
      switch (dateRange) {
        case 'today':
          return logDate >= startOfToday;
        case 'week':
          return logDate >= startOfWeek;
        case 'month':
          return logDate >= startOfMonth;
        default:
          return true;
      }
    });

    setFilteredLogs(filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'severe':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSymptomStats = () => {
    const stats = {};
    symptomLogs.forEach(log => {
      const type = log.symptomType;
      if (!stats[type]) {
        stats[type] = { count: 0, severity: [] };
      }
      stats[type].count++;
      stats[type].severity.push(log.severity);
    });
    return stats;
  };

  const renderSymptomLog = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <Text style={styles.symptomType}>{item.symptomType}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(item.severity) }
          ]}
        >
          <Text style={styles.severityBadgeText}>{item.severity}</Text>
        </View>
      </View>
      {item.notes && (
        <Text style={styles.notes}>{item.notes}</Text>
      )}
    </View>
  );

  const stats = getSymptomStats();
  const topSymptoms = Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>🔍 Search Symptoms</Text>
      <Text style={styles.subtitle}>Find and analyze your symptom patterns</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by symptom name or notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Severity Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter by Severity:</Text>
        <View style={styles.filterButtons}>
          {SEVERITY_OPTIONS.map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterButton,
                selectedSeverity === severity && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedSeverity === severity && styles.filterButtonTextActive,
                ]}
              >
                {severity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Date Range:</Text>
        <View style={styles.dateRangeButtons}>
          {DATE_RANGE_OPTIONS.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.dateButton,
                dateRange === range && styles.dateButtonActive,
              ]}
              onPress={() => setDateRange(range)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  dateRange === range && styles.dateButtonTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Statistics */}
      {topSymptoms.length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Most Common Symptoms</Text>
          {topSymptoms.map(([symptom, data], index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statItemHeader}>
                <Text style={styles.statSymptom}>{symptom}</Text>
                <Text style={styles.statCount}>{data.count}x</Text>
              </View>
              <View style={styles.severityDistribution}>
                {SEVERITY_OPTIONS.map((severity) => {
                  const count = data.severity.filter((s) => s === severity).length;
                  const percentage = count > 0 ? Math.round((count / data.count) * 100) : 0;
                  return (
                    <View
                      style={[
                        styles.severityBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: getSeverityColor(severity),
                        },
                      ]}
                    >
                      {percentage > 10 && (
                        <Text style={styles.percentageText}>{percentage}%</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''} found
      </Text>

      {/* Symptom Logs */}
      {filteredLogs.length > 0 ? (
        <FlatList
          data={filteredLogs}
          renderItem={renderSymptomLog}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No symptoms found</Text>
          <Text style={styles.emptySubtext}>
            {symptomLogs.length === 0
              ? 'Start logging symptoms to see them here'
              : 'Try adjusting your search or filters'}
          </Text>
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
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dateButtonTextActive: {
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statItem: {
    marginBottom: 16,
  },
  statItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statSymptom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  severityDistribution: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  severityBar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
  },
  symptomType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default SymptomSearch;
