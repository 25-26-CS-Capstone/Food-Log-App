import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Convert logs to CSV format
 * @param {Array} logs - Array of food/symptom log objects
 * @param {string} format - 'csv' or 'json'
 * @returns {string} Formatted export data
 */
export const formatLogsForExport = (logs, format = 'csv') => {
  if (format === 'json') {
    return JSON.stringify(logs, null, 2);
  }

  // CSV format
  return logsToCSV(logs);
};

/**
 * Convert logs array to CSV string
 * @param {Array} logs - Food and symptom logs
 * @returns {string} CSV formatted string
 */
export const logsToCSV = (logs) => {
  if (!logs || logs.length === 0) {
    return 'No logs to export';
  }

  // Separate food and symptom logs for better organization
  const foodLogs = logs.filter(l => l.type === 'food');
  const symptomLogs = logs.filter(l => l.type === 'symptom');

  let csv = '';

  // Food Logs Section
  if (foodLogs.length > 0) {
    csv += 'FOOD LOGS\n';
    csv += 'Date,Time,Food Name,Calories,Carbs,Protein,Fat,Fiber,Sugar,Sodium,Notes\n';
    
    foodLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('en-US');
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const calories = log.calories || log.usdaData?.calories || '';
      const carbs = log.usdaData?.carbs || '';
      const protein = log.usdaData?.protein || '';
      const fat = log.usdaData?.fat || '';
      const fiber = log.usdaData?.fiber || '';
      const sugar = log.usdaData?.sugar || '';
      const sodium = log.usdaData?.sodium || '';
      const notes = (log.notes || '').replace(/,/g, ';'); // Escape commas

      csv += `${dateStr},${timeStr},"${log.foodName}",${calories},${carbs},${protein},${fat},${fiber},${sugar},${sodium},"${notes}"\n`;
    });
    
    csv += '\n\n';
  }

  // Symptom Logs Section
  if (symptomLogs.length > 0) {
    csv += 'SYMPTOM LOGS\n';
    csv += 'Date,Time,Symptom,Severity,Notes\n';
    
    symptomLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('en-US');
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const notes = (log.notes || '').replace(/,/g, ';'); // Escape commas

      csv += `${dateStr},${timeStr},"${log.symptomName}","${log.severity}","${notes}"\n`;
    });
  }

  return csv;
};

/**
 * Export logs to a file and share
 * @param {Array} logs - Logs to export
 * @param {string} format - File format ('csv' or 'json')
 * @returns {Promise<boolean>} True if export successful
 */
export const exportLogsToFile = async (logs, format = 'csv') => {
  try {
    const filename = `FoodLog_${new Date().toISOString().split('T')[0]}.${format}`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    // Format data
    const data = formatLogsForExport(logs, format);

    // Write to file
    await FileSystem.writeAsStringAsync(filepath, data, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filepath, {
        mimeType: format === 'csv' ? 'text/csv' : 'application/json',
        dialogTitle: `Share ${filename}`,
      });
    }

    return true;
  } catch (error) {
    console.error('Error exporting logs:', error);
    throw error;
  }
};

/**
 * Filter logs by date range
 * @param {Array} logs - All logs
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @returns {Array} Filtered logs
 */
export const filterLogsByDateRange = (logs, startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
};

/**
 * Generate export summary statistics
 * @param {Array} logs - Logs to summarize
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {Object} Export summary
 */
export const generateExportSummary = (logs, startDate, endDate) => {
  const logsToAnalyze = startDate && endDate
    ? filterLogsByDateRange(logs, startDate, endDate)
    : logs;

  const foodLogs = logsToAnalyze.filter(l => l.type === 'food');
  const symptomLogs = logsToAnalyze.filter(l => l.type === 'symptom');

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  foodLogs.forEach(log => {
    totalCalories += log.calories || log.usdaData?.calories || 0;
    totalCarbs += log.usdaData?.carbs || 0;
    totalProtein += log.usdaData?.protein || 0;
    totalFat += log.usdaData?.fat || 0;
  });

  const avgCaloriesPerDay = foodLogs.length > 0
    ? Math.round(totalCalories / Math.max(1, getUniqueDays(logsToAnalyze)))
    : 0;

  const symptomTypes = {};
  symptomLogs.forEach(log => {
    symptomTypes[log.symptomName] = (symptomTypes[log.symptomName] || 0) + 1;
  });

  return {
    dateRange: startDate && endDate
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : 'All Time',
    totalDays: getUniqueDays(logsToAnalyze),
    foodLogsCount: foodLogs.length,
    symptomLogsCount: symptomLogs.length,
    totalCalories: Math.round(totalCalories),
    totalCarbs: Math.round(totalCarbs),
    totalProtein: Math.round(totalProtein),
    totalFat: Math.round(totalFat),
    avgCaloriesPerDay,
    mostCommonSymptoms: Object.entries(symptomTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
  };
};

/**
 * Count unique days in logs
 * @param {Array} logs - Logs array
 * @returns {number} Number of unique days
 */
const getUniqueDays = (logs) => {
  const days = new Set();
  logs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString();
    days.add(date);
  });
  return days.size;
};

/**
 * Generate detailed export report as text
 * @param {Array} logs - Logs to include
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {string} Text report
 */
export const generateExportReport = (logs, startDate, endDate) => {
  const summary = generateExportSummary(logs, startDate, endDate);
  
  let report = '═══════════════════════════════════════\n';
  report += '         FOOD LOG EXPORT REPORT\n';
  report += '═══════════════════════════════════════\n\n';

  report += `Export Date: ${new Date().toLocaleString()}\n`;
  report += `Date Range: ${summary.dateRange}\n\n`;

  report += '─ SUMMARY ─\n';
  report += `Total Days Logged: ${summary.totalDays}\n`;
  report += `Food Entries: ${summary.foodLogsCount}\n`;
  report += `Symptom Entries: ${summary.symptomLogsCount}\n\n`;

  report += '─ NUTRITION TOTALS ─\n';
  report += `Total Calories: ${summary.totalCalories} kcal\n`;
  report += `Total Carbs: ${summary.totalCarbs}g\n`;
  report += `Total Protein: ${summary.totalProtein}g\n`;
  report += `Total Fat: ${summary.totalFat}g\n`;
  report += `Average Calories/Day: ${summary.avgCaloriesPerDay} kcal\n\n`;

  if (summary.mostCommonSymptoms.length > 0) {
    report += '─ MOST COMMON SYMPTOMS ─\n';
    summary.mostCommonSymptoms.forEach((symptom, idx) => {
      report += `${idx + 1}. ${symptom.name}: ${symptom.count} times\n`;
    });
  }

  report += '\n═══════════════════════════════════════\n';

  return report;
};

export default {
  formatLogsForExport,
  logsToCSV,
  exportLogsToFile,
  filterLogsByDateRange,
  generateExportSummary,
  generateExportReport,
};
