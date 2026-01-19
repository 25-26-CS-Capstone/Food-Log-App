import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getAllLogs } from '../utils/storage';
import {
  exportLogsToFile,
  filterLogsByDateRange,
  generateExportSummary,
  generateExportReport,
} from '../utils/dataExport';

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

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    updateFilteredLogs();
  }, [startDate, endDate, allLogs]);

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

    setIsExporting(true);
    try {
      await exportLogsToFile(filteredLogs, exportFormat);
      Alert.alert(
        'Success',
        `Exported ${filteredLogs.length} logs as ${exportFormat.toUpperCase()}`
      );
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
          <Text style={styles.title}>📊 Export Data</Text>
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
                <Text style={styles.summaryLabel}>Logs</Text>
                <Text style={styles.summaryValue}>{filteredLogs.length}</Text>
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
});

export default DataExport;
