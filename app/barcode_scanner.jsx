/*
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

import { offGetProductByBarcode } from '../lib/openfoodfacts';

const BarcodeScanner = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const [manualCode, setManualCode] = useState('');

  const canScan = useMemo(() => !scanned && !loading, [scanned, loading]);

  const handleLookup = async (barcode) => {
    const code = (barcode || '').trim();

    // Basic barcode validation (UPC/EAN/GTIN are typically 8–14 digits)
    if (!/^\d{8,14}$/.test(code)) {
      Alert.alert('Invalid barcode', 'Enter 8–14 digits (numbers only).');
      return;
    }

    try {
      setLoading(true);

      const product = await offGetProductByBarcode(code);

      if (!product) {
        Alert.alert('Not found', 'No product found for this barcode.');
        return;
      }

      setScanned(true);

      // Send product back to Food Log page
      router.replace({
        pathname: '/food_log',
        params: {
          scannedName: product.product_name || '',
          scannedBrand: product.brands || '',
          scannedCode: code,
        },
      });

    } catch (err) {
      Alert.alert('Error', err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onBarcodeScanned = (result) => {
    if (!canScan) return;
    if (!result?.data) return;

    handleLookup(result.data);
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan barcodes.
        </Text>
        <View style={styles.permissionBtn}>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
        <View style={styles.permissionBtn}>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={canScan ? onBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8'],
          }}
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Manual Barcode Entry</Text>

        <TextInput
          style={styles.input}
          value={manualCode}
          onChangeText={(t) => setManualCode(t.replace(/[^\d]/g, ''))}
          keyboardType="number-pad"
          placeholder="Enter barcode digits"
          placeholderTextColor="#777"
        />

        <View style={styles.btnRow}>
          <View style={styles.btn}>
            <Button title="Search" onPress={() => handleLookup(manualCode)} />
          </View>

          <View style={styles.btn}>
            <Button
              title="Rescan"
              onPress={() => {
                setScanned(false);
              }}
            />
          </View>
        </View>

        <View style={styles.btnRow}>
          <View style={styles.btn}>
            <Button title="Back" onPress={() => router.back()} />
          </View>

          <View style={styles.statusWrap}>
            {loading ? <ActivityIndicator /> : null}
            {scanned ? <Text style={styles.statusText}>Scanned</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BarcodeScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  panel: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  panelTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  btn: {
    flex: 1,
  },
  statusWrap: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 6,
    color: '#0077FF',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionBtn: {
    width: 240,
    marginVertical: 6,
  },
});
*/
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

import { offGetProductByBarcode } from '../lib/openfoodfacts';

const BarcodeScanner = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const canScan = useMemo(() => !scanned && !loading, [scanned, loading]);

  const handleLookup = async (barcode) => {
    const code = (barcode || '').trim();

    // Barcode validaton
    if (!/^\d{8,14}$/.test(code)) {
      Alert.alert('Invalid barcode', 'Enter 8–14 digits only.');
      return;
    }

    try {
      setLoading(true);

      const product = await offGetProductByBarcode(code);
      if (!product) {
        Alert.alert('Not found', 'No product found for this barcode.');
        return;
      }

      setScanned(true);

      // Send product back to Food Log page
      router.replace({
        pathname: '/food_log',
        params: {
          scannedName: product.product_name,
        },
      });
    } catch (err) {
      Alert.alert('Error', err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onBarcodeScanned = (result) => {
    if (!canScan || !result?.data) return;
    handleLookup(result.data);
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan barcodes.
        </Text>
        <View style={styles.permissionBtn}>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
        <View style={styles.permissionBtn}>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
      >
        {/* Camera */}
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={canScan ? onBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8'],
            }}
          />
        </View>

        {/* Manual barcode entry */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Enter barcode manually</Text>

          <TextInput
            style={styles.input}
            value={manualCode}
            onChangeText={(t) => setManualCode(t.replace(/[^\d]/g, ''))}
            keyboardType="number-pad"
            placeholder="Enter barcode digits"
            placeholderTextColor="#777"
          />

          <View style={styles.row}>
            <View style={styles.btn}>
              <Button title="Search" onPress={() => handleLookup(manualCode)} />
            </View>

            <View style={styles.btn}>
              <Button
                title="Rescan"
                onPress={() => {
                  setScanned(false);
                  setManualCode('');
                }}
              />
            </View>

            <View style={styles.btn}>
              <Button title="Back" onPress={() => router.back()} />
            </View>
          </View>

          {loading ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default BarcodeScanner;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  panel: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  panelTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionBtn: {
    width: 240,
    marginVertical: 6,
  },
});
