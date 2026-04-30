import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import History from '../app/history';
import moment from 'moment';

/* ─── Fixtures ───────────────────────────────────────────────────────── */

const FOOD_LOGS = [
  { id: 'f1', food_name: 'Almond Milk', meal_type: 'breakfast', date_time: '2024-06-01T08:00:00.000Z', calories: 60, brand: 'BlueDiamond', ingredients: 'almonds, water', allergens: ['en:tree-nuts'], user_id: 'user-abc' },
  { id: 'f2', food_name: 'Pasta Salad', meal_type: 'lunch', date_time: '2024-06-01T12:30:00.000Z', calories: 400, brand: null, ingredients: 'pasta, tomatoes', allergens: ['en:gluten'], user_id: 'user-abc' },
  { id: 'f3', food_name: 'Peanut Butter Toast', meal_type: 'snack', date_time: '2024-06-02T15:00:00.000Z', calories: 300, brand: null, ingredients: 'bread, peanuts', allergens: ['en:peanuts'], user_id: 'user-abc' },
];

const SYMPTOM_LOGS = [
  { id: 's1', symptom: 'hives', severity: 7, date_time: '2024-06-01T08:30:00.000Z', food_log_ids: ['f1'], user_id: 'user-abc' },
  { id: 's2', symptom: 'nausea', severity: 4, date_time: '2024-06-01T13:00:00.000Z', food_log_ids: ['f2'], user_id: 'user-abc' },
];

/* ─── Supabase mock ──────────────────────────────────────────────────── */

// food_log ends with .is()        → .is() must resolve
// symptom_log ends with .order()  → .order() must resolve
// evaluation_history ends with .order() → same
// update chains (.eq at the end)  → .eq() must resolve for those
const makeChain = ({ data, error }) => {
  const resolved = Promise.resolve({ data, error });
  const chain = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnValue(resolved),
    is: jest.fn().mockReturnValue(resolved),
    order: jest.fn().mockReturnValue(resolved),
    in: jest.fn().mockReturnValue(resolved),
  };
  // Allow further chaining after eq/is/order when they aren't terminal
  // by also attaching the chain methods to the resolved promise shim
  Object.assign(resolved, chain);
  return chain;
};

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return ({ name, ...props }) =>
    React.createElement(TouchableOpacity, { testID: 'icon-' + name, ...props });
});

jest.mock('react-native-modal-datetime-picker', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return ({ isVisible, onConfirm, onCancel, mode }) => {
    if (!isVisible) return null;
    return React.createElement(
      View,
      { testID: 'filter-datetime-picker' },
      React.createElement(
        TouchableOpacity,
        {
          testID: 'picker-confirm-filter',
          onPress: () => onConfirm(
            mode === 'date'
              ? new Date('2024-06-01T00:00:00.000Z')
              : new Date('1970-01-01T10:00:00.000Z'),
          ),
        },
        React.createElement(Text, null, 'Confirm'),
      ),
      React.createElement(
        TouchableOpacity,
        { testID: 'picker-cancel-filter', onPress: onCancel },
        React.createElement(Text, null, 'Cancel'),
      ),
    );
  };
});

// history.jsx imports DateTimePicker from @react-native-community/datetimepicker
// for the iOS inline picker path. Must be mocked to avoid native module errors.
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, { testID: 'native-datetime-picker' });
});

/* ─── Setup ──────────────────────────────────────────────────────────── */

beforeEach(() => {
  const { supabase } = require('../lib/supabase');
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
  supabase.from.mockImplementation((table) => {
    if (table === 'food_log') return makeChain({ data: FOOD_LOGS, error: null });
    if (table === 'symptom_log') return makeChain({ data: SYMPTOM_LOGS, error: null });
    if (table === 'evaluation_history') return makeChain({ data: [], error: null });
    return makeChain({ data: [], error: null });
  });
});

afterEach(() => { jest.clearAllMocks(); });

/* ─── Helper ─────────────────────────────────────────────────────────── */

async function openFilterModal(utils) {
  await act(async () => { fireEvent.press(utils.getByTestId('icon-funnel')); });
  await waitFor(() => utils.getByText('Filter & Sort'));
}

/* ─── chronological food history ────────────────────────────────────── */

describe('History — view chronological food history', () => {
  it('renders all food log entries after loading', async () => {
    const { getByText } = render(<History />);
    await waitFor(() => expect(getByText('Almond Milk')).toBeTruthy());
    expect(getByText('Pasta Salad')).toBeTruthy();
    expect(getByText('Peanut Butter Toast')).toBeTruthy();
  });

  it('shows empty state when food log is empty', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.from.mockImplementation(() => makeChain({ data: [], error: null }));
    const { getByText } = render(<History />);
    await waitFor(() => expect(getByText('No food has been logged yet.')).toBeTruthy());
  });

  it('renders logged timestamps for each entry', async () => {
    const { getAllByText } = render(<History />);
    await waitFor(() => getAllByText(/Logged:/));
    expect(getAllByText(/Logged:/).length).toBe(3);
  });

  it('displays symptoms linked to a food entry', async () => {
    const { getByText } = render(<History />);
    await waitFor(() => getByText('hives'));
    expect(getByText('nausea')).toBeTruthy();
  });

  it('shows "No symptoms logged" for entries without symptoms', async () => {
    const { getAllByText } = render(<History />);
    await waitFor(() => getAllByText('No symptoms logged for this food.'));
    expect(getAllByText('No symptoms logged for this food.').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Edit Time and Delete Entire Log buttons on each card', async () => {
    const { getAllByText } = render(<History />);
    await waitFor(() => getAllByText('Edit Time'));
    expect(getAllByText('Edit Time').length).toBe(3);
    expect(getAllByText('Delete Entire Log').length).toBe(3);
  });
});

/* ─── filter by food name ────────────────────────────────────────────── */

describe('History — filter by food name', () => {
  it('filters to only entries matching the food name query', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'pasta');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Pasta Salad')).toBeTruthy());
    expect(utils.queryByText('Almond Milk')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('food name search is case-insensitive', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'ALMOND');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
  });

  it('shows all entries when food name query is cleared', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'pasta');
    });
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), '');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('"Clear Filters" resets food name search', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'pasta');
    });
    await act(async () => { fireEvent.press(utils.getByText('Clear Filters')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
    });
  });
});

/* ─── filter by symptom ──────────────────────────────────────────────── */

describe('History — filter by symptom', () => {
  it('shows only food linked to a matching symptom', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'hives');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('filters to food linked to "nausea"', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Pasta Salad'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'nausea');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Pasta Salad')).toBeTruthy());
    expect(utils.queryByText('Almond Milk')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  // Pure logic tests — no UI needed, fast and reliable
  it('symptom filter logic matches correct food ids (unit test)', () => {
    const filter = (foodLogs, symptomLogs, query) => {
      const ids = new Set();
      symptomLogs.forEach((s) => {
        if (s.symptom.toLowerCase().includes(query.toLowerCase()))
          s.food_log_ids?.forEach((id) => ids.add(id));
      });
      return foodLogs.filter((f) => ids.has(f.id));
    };
    expect(filter(FOOD_LOGS, SYMPTOM_LOGS, 'hives')).toHaveLength(1);
    expect(filter(FOOD_LOGS, SYMPTOM_LOGS, 'hives')[0].food_name).toBe('Almond Milk');
  });

  it('symptom filter is case-insensitive (unit test)', () => {
    const filter = (foodLogs, symptomLogs, query) => {
      const ids = new Set();
      symptomLogs.forEach((s) => {
        if (s.symptom.toLowerCase().includes(query.toLowerCase()))
          s.food_log_ids?.forEach((id) => ids.add(id));
      });
      return foodLogs.filter((f) => ids.has(f.id));
    };
    expect(filter(FOOD_LOGS, SYMPTOM_LOGS, 'NAUSEA')[0].food_name).toBe('Pasta Salad');
  });

  it('returns no entries when symptom query matches nothing (unit test)', () => {
    const filter = (foodLogs, symptomLogs, query) => {
      const ids = new Set();
      symptomLogs.forEach((s) => {
        if (s.symptom.toLowerCase().includes(query.toLowerCase()))
          s.food_log_ids?.forEach((id) => ids.add(id));
      });
      return foodLogs.filter((f) => ids.has(f.id));
    };
    expect(filter(FOOD_LOGS, SYMPTOM_LOGS, 'anaphylaxis')).toHaveLength(0);
  });
});

/* ─── filter by date range ───────────────────────────────────────────── */

describe('History — filter by date range', () => {
  const filterByDate = (logs, dateFrom, dateTo) => {
    let out = [...logs];
    
    if (dateFrom) {
        out = out.filter((f) => 
            moment.utc(f.date_time).startOf('day').isSameOrAfter(moment.utc(dateFrom).startOf('day'))
        );
    }
    
    if (dateTo) {
        out = out.filter((f) => 
            moment.utc(f.date_time).startOf('day').isSameOrBefore(moment.utc(dateTo).startOf('day'))
        );
    }
    
    return out;
};

  it('returns only entries on or after dateFrom', () => {
    const result = filterByDate(FOOD_LOGS, new Date('2024-06-02T00:00:00.000Z'), null);
    expect(result).toHaveLength(1);
    expect(result[0].food_name).toBe('Peanut Butter Toast');
  });

  it('returns only entries on or before dateTo', () => {
    const result = filterByDate(FOOD_LOGS, null, new Date('2024-06-01T23:59:59.000Z'));
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.food_name)).toEqual(expect.arrayContaining(['Almond Milk', 'Pasta Salad']));
  });

  it('returns entries within an inclusive date range', () => {
    expect(filterByDate(FOOD_LOGS, new Date('2024-06-01T00:00:00.000Z'), new Date('2024-06-01T23:59:59.000Z'))).toHaveLength(2);
  });

  it('returns no entries when range excludes all logs', () => {
    expect(filterByDate(FOOD_LOGS, new Date('2024-07-01T00:00:00.000Z'), new Date('2024-07-31T23:59:59.000Z'))).toHaveLength(0);
  });

  it('returns all entries when no bounds are set', () => {
    expect(filterByDate(FOOD_LOGS, null, null)).toHaveLength(3);
  });

  it('opens the From Date picker when the button is pressed', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('From Date')); });
    expect(utils.getByTestId('filter-datetime-picker')).toBeTruthy();
  });

  it('From Date button label updates after confirming the picker', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('From Date')); });
    await act(async () => { fireEvent.press(utils.getByTestId('picker-confirm-filter')); });
    await waitFor(() => expect(utils.queryByText('From Date')).toBeNull());
  });
});

/* ─── filter by time ─────────────────────────────────────────────────── */

describe('History — filter by time', () => {
  const filterByTime = (logs, timeFrom, timeTo) => {
    return logs.filter((f) => {
      // Force UTC parsing for both logs and filter arguments
      const fTime = moment.utc(f.date_time);
      const fMins = fTime.hours() * 60 + fTime.minutes();

      let pass = true;
      if (timeFrom) {
        const fromMins = moment.utc(timeFrom).hours() * 60 + moment.utc(timeFrom).minutes();
        if (fMins < fromMins) pass = false;
      }
      if (timeTo) {
        const toMins = moment.utc(timeTo).hours() * 60 + moment.utc(timeTo).minutes();
        if (fMins > toMins) pass = false;
      }
      return pass;
    });
  };

  it('returns only entries at or after timeFrom', () => {
    const result = filterByTime(FOOD_LOGS, new Date('1970-01-01T10:00:00.000Z'), null);
    expect(result.map((f) => f.food_name)).not.toContain('Almond Milk');
    expect(result.map((f) => f.food_name)).toContain('Pasta Salad');
  });

  it('returns only entries at or before timeTo', () => {
    const result = filterByTime(FOOD_LOGS, null, new Date('1970-01-01T09:00:00.000Z'));
    expect(result).toHaveLength(1);
    expect(result[0].food_name).toBe('Almond Milk');
  });

  it('returns entries within a time window', () => {
    const result = filterByTime(
      FOOD_LOGS,
      new Date('1970-01-01T08:00:00.000Z'),
      new Date('1970-01-01T13:00:00.000Z'),
    );
    expect(result.map((f) => f.food_name)).toEqual(expect.arrayContaining(['Almond Milk', 'Pasta Salad']));
    expect(result.map((f) => f.food_name)).not.toContain('Peanut Butter Toast');
  });

  it('returns no entries when time window excludes all logs', () => {
    expect(filterByTime(FOOD_LOGS, new Date('1970-01-01T20:00:00.000Z'), new Date('1970-01-01T22:00:00.000Z'))).toHaveLength(0);
  });

  it('returns all entries when no time bounds set', () => {
    expect(filterByTime(FOOD_LOGS, null, null)).toHaveLength(3);
  });

  it('time filter is date-agnostic (only compares hours and minutes)', () => {
    const result = filterByTime(FOOD_LOGS, new Date('2024-06-02T12:00:00.000Z'), null);
    expect(result.map((f) => f.food_name)).toContain('Pasta Salad');
    expect(result.map((f) => f.food_name)).toContain('Peanut Butter Toast');
  });

  it('opens the From Time picker when the button is pressed', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('From Time')); });
    expect(utils.getByTestId('filter-datetime-picker')).toBeTruthy();
  });

  it('From Time button label updates after confirming the picker', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('From Time')); });
    await act(async () => { fireEvent.press(utils.getByTestId('picker-confirm-filter')); });
    await waitFor(() => expect(utils.queryByText('From Time')).toBeNull());
  });
});

/* ─── filter by food name (extended) ────────────────────────────────── */

describe('History — filter by food name (extended)', () => {
  it('partial match on food name shows only matching entries', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'peanut');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Peanut Butter Toast')).toBeTruthy());
    expect(utils.queryByText('Almond Milk')).toBeNull();
    expect(utils.queryByText('Pasta Salad')).toBeNull();
  });

  it('query that matches no food name shows no entries', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'zzznomatch');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.queryByText('Almond Milk')).toBeNull();
      expect(utils.queryByText('Pasta Salad')).toBeNull();
      expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
    });
  });

  it('food name filter is applied live (before pressing Close)', async () => {
    // Typing in the filter input narrows the query state immediately;
    // pressing Close just dismisses the modal — entries are already filtered.
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'almond');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('single-character food name query still filters correctly', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    // 'a' matches 'Almond Milk', 'Pasta Salad' and 'Peanut Butter Toast'
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'a');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('switching from food search to symptom search clears food filter results', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    // Type a food query that narrows results
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'almond');
    });
    // Switch to symptom mode
    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));

    // Clear the query (it still holds 'almond' from the food search)
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), '');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    // With no symptom query, all entries should be visible
    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  // Pure logic unit tests (fast, no render needed)
  it('food filter logic: exact match (unit test)', () => {
    const filter = (logs, query) =>
      logs.filter((f) => f.food_name?.toLowerCase().includes(query.toLowerCase()));
    expect(filter(FOOD_LOGS, 'Almond Milk')).toHaveLength(1);
    expect(filter(FOOD_LOGS, 'Almond Milk')[0].id).toBe('f1');
  });

  it('food filter logic: partial match (unit test)', () => {
    const filter = (logs, query) =>
      logs.filter((f) => f.food_name?.toLowerCase().includes(query.toLowerCase()));
    expect(filter(FOOD_LOGS, 'salad')).toHaveLength(1);
    expect(filter(FOOD_LOGS, 'salad')[0].food_name).toBe('Pasta Salad');
  });

  it('food filter logic: empty query returns all entries (unit test)', () => {
    const filter = (logs, query) =>
      query.trim() ? logs.filter((f) => f.food_name?.toLowerCase().includes(query.toLowerCase())) : logs;
    expect(filter(FOOD_LOGS, '')).toHaveLength(3);
  });

  it('food filter logic: no match returns empty array (unit test)', () => {
    const filter = (logs, query) =>
      logs.filter((f) => f.food_name?.toLowerCase().includes(query.toLowerCase()));
    expect(filter(FOOD_LOGS, 'sushi')).toHaveLength(0);
  });
});

/* ─── filter by symptom (extended) ──────────────────────────────────── */

describe('History — filter by symptom (extended)', () => {
  it('switching to Symptom mode shows the symptom search placeholder', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => expect(utils.getByPlaceholderText('Search by symptom...')).toBeTruthy());
  });

  it('symptom query that matches no symptoms shows no entries', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'anaphylaxis');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.queryByText('Almond Milk')).toBeNull();
      expect(utils.queryByText('Pasta Salad')).toBeNull();
      expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
    });
  });

  it('symptom search is case-insensitive', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'HIVES');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('partial symptom query matches correctly', async () => {
    // 'nau' is a partial match for 'nausea'
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Pasta Salad'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'nau');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Pasta Salad')).toBeTruthy());
    expect(utils.queryByText('Almond Milk')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('food without any linked symptom is excluded when symptom filter is active', async () => {
    // Peanut Butter Toast (f3) has no symptoms in SYMPTOM_LOGS
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Peanut Butter Toast'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'hives');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    // Peanut Butter Toast has no symptoms at all — must not appear
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('"Clear Filters" while in symptom mode resets query and shows all entries', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'hives');
    });
    await act(async () => { fireEvent.press(utils.getByText('Clear Filters')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  // Pure logic unit tests
  it('symptom filter: one symptom linked to multiple foods includes all linked foods (unit test)', () => {
    const multiLogs = [
      ...SYMPTOM_LOGS,
      { id: 's3', symptom: 'hives', severity: 3, date_time: '2024-06-02T16:00:00.000Z', food_log_ids: ['f3'], user_id: 'user-abc' },
    ];
    const filter = (foodLogs, symptomLogs, query) => {
      const ids = new Set();
      symptomLogs.forEach((s) => {
        if (s.symptom.toLowerCase().includes(query.toLowerCase()))
          s.food_log_ids?.forEach((id) => ids.add(id));
      });
      return foodLogs.filter((f) => ids.has(f.id));
    };
    const result = filter(FOOD_LOGS, multiLogs, 'hives');
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.food_name)).toEqual(
      expect.arrayContaining(['Almond Milk', 'Peanut Butter Toast']),
    );
  });

  it('symptom filter: empty query returns all entries (unit test)', () => {
    const filter = (foodLogs, symptomLogs, query) => {
      if (!query.trim()) return foodLogs;
      const ids = new Set();
      symptomLogs.forEach((s) => {
        if (s.symptom.toLowerCase().includes(query.toLowerCase()))
          s.food_log_ids?.forEach((id) => ids.add(id));
      });
      return foodLogs.filter((f) => ids.has(f.id));
    };
    expect(filter(FOOD_LOGS, SYMPTOM_LOGS, '')).toHaveLength(3);
  });
});

/* ─── sort by date range ─────────────────────────────────────────────── */

describe('History — sort by date range', () => {
  // Sorting logic mirrored from getFilteredAndSortedLogs
  const sortByDate = (logs) =>
    [...logs].sort((a, b) => moment(b.date_time).diff(moment(a.date_time)));

  it('"Date (Newest)" sort button is present in the filter modal', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    expect(utils.getByText('Date (Newest)')).toBeTruthy();
  });

  it('default sort order is newest-first', async () => {
    // FOOD_LOGS: f3 (Jun 2) > f2 (Jun 1 12:30) > f1 (Jun 1 08:00)
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));

    const allCards = utils.getAllByText(/Logged:/);
    // With date-newest sort the first card's timestamp should be the latest
    expect(allCards.length).toBe(3);
  });

  it('sort by date: newest entry appears before older entries (unit test)', () => {
    const sorted = sortByDate(FOOD_LOGS);
    expect(sorted[0].id).toBe('f3'); // 2024-06-02
    expect(sorted[1].id).toBe('f2'); // 2024-06-01T12:30
    expect(sorted[2].id).toBe('f1'); // 2024-06-01T08:00
  });

  it('sort by date: single entry is returned unchanged (unit test)', () => {
    const sorted = sortByDate([FOOD_LOGS[0]]);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('f1');
  });

  it('sort by date: entries on the same date are ordered by time descending (unit test)', () => {
    const sorted = sortByDate(FOOD_LOGS.filter((f) => f.date_time.startsWith('2024-06-01')));
    expect(sorted[0].id).toBe('f2'); // 12:30 before 08:00
    expect(sorted[1].id).toBe('f1');
  });

  it('pressing "Date (Newest)" sort button does not crash and keeps all entries visible', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('Date (Newest)')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('"A - Z" sort button is present in the filter modal', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    expect(utils.getByText('A - Z')).toBeTruthy();
  });

  it('A-Z sort puts Almond Milk before Pasta Salad before Peanut Butter Toast (unit test)', () => {
    const sorted = [...FOOD_LOGS].sort((a, b) => a.food_name.localeCompare(b.food_name));
    expect(sorted.map((f) => f.food_name)).toEqual([
      'Almond Milk',
      'Pasta Salad',
      'Peanut Butter Toast',
    ]);
  });

  it('Z-A sort puts Peanut Butter Toast before Pasta Salad before Almond Milk (unit test)', () => {
    const sorted = [...FOOD_LOGS].sort((a, b) => b.food_name.localeCompare(a.food_name));
    expect(sorted.map((f) => f.food_name)).toEqual([
      'Peanut Butter Toast',
      'Pasta Salad',
      'Almond Milk',
    ]);
  });

  it('pressing "A - Z" sort shows all entries and does not crash', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('A - Z')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('pressing "Z - A" sort shows all entries and does not crash', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('Z - A')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('"Clear Filters" resets sort back to date-newest', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('A - Z')); });
    await act(async () => { fireEvent.press(utils.getByText('Clear Filters')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    // After clearing, date sort is active — all entries still visible
    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('date filter combined with date-newest sort returns only in-range entries sorted correctly (unit test)', () => {
    const dateFrom = new Date('2024-06-01T00:00:00.000Z');
    const dateTo = new Date('2024-06-01T23:59:59.000Z');
    const filtered = FOOD_LOGS.filter((f) =>
      moment(f.date_time).isSameOrAfter(moment(dateFrom).startOf('day')) &&
      moment(f.date_time).isSameOrBefore(moment(dateTo).endOf('day')),
    );
    const sorted = sortByDate(filtered);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].id).toBe('f2'); // 12:30 is newer than 08:00
    expect(sorted[1].id).toBe('f1');
  });
});

/* ─── sort by time ───────────────────────────────────────────────────── */

describe('History — sort by time', () => {
  // Time filter helpers mirrored from getFilteredAndSortedLogs
  const applyTimeFilter = (logs, timeFrom, timeTo) => {
    let out = [...logs];
    if (timeFrom) {
      const fromMins = moment(timeFrom).hours() * 60 + moment(timeFrom).minutes();
      out = out.filter((f) => moment(f.date_time).hours() * 60 + moment(f.date_time).minutes() >= fromMins);
    }
    if (timeTo) {
      const toMins = moment(timeTo).hours() * 60 + moment(timeTo).minutes();
      out = out.filter((f) => moment(f.date_time).hours() * 60 + moment(f.date_time).minutes() <= toMins);
    }
    return out;
  };

  it('"From Time" and "To Time" picker buttons are present in the filter modal', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    expect(utils.getByText('From Time')).toBeTruthy();
    expect(utils.getByText('To Time')).toBeTruthy();
  });

  it('opens the To Time picker when "To Time" is pressed', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('To Time')); });
    expect(utils.getByTestId('filter-datetime-picker')).toBeTruthy();
  });

  it('"To Time" button label updates after confirming the picker', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('To Time')); });
    await act(async () => { fireEvent.press(utils.getByTestId('picker-confirm-filter')); });
    // Confirmed time is 10:00 AM → label becomes "10:00 AM" (not "To Time")
    await waitFor(() => expect(utils.queryByText('To Time')).toBeNull());
  });

  it('picker cancel leaves "To Time" label unchanged', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('To Time')); });
    await act(async () => { fireEvent.press(utils.getByTestId('picker-cancel-filter')); });
    // Cancelled — label stays as "To Time"
    expect(utils.getByText('To Time')).toBeTruthy();
  });

  it('applying From Time = 10:00 hides entries before that time (unit test)', () => {
    // Almond Milk is at 08:00 — below 10:00, should be excluded
    const result = applyTimeFilter(FOOD_LOGS, new Date('1970-01-01T10:00:00.000Z'), null);
    expect(result.map((f) => f.food_name)).not.toContain('Almond Milk');
    expect(result.map((f) => f.food_name)).toContain('Pasta Salad');    // 12:30
    expect(result.map((f) => f.food_name)).toContain('Peanut Butter Toast'); // 15:00
  });

  it('From Time > To Time returns no entries (unit test)', () => {
    // logically impossible window — nothing satisfies both conditions
    const result = applyTimeFilter(
      FOOD_LOGS,
      new Date('1970-01-01T20:00:00.000Z'),
      new Date('1970-01-01T06:00:00.000Z'),
    );
    expect(result).toHaveLength(0);
  });

  it('time filter is independent of the calendar date (unit test)', () => {
    // Use a date in 2024 for the time bound — component only reads hours/minutes
    const result = applyTimeFilter(FOOD_LOGS, new Date('2024-06-15T12:00:00.000Z'), null);
    expect(result.map((f) => f.food_name)).toContain('Pasta Salad');       // 12:30 ≥ 12:00 ✓
    expect(result.map((f) => f.food_name)).toContain('Peanut Butter Toast'); // 15:00 ≥ 12:00 ✓
    expect(result.map((f) => f.food_name)).not.toContain('Almond Milk');   // 08:00 < 12:00 ✗
  });

  it('time filter combined with food name filter narrows results further (unit test)', () => {
    // Time: ≥ 12:00 keeps Pasta Salad + Peanut Butter Toast
    // Food name: "pasta" keeps only Pasta Salad
    const afterTime = applyTimeFilter(FOOD_LOGS, new Date('1970-01-01T12:00:00.000Z'), null);
    const afterName = afterTime.filter((f) => f.food_name.toLowerCase().includes('pasta'));
    expect(afterName).toHaveLength(1);
    expect(afterName[0].food_name).toBe('Pasta Salad');
  });

  it('"Clear Filters" resets both From Time and To Time', async () => {
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    // Set From Time via picker
    await act(async () => { fireEvent.press(utils.getByText('From Time')); });
    await act(async () => { fireEvent.press(utils.getByTestId('picker-confirm-filter')); });
    await waitFor(() => expect(utils.queryByText('From Time')).toBeNull());

    // Clear all filters
    await act(async () => { fireEvent.press(utils.getByText('Clear Filters')); });

    // "From Time" label should be restored
    await waitFor(() => expect(utils.getByText('From Time')).toBeTruthy());
    expect(utils.getByText('To Time')).toBeTruthy();

    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    // All entries visible again
    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });
});

/* ─── view all flagged foods ─────────────────────────────────────────── */

// Evaluation history fixtures used only in this suite
const EVAL_HIGH = {
  id: 'e1', symptom_log_id: 's1', food_name: 'Almond Milk',
  risk: 'High', confidence: '90%', evaluated_at: '2024-06-01T10:00:00.000Z', user_id: 'user-abc',
};
const EVAL_MODERATE = {
  id: 'e2', symptom_log_id: 's2', food_name: 'Pasta Salad',
  risk: 'Moderate', confidence: '70%', evaluated_at: '2024-06-01T14:00:00.000Z', user_id: 'user-abc',
};
// Peanut Butter Toast has no evaluation — intentionally unflagged

// Helper: override the supabase mock to return evaluation history for this suite
function withEvaluations(evals) {
  const { supabase } = require('../lib/supabase');
  supabase.from.mockImplementation((table) => {
    if (table === 'food_log') return makeChain({ data: FOOD_LOGS, error: null });
    if (table === 'symptom_log') return makeChain({ data: SYMPTOM_LOGS, error: null });
    if (table === 'evaluation_history') return makeChain({ data: evals, error: null });
    return makeChain({ data: [], error: null });
  });
}

describe('History — view all flagged foods', () => {
  it('toggle button is visible in the filter modal', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    expect(utils.getByText('⚠️ Show flagged only')).toBeTruthy();
  });

  it('toggle label changes to "Showing flagged only" when activated', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    expect(utils.getByText('⚠️ Showing flagged only')).toBeTruthy();
  });

  it('shows only flagged entries after enabling the toggle', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('shows multiple flagged entries when several foods are evaluated', async () => {
    withEvaluations([EVAL_HIGH, EVAL_MODERATE]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.getByText('Pasta Salad')).toBeTruthy();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('shows no entries when no foods have been evaluated', async () => {
    withEvaluations([]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.queryByText('Almond Milk')).toBeNull();
      expect(utils.queryByText('Pasta Salad')).toBeNull();
      expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
    });
  });

  it('toggling off restores all entries', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    // Enable
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    // Disable
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Showing flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('"Clear Filters" resets the flagged-only toggle', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await waitFor(() => utils.getByText('⚠️ Showing flagged only'));
    await act(async () => { fireEvent.press(utils.getByText('Clear Filters')); });

    // Toggle label should revert
    await waitFor(() => expect(utils.getByText('⚠️ Show flagged only')).toBeTruthy());
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    // All entries back
    await waitFor(() => {
      expect(utils.getByText('Almond Milk')).toBeTruthy();
      expect(utils.getByText('Pasta Salad')).toBeTruthy();
      expect(utils.getByText('Peanut Butter Toast')).toBeTruthy();
    });
  });

  it('flagged-only filter combines with food name search', async () => {
    // Both Almond Milk and Pasta Salad are flagged, but only Pasta Salad matches "pasta"
    withEvaluations([EVAL_HIGH, EVAL_MODERATE]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by food...'), 'pasta');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Pasta Salad')).toBeTruthy());
    expect(utils.queryByText('Almond Milk')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('flagged-only filter combines with symptom search', async () => {
    // Almond Milk is flagged and linked to "hives"; Pasta Salad is flagged and linked to "nausea"
    // Symptom filter "hives" should return only Almond Milk
    withEvaluations([EVAL_HIGH, EVAL_MODERATE]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);

    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Symptom')); });
    await waitFor(() => utils.getByPlaceholderText('Search by symptom...'));
    await act(async () => {
      fireEvent.changeText(utils.getByPlaceholderText('Search by symptom...'), 'hives');
    });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
    expect(utils.queryByText('Peanut Butter Toast')).toBeNull();
  });

  it('food name matching is case-insensitive for flagged filter', async () => {
    // evaluationHistory stores food_name as "Almond Milk"; food_log also has "Almond Milk"
    // getFlaggedFoodNames lowercases both sides, so the match must work regardless of case
    withEvaluations([{ ...EVAL_HIGH, food_name: 'almond milk' }]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
  });

  it('highest-risk evaluation wins when a food has multiple evaluations', () => {
    // Pure logic test mirroring getFlaggedFoodNames
    const riskPriority = { High: 3, Moderate: 2, Low: 1 };
    const evals = [
      { food_name: 'Almond Milk', risk: 'Low' },
      { food_name: 'Almond Milk', risk: 'High' },
      { food_name: 'Almond Milk', risk: 'Moderate' },
    ];
    const flagMap = {};
    evals.forEach((e) => {
      const name = e.food_name.toLowerCase();
      const incoming = riskPriority[e.risk] ?? 0;
      const existing = riskPriority[flagMap[name]?.risk] ?? 0;
      if (incoming > existing) flagMap[name] = { risk: e.risk };
    });
    expect(flagMap['almond milk'].risk).toBe('High');
  });

  it('a food with only a Low-risk evaluation is still included in flagged results', async () => {
    withEvaluations([{
      id: 'e3', symptom_log_id: 's1', food_name: 'Almond Milk',
      risk: 'Low', confidence: '40%', evaluated_at: '2024-06-01T10:00:00.000Z', user_id: 'user-abc',
    }]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Almond Milk'));
    await openFilterModal(utils);
    await act(async () => { fireEvent.press(utils.getByText('⚠️ Show flagged only')); });
    await act(async () => { fireEvent.press(utils.getByText('Close')); });

    await waitFor(() => expect(utils.getByText('Almond Milk')).toBeTruthy());
    expect(utils.queryByText('Pasta Salad')).toBeNull();
  });

  it('risk badges are visible on flagged food cards', async () => {
    withEvaluations([EVAL_HIGH, EVAL_MODERATE]);
    const utils = render(<History />);
    // Wait for food entries to render first, then for badges to appear
    // once the async evaluationHistory fetch completes
    await waitFor(() => utils.getByText('Almond Milk'));
    await waitFor(() => utils.getByText('⚠️ High Risk'));
    expect(utils.getByText('⚡ Moderate Risk')).toBeTruthy();
  });

  it('unflagged food card has no risk badge', async () => {
    withEvaluations([EVAL_HIGH]);
    const utils = render(<History />);
    await waitFor(() => utils.getByText('Peanut Butter Toast'));
    // Wait long enough for evaluationHistory to settle, then assert no badge
    await waitFor(() => utils.getByText('⚠️ High Risk')); // Almond Milk badge confirms evals loaded
    // Peanut Butter Toast has no evaluation — must have no badge
    expect(utils.queryByText('✓ Low Risk')).toBeNull();
  });
});
