import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const WEB_EXPORTED_FILES_KEY = 'FoodLogWebExportedFiles';

const parseDateRangeFromFilename = (filename) => {
  const match = filename.match(/^FoodLog_(\d{4}-\d{2}-\d{2})_to_(\d{4}-\d{2}-\d{2})_/);
  if (match) {
    return `${match[1]} - ${match[2]}`;
  }
  return '';
};

const saveWebExportMetadata = async (metadata) => {
  try {
    const existing = await AsyncStorage.getItem(WEB_EXPORTED_FILES_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(metadata);
    await AsyncStorage.setItem(WEB_EXPORTED_FILES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error saving web export metadata:', error);
  }
};

const getWebExportedFiles = async () => {
  try {
    const stored = await AsyncStorage.getItem(WEB_EXPORTED_FILES_KEY);
    if (!stored) return [];
    const list = JSON.parse(stored);
    return list.sort((a, b) => b.modificationTime - a.modificationTime);
  } catch (error) {
    console.error('Error reading web export metadata:', error);
    return [];
  }
};

const removeWebExportedFile = async (filename) => {
  try {
    const stored = await AsyncStorage.getItem(WEB_EXPORTED_FILES_KEY);
    if (!stored) return;
    const list = JSON.parse(stored).filter(item => item.name !== filename);
    await AsyncStorage.setItem(WEB_EXPORTED_FILES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error removing web export metadata:', error);
  }
};

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const NATIVE_EXPORTED_FILES_KEY = 'FoodLogNativeExportedFiles';

const saveNativeExportMetadata = async (metadata) => {
  try {
    const existing = await AsyncStorage.getItem(NATIVE_EXPORTED_FILES_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(metadata);
    await AsyncStorage.setItem(NATIVE_EXPORTED_FILES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error saving native export metadata:', error);
  }
};

const getNativeExportedFiles = async () => {
  try {
    const stored = await AsyncStorage.getItem(NATIVE_EXPORTED_FILES_KEY);
    if (!stored) return [];
    const list = JSON.parse(stored);
    return list.sort((a, b) => b.modificationTime - a.modificationTime);
  } catch (error) {
    console.error('Error reading native export metadata:', error);
    return [];
  }
};

const removeNativeExportedFile = async (filename) => {
  try {
    const stored = await AsyncStorage.getItem(NATIVE_EXPORTED_FILES_KEY);
    if (!stored) return;
    const list = JSON.parse(stored).filter(item => item.name !== filename);
    await AsyncStorage.setItem(NATIVE_EXPORTED_FILES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error removing native export metadata:', error);
  }
};

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
      const carbs = log.carbs || '';
      const protein = log.protein || '';
      const fat = log.fat || '';
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


const buildPDFHtml = (logs) => {
  const normalized = normalizeLogs(logs);
  const foodLogs = normalized.filter(l => l.type === 'food');
  const symptomLogs = normalized.filter(l => l.type === 'symptom');
  const titleDate = new Date().toLocaleString();

  const rowHtml = (cells) => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
  const foodRows = foodLogs.map((log) => {
    const date = new Date(log.timestamp);
    return rowHtml([
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      log.foodName || '',
      log.calories || log.usdaData?.calories || '',
      log.carbs || '',
      log.protein || '',
      log.fat || '',
      log.usdaData?.fiber || '',
      log.usdaData?.sugar || '',
      log.usdaData?.sodium || '',
      (log.notes || '').replace(/\s+/g, ' ').trim(),
    ]);
  }).join('');

  const symptomRows = symptomLogs.map((log) => {
    const date = new Date(log.timestamp);
    return rowHtml([
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      log.symptomName || '',
      log.severity || '',
      (log.notes || '').replace(/\s+/g, ' ').trim(),
    ]);
  }).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Food Log Export</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 24px; }
  h1, h2 { color: #0a6d6e; }
  p { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  th { background: #f2f2f2; }
  .section-note { font-size: 12px; color: #555; margin-bottom: 16px; }
</style>
</head>
<body>
  <h1>Food Log Export</h1>
  <p class="section-note">Generated: ${titleDate}</p>
  <h2>Food Logs</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Food</th>
        <th>Calories</th>
        <th>Carbs</th>
        <th>Protein</th>
        <th>Fat</th>
        <th>Fiber</th>
        <th>Sugar</th>
        <th>Sodium</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${foodRows || '<tr><td colspan="11">No food logs found for this range.</td></tr>'}
    </tbody>
  </table>
  <h2>Symptom Logs</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Symptom</th>
        <th>Severity</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${symptomRows || '<tr><td colspan="5">No symptom logs found for this range.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;
};

/**
 * Export logs to a file
 * @param {Array} logs - Logs to export
 * @param {string} format - File format ('csv' or 'json')
 * @param {string} customDirectory - Optional custom directory path. Defaults to Documents.
 * @returns {Promise<boolean>} True if export successful
 */
export const exportLogsToFile = async (logs, format = 'csv', customDirectory = null, customFilename = null, options = { share: false, directoryUri: null, persist: true }) => {
  try {
    const filename = customFilename || `FoodLog_${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'application/pdf';

    // Web platform: use browser download APIs
    if (Platform.OS === 'web') {
      let metadata = {
        name: filename,
        size: 0,
        uri: filename,
        modificationTime: Date.now(),
        format: format === 'csv' ? 'CSV' : format === 'json' ? 'JSON' : 'PDF',
        location: 'Web',
        dateRange: parseDateRangeFromFilename(filename),
      };

      if (format === 'pdf') {
        const html = buildPDFHtml(logs);
        const blob = new Blob([html], { type: 'text/html' });
        metadata.size = blob.size;
        metadata.mimeType = 'text/html';
        metadata.base64Content = btoa(unescape(encodeURIComponent(html)));

        if (options.share) {
          throw new Error('PDF sharing is not supported in this browser');
        }

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 250);
        }
      } else {
        const data = formatLogsForExport(logs, format);
        const blob = new Blob([data], { type: mimeType });
        metadata.size = blob.size;
        metadata.mimeType = mimeType;
        metadata.base64Content = await blobToBase64(blob);
        const url = URL.createObjectURL(blob);
        metadata.uri = url;

        if (options.share) {
          const shareFile = new File([blob], filename, { type: mimeType });
          if (window.navigator?.canShare?.({ files: [shareFile] })) {
            await window.navigator.share({ files: [shareFile], title: filename });
            return true;
          }
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return true;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await saveWebExportMetadata(metadata);
      }

      if (format === 'pdf') {
        await saveWebExportMetadata(metadata);
      }

      return true;
    }

    // Native platforms: use FileSystem API
    let directory = customDirectory || getDownloadsDirectory() || FileSystem.cacheDirectory;
    if (!directory && !options.directoryUri) {
      throw new Error('No accessible file system directory available');
    }

    const isPdf = format === 'pdf';
    let filepath = options.directoryUri ? null : `${directory}${filename}`;

    if (options.directoryUri && Platform.OS === 'android') {
      if (isPdf) {
        const { uri } = await Print.printToFileAsync({ html: buildPDFHtml(logs) });
        try {
          const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(options.directoryUri, filename, mimeType);
          await FileSystem.copyAsync({ from: uri, to: targetUri });
          filepath = targetUri;
        } catch (copyErr) {
          console.warn('Could not save PDF to selected folder, using generated file URI instead.', copyErr);
          filepath = uri;
        }
      } else {
        const data = formatLogsForExport(logs, format);
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(options.directoryUri, filename, mimeType);
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        filepath = fileUri;
      }
    } else {
      if (isPdf) {
        const { uri } = await Print.printToFileAsync({ html: buildPDFHtml(logs) });
        filepath = uri;

        if (directory && !uri.startsWith(directory)) {
          try {
            const dirInfo = await FileSystem.getInfoAsync(directory);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
            }
            const targetPath = `${directory}${filename}`;
            await FileSystem.copyAsync({ from: uri, to: targetPath });
            filepath = targetPath;
          } catch (copyErr) {
            console.warn('Could not copy PDF to target directory; using generated file URI instead.', copyErr);
          }
        }
      } else {
        const data = formatLogsForExport(logs, format);

        if (Platform.OS === 'android' && directory && directory.startsWith('/storage')) {
          try {
            const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (perm.granted && perm.directoryUri) {
              const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(perm.directoryUri, filename, mimeType);
              await FileSystem.writeAsStringAsync(fileUri, data, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              filepath = fileUri;
            } else {
              throw new Error('Directory permission not granted');
            }
          } catch (safErr) {
            console.warn('SAF write failed, falling back to cache write:', safErr);
            const fallbackPath = `${FileSystem.cacheDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(fallbackPath, data, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            try {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) await Sharing.shareAsync(fallbackPath, { mimeType });
            } catch (shareErr) {
              console.warn('Sharing fallback failed:', shareErr);
            }
            return fallbackPath;
          }
        } else {
          try {
            const dirInfo = await FileSystem.getInfoAsync(directory);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
            }
          } catch (dirErr) {
            console.warn('Could not create directory:', dirErr);
          }
          filepath = `${directory}${filename}`;
          await FileSystem.writeAsStringAsync(filepath, data, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        }
      }
    }

    console.log('Export: using directory:', directory);
    console.log('Export: writing to:', filepath);

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

    const fileMetadata = {
      name: filename,
      size: fileInfo.size || 0,
      uri: filepath,
      modificationTime: Date.now(),
      format: format === 'csv' ? 'CSV' : format === 'json' ? 'JSON' : 'PDF',
      location: options.directoryUri ? 'Custom Folder' : (directory === FileSystem.cacheDirectory ? 'Cache' : 'Downloads'),
      dateRange: parseDateRangeFromFilename(filename),
    };

    if (options.share) {
      const canShare = await Sharing.isAvailableAsync();
      console.log('Export: canShare =', canShare);
      if (canShare) {
        try {
          await Sharing.shareAsync(filepath, {
            mimeType,
            dialogTitle: `Share ${filename}`,
          });
        } catch (shareError) {
          console.warn('Export: sharing not available for this file location:', shareError.message);
        }
      } else {
        console.log('Export: sharing not available on this platform');
      }
    }

    if (options.persist) {
      await saveNativeExportMetadata(fileMetadata);
    }

    return filepath;
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
  // Handle new Supabase shape { foodLogs: [], symptomLogs: [] }
  if (logs && !Array.isArray(logs) && (logs.foodLogs || logs.symptomLogs)) {
    const food = (logs.foodLogs ?? []).map(l => ({
      ...l,
      type: 'food',
      timestamp: l.date_time,
      foodName: l.food_name,
      mealType: l.meal_type,
    }));
    const symptoms = (logs.symptomLogs ?? []).map(l => ({
      ...l,
      type: 'symptom',
      timestamp: l.date_time,
      symptomName: l.symptom,
    }));
    return [...food, ...symptoms];
  }
  // Fallback for flat arrays (legacy)
  return (logs ?? []).map(l => ({
    ...l,
    type: deriveType(l),
    timestamp: deriveTimestamp(l),
    foodName: l.food_name ?? l.foodName,
    mealType: l.meal_type ?? l.mealType,
    symptomName: l.symptom ?? l.symptomName,
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
    totalCalories += Number(log.calories) || 0;
    totalCarbs += Number(log.carbs) || 0;
    totalProtein += Number(log.protein) || 0;
    totalFat += Number(log.fat) || 0;
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
    if (log.type === 'food') {
      const date = new Date(log.timestamp).toLocaleDateString();
      days.add(date);
    }
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
    if (Platform.OS === 'web') {
      return await getWebExportedFiles();
    }

    return await getNativeExportedFiles();
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
export const deleteExportedFile = async (fileOrPath) => {
  try {
    if (Platform.OS === 'web') {
      const filename = fileOrPath?.name || fileOrPath;
      await removeWebExportedFile(filename);
      console.log('Deleted web export metadata:', filename);
      return true;
    }

    let filename;
    let uri;

    if (fileOrPath && typeof fileOrPath === 'object') {
      filename = fileOrPath.name;
      uri = fileOrPath.uri;
    } else {
      uri = fileOrPath;
      if (typeof fileOrPath === 'string') {
        const segments = fileOrPath.split('/');
        filename = segments[segments.length - 1];
      }
    }

    if (filename) {
      await removeNativeExportedFile(filename);
    }

    try {
      if (uri) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (delErr) {
      console.warn('Could not delete file from system:', delErr);
    }

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
export const readExportedFile = async (fileOrPath) => {
  try {
    if (Platform.OS === 'web') {
      if (fileOrPath?.base64Content) return atob(fileOrPath.base64Content);
      return 'File preview unavailable — please re-export.';
    }
    const filepath = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath.uri;
    return await FileSystem.readAsStringAsync(filepath);
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
