import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { lookupBarcodeFood, normalizeBarcode, isValidBarcode } from '../utils/barcodeScanner';

const BarcodeScannerModal = ({ visible, onClose, onBarcodeDetected }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [scannedFoodData, setScannedFoodData] = useState(null);
  const cameraRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    
    return () => {
      // Cleanup timeout on unmount
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [visible, permission]);

  const handleBarcodeScanned = async (result) => {
    // Prevent duplicate scans within 2 seconds
    if (lastScannedBarcode === result.data) {
      return;
    }

    setLastScannedBarcode(result.data);

    // Clear previous timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    try {
      setIsLoading(true);
      const barcode = normalizeBarcode(result.data);

      if (!isValidBarcode(barcode)) {
        Alert.alert('Invalid Barcode', 'This barcode format is not recognized.');
        setIsLoading(false);
        
        // Reset after 1 second to allow rescanning
        scanTimeoutRef.current = setTimeout(() => {
          setLastScannedBarcode(null);
        }, 1000);
        return;
      }

      // Lookup food data
      const foodData = await lookupBarcodeFood(barcode);
      setScannedFoodData(foodData);
      setIsLoading(false);
    } catch (error) {
      console.error('Barcode lookup error:', error);
      Alert.alert('Error', error.message || 'Failed to lookup product. Try again.');
      setIsLoading(false);
      
      // Reset after 2 seconds to allow rescanning
      scanTimeoutRef.current = setTimeout(() => {
        setLastScannedBarcode(null);
      }, 2000);
    }
  };

  const handleUseFood = () => {
    if (scannedFoodData && onBarcodeDetected) {
      onBarcodeDetected(scannedFoodData);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setLastScannedBarcode(null);
    setScannedFoodData(null);
    setIsLoading(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    onClose();
  };

  const handleRescan = () => {
    setScannedFoodData(null);
    setLastScannedBarcode(null);
    setIsLoading(false);
  };

  const shouldShowNutriscore = () => {
    if (!scannedFoodData?.nutriscoreGrade) return false;
    const grade = String(scannedFoodData.nutriscoreGrade).toLowerCase();
    return grade !== 'n/a';
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need camera access to scan barcodes. Please grant permission to continue.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.permissionButton, styles.cancelButton]}
              onPress={handleCloseModal}
            >
              <Text style={styles.permissionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {!scannedFoodData ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Scan Barcode</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <CameraView
              ref={cameraRef}
              style={styles.camera}
              onBarcodeScanned={isLoading ? null : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'upc_a',
                  'upc_e',
                  'ean13',
                  'ean8',
                  'code128',
                  'code39',
                  'code93',
                  'itf14',
                  'datamatrix',
                  'qr',
                ],
              }}
            />

            <View style={styles.scannerOverlay}>
              <View style={styles.scanFrame} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.instructions}>
                {isLoading
                  ? 'Looking up product...'
                  : 'Position barcode in frame to scan'}
              </Text>
              {isLoading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />}
            </View>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Product Found</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultContent}>
              <Text style={styles.productName}>{scannedFoodData.name}</Text>
              <Text style={styles.productBrand}>{scannedFoodData.brands}</Text>
              <Text style={styles.productBarcode}>
                {scannedFoodData.barcode} • {scannedFoodData.source}
              </Text>

              {shouldShowNutriscore() && (
                <View style={styles.nutriscoreContainer}>
                  <Text style={styles.nutriscoreLabel}>Nutri-Score</Text>
                  <View
                    style={[
                      styles.nutritscoreBadge,
                      { backgroundColor: getNutriscoreColor(scannedFoodData.nutriscoreGrade) }
                    ]}
                  >
                    <Text style={styles.nutrisscoreText}>{scannedFoodData.nutriscoreGrade}</Text>
                  </View>
                </View>
              )}

              <View style={styles.nutritionGrid}>
                <NutritionItem label="Calories" value={`${scannedFoodData.calories || 0} kcal`} />
                <NutritionItem label="Protein" value={`${scannedFoodData.protein || 0}g`} />
                <NutritionItem label="Carbs" value={`${scannedFoodData.carbs || 0}g`} />
                <NutritionItem label="Fat" value={`${scannedFoodData.fat || 0}g`} />
              </View>

              {scannedFoodData.allergens && scannedFoodData.allergens.length > 0 && (
                <View style={styles.allergenSection}>
                  <Text style={styles.allergenTitle}>⚠️ Allergens</Text>
                  <View style={styles.allergenTags}>
                    {scannedFoodData.allergens.map((allergen, idx) => (
                      <View key={idx} style={styles.allergenTag}>
                        <Text style={styles.allergenTagText}>{allergen}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rescanButton]}
                onPress={handleRescan}
              >
                <Text style={styles.rescanButtonText}>🔄 Rescan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.useButton]}
                onPress={handleUseFood}
              >
                <Text style={styles.useButtonText}>✓ Use This Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const NutritionItem = ({ label, value }) => (
  <View style={styles.nutritionItem}>
    <Text style={styles.nutritionLabel}>{label}</Text>
    <Text style={styles.nutritionValue}>{value}</Text>
  </View>
);

const getNutriscoreColor = (grade) => {
  switch (grade?.toUpperCase()) {
    case 'A':
      return '#27AE60';
    case 'B':
      return '#F39C12';
    case 'C':
      return '#E67E22';
    case 'D':
      return '#E74C3C';
    case 'E':
      return '#C0392B';
    default:
      return '#95A5A6';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    paddingHorizontal: 8,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#4ECDC4',
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  productBarcode: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  nutriscoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  nutriscoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutritscoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nutrisscoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  allergenSection: {
    marginBottom: 16,
  },
  allergenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: '#FFE4E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  allergenTagText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  rescanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  useButton: {
    backgroundColor: '#4ECDC4',
  },
  useButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BarcodeScannerModal;
