import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllLogs, getEntriesByDate, deleteFoodEntry, deleteSymptomEntry, clearAllLogs } from '../utils/storage';

const ViewLogs = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [highlightLatest, setHighlightLatest] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [params]);

  useEffect(() => {
    // If navigated with a `latest` param, briefly highlight the first entry
    if (params && params.latest) {
      setHighlightLatest(true);
      const t = setTimeout(() => setHighlightLatest(false), 3000);
      return () => clearTimeout(t);
    }
  }, [params]);

  const loadLogs = async () => {
    try {
      if (params && params.latestDate) {
        const date = Array.isArray(params.latestDate) ? params.latestDate[0] : params.latestDate;
        const dayLogs = await getEntriesByDate(date);
        setLogs(dayLogs);
        setToast({ text: `Showing entries for ${new Date(date).toLocaleDateString()}`, ts: Date.now() });
        setHighlightLatest(true);
        setTimeout(() => setHighlightLatest(false), 3000);
        setTimeout(() => setToast(null), 2500);
      } else {
        const allLogs = await getAllLogs();
        setLogs(allLogs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const deleteEntry = (entry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete this ${entry.type} entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let success;
              if (entry.type === 'food') {
                success = await deleteFoodEntry(entry.id);
              } else if (entry.type === 'symptom') {
                success = await deleteSymptomEntry(entry.id);
              } else {
                Alert.alert('Error', `Unknown entry type: ${entry.type}`);
                return;
              }
              
              if (success) {
                Alert.alert('Success', 'Entry deleted successfully');
                loadLogs(); // Refresh the list
              } else {
                Alert.alert('Error', 'Failed to delete entry');
              }
            } catch (error) {
              console.error('Error in deleteEntry:', error);
              Alert.alert('Error', `Failed to delete entry: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to delete ALL entries? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllLogs();
              if (success) {
                setLogs([]);
                Alert.alert('Success', 'All logs have been cleared');
                loadLogs(); // Refresh to be sure
              } else {
                Alert.alert('Error', 'Failed to clear logs');
              }
            } catch (error) {
              console.error('Error in clearAll:', error);
              Alert.alert('Error', 'Failed to clear logs');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderLogEntry = (entry, index) => {
    const isFood = entry.type === 'food';
    const highlight = highlightLatest && index === 0;
    
    return (
      <View key={entry.id} style={[styles.logEntry, isFood ? styles.foodEntry : styles.symptomEntry, highlight && styles.latestHighlight]}>
        <View style={styles.entryHeader}>
          <View style={styles.entryTypeContainer}>
            <Text style={styles.entryType}>
              {isFood ? '🍎 Food' : '🩺 Symptom'}
            </Text>
            <Text style={styles.entryTime}>{formatDate(entry.timestamp)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteEntry(entry)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle}>
            {isFood ? entry.foodName : entry.symptomType}
          </Text>
          
          {isFood && entry.calories && (
            <Text style={styles.entryDetail}>Calories: {entry.calories}</Text>
          )}
          
          {isFood && entry.usdaData && (
            <View style={styles.nutritionInfo}>
              {entry.usdaData.protein && (
                <Text style={styles.nutritionText}>Protein: {entry.usdaData.protein}g</Text>
              )}
              {entry.usdaData.carbs && (
                <Text style={styles.nutritionText}>Carbs: {entry.usdaData.carbs}g</Text>
              )}
              {entry.usdaData.fat && (
                <Text style={styles.nutritionText}>Fat: {entry.usdaData.fat}g</Text>
              )}
              {entry.usdaData.brandName && (
                <Text style={styles.brandName}>Brand: {entry.usdaData.brandName}</Text>
              )}
            </View>
          )}
          
          {!isFood && (
            <Text style={[styles.entryDetail, styles.severityText]}>
              Severity: {entry.severity}
            </Text>
          )}
          
          {entry.notes && (
            <Text style={styles.entryNotes}>{entry.notes}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {toast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toast.text}</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Your Logs</Text>
        <View style={styles.headerButtons}>
          {logs.length > 0 && (
            <TouchableOpacity style={styles.clearAllButton} onPress={clearAll}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptySubtitle}>Start by logging your food or symptoms</Text>
            <View style={styles.quickActionButtons}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/foodLog')}
              >
                <Text style={styles.quickActionText}>🍎 Log Food</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/symptomsLog')}
              >
                <Text style={styles.quickActionText}>🩺 Log Symptom</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.logsList}>
            <Text style={styles.statsText}>
              Total entries: {logs.length} ({logs.filter(l => l.type === 'food').length} food, {logs.filter(l => l.type === 'symptom').length} symptoms)
            </Text>
            {logs.map((entry, index) => renderLogEntry(entry, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastBanner: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 1000,
    opacity: 0.95,
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logsList: {
    padding: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  logEntry: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  latestHighlight: {
    borderWidth: 2,
    borderColor: '#FFD166',
  },
  foodEntry: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  symptomEntry: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTypeContainer: {
    flex: 1,
  },
  entryType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  entryTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryContent: {
    marginTop: 4,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  severityText: {
    fontWeight: '600',
  },
  entryNotes: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  nutritionInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e8f4f8',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  nutritionText: {
    fontSize: 12,
    color: '#555',
    marginVertical: 1,
  },
  brandName: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default ViewLogs;