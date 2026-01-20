import { saveFoodEntry, saveSymptomEntry } from './storage';

// Sample food entries
const sampleFoodEntries = [
  {
    id: '1',
    foodName: 'Apple',
    calories: 95,
    notes: 'Fresh red apple for breakfast',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    type: 'food'
  },
  {
    id: '2', 
    foodName: 'Chicken Sandwich',
    calories: 320,
    notes: 'Grilled chicken breast with lettuce and tomato',
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    type: 'food'
  },
  {
    id: '3',
    foodName: 'Greek Yogurt',
    calories: 100,
    notes: 'Plain Greek yogurt with honey',
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    type: 'food'
  }
];

// Sample symptom entries
const sampleSymptomEntries = [
  {
    id: '4',
    symptomType: 'Bloating',
    severity: 'Mild',
    notes: 'Slight bloating after lunch',
    timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    type: 'symptom'
  },
  {
    id: '5',
    symptomType: 'Headache', 
    severity: 'Moderate',
    notes: 'Tension headache in the afternoon',
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    type: 'symptom'
  }
];

// Function to add sample data
export const addSampleData = async () => {
  try {
    console.log('Adding sample data...');
    
    // Add sample food entries
    for (const entry of sampleFoodEntries) {
      await saveFoodEntry(entry);
    }
    
    // Add sample symptom entries  
    for (const entry of sampleSymptomEntries) {
      await saveSymptomEntry(entry);
    }
    
    console.log('Sample data added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample data:', error);
    return false;
  }
};

// Function to check if sample data exists
export const hasSampleData = async () => {
  try {
    const { getFoodLogs, getSymptomLogs } = await import('./storage');
    const foodLogs = await getFoodLogs();
    const symptomLogs = await getSymptomLogs();
    
    return foodLogs.length > 0 || symptomLogs.length > 0;
  } catch (error) {
    console.error('Error checking sample data:', error);
    return false;
  }
};

export default {
  addSampleData,
  hasSampleData,
  sampleFoodEntries,
  sampleSymptomEntries
};