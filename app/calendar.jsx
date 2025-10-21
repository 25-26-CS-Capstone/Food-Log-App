import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { getFoodLogs, getSymptomLogs } from '../utils/storage';

const CalendarScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [dayEntries, setDayEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const foodLogs = await getFoodLogs();
      const symptomLogs = await getSymptomLogs();
      
      const allEntries = [
        ...foodLogs.map(entry => ({ ...entry, type: 'food' })),
        ...symptomLogs.map(entry => ({ ...entry, type: 'symptom' }))
      ];

      // Create marked dates object
      const marked = {};
      allEntries.forEach(entry => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        if (!marked[date]) {
          marked[date] = {
            marked: true,
            dotColor: '#007AFF',
            entries: []
          };
        }
        marked[date].entries.push(entry);
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    
    // Get entries for selected date
    const entriesForDay = markedDates[dateString]?.entries || [];
    setDayEntries(entriesForDay);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDayEntry = (entry, index) => {
    const isFood = entry.type === 'food';
    
    return (
      <View key={`${entry.type}-${entry.id}-${index}`} style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={[styles.entryType, { color: isFood ? '#FF6B35' : '#007AFF' }]}>
            {isFood ? '🍎 Food' : '🩺 Symptom'}
          </Text>
          <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
        </View>
        
        <Text style={styles.entryTitle}>
          {isFood ? entry.foodName : entry.symptomType}
        </Text>
        
        {isFood && entry.calories && (
          <Text style={styles.entryDetail}>Calories: {entry.calories}</Text>
        )}
        
        {!isFood && (
          <Text style={styles.entryDetail}>Severity: {entry.severity}</Text>
        )}
        
        {entry.notes && (
          <Text style={styles.entryNotes}>{entry.notes}</Text>
        )}
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalendarData();
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
        <Text style={styles.title}>Food Calendar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#007AFF',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13
          }}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#007AFF'
            }
          }}
          onDayPress={onDayPress}
        />

        {selectedDate && (
          <View style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>
              {formatDate(selectedDate)}
            </Text>
            
            {dayEntries.length > 0 ? (
              <View style={styles.entriesContainer}>
                <Text style={styles.entriesHeader}>
                  {dayEntries.length} {dayEntries.length === 1 ? 'Entry' : 'Entries'}
                </Text>
                {dayEntries.map((entry, index) => renderDayEntry(entry, index))}
              </View>
            ) : (
              <View style={styles.noEntriesContainer}>
                <Text style={styles.noEntriesText}>No entries for this date</Text>
                <TouchableOpacity 
                  style={styles.addEntryButton}
                  onPress={() => router.push('/foodLog')}
                >
                  <Text style={styles.addEntryButtonText}>Add Food Entry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📅 Your Food Calendar</Text>
            <Text style={styles.instructionsText}>
              • Tap on any date to see your food and symptom entries{'\n'}
              • Dates with entries are marked with a blue dot{'\n'}
              • Track your eating patterns over time
            </Text>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  calendar: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  selectedDateSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  entriesContainer: {
    gap: 12,
  },
  entriesHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryType: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryTime: {
    fontSize: 12,
    color: '#666',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  entryNotes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  noEntriesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEntriesText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addEntryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addEntryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CalendarScreen;