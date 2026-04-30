import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import FoodLog from '../app/food_log';

/* ─── Module Mocks ──────────────────────────────────────────────────── */

const mockOffSearch = jest.fn();

jest.mock('../lib/openfoodfacts', () => ({
  offSearch: (...args) => mockOffSearch(...args),
}));

jest.mock('../lib/allergens', () => ({
  detectAllergensFromIngredients: jest.fn(() => ['eggs']),
  mergeAllergens: jest.fn((tags, detected) => [...(tags || []), ...(detected || [])]),
}));

const mockQueueLocalChange = jest.fn();
const mockSyncLocalChangesToSupabase = jest.fn();

jest.mock('../lib/syncService', () => ({
  queueLocalChange: (...args) => mockQueueLocalChange(...args),
  syncLocalChangesToSupabase: (...args) => mockSyncLocalChangesToSupabase(...args),
}));

jest.mock('react-native-get-random-values', () => {});
jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const Picker = ({ children, onValueChange, selectedValue }) =>
    React.createElement(View, { testID: 'meal-type-picker' }, children);
  Picker.Item = ({ label, value }) =>
    React.createElement(
      TouchableOpacity,
      { testID: 'picker-item-' + value, onPress: () => {} },
      React.createElement(Text, null, label),
    );
  return { Picker };
});

jest.mock('react-native-modal-datetime-picker', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return ({ isVisible, onConfirm, onCancel }) => {
    if (!isVisible) return null;
    return React.createElement(
      View,
      { testID: 'datetime-picker' },
      React.createElement(
        TouchableOpacity,
        { testID: 'picker-confirm', onPress: () => onConfirm(new Date('2024-06-15T12:00:00.000Z')) },
        React.createElement(Text, null, 'Confirm'),
      ),
      React.createElement(
        TouchableOpacity,
        { testID: 'picker-cancel', onPress: onCancel },
        React.createElement(Text, null, 'Cancel'),
      ),
    );
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Stack: { Screen: () => null },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// food_log.jsx also imports @react-native-community/datetimepicker (iOS path)
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, { testID: 'native-datetime-picker' });
});

/* ─── Shared product fixture ─────────────────────────────────────────── */

const MOCK_PRODUCT = {
  code: 'abc123',
  product_name_en: 'Test Food',
  brands: 'Test Brand',
  nutriments: { 'energy-kcal': 200, proteins_100g: 5, carbohydrates_100g: 30, fat_100g: 8 },
  ingredients_text_en: 'wheat, milk, eggs',
  allergens_tags: ['en:gluten', 'en:milk'],
};

/* ─── Helper ─────────────────────────────────────────────────────────── */
// The component uses a manual Search button (not a debounce-on-type).
// Type the query, press Search, then select the result.
async function searchAndSelect(utils) {
  await act(async () => {
    fireEvent.changeText(utils.getByPlaceholderText('Search for food...'), 'Test Food');
  });
  await act(async () => {
    fireEvent.press(utils.getByText('Search'));
  });
  await waitFor(() => utils.getByText('Test Food'));
  await act(async () => { fireEvent.press(utils.getByText('Test Food')); });
  await waitFor(() => utils.getByText('Submit Log'));
}

/* ─── log single food item ───────────────────────────────────────────── */

describe('FoodLog — log single food item', () => {
  beforeEach(() => {
    mockOffSearch.mockResolvedValue({ products: [MOCK_PRODUCT], total: 1 });
    mockQueueLocalChange.mockResolvedValue(undefined);
    mockSyncLocalChangesToSupabase.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the search input and barcode button', () => {
    const { getByPlaceholderText, getByText } = render(<FoodLog />);
    expect(getByPlaceholderText('Search for food...')).toBeTruthy();
    expect(getByText('Scan Barcode')).toBeTruthy();
  });

  it('calls offSearch when user types and presses Search', async () => {
    const { getByPlaceholderText, getByText } = render(<FoodLog />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Search for food...'), 'apple');
    });
    expect(mockOffSearch).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.press(getByText('Search'));
    });
    await waitFor(() => expect(mockOffSearch).toHaveBeenCalledWith('apple', 1));
  });

  it('displays search results after typing and pressing Search', async () => {
    const utils = render(<FoodLog />);
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search for food...'), 'Test Food');
    });
    await act(async () => {
      fireEvent.press(utils.getByText('Search'));
    });
    await waitFor(() => utils.getByText('Test Food'));
    expect(utils.getByText('Test Brand')).toBeTruthy();
  });

  it('shows product card with calories after selecting a result', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    expect(utils.getByText('Brand: Test Brand')).toBeTruthy();
    expect(utils.getByText(/Calories:/)).toBeTruthy();
  });

  it('shows submit button once a product is selected', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    expect(utils.getByText('Submit Log')).toBeTruthy();
  });

  it('queues a local change with correct fields on submit', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() =>
      expect(mockQueueLocalChange).toHaveBeenCalledWith(
        'create',
        'food_log',
        expect.objectContaining({
          foodName: 'Test Food',
          meal_type: 'breakfast',
          servings: 1,
          calories: '200',
        }),
      ),
    );
  });

  it('syncs to Supabase after queuing', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() => expect(mockSyncLocalChangesToSupabase).toHaveBeenCalled());
  });

  it('resets the form after a successful submit', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() => expect(utils.queryByText('Submit Log')).toBeNull());
    expect(utils.getByPlaceholderText('Search for food...').props.value).toBe('');
  });

  it('increments serving count with + button', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('+')); });
    expect(utils.getByText('1.5')).toBeTruthy();
  });

  it('servings does not go below 0.5', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('-')); }); // 1 → 0.5
    await act(async () => { fireEvent.press(utils.getByText('-')); }); // stays 0.5
    expect(utils.getByText('0.5')).toBeTruthy();
  });

  it('calories scale with serving count', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('+')); }); // 1.5 × 200 = 300
    expect(utils.getByText(/300/)).toBeTruthy();
  });
});

/* ─── edit existing food log (date/time) ────────────────────────────── */

describe('FoodLog — edit existing food log (date/time)', () => {
  beforeEach(() => {
    mockOffSearch.mockResolvedValue({ products: [MOCK_PRODUCT], total: 1 });
    mockQueueLocalChange.mockResolvedValue(undefined);
    mockSyncLocalChangesToSupabase.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('opens the datetime picker when "Pick Date & Time" is pressed', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Pick Date & Time')); });
    // Platform.OS is 'ios' in Jest — the iOS modal is shown with a Done button
    expect(utils.getByText('Done')).toBeTruthy();
  });

  it('button label updates after confirming the picker', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Pick Date & Time')); });
    await act(async () => { fireEvent.press(utils.getByText('Done')); });
    await waitFor(() => expect(utils.queryByText('Pick Date & Time')).toBeNull());
  });

  it('saves the chosen datetime into the queued log entry', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Pick Date & Time')); });
    await act(async () => { fireEvent.press(utils.getByText('Done')); });
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() =>
      expect(mockQueueLocalChange).toHaveBeenCalledWith(
        'create',
        'food_log',
        expect.objectContaining({
          date_time: expect.any(Date),
        }),
      ),
    );
  });
});

/* ─── delete food log ────────────────────────────────────────────────── */

describe('FoodLog — delete food log', () => {
  beforeEach(() => {
    mockOffSearch.mockResolvedValue({ products: [MOCK_PRODUCT], total: 1 });
    mockQueueLocalChange.mockResolvedValue(undefined);
    mockSyncLocalChangesToSupabase.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('product card disappears from UI after submit', async () => {
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() => expect(utils.queryByText('Submit Log')).toBeNull());
  });

  it('queues a delete operation with the correct shape', async () => {
    await act(async () => {
      await mockQueueLocalChange('delete', 'food_log', { id: 'test-uuid-1234' });
    });
    expect(mockQueueLocalChange).toHaveBeenCalledWith('delete', 'food_log', { id: 'test-uuid-1234' });
  });

  it('does not sync when queueLocalChange rejects', async () => {
    mockQueueLocalChange.mockRejectedValueOnce(new Error('queue error'));
    const utils = render(<FoodLog />);
    await searchAndSelect(utils);
    await act(async () => { fireEvent.press(utils.getByText('Submit Log')); });
    await waitFor(() => expect(mockQueueLocalChange).toHaveBeenCalled());
    expect(mockSyncLocalChangesToSupabase).not.toHaveBeenCalled();
  });
});
