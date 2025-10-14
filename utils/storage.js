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
    const updatedLogs = logs.filter(log => log.id !== entryId);
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
    const updatedLogs = logs.filter(log => log.id !== entryId);
    await AsyncStorage.setItem(SYMPTOMS_LOG_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Error deleting symptom entry:', error);
    return false;
  }
};