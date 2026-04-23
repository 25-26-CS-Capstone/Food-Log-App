import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { getAllLogs } from '../utils/storage';
import {
  exportLogsToFile, filterLogsByDateRange, generateExportSummary,
  generateExportReport, getExportedFiles, deleteExportedFile, formatFileSize,
  readExportedFile, getDownloadsDirectory
} from '../utils/dataExport';
import { supabase } from '../lib/supabase';
import * as Sharing from 'expo-sharing';
import { Stack } from 'expo-router';

const webCanShare = (() => {
  if (Platform.OS !== 'web') return false;
  if (!window.navigator?.canShare) return false;
  try {
    const testFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    return window.navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
})();

const canNativeShare = (file) => {
  if (Platform.OS !== 'web') return false;
  if (!window.navigator?.canShare) return false;
  try {
    const mimeType = file.format === 'CSV' ? 'text/csv'
      : file.format === 'JSON' ? 'application/json'
        : 'application/pdf';
    const testFile = new File(['test'], file.name, { type: mimeType });
    return window.navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
};

const DataExport = () => {
  const router = useRouter();
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Date range selection
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Export options
  const [exportFormat, setExportFormat] = useState('csv');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportText, setReportText] = useState('');

  // Exported files
  const [exportedFiles, setExportedFiles] = useState([]);
  const [fileViewModalVisible, setFileViewModalVisible] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    loadLogs();
    loadExportedFiles();
  }, []);

  useEffect(() => {
    updateFilteredLogs();
  }, [startDate, endDate, allLogs]);

  const loadExportedFiles = async () => {
    const files = await getExportedFiles();
    setExportedFiles(files);
  };

  const handleDeleteFile = async (file) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete this file? This cannot be undone.');
      if (!confirmed) return;
      const success = await deleteExportedFile(file);
      if (success) await loadExportedFiles();
      return;
    }

    Alert.alert(
      'Delete File',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteExportedFile(file);
            if (success) {
              Alert.alert('Success', 'File deleted');
              await loadExportedFiles();
            }
          },
        },
      ]
    );
  };

  const handleViewFile = async (file) => {
    if (!file) return;
    if (file.format === 'PDF') {
      setViewingFile(file);
      setFileContent('PDF preview is not available in this app. Use the button below to open or save the PDF.');
      setFileViewModalVisible(true);
      return;
    }

    setViewingFile(file);
    setIsLoadingFileContent(true);
    try {
      const content = await readExportedFile(file);
      setFileContent(content);
      setFileViewModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load file: ' + error.message);
    } finally {
      setIsLoadingFileContent(false);
    }
  };

  const handleDownloadFile = async (file = viewingFile) => {
    if (!file) return;

    if (Platform.OS === 'web') {
      if (file.format === 'PDF') {
        if (file.base64Content) {
          const html = decodeURIComponent(escape(atob(file.base64Content)));
          const printWindow = window.open('', '_blank', 'width=900,height=700');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 250);
          }
        } else {
          Alert.alert('PDF unavailable', 'File data is no longer available. Please re-export.');
        }
        return;
      }

      const mimeType = file.format === 'CSV' ? 'text/csv' : 'application/json';

      let blob;
      if (file.base64Content) {
        const bytes = Uint8Array.from(atob(file.base64Content), c => c.charCodeAt(0));
        blob = new Blob([bytes], { type: mimeType });
      } else if (file.uri?.startsWith('blob:')) {
        try {
          const res = await fetch(file.uri);
          blob = await res.blob();
        } catch {
          blob = null;
        }
      }

      if (!blob) {
        Alert.alert('Download unavailable', 'File data is no longer available. Please re-export.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (Platform.OS === 'android') {
      const directoryUri = await promptAndroidDirectorySelection();
      if (!directoryUri) {
        Alert.alert('Cancelled', 'No folder selected.');
        return;
      }

      try {
        const mimeType = file.format === 'CSV'
          ? 'text/csv'
          : file.format === 'JSON'
            ? 'application/json'
            : 'application/pdf';
        const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, file.name, mimeType);

        if (file.format === 'PDF') {
          const sourceUri = file.uri && file.uri.startsWith('/') ? `file://${file.uri}` : file.uri;
          try {
            await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
          } catch (copyError) {
            const base64Pdf = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.writeAsStringAsync(targetUri, base64Pdf, { encoding: FileSystem.EncodingType.Base64 });
          }
        } else {
          const contents = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          await FileSystem.writeAsStringAsync(targetUri, contents, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        }

        Alert.alert('Downloaded', 'File saved to the selected folder.');
      } catch (error) {
        Alert.alert('Error', 'Could not save file: ' + error.message);
      }
      return;
    }

    const normalizedUri = file.uri && file.uri.startsWith('/') ? `file://${file.uri}` : file.uri;
    try {
      await Linking.openURL(normalizedUri);
    } catch (error) {
      Alert.alert('Info', 'File saved to: ' + file.uri);
    }
  };

  const loadLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: foodData } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date_time', { ascending: false });

      const { data: symptomData } = await supabase
        .from('symptom_log')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date_time', { ascending: false });

      const logs = { foodLogs: foodData ?? [], symptomLogs: symptomData ?? [] };
      setAllLogs(logs);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading logs:', error);
      setIsLoading(false);
    }
  };

  const updateFilteredLogs = () => {
    const filtered = filterLogsByDateRange(allLogs, startDate, endDate);
    setFilteredLogs(filtered);

    const newSummary = generateExportSummary(allLogs, startDate, endDate);
    setSummary(newSummary);

    const report = generateExportReport(allLogs, startDate, endDate);
    setReportText(report);
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleWebDateChange = (isStart, dateStr) => {
    const date = new Date(dateStr);
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const buildExportFileName = (format, start, end) => {
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `FoodLog_${startKey}_to_${endKey}_${timestamp}.${format}`;
  };

  const handleShareFile = async (file) => {
    if (!file) return;
    try {
      const mimeType = file.format === 'CSV'
        ? 'text/csv'
        : file.format === 'JSON'
          ? 'application/json'
          : 'application/pdf';

      if (Platform.OS === 'web') {
        // Reconstruct blob from stored base64, or try the blob URL if still alive
        let blob;
        if (file.base64Content) {
          const bytes = Uint8Array.from(atob(file.base64Content), c => c.charCodeAt(0));
          blob = new Blob([bytes], { type: file.mimeType || mimeType });
        } else if (file.uri?.startsWith('blob:')) {
          try {
            const res = await fetch(file.uri);
            blob = await res.blob();
          } catch {
            blob = null;
          }
        }

        if (!blob) {
          Alert.alert('Share Unavailable', 'File data is no longer available. Please re-export.');
          return;
        }

        // PDF: open in new tab so the browser renders it natively
        if (file.format === 'PDF') {
          if (file.base64Content) {
            const html = decodeURIComponent(escape(atob(file.base64Content)));
            const printWindow = window.open('', '_blank', 'width=900,height=700');
            if (printWindow) {
              printWindow.document.write(html);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => printWindow.print(), 250);
            }
          } else {
            Alert.alert('PDF unavailable', 'File data is no longer available. Please re-export.');
          }
          return;
        }

        // Native share sheet if available (mobile browsers)
        if (canNativeShare(file)) {
          const shareFile = new File([blob], file.name, { type: mimeType });
          await window.navigator.share({ files: [shareFile], title: file.name });
          return;
        }

        // Fallback: re-trigger download (desktop browsers)
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Share Unavailable', 'Your device cannot share this file.');
        return;
      }

      let shareUri = file.uri;
      if (shareUri && shareUri.startsWith('/')) {
        shareUri = `file://${shareUri}`;
      }

      try {
        await Sharing.shareAsync(shareUri, {
          mimeType,
          dialogTitle: `Share ${file.name}`,
        });
      } catch (shareError) {
        console.warn('Share failed, retrying with copied cache file:', shareError);
        const sourceUri = file.uri && file.uri.startsWith('/') ? `file://${file.uri}` : file.uri;
        const fallbackUri = `${FileSystem.cacheDirectory}${file.name}`;
        await FileSystem.copyAsync({ from: sourceUri, to: fallbackUri });
        await Sharing.shareAsync(fallbackUri, {
          mimeType,
          dialogTitle: `Share ${file.name}`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share file: ' + error.message);
    }
  };

  const renderDatePicker = (isStartDate) => {
    const date = isStartDate ? startDate : endDate;
    if (Platform.OS === 'web') {
      const isoDate = date.toISOString().split('T')[0];
      return (
        <input
          type="date"
          value={isoDate}
          onChange={(e) => handleWebDateChange(isStartDate, e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            fontFamily: 'inherit',
            marginRight: isStartDate ? 12 : 0,
          }}
        />
      );
    }
    return null;
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      Alert.alert('No Data', 'No logs found in the selected date range');
      return;
    }
    setShowExportOptions(true);
  };

  const promptAndroidDirectorySelection = async () => {
    try {
      const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (perm.granted && perm.directoryUri) {
        return perm.directoryUri;
      }
    } catch (error) {
      console.warn('Directory selection failed:', error);
    }
    return null;
  };

  const handleExportSelection = async (action) => {
    setShowExportOptions(false);
    setIsExporting(true);

    const filename = buildExportFileName(exportFormat, startDate, endDate);
    let directory = getDownloadsDirectory();
    const options = { share: action === 'share', directoryUri: null, persist: action === 'download' };

    if (Platform.OS === 'android' && action === 'download') {
      const directoryUri = await promptAndroidDirectorySelection();
      if (!directoryUri) {
        Alert.alert('Cancelled', 'No folder selected.');
        setIsExporting(false);
        return;
      }
      options.directoryUri = directoryUri;
      directory = null;
    } else if (Platform.OS === 'android' && action === 'share') {
      // Use cache directory for share to avoid triggering file picker
      directory = FileSystem.cacheDirectory;
    }

    try {
      const result = await exportLogsToFile(filteredLogs, exportFormat, directory, filename, options);

      if (action === 'download') {
        let message = `Exported ${summary.foodLogsCount} food logs`;
        if (Platform.OS === 'web') {
          message = 'Your file should appear in your browser downloads.';
        }
        Alert.alert('Success', message, [{ text: 'OK', onPress: () => loadExportedFiles() }]);
      } else if (action === 'share') {
        await loadExportedFiles();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyReport = () => {
    if (Platform.OS === 'web') {
      const reportWindow = window.open('', '_blank', 'width=800,height=600');
      if (reportWindow) {
        reportWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word; padding: 20px; font-size: 12px;">${reportText}</pre>`);
        reportWindow.document.close();
      }
    } else {
      Alert.alert('Report Generated', reportText);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Export Data',
          headerStyle: { backgroundColor: "#056f46" },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>

          {Platform.OS === 'web' ? (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              {renderDatePicker(true)}
              {renderDatePicker(false)}
            </View>
          ) : (
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateLabel}>From:</Text>
                <Text style={styles.dateValue}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateLabel}>To:</Text>
                <Text style={styles.dateValue}>
                  {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS !== 'web' && showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={handleStartDateChange}
            />
          )}

          {Platform.OS !== 'web' && showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              onChange={handleEndDateChange}
            />
          )}

          <View style={styles.quickRanges}>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => {
                const newStart = new Date();
                newStart.setDate(newStart.getDate() - 7);
                setStartDate(newStart);
              }}
            >
              <Text style={styles.quickRangeText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => {
                const newStart = new Date();
                newStart.setDate(newStart.getDate() - 30);
                setStartDate(newStart);
              }}
            >
              <Text style={styles.quickRangeText}>Last 30 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => {
                const newStart = new Date();
                newStart.setDate(newStart.getDate() - 90);
                setStartDate(newStart);
              }}
            >
              <Text style={styles.quickRangeText}>Last 90 Days </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Stats */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Food Logs</Text>
                <Text style={styles.summaryValue}>{summary.foodLogsCount}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Days</Text>
                <Text style={styles.summaryValue}>{summary.totalDays}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Calories</Text>
                <Text style={styles.summaryValue}>{summary.totalCalories}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Avg/Day</Text>
                <Text style={styles.summaryValue}>{summary.avgCaloriesPerDay}</Text>
              </View>
            </View>

            {summary.mostCommonSymptoms.length > 0 && (
              <View style={styles.symptomsBox}>
                <Text style={styles.boxTitle}>Top Symptoms</Text>
                {summary.mostCommonSymptoms.map((symptom, idx) => (
                  <View key={idx} style={styles.symptomItem}>
                    <Text style={styles.symptomName}>{symptom.name}</Text>
                    <Text style={styles.symptomCount}>{symptom.count}x</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Export Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatButton, exportFormat === 'csv' && styles.formatButtonActive]}
              onPress={() => setExportFormat('csv')}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  exportFormat === 'csv' && styles.formatButtonTextActive,
                ]}
              >
                CSV
              </Text>
              <Text style={styles.formatDescription}>Spreadsheet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatButton, exportFormat === 'json' && styles.formatButtonActive]}
              onPress={() => setExportFormat('json')}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  exportFormat === 'json' && styles.formatButtonTextActive,
                ]}
              >
                JSON
              </Text>
              <Text style={styles.formatDescription}>Data Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatButton, exportFormat === 'pdf' && styles.formatButtonActive]}
              onPress={() => setExportFormat('pdf')}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  exportFormat === 'pdf' && styles.formatButtonTextActive,
                ]}
              >
                PDF
              </Text>
              <Text style={styles.formatDescription}>Portable Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.reportButton]}
            activeOpacity={0.7}
            onPress={handleCopyReport}
          >
            <Text style={styles.reportButtonText}>📋 View Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            activeOpacity={0.7}
            disabled={isExporting}
            onPress={handleExport}
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.exportButtonText}>📥 Export</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Exported Files */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📂 Exported Files</Text>
            {exportedFiles.length > 0 && (
              <Text style={styles.fileCount}>{exportedFiles.length}</Text>
            )}
          </View>
          {exportedFiles.length === 0 ? (
            <Text style={styles.emptyText}>No exported files yet</Text>
          ) : (
            <ScrollView style={styles.exportedFilesList} nestedScrollEnabled>
              {exportedFiles.map((file) => (
                <View key={file.uri} style={styles.fileItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {file.name.replace('FoodLog_', '').replace('.csv', '').replace('.json', '').replace('.pdf', '')}
                    </Text>
                    <Text style={styles.fileDetails}>
                      {file.format} • {formatFileSize(file.size)} • {new Date(file.modificationTime).toLocaleDateString()} • {file.location || 'Cache'}
                    </Text>
                    {file.dateRange ? (
                      <Text style={styles.fileRange}>Range: {file.dateRange}</Text>
                    ) : null}
                  </View>
                  <View style={styles.fileActions}>
                    <TouchableOpacity onPress={() => handleViewFile(file)} style={styles.textActionButton}>
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    {(Platform.OS !== 'web' || webCanShare) && (
                      <TouchableOpacity onPress={() => handleShareFile(file)} style={styles.textActionButton}>
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteFile(file)} style={styles.textActionButton}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ About Export</Text>
          <Text style={styles.infoText}>
            • CSV format is ideal for importing into Excel or Google Sheets{'\n'}
            • JSON format preserves all data and can be used as a backup{'\n'}
            • PDF format creates a portable report that is easy to review and share{'\n'}
            • Your data is exported locally and not sent to any server{'\n'}
            • You can share the exported file with your doctor
          </Text>
        </View>
      </ScrollView>
      {/* File Viewer Modal */}
      {fileViewModalVisible && viewingFile && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{viewingFile.name}</Text>
              <TouchableOpacity onPress={() => setFileViewModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoadingFileContent ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading file...</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.fileContentScroll}>
                  <Text style={styles.fileContentText}>{fileContent}</Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.downloadModalButton]}
                    onPress={() => handleDownloadFile(viewingFile)}
                  >
                    <Text style={styles.modalButtonText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.closeModalButton]}
                    onPress={() => setFileViewModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
      {showExportOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.exportOptionsModal}>
            <View style={styles.exportOptionsHeader}>
              <Text style={styles.exportOptionsTitle}>Export Options</Text>
              <TouchableOpacity onPress={() => setShowExportOptions(false)}>
                <Text style={styles.exportOptionsClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.exportOptionsMessage}>Choose how you want to export this file.</Text>
            <TouchableOpacity
              style={styles.downloadOptionButton}
              activeOpacity={0.8}
              onPress={() => handleExportSelection('download')}
            >
              <Text style={styles.downloadOptionButtonText}>📥 Download</Text>
            </TouchableOpacity>
            {(Platform.OS !== 'web' || webCanShare) && (
              <TouchableOpacity
                style={styles.shareOptionButton}
                activeOpacity={0.8}
                onPress={() => handleExportSelection('share')}
              >
                <Text style={styles.shareOptionButtonText}>📤 Share File</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  quickRanges: {
    flexDirection: 'row',
    gap: 8,
  },
  quickRangeButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  symptomsBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  symptomName: {
    fontSize: 12,
    color: '#BF360C',
  },
  symptomCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  formatButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  formatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  formatButtonTextActive: {
    color: '#2196F3',
  },
  formatDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  exportedFilesList: {
    maxHeight: 260,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fileRange: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  exportOptionsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 24,
  },
  exportOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportOptionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  exportOptionsClose: {
    fontSize: 24,
    color: '#999',
  },
  exportOptionsMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  downloadOptionButton: {
    backgroundColor: '#4ECDC4',
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  downloadOptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  shareOptionButton: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  shareOptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelOptionButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelOptionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#4ECDC4',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1B5E20',
    lineHeight: 18,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  textActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingTop: 16,
    paddingBottom: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
  },
  fileContentScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fileContentText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadModalButton: {
    backgroundColor: '#007AFF',
  },
  closeModalButton: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
  },
});

export default DataExport;
