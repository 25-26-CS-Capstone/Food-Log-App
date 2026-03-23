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
  Pressable,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';

import { offGetProductByBarcode } from '../lib/openfoodfacts';

const BarcodeScanner = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const canScan = useMemo(() => !scanned && !loading, [scanned, loading]);
  const canSearchManual = useMemo(() => manualCode.trim().length > 0 && !loading, [manualCode, loading]);


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
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Allow camera access to scan barcodes.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </Pressable>

        <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
          <Text style={styles.ghostBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

    return (
    <>
      <Stack.Screen options={{ title: 'Scan Barcode' }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          {/* Camera */}
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={canScan ? onBarcodeScanned : undefined}
              barcodeScannerSettings={{ barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8'] }}
            />

            {/* Overlay */}
            <View pointerEvents="none" style={styles.overlay}>
              <Text style={styles.overlayText}>
                Align barcode to the centre of the frame
              </Text>

              <View style={styles.frame}>
                {/* Corner markers */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              <Text style={styles.overlaySubText}>
                {loading ? 'Looking up product…' : scanned ? 'Scanned ✓ Tap Rescan to scan again' : 'Scanning is on'}
              </Text>
            </View>
          </View>

          {/* Bottom sheet */}
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Manual entry</Text>
            <Text style={styles.sheetSubtitle}>Type the barcode digits (8–14)</Text>

            <TextInput
              style={styles.input}
              value={manualCode}
              onChangeText={(t) => setManualCode(t.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              placeholder="e.g. 012345678905"
              placeholderTextColor="#888"
            />

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryBtn, (!canSearchManual || loading) && styles.btnDisabled]}
                onPress={() => handleLookup(manualCode)}
                disabled={!canSearchManual || loading}
              >
                <Text style={styles.primaryBtnText}>Search</Text>
              </Pressable>

              <View style={styles.secondaryRow}>
                <Pressable
                  style={[styles.outlineBtn, loading && styles.btnDisabled]}
                  onPress={() => {
                    setScanned(false);
                    setManualCode('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.outlineBtnText}>Rescan</Text>
                </Pressable>

                <Pressable
                  style={[styles.ghostBtnSmall, loading && styles.btnDisabled]}
                  onPress={() => router.back()}
                  disabled={loading}
                >
                  <Text style={styles.ghostBtnText}>Back</Text>
                </Pressable>
              </View>

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator />
                  <Text style={styles.loadingText}>Searching…</Text>
                </View>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

export default BarcodeScanner;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  overlaySubText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  frame: {
    width: '82%',
    height: 140,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#fff',
  },
  cornerTL: {
    top: -1.5,
    left: -1.5,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: -1.5,
    right: -1.5,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: -1.5,
    left: -1.5,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: -1.5,
    right: -1.5,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  sheet: {
    backgroundColor: '#fff',
    padding: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  sheetSubtitle: { fontSize: 12, color: '#666', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },

  actions: { gap: 10 },

  primaryBtn: {
    backgroundColor: '#0077FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },

  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0077FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  outlineBtnText: { color: '#0077FF', fontWeight: '800' },

  ghostBtnSmall: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  ghostBtn: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  ghostBtnText: { color: '#222', fontWeight: '700' },

  btnDisabled: { opacity: 0.5 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  loadingText: { color: '#444', fontWeight: '600' },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    backgroundColor: '#fff',
  },
  permissionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  permissionText: { textAlign: 'center', marginBottom: 14, color: '#555' },
});