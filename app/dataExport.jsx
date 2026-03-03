import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { getAllLogs } from '../utils/storage';
import {exportLogsToFile, filterLogsByDateRange, generateExportSummary,
generateExportReport, getExportedFiles, deleteExportedFile, formatFileSize,
readExportedFile, getDownloadsDirectory} from '../utils/dataExport';
import { FlatList } from 'react-native';

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

  const handleDeleteFile = async (filepath) => {
    Alert.alert(
      'Delete File',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteExportedFile(filepath);
            if (success) {
              Alert.alert('Success', 'File deleted');
              await loadExportedFiles(); // Reload list
            }
          },
        },
      ]
    );
  };

  const handleViewFile = async (file) => {
    setViewingFile(file);
    setIsLoadingFileContent(true);
    try {
      const content = await readExportedFile(file.uri);
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
    try {
      await Sharing.shareAsync(file.uri, {
        mimeType: file.format === 'CSV' ? 'text/csv' : 'application/json',
        dialogTitle: `Download ${file.name}`,
      });
    } catch (error) {
      Alert.alert('Info', 'File saved to: ' + viewingFile.uri);
    }
  };

  const loadLogs = async () => {
    try {
      const logs = await getAllLogs();
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

  const handleExport = async () => {
    if (filteredLogs.length === 0) {
      Alert.alert('No Data', 'No logs found in the selected date range');
      return;
    }
    Alert.alert(
      'Choose Save Location',
      'Where would you like to save the exported file?',
      [
        { text: 'Downloads (Recommended)', onPress: () => doExport(getDownloadsDirectory()) },
        { text: 'App Cache', onPress: () => doExport(FileSystem.cacheDirectory) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const doExport = async (directory) => {
    setIsExporting(true);
    try {
      await exportLogsToFile(filteredLogs, exportFormat, directory);
      Alert.alert('Success', `Exported ${summary.foodLogsCount} food logs`);
      // Add delay to ensure file system updates before reload
      setTimeout(() => loadExportedFiles(), 500);
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyReport = () => {
    // This would typically use clipboard, but for now we'll just show an alert
    Alert.alert('Report Generated', reportText);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Data 📊</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          
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

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={handleStartDateChange}
            />
          )}

          {showEndPicker && (
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
                newStart.setMonth(newStart.getMonth() - 1);
                setStartDate(newStart);
              }}
            >
              <Text style={styles.quickRangeText}>Last Month</Text>
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
          </View>
        </View>

        {/* Export Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.reportButton]}
            onPress={handleCopyReport}
          >
            <Text style={styles.reportButtonText}>📋 View Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            disabled={isExporting}
            onPress={handleExport}
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.exportButtonText}>📥 Export & Share</Text>
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
            exportedFiles.map((file) => (
              <View key={file.uri} style={styles.fileItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName}>
                    {file.name.replace('FoodLog_', '').replace('.csv', '').replace('.json', '')}
                  </Text>
                  <Text style={styles.fileDetails}>
                    {file.format} • {formatFileSize(file.size)} • {new Date(file.modificationTime).toLocaleDateString()} • {file.location || 'Cache'}
                  </Text>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity onPress={() => handleViewFile(file)} style={styles.textActionButton}>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDownloadFile(file)} style={styles.textActionButton}>
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteFile(file.uri)} style={styles.textActionButton}>
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ About Export</Text>
          <Text style={styles.infoText}>
            • CSV format is ideal for importing into Excel or Google Sheets{'\n'}
            • JSON format preserves all data and can be used as a backup{'\n'}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
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
  },
  formatButtonTextActive: {
    color: '#2196F3',
  },
  formatDescription: {
    fontSize: 12,
    color: '#999',
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
