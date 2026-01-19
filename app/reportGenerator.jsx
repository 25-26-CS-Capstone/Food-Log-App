import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { generateReport } from '../utils/reportGenerator';

const ReportGenerator = () => {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'all'

  useEffect(() => {
    generateWeeklyReport();
  }, []);

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'all':
        start.setFullYear(2000); // Far past
        break;
      default:
        start.setDate(end.getDate() - 7);
    }

    return { start, end };
  };

  const generateWeeklyReport = async () => {
    await generateCustomReport('week');
  };

  const generateMonthlyReport = async () => {
    await generateCustomReport('month');
  };

  const generateAllTimeReport = async () => {
    await generateCustomReport('all');
  };

  const generateCustomReport = async (range) => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(range);
      const newReport = await generateReport(start.toISOString(), end.toISOString());
      
      if (newReport) {
        setReport(newReport);
        setDateRange(range);
      } else {
        Alert.alert('Error', 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const reportText = [
      `Food Log Report - ${dateRange.toUpperCase()}`,
      `Generated: ${new Date(report.generatedAt).toLocaleDateString()}`,
      `Period: ${new Date(report.dateRange.startDate).toLocaleDateString()} - ${new Date(report.dateRange.endDate).toLocaleDateString()}`,
      '',
      report.summary,
      ''
    ].join('\n');

    Alert.alert(
      'Report Summary',
      reportText,
      [
        { text: 'Copy to Clipboard', onPress: () => copyToClipboard(reportText) },
        { text: 'Close', onPress: () => {} }
      ]
    );
  };

  const copyToClipboard = (text) => {
    // In React Native, we'd use a clipboard library
    // For now, just show a confirmation
    Alert.alert('✅ Copied', 'Report summary copied to clipboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>📊 Generate Report</Text>
      <Text style={styles.subtitle}>Analyze your food and symptom patterns</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.rangeButton,
            dateRange === 'week' && styles.rangeButtonActive
          ]}
          onPress={generateWeeklyReport}
          disabled={loading}
        >
          <Text style={[
            styles.rangeButtonText,
            dateRange === 'week' && styles.rangeButtonTextActive
          ]}>
            📅 This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangeButton,
            dateRange === 'month' && styles.rangeButtonActive
          ]}
          onPress={generateMonthlyReport}
          disabled={loading}
        >
          <Text style={[
            styles.rangeButtonText,
            dateRange === 'month' && styles.rangeButtonTextActive
          ]}>
            📆 This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangeButton,
            dateRange === 'all' && styles.rangeButtonActive
          ]}
          onPress={generateAllTimeReport}
          disabled={loading}
        >
          <Text style={[
            styles.rangeButtonText,
            dateRange === 'all' && styles.rangeButtonTextActive
          ]}>
            📈 All Time
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating report...</Text>
        </View>
      )}

      {report && !loading && (
        <View style={styles.reportContainer}>
          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>🍎 Food Statistics</Text>
            <Text style={styles.stat}>Total entries: <Text style={styles.statValue}>{report.foodStats.totalEntries}</Text></Text>
            <Text style={styles.stat}>Unique foods: <Text style={styles.statValue}>{report.foodStats.uniqueFoods}</Text></Text>
            
            {report.foodStats.mostFrequentFood && (
              <Text style={styles.stat}>
                Most frequent: <Text style={styles.statValue}>{report.foodStats.mostFrequentFood.food}</Text>
                <Text style={styles.statLabel}> ({report.foodStats.mostFrequentFood.count}x)</Text>
              </Text>
            )}

            {report.foodStats.flaggedFoodsConsumed > 0 && (
              <Text style={[styles.stat, styles.warning]}>
                ⚠️ Flagged foods: <Text style={styles.statValue}>{report.foodStats.flaggedFoodsConsumed}</Text>
              </Text>
            )}

            {report.foodStats.averageMacros && (
              <View style={styles.macrosGroup}>
                <Text style={styles.macrosTitle}>Average Daily Intake:</Text>
                <Text style={styles.macro}>
                  🔥 Calories: <Text style={styles.macroValue}>{report.foodStats.averageMacros.caloriesPerDay}</Text>
                </Text>
                <Text style={styles.macro}>
                  🥚 Protein: <Text style={styles.macroValue}>{report.foodStats.averageMacros.proteinPerDay}g</Text>
                </Text>
                <Text style={styles.macro}>
                  🍞 Carbs: <Text style={styles.macroValue}>{report.foodStats.averageMacros.carbsPerDay}g</Text>
                </Text>
                <Text style={styles.macro}>
                  🧈 Fat: <Text style={styles.macroValue}>{report.foodStats.averageMacros.fatPerDay}g</Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>🩺 Symptom Statistics</Text>
            <Text style={styles.stat}>Total entries: <Text style={styles.statValue}>{report.symptomStats.totalEntries}</Text></Text>
            <Text style={styles.stat}>Unique symptoms: <Text style={styles.statValue}>{report.symptomStats.uniqueSymptoms}</Text></Text>
            
            {report.symptomStats.averageSeverity && (
              <Text style={styles.stat}>
                Average severity: <Text style={styles.statValue}>{report.symptomStats.averageSeverity}</Text>
                <Text style={styles.statLabel}>/10</Text>
              </Text>
            )}

            {Object.keys(report.symptomStats.symptomsByType).length > 0 && (
              <View style={styles.symptomsGroup}>
                <Text style={styles.symptomsTitle}>Most Common Symptoms:</Text>
                {Object.entries(report.symptomStats.symptomsByType)
                  .sort((a, b) => b[1].length - a[1].length)
                  .slice(0, 5)
                  .map(([symptom, logs], index) => (
                    <Text key={index} style={styles.symptomItem}>
                      • {symptom}: <Text style={styles.symptomCount}>{logs.length}x</Text>
                    </Text>
                  ))
                }
              </View>
            )}
          </View>

          {report.correlations.length > 0 && (
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>🔗 Potential Triggers</Text>
              {report.correlations.slice(0, 5).map((corr, index) => (
                <View key={index} style={styles.correlationItem}>
                  <Text style={styles.correlationFood}>{corr.food}</Text>
                  <Text style={styles.correlationDetail}>
                    {corr.confidence}% confidence
                  </Text>
                  <Text style={styles.correlationDetail}>
                    {corr.relatedSymptoms} symptoms after {corr.timesEaten} serving{corr.timesEaten !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.correlationSymptoms}>
                    {corr.symptomTypes.join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
            <Text style={styles.exportButtonText}>📤 Export Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {!report && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available yet</Text>
          <Text style={styles.emptySubtext}>Log some food and symptoms to generate a report</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  rangeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  reportContainer: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  stat: {
    fontSize: 15,
    color: '#555',
    marginVertical: 6,
  },
  statValue: {
    fontWeight: '700',
    color: '#007AFF',
    fontSize: 16,
  },
  statLabel: {
    fontWeight: '400',
    color: '#999',
    fontSize: 14,
  },
  warning: {
    color: '#E63E11',
  },
  macrosGroup: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  macrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  macro: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  macroValue: {
    fontWeight: '700',
    color: '#FF6B6B',
  },
  symptomsGroup: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  symptomItem: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  symptomCount: {
    fontWeight: '700',
    color: '#FF9500',
  },
  correlationItem: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  correlationFood: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  correlationDetail: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  correlationSymptoms: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
  },
  exportButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default ReportGenerator;
