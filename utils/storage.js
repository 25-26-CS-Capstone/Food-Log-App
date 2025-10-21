import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_LOG_KEY = '@food_log';
const SYMPTOMS_LOG_KEY = '@symptoms_log';

// Food Log Functions
export const saveFoodEntry = async (foodEntry) => {
  try {
    const existingLogs = await getFoodLogs();
    const updatedLogs = [foodEntry, ...existingLogs];
    await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Error saving food entry:', error);
    return false;
  }
};

export const getFoodLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem(FOOD_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting food logs:', error);
    return [];
  }
};

// Symptom Log Functions
export const saveSymptomEntry = async (symptomEntry) => {
  try {
    const existingLogs = await getSymptomLogs();
    const updatedLogs = [symptomEntry, ...existingLogs];
    await AsyncStorage.setItem(SYMPTOMS_LOG_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Error saving symptom entry:', error);
    return false;
  }
};

export const getSymptomLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem(SYMPTOMS_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting symptom logs:', error);
    return [];
  }
};

// Combined Functions
export const getAllLogs = async () => {
  try {
    const [foodLogs, symptomLogs] = await Promise.all([
      getFoodLogs(),
      getSymptomLogs()
    ]);
    
    // Combine and sort by timestamp (newest first)
    const allLogs = [...foodLogs, ...symptomLogs];
    return allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting all logs:', error);
    return [];
  }
};

// Clear Functions (useful for development/testing)
export const clearFoodLogs = async () => {
  try {
    await AsyncStorage.removeItem(FOOD_LOG_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing food logs:', error);
    return false;
  }
};

export const clearSymptomLogs = async () => {
  try {
    await AsyncStorage.removeItem(SYMPTOMS_LOG_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing symptom logs:', error);
    return false;
  }
};

export const clearAllLogs = async () => {
  try {
    await Promise.all([
      clearFoodLogs(),
      clearSymptomLogs()
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing all logs:', error);
    return false;
  }
};

// Delete individual entry
export const deleteFoodEntry = async (entryId) => {
  try {
    const logs = await getFoodLogs();
    
    // Convert both to strings to ensure comparison works
    const entryIdStr = String(entryId);
    const updatedLogs = logs.filter(log => String(log.id) !== entryIdStr);
    
    if (logs.length === updatedLogs.length) {
      return false; // No entries were removed - ID not found
    }
    
    await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return false;
  }
};

export const deleteSymptomEntry = async (entryId) => {
  try {
    const logs = await getSymptomLogs();
    
    // Convert both to strings to ensure comparison works
    const entryIdStr = String(entryId);
    const updatedLogs = logs.filter(log => String(log.id) !== entryIdStr);
    
    if (logs.length === updatedLogs.length) {
      return false; // No entries were removed - ID not found
    }
    
    await AsyncStorage.setItem(SYMPTOMS_LOG_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Error deleting symptom entry:', error);
    return false;
  }
};

// Date-based filtering functions for calendar
export const getEntriesByDate = async (dateString) => {
  try {
    const foodLogs = await getFoodLogs();
    const symptomLogs = await getSymptomLogs();
    
    // Filter entries for specific date
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const foodEntriesForDate = foodLogs.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= targetDate && entryDate < nextDate;
    }).map(entry => ({ ...entry, type: 'food' }));
    
    const symptomEntriesForDate = symptomLogs.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= targetDate && entryDate < nextDate;
    }).map(entry => ({ ...entry, type: 'symptom' }));
    
    return [...foodEntriesForDate, ...symptomEntriesForDate].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  } catch (error) {
    console.error('Error getting entries by date:', error);
    return [];
  }
};

export const getDatesWithEntries = async () => {
  try {
    const foodLogs = await getFoodLogs();
    const symptomLogs = await getSymptomLogs();
    
    const allEntries = [...foodLogs, ...symptomLogs];
    const datesWithEntries = new Set();
    
    allEntries.forEach(entry => {
      const dateString = new Date(entry.timestamp).toISOString().split('T')[0];
      datesWithEntries.add(dateString);
    });
    
    return Array.from(datesWithEntries);
  } catch (error) {
    console.error('Error getting dates with entries:', error);
    return [];
  }
};

export const getCalendarMarkedDates = async () => {
  try {
    const foodLogs = await getFoodLogs();
    const symptomLogs = await getSymptomLogs();
    
    const marked = {};
    
    // Mark dates with food entries
    foodLogs.forEach(entry => {
      const dateString = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!marked[dateString]) {
        marked[dateString] = { marked: true, dotColor: '#007AFF' };
      }
    });
    
    // Mark dates with symptom entries (different color)
    symptomLogs.forEach(entry => {
      const dateString = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!marked[dateString]) {
        marked[dateString] = { marked: true, dotColor: '#FF3B30' };
      } else {
        // If both food and symptoms exist, use a mixed color
        marked[dateString].dotColor = '#FF9500';
      }
    });
    
    return marked;
  } catch (error) {
    console.error('Error getting calendar marked dates:', error);
    return {};
  }
};