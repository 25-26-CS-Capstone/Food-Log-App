import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_LOG_KEY = '@food_log';
const SYMPTOMS_LOG_KEY = '@symptoms_log';
const USER_KEY = '@user_data';
const USER_LOGIN_DATES_KEY = '@user_login_dates';
const UI_WELCOME_BANNER_DISMISSED_DATE = '@ui_welcome_banner_dismissed_date';
const FLAGGED_FOODS_KEY = '@flagged_foods'; // Foods marked as allergens or important

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

export const updateFoodEntry = async (entryId, updatedEntry) => {
  try {
    const existingLogs = await getFoodLogs();
    const index = existingLogs.findIndex(log => log.id === entryId);
    
    if (index >= 0) {
      existingLogs[index] = { ...existingLogs[index], ...updatedEntry, timestamp: existingLogs[index].timestamp };
      await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(existingLogs));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating food entry:', error);
    return false;
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

export const updateSymptomEntry = async (entryId, updatedEntry) => {
  try {
    const existingLogs = await getSymptomLogs();
    const index = existingLogs.findIndex(log => log.id === entryId);
    
    if (index >= 0) {
      existingLogs[index] = { ...existingLogs[index], ...updatedEntry, timestamp: existingLogs[index].timestamp };
      await AsyncStorage.setItem(SYMPTOMS_LOG_KEY, JSON.stringify(existingLogs));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating symptom entry:', error);
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

// User Data Functions
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

// Login day tracking (unique calendar days)
export const recordTodayLoginDay = async () => {
  try {
    const today = new Date();
    const dayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = await AsyncStorage.getItem(USER_LOGIN_DATES_KEY);
    const set = new Set(existing ? JSON.parse(existing) : []);
    set.add(dayString);
    const updated = Array.from(set);
    await AsyncStorage.setItem(USER_LOGIN_DATES_KEY, JSON.stringify(updated));
    return updated.length;
  } catch (error) {
    console.error('Error recording login day:', error);
    return null;
  }
};

export const getLoginDayCount = async () => {
  try {
    const dates = await AsyncStorage.getItem(USER_LOGIN_DATES_KEY);
    if (!dates) return 0;
    return JSON.parse(dates).length;
  } catch (error) {
    console.error('Error getting login day count:', error);
    return 0;
  }
};

export const getLoginDates = async () => {
  try {
    const dates = await AsyncStorage.getItem(USER_LOGIN_DATES_KEY);
    return dates ? JSON.parse(dates) : [];
  } catch (error) {
    console.error('Error getting login dates:', error);
    return [];
  }
};

// Welcome banner dismissal persistence
export const isWelcomeBannerDismissedToday = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dismissedDate = await AsyncStorage.getItem(UI_WELCOME_BANNER_DISMISSED_DATE);
    return dismissedDate === today;
  } catch (error) {
    console.error('Error checking banner dismissed date:', error);
    return false;
  }
};

export const setWelcomeBannerDismissedToday = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(UI_WELCOME_BANNER_DISMISSED_DATE, today);
    return true;
  } catch (error) {
    console.error('Error setting banner dismissed date:', error);
    return false;
  }
};

// Food Flagging Functions - Mark foods as allergens or problematic
export const flagFood = async (foodName, reason = 'allergen', severity = 'medium') => {
  try {
    const flaggedFoods = await getFlaggedFoods();
    const existingIndex = flaggedFoods.findIndex(f => f.foodName.toLowerCase() === foodName.toLowerCase());
    
    const flagEntry = {
      foodName,
      reason, // 'allergen', 'trigger', 'dislike', 'intolerance'
      severity, // 'low', 'medium', 'high'
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing flag
      flaggedFoods[existingIndex] = { ...flaggedFoods[existingIndex], ...flagEntry, dateAdded: flaggedFoods[existingIndex].dateAdded };
    } else {
      // Add new flag
      flaggedFoods.push(flagEntry);
    }
    
    await AsyncStorage.setItem(FLAGGED_FOODS_KEY, JSON.stringify(flaggedFoods));
    return true;
  } catch (error) {
    console.error('Error flagging food:', error);
    return false;
  }
};

export const unflagFood = async (foodName) => {
  try {
    const flaggedFoods = await getFlaggedFoods();
    const filtered = flaggedFoods.filter(f => f.foodName.toLowerCase() !== foodName.toLowerCase());
    await AsyncStorage.setItem(FLAGGED_FOODS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error unflagging food:', error);
    return false;
  }
};

export const getFlaggedFoods = async () => {
  try {
    const flaggedFoods = await AsyncStorage.getItem(FLAGGED_FOODS_KEY);
    return flaggedFoods ? JSON.parse(flaggedFoods) : [];
  } catch (error) {
    console.error('Error getting flagged foods:', error);
    return [];
  }
};

export const isFoodFlagged = async (foodName) => {
  try {
    const flaggedFoods = await getFlaggedFoods();
    return flaggedFoods.find(f => f.foodName.toLowerCase() === foodName.toLowerCase()) || null;
  } catch (error) {
    console.error('Error checking if food is flagged:', error);
    return null;
  }
};

export const updateFoodFlag = async (foodName, updates) => {
  try {
    const flaggedFoods = await getFlaggedFoods();
    const index = flaggedFoods.findIndex(f => f.foodName.toLowerCase() === foodName.toLowerCase());
    
    if (index >= 0) {
      flaggedFoods[index] = { 
        ...flaggedFoods[index], 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      await AsyncStorage.setItem(FLAGGED_FOODS_KEY, JSON.stringify(flaggedFoods));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating food flag:', error);
    return false;
  }
};