import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import DataExport from '../app/dataExport';

/* ─── Module Mocks ──────────────────────────────────────────────────── */

// Supabase — provides food + symptom logs
const mockFoodLogs = [
  {
    id: 'f1',
    food_name: 'Oatmeal',
    meal_type: 'breakfast',
    date_time: '2024-06-01T08:00:00.000Z',
    calories: 300,
    carbs: 54,
    protein: 10,
    fat: 5,
    user_id: 'user-abc',
    deleted_at: null,
  },
  {
    id: 'f2',
    food_name: 'Chicken Salad',
    meal_type: 'lunch',
    date_time: '2024-06-02T12:00:00.000Z',
    calories: 450,
    carbs: 20,
    protein: 40,
    fat: 18,
    user_id: 'user-abc',
    deleted_at: null,
  },
];

const mockSymptomLogs = [
  {
    id: 's1',
    symptom: 'hives',
    severity: 7,
    date_time: '2024-06-01T09:00:00.000Z',
    food_log_ids: ['f1'],
    user_id: 'user-abc',
    deleted_at: null,
  },
];

const makeSupabaseChain = ({ data, error } = { data: [], error: null }) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data, error }),
});

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

// dataExport utils — the real functions we want to test through the UI
const mockExportLogsToFile = jest.fn();
const mockGetExportedFiles = jest.fn();
const mockDeleteExportedFile = jest.fn();
const mockReadExportedFile = jest.fn();
const mockFilterLogsByDateRange = jest.fn();
const mockGenerateExportSummary = jest.fn();
const mockGenerateExportReport = jest.fn();
const mockFormatFileSize = jest.fn((n) => `${n} B`);
const mockGetDownloadsDirectory = jest.fn(() => 'file:///downloads/');

jest.mock('../utils/dataExport', () => ({
  exportLogsToFile: (...args) => mockExportLogsToFile(...args),
  getExportedFiles: (...args) => mockGetExportedFiles(...args),
  deleteExportedFile: (...args) => mockDeleteExportedFile(...args),
  readExportedFile: (...args) => mockReadExportedFile(...args),
  filterLogsByDateRange: (...args) => mockFilterLogsByDateRange(...args),
  generateExportSummary: (...args) => mockGenerateExportSummary(...args),
  generateExportReport: (...args) => mockGenerateExportReport(...args),
  formatFileSize: (...args) => mockFormatFileSize(...args),
  getDownloadsDirectory: (...args) => mockGetDownloadsDirectory(...args),
}));

// storage (getAllLogs — not used in this component directly but imported)
jest.mock('../utils/storage', () => ({
  getAllLogs: jest.fn().mockResolvedValue([]),
}));

// expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue('file content'),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
    createFileAsync: jest.fn().mockResolvedValue('file:///target/file.csv'),
  },
}));

// expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// DateTimePicker — native module, must be mocked
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, { testID: 'date-time-picker' });
});

/* ─── Default mock return values ─────────────────────────────────────── */

const DEFAULT_SUMMARY = {
  foodLogsCount: 2,
  symptomLogsCount: 1,
  totalDays: 2,
  totalCalories: 750,
  totalCarbs: 74,
  totalProtein: 50,
  totalFat: 23,
  avgCaloriesPerDay: 375,
  mostCommonSymptoms: [{ name: 'hives', count: 1 }],
  dateRange: '6/1/2024 - 6/2/2024',
};

const DEFAULT_REPORT = '═══\nFOOD LOG EXPORT REPORT\n═══\n';

/* ─── Setup ──────────────────────────────────────────────────────────── */

beforeEach(() => {
  const { supabase } = require('../lib/supabase');
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
  supabase.from.mockImplementation((table) => {
    if (table === 'food_log')    return makeSupabaseChain({ data: mockFoodLogs,    error: null });
    if (table === 'symptom_log') return makeSupabaseChain({ data: mockSymptomLogs, error: null });
    return makeSupabaseChain({ data: [], error: null });
  });

  // filterLogsByDateRange returns a normalized flat array of food+symptom entries
  mockFilterLogsByDateRange.mockReturnValue([
    { type: 'food',    id: 'f1', food_name: 'Oatmeal',       date_time: '2024-06-01T08:00:00.000Z' },
    { type: 'food',    id: 'f2', food_name: 'Chicken Salad', date_time: '2024-06-02T12:00:00.000Z' },
    { type: 'symptom', id: 's1', symptom: 'hives',            date_time: '2024-06-01T09:00:00.000Z' },
  ]);
  mockGenerateExportSummary.mockReturnValue(DEFAULT_SUMMARY);
  mockGenerateExportReport.mockReturnValue(DEFAULT_REPORT);
  mockGetExportedFiles.mockResolvedValue([]);
  mockExportLogsToFile.mockResolvedValue('file:///downloads/FoodLog_2024-06-01_to_2024-06-02_test.csv');
  mockDeleteExportedFile.mockResolvedValue(true);
  mockReadExportedFile.mockResolvedValue('col1,col2\nval1,val2');
});

afterEach(() => { jest.clearAllMocks(); });

/* ─── Helper: wait for the component to finish loading ───────────────── */
async function renderAndLoad() {
  const utils = render(<DataExport />);
  // Wait until the loading spinner is gone and summary stats are visible
  await waitFor(() => utils.getByText('Food Logs'));
  return utils;
}

/* ─── Helper: select a format then press Export ──────────────────────── */
async function selectFormatAndExport(utils, formatLabel) {
  await act(async () => { fireEvent.press(utils.getByText(formatLabel)); });
  await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });
  // Export Options modal appears — choose Download
  await waitFor(() => utils.getByText('📥 Download'));
  await act(async () => { fireEvent.press(utils.getByText('📥 Download')); });
}

/* ═══════════════════════════════════════════════════════════════════════
   GENERATE CSV REPORT
   ═══════════════════════════════════════════════════════════════════════ */

describe('DataExport — generate CSV report', () => {
  it('renders the CSV format button', async () => {
    const utils = await renderAndLoad();
    expect(utils.getByText('CSV')).toBeTruthy();
  });

  it('CSV is selected by default', async () => {
    // The component initialises exportFormat to "csv".
    // Pressing Export immediately (without switching format) should call
    // exportLogsToFile with format "csv".
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });
    await waitFor(() => utils.getByText('📥 Download'));
    await act(async () => { fireEvent.press(utils.getByText('📥 Download')); });

    await waitFor(() =>
      expect(mockExportLogsToFile).toHaveBeenCalledWith(
        expect.anything(),
        'csv',
        expect.anything(),
        expect.stringMatching(/\.csv$/),
        expect.anything(),
      ),
    );
  });

  it('selecting CSV format then exporting calls exportLogsToFile with "csv"', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() =>
      expect(mockExportLogsToFile).toHaveBeenCalledWith(
        expect.anything(),
        'csv',
        expect.anything(),
        expect.stringMatching(/\.csv$/),
        expect.anything(),
      ),
    );
  });

  it('passes the filtered logs to exportLogsToFile', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const [logsArg] = mockExportLogsToFile.mock.calls[0];
    // filteredLogs comes from mockFilterLogsByDateRange — 3 entries
    expect(Array.isArray(logsArg)).toBe(true);
    expect(logsArg.length).toBe(3);
  });

  it('generated filename ends with .csv', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const filename = mockExportLogsToFile.mock.calls[0][3];
    expect(filename).toMatch(/\.csv$/);
  });

  it('generated filename contains the start and end dates', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const filename = mockExportLogsToFile.mock.calls[0][3];
    // filename format: FoodLog_YYYY-MM-DD_to_YYYY-MM-DD_<timestamp>.csv
    expect(filename).toMatch(/^FoodLog_\d{4}-\d{2}-\d{2}_to_\d{4}-\d{2}-\d{2}_/);
  });

  it('shows success alert after CSV download completes', async () => {
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        expect.stringContaining('2'), // "Exported 2 food logs"
        expect.anything(),
      ),
    );
  });

  it('shows error alert when exportLogsToFile rejects', async () => {
    mockExportLogsToFile.mockRejectedValueOnce(new Error('disk full'));
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'CSV');

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining('disk full'),
      ),
    );
  });

  it('shows alert and does NOT call exportLogsToFile when there are no logs in range', async () => {
    // Override: empty filtered logs
    mockFilterLogsByDateRange.mockReturnValue([]);
    mockGenerateExportSummary.mockReturnValue({ ...DEFAULT_SUMMARY, foodLogsCount: 0, symptomLogsCount: 0 });

    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('No Data', 'No logs found in the selected date range'),
    );
    expect(mockExportLogsToFile).not.toHaveBeenCalled();
  });

  it('export options modal appears with Download and Share options after pressing Export', async () => {
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });

    await waitFor(() => utils.getByText('Export Options'));
    expect(utils.getByText('📥 Download')).toBeTruthy();
  });

  it('export options modal can be dismissed without exporting', async () => {
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });
    await waitFor(() => utils.getByText('Export Options'));

    // Press the ✕ close button
    await act(async () => { fireEvent.press(utils.getByText('✕')); });
    await waitFor(() => expect(utils.queryByText('Export Options')).toBeNull());
    expect(mockExportLogsToFile).not.toHaveBeenCalled();
  });

  it('reloads the exported files list after a successful CSV export', async () => {
    const utils = await renderAndLoad();
    const callsBefore = mockGetExportedFiles.mock.calls.length;
    await selectFormatAndExport(utils, 'CSV');

    // dismiss success alert by invoking the OK callback
    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const [, , okButtonConfig] = require('react-native').Alert.alert.mock.calls.find(
      ([title]) => title === 'Success',
    ) || [];
    if (okButtonConfig?.[0]?.onPress) await act(async () => okButtonConfig[0].onPress());

    await waitFor(() => expect(mockGetExportedFiles.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it('summary stats are displayed before export (Food Logs count)', async () => {
    const utils = await renderAndLoad();
    // DEFAULT_SUMMARY.foodLogsCount = 2 — use getAllByText since '2' may appear
    // multiple times (e.g. symptom count, days). Verify the Food Logs label exists.
    expect(utils.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(utils.getByText('Food Logs')).toBeTruthy();
  });

  it('displays top symptoms in the summary section', async () => {
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('Top Symptoms'));
    expect(utils.getByText('hives')).toBeTruthy();
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   GENERATE PDF REPORT
   ═══════════════════════════════════════════════════════════════════════ */

describe('DataExport — generate PDF report', () => {
  it('renders the PDF format button', async () => {
    const utils = await renderAndLoad();
    expect(utils.getByText('PDF')).toBeTruthy();
  });

  it('selecting PDF format then exporting calls exportLogsToFile with "pdf"', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() =>
      expect(mockExportLogsToFile).toHaveBeenCalledWith(
        expect.anything(),
        'pdf',
        expect.anything(),
        expect.stringMatching(/\.pdf$/),
        expect.anything(),
      ),
    );
  });

  it('passes the filtered logs to exportLogsToFile for PDF', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const [logsArg] = mockExportLogsToFile.mock.calls[0];
    expect(Array.isArray(logsArg)).toBe(true);
    expect(logsArg.length).toBe(3);
  });

  it('generated filename ends with .pdf', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const filename = mockExportLogsToFile.mock.calls[0][3];
    expect(filename).toMatch(/\.pdf$/);
  });

  it('generated filename contains the start and end dates for PDF', async () => {
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const filename = mockExportLogsToFile.mock.calls[0][3];
    expect(filename).toMatch(/^FoodLog_\d{4}-\d{2}-\d{2}_to_\d{4}-\d{2}-\d{2}_/);
  });

  it('shows success alert after PDF download completes', async () => {
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        expect.any(String),
        expect.anything(),
      ),
    );
  });

  it('shows error alert when exportLogsToFile rejects during PDF export', async () => {
    mockExportLogsToFile.mockRejectedValueOnce(new Error('print failed'));
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining('print failed'),
      ),
    );
  });

  it('PDF format button becomes visually active when selected', async () => {
    // After pressing the PDF button, the format state should be "pdf", which
    // means re-pressing Export will call exportLogsToFile with "pdf" (not csv).
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('PDF')); });
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });
    await waitFor(() => utils.getByText('📥 Download'));
    await act(async () => { fireEvent.press(utils.getByText('📥 Download')); });

    await waitFor(() => {
      const formatArg = mockExportLogsToFile.mock.calls[0]?.[1];
      expect(formatArg).toBe('pdf');
    });
  });

  it('switching from PDF back to CSV reverts the export format', async () => {
    const utils = await renderAndLoad();
    // Select PDF, then switch back to CSV
    await act(async () => { fireEvent.press(utils.getByText('PDF')); });
    await act(async () => { fireEvent.press(utils.getByText('CSV')); });
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });
    await waitFor(() => utils.getByText('📥 Download'));
    await act(async () => { fireEvent.press(utils.getByText('📥 Download')); });

    await waitFor(() => {
      const formatArg = mockExportLogsToFile.mock.calls[0]?.[1];
      expect(formatArg).toBe('csv');
    });
  });

  it('does not call exportLogsToFile when there are no logs, even for PDF', async () => {
    mockFilterLogsByDateRange.mockReturnValue([]);
    mockGenerateExportSummary.mockReturnValue({ ...DEFAULT_SUMMARY, foodLogsCount: 0, symptomLogsCount: 0 });

    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('PDF')); });
    await act(async () => { fireEvent.press(utils.getByText('📥 Export')); });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('No Data', 'No logs found in the selected date range'),
    );
    expect(mockExportLogsToFile).not.toHaveBeenCalled();
  });

  it('reloads the exported files list after a successful PDF export', async () => {
    const utils = await renderAndLoad();
    const callsBefore = mockGetExportedFiles.mock.calls.length;
    await selectFormatAndExport(utils, 'PDF');

    await waitFor(() => expect(mockExportLogsToFile).toHaveBeenCalled());
    const successCall = require('react-native').Alert.alert.mock.calls.find(
      ([title]) => title === 'Success',
    );
    if (successCall?.[2]?.[0]?.onPress) await act(async () => successCall[2][0].onPress());

    await waitFor(() => expect(mockGetExportedFiles.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   VIEW REPORT (shared between CSV and PDF)
   ═══════════════════════════════════════════════════════════════════════ */

describe('DataExport — View Report button', () => {
  it('renders the View Report button', async () => {
    const utils = await renderAndLoad();
    expect(utils.getByText('📋 View Report')).toBeTruthy();
  });

  it('shows an alert with the report text on native when View Report is pressed', async () => {
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('📋 View Report')); });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Report Generated',
        DEFAULT_REPORT,
      ),
    );
  });

  it('generateExportReport is called with the loaded logs and date range', async () => {
    await renderAndLoad();
    expect(mockGenerateExportReport).toHaveBeenCalledWith(
      expect.objectContaining({ foodLogs: mockFoodLogs, symptomLogs: mockSymptomLogs }),
      expect.any(Date),
      expect.any(Date),
    );
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   DATE RANGE QUICK SELECTORS
   ═══════════════════════════════════════════════════════════════════════ */

describe('DataExport — date range quick selectors', () => {
  it('renders Last 7 Days, Last 30 Days, Last 90 Days buttons', async () => {
    const utils = await renderAndLoad();
    expect(utils.getByText('Last 7 Days')).toBeTruthy();
    expect(utils.getByText('Last 30 Days')).toBeTruthy();
    // trailing space is intentional in the component
    expect(utils.getByText(/Last 90 Days/)).toBeTruthy();
  });

  it('pressing Last 7 Days triggers a new filterLogsByDateRange call', async () => {
    const callsBefore = mockFilterLogsByDateRange.mock.calls.length;
    const utils = await renderAndLoad();
    await act(async () => { fireEvent.press(utils.getByText('Last 7 Days')); });
    expect(mockFilterLogsByDateRange.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('pressing Last 30 Days triggers a new filterLogsByDateRange call', async () => {
    const utils = await renderAndLoad();
    const callsBefore = mockFilterLogsByDateRange.mock.calls.length;
    await act(async () => { fireEvent.press(utils.getByText('Last 30 Days')); });
    expect(mockFilterLogsByDateRange.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   EXPORTED FILES LIST
   ═══════════════════════════════════════════════════════════════════════ */

describe('DataExport — exported files list', () => {
  it('shows empty state when no files have been exported', async () => {
    mockGetExportedFiles.mockResolvedValue([]);
    const utils = await renderAndLoad();
    await waitFor(() => expect(utils.getByText('No exported files yet')).toBeTruthy());
  });

  it('renders a previously exported CSV file in the list', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/FoodLog_2024-06-01_to_2024-06-02_test.csv',
        name: 'FoodLog_2024-06-01_to_2024-06-02_test.csv',
        format: 'CSV',
        size: 2048,
        modificationTime: new Date('2024-06-02').getTime(),
        location: 'Downloads',
        dateRange: '2024-06-01 - 2024-06-02',
      },
    ]);
    const utils = await renderAndLoad();
    await waitFor(() => expect(utils.getByText(/2024-06-01_to_2024-06-02/)).toBeTruthy());
  });

  it('renders a previously exported PDF file in the list', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/FoodLog_2024-06-01_to_2024-06-02_test.pdf',
        name: 'FoodLog_2024-06-01_to_2024-06-02_test.pdf',
        format: 'PDF',
        size: 8192,
        modificationTime: new Date('2024-06-02').getTime(),
        location: 'Downloads',
        dateRange: '2024-06-01 - 2024-06-02',
      },
    ]);
    const utils = await renderAndLoad();
    // Match on the unique filename text rendered in the file list
    await waitFor(() =>
      expect(utils.getByText(/2024-06-01_to_2024-06-02_test/)).toBeTruthy(),
    );
  });

  it('shows View, Delete action buttons for each listed file', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/test.csv',
        name: 'FoodLog_2024-06-01_to_2024-06-02_test.csv',
        format: 'CSV',
        size: 512,
        modificationTime: Date.now(),
        location: 'Downloads',
      },
    ]);
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('View'));
    expect(utils.getByText('Delete')).toBeTruthy();
  });

  it('calls deleteExportedFile and reloads list when Delete is pressed and confirmed', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/test.csv',
        name: 'FoodLog_test.csv',
        format: 'CSV',
        size: 512,
        modificationTime: Date.now(),
        location: 'Downloads',
      },
    ]);
    const { Alert } = require('react-native');
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('Delete'));

    await act(async () => { fireEvent.press(utils.getByText('Delete')); });

    // Alert.alert is called with Cancel + Delete buttons; invoke Delete
    const deleteCall = Alert.alert.mock.calls.find(([title]) => title === 'Delete File');
    expect(deleteCall).toBeTruthy();
    const deleteButton = deleteCall[2].find((b) => b.text === 'Delete');
    await act(async () => { deleteButton.onPress(); });

    await waitFor(() => expect(mockDeleteExportedFile).toHaveBeenCalled());
  });

  it('opens file viewer modal with PDF notice when View is pressed on a PDF file', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/test.pdf',
        name: 'FoodLog_test.pdf',
        format: 'PDF',
        size: 4096,
        modificationTime: Date.now(),
        location: 'Downloads',
      },
    ]);
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('View'));
    await act(async () => { fireEvent.press(utils.getByText('View')); });

    await waitFor(() =>
      expect(
        utils.getByText('PDF preview is not available in this app. Use the button below to open or save the PDF.'),
      ).toBeTruthy(),
    );
  });

  it('opens file viewer modal with file content when View is pressed on a CSV file', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/test.csv',
        name: 'FoodLog_test.csv',
        format: 'CSV',
        size: 512,
        modificationTime: Date.now(),
        location: 'Downloads',
      },
    ]);
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('View'));
    await act(async () => { fireEvent.press(utils.getByText('View')); });

    await waitFor(() => expect(utils.getByText('col1,col2\nval1,val2')).toBeTruthy());
  });

  it('closes the file viewer modal when Close is pressed', async () => {
    mockGetExportedFiles.mockResolvedValue([
      {
        uri: 'file:///downloads/test.csv',
        name: 'FoodLog_test.csv',
        format: 'CSV',
        size: 512,
        modificationTime: Date.now(),
        location: 'Downloads',
      },
    ]);
    const utils = await renderAndLoad();
    await waitFor(() => utils.getByText('View'));
    await act(async () => { fireEvent.press(utils.getByText('View')); });
    await waitFor(() => utils.getByText('Close'));
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.queryByText('Close')).toBeNull());
  });
});
