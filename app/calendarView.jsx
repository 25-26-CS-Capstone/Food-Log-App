import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { getAllLogs } from '../utils/storage';

const CalendarView = () => {
  const router = useRouter();
  const [allLogs, setAllLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logs = await getAllLogs();
      setAllLogs(logs);
      buildMarkedDates(logs);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading logs:', error);
      setIsLoading(false);
    }
  };

  const buildMarkedDates = (logs) => {
    const marked = {};
    
    logs.forEach(log => {
      const dateKey = log.timestamp.split('T')[0];
      if (!marked[dateKey]) {
        marked[dateKey] = {
          marked: true,
          dots: [],
          periods: [],
        };
      }
      
      // Add dots for different log types
      const color = log.type === 'food' ? '#2196F3' : '#FF6B6B';
      marked[dateKey].dots.push({ color, key: log.id });
    });

    // Add selected date
    const today = new Date().toISOString().split('T')[0];
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };

    setMarkedDates(marked);
  };

  const getLogsForDate = (dateStr) => {
    return allLogs.filter(log => log.timestamp.split('T')[0] === dateStr);
  };

  const getDaySummary = (dateStr) => {
    const logsForDay = getLogsForDate(dateStr);
    const foodLogs = logsForDay.filter(l => l.type === 'food');
    const symptomLogs = logsForDay.filter(l => l.type === 'symptom');

    let totalCalories = 0;
    foodLogs.forEach(log => {
      if (log.calories) {
        totalCalories += parseInt(log.calories);
      } else if (log.usdaData?.calories) {
        totalCalories += log.usdaData.calories;
      }
    });

    return {
      foodCount: foodLogs.length,
      symptomCount: symptomLogs.length,
      totalCalories,
      foodLogs,
      symptomLogs,
    };
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    const newMarked = { ...markedDates };
    
    // Update marking
    Object.keys(newMarked).forEach(key => {
      newMarked[key].selected = key === day.dateString;
      newMarked[key].selectedColor = key === day.dateString ? '#007AFF' : undefined;
    });
    
    setMarkedDates(newMarked);
  };

  const renderLogEntry = (log) => {
    if (log.type === 'food') {
      return (
        <View key={log.id} style={styles.logEntry}>
          <View style={styles.logTypeIcon}>
            <Text style={styles.logIcon}>🍽️</Text>
          </View>
          <View style={styles.logContent}>
            <Text style={styles.logTitle}>{log.foodName}</Text>
            <View style={styles.logMetaRow}>
              {log.calories && (
                <Text style={styles.logMeta}>
                  {log.calories} cal
                </Text>
              )}
              {log.notes && (
                <Text style={styles.logMeta}>• {log.notes}</Text>
              )}
            </View>
            <Text style={styles.logTime}>
              {new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      );
    } else if (log.type === 'symptom') {
      const severityColors = {
        'Mild': '#4CAF50',
        'Moderate': '#FFC107',
        'Severe': '#F44336',
      };
      
      return (
        <View key={log.id} style={styles.logEntry}>
          <View style={styles.logTypeIcon}>
            <Text style={styles.logIcon}>⚕️</Text>
          </View>
          <View style={styles.logContent}>
            <View style={styles.symptomHeader}>
              <Text style={styles.logTitle}>{log.symptomName}</Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: severityColors[log.severity] }
                ]}
              >
                <Text style={styles.severityText}>{log.severity}</Text>
              </View>
            </View>
            {log.notes && (
              <Text style={styles.logMeta}>{log.notes}</Text>
            )}
            <Text style={styles.logTime}>
              {new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = getDaySummary(selectedDate);
  const dateObj = new Date(selectedDate);
  const dateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📅 Calendar View</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#333',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#fff',
              todayTextColor: '#007AFF',
              dayTextColor: '#333',
              textDisabledColor: '#ccc',
              dotColor: '#007AFF',
              selectedDotColor: '#fff',
              arrowColor: '#007AFF',
              monthTextColor: '#333',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Selected Date Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.selectedDateLabel}>{dateLabel}</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🍽️</Text>
              <Text style={styles.summaryLabel}>Food Logs</Text>
              <Text style={styles.summaryValue}>{summary.foodCount}</Text>
            </View>
            
            {summary.totalCalories > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>🔥</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
                <Text style={styles.summaryValue}>{summary.totalCalories}</Text>
              </View>
            )}
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⚕️</Text>
              <Text style={styles.summaryLabel}>Symptoms</Text>
              <Text style={styles.summaryValue}>{summary.symptomCount}</Text>
            </View>
          </View>
        </View>

        {/* Daily Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>
            {summary.foodCount + summary.symptomCount === 0
              ? 'No logs for this day'
              : `${summary.foodCount + summary.symptomCount} Entries`}
          </Text>
          
          {summary.foodCount + summary.symptomCount === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No logs recorded for this date</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/foodLog')}
              >
                <Text style={styles.addButtonText}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.logsList}>
              {/* Food logs first */}
              {summary.foodLogs.map(log => renderLogEntry(log))}
              
              {/* Symptom logs */}
              {summary.symptomLogs.map(log => renderLogEntry(log))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  backButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 12,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectedDateLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  logsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  logsList: {
    gap: 8,
  },
  logEntry: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  logTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logIcon: {
    fontSize: 20,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  logMetaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logMeta: {
    fontSize: 12,
    color: '#666',
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CalendarView;
