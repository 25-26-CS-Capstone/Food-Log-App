import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Get user-accessible downloads directory
 * On Android: /storage/emulated/0/Download/FoodLogApp/
 * On iOS: Uses documentDirectory (app sandbox)
 */
export const getDownloadsDirectory = () => {
  if (Platform.OS === 'android') {
    return `/storage/emulated/0/Download/FoodLogApp/`;
  }
  return FileSystem.documentDirectory;
};

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

  const normalized = normalizeLogs(logs);

  // Separate food and symptom logs for better organization
  const foodLogs = normalized.filter(l => l.type === 'food');
  const symptomLogs = normalized.filter(l => l.type === 'symptom');

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
 * Export logs to a file
 * @param {Array} logs - Logs to export
 * @param {string} format - File format ('csv' or 'json')
 * @param {string} customDirectory - Optional custom directory path. Defaults to Documents.
 * @returns {Promise<boolean>} True if export successful
 */
export const exportLogsToFile = async (logs, format = 'csv', customDirectory = null) => {
  try {
    const filename = `FoodLog_${new Date().toISOString().split('T')[0]}.${format}`;
    // Use custom directory if provided, otherwise default to Downloads (user-accessible)
    // Fall back to cache if Downloads not available
    let directory = customDirectory || getDownloadsDirectory() || FileSystem.cacheDirectory;
    if (!directory) {
      throw new Error('No accessible file system directory available');
    }

    // Format data
    const data = formatLogsForExport(logs, format);

    // On Android, writing directly to /storage may be denied by scoped storage.
    // Try Storage Access Framework (SAF) first when targeting Downloads, otherwise write normally.
    let filepath = `${directory}${filename}`;
    if (Platform.OS === 'android' && directory && directory.startsWith('/storage')) {
      try {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted && perm.directoryUri) {
          const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(perm.directoryUri, filename, mimeType);
          await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
          filepath = fileUri; // content:// URI
        } else {
          throw new Error('Directory permission not granted');
        }
      } catch (safErr) {
        console.warn('SAF write failed, falling back to cache write:', safErr);
        // Fallback: write to cache and attempt to share so user can save externally
        const fallbackPath = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fallbackPath, data, { encoding: FileSystem.EncodingType.UTF8 });
        // Try to prompt user to save/share the file
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) await Sharing.shareAsync(fallbackPath);
        } catch (shareErr) {
          console.warn('Sharing fallback failed:', shareErr);
        }
        // Return early with fallback path
        return fallbackPath;
      }
    } else {
      // Ensure directory exists for normal paths
      try {
        const dirInfo = await FileSystem.getInfoAsync(directory);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        }
      } catch (dirErr) {
        console.warn('Could not create directory:', dirErr);
      }
      filepath = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(filepath, data, { encoding: FileSystem.EncodingType.UTF8 });
    }

    console.log('Export: using directory:', directory);
    console.log('Export: writing to:', filepath);

    // Verify file was written
    let fileInfo;
    try {
      fileInfo = await FileSystem.getInfoAsync(filepath);
      console.log('Export: file info:', fileInfo);
    } catch (infoErr) {
      console.error('Export: getInfoAsync failed:', infoErr);
      throw new Error(`Failed to verify file: ${infoErr.message}`);
    }
    
    if (!fileInfo.exists) {
      throw new Error('File was created but does not exist - verify permissions');
    }
    
    const normalized = normalizeLogs(logs);
    const foodCount = normalized.filter(l => l.type === 'food').length;
    const symptomCount = normalized.filter(l => l.type === 'symptom').length;
    
    console.log(`Export: success - ${foodCount} food & ${symptomCount} symptom logs to ${filepath}`);

    // Share the file if available (native platforms)
    const canShare = await Sharing.isAvailableAsync();
    console.log('Export: canShare =', canShare);
    if (canShare) {
      try {
        await Sharing.shareAsync(filepath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: `Share ${filename}`,
        });
      } catch (shareError) {
        // On Android, app-private cache files can't be shared this way.
        // The file is still created successfully; just log the error.
        console.warn('Export: sharing not available for this file location:', shareError.message);
      }
    } else {
      console.log('Export: sharing not available on this platform');
    }

    return true;
  } catch (error) {
    console.error('Export: fatal error:', error);
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
// helpers for backwards compatibility with older log entries that didn't include
// `type` or `timestamp` fields.  New logs created by food_log.jsx now include
// those properties, but existing records may still rely on `date`,
// `symptomDate`, etc.
const deriveType = (log) => {
  if (log.type) return log.type;
  if (log.symptom || log.symptomName) return 'symptom';
  if (log.mealType) return 'food';
  return 'food';
};

const deriveTimestamp = (log) => {
  if (log.timestamp) return log.timestamp;
  if (log.date) return log.date;
  if (log.symptomDate) return log.symptomDate;
  return new Date().toISOString();
};

const normalizeLogs = (logs) => {
  return logs.map(log => ({
    ...log,
    type: deriveType(log),
    timestamp: deriveTimestamp(log),
  }));
};

export const filterLogsByDateRange = (logs, startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return normalizeLogs(logs).filter(log => {
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
  // normalize so later code can rely on type/timestamp
  const all = normalizeLogs(logs);
  const logsToAnalyze = startDate && endDate
    ? filterLogsByDateRange(all, startDate, endDate)
    : all;

  const foodLogs = logsToAnalyze.filter(l => l.type === 'food');
  const symptomLogs = logsToAnalyze.filter(l => l.type === 'symptom');

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  foodLogs.forEach(log => {
    totalCalories += log.calories || log.usdaData?.calories || log.product?.calories || 0;
    totalCarbs += log.usdaData?.carbs || 0;
    totalProtein += log.usdaData?.protein || 0;
    totalFat += log.usdaData?.fat || 0;
  });

  const avgCaloriesPerDay = foodLogs.length > 0
    ? Math.round(totalCalories / Math.max(1, getUniqueDays(logsToAnalyze)))
    : 0;

  const symptomTypes = {};
  symptomLogs.forEach(log => {
    const name = log.symptomName || log.symptom;
    symptomTypes[name] = (symptomTypes[name] || 0) + 1;
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

export const getExportedFiles = async () => {
  try {
    const allFiles = [];
    const directories = [
      { path: getDownloadsDirectory(), label: 'Downloads' },
      { path: FileSystem.cacheDirectory, label: 'Cache' },
    ];

    for (const dir of directories) {
      if (!dir.path) continue;
      try {
        const files = await FileSystem.readDirectoryAsync(dir.path);
        console.log(`${dir.label} directory contents:`, files);
        
        // Filter for CSV and JSON export files
        const exportFiles = files.filter(f => f.startsWith('FoodLog_') && (f.endsWith('.csv') || f.endsWith('.json')));
        
        // Get info for each file
        const fileInfos = await Promise.all(
          exportFiles.map(async (filename) => {
            const filepath = `${dir.path}${filename}`;
            const info = await FileSystem.getInfoAsync(filepath);
            return {
              name: filename,
              size: info.size || 0,
              uri: filepath,
              modificationTime: info.modificationTime || 0,
              format: filename.endsWith('.csv') ? 'CSV' : 'JSON',
              location: dir.label,
            };
          })
        );
        allFiles.push(...fileInfos);
      } catch (error) {
        console.log(`Error reading ${dir.label} directory:`, error);
      }
    }
    
    // Sort by modification time (newest first)
    return allFiles.sort((a, b) => b.modificationTime - a.modificationTime);
  } catch (error) {
    console.error('Error getting exported files:', error);
    return [];
  }
};

/**
 * Delete an exported file
 * @param {string} filepath - Full path to file to delete
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteExportedFile = async (filepath) => {
  try {
    await FileSystem.deleteAsync(filepath);
    console.log('Deleted:', filepath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Read exported file content
 * @param {string} filepath - Full path to file
 * @returns {Promise<string>} File contents
 */
export const readExportedFile = async (filepath) => {
  try {
    const content = await FileSystem.readAsStringAsync(filepath);
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

/**
 * Format file size for display (bytes to KB/MB)
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default {
  formatLogsForExport,
  logsToCSV,
  exportLogsToFile,
  filterLogsByDateRange,
  generateExportSummary,
  generateExportReport,
  getExportedFiles,
  deleteExportedFile,
  readExportedFile,
  formatFileSize,
};
