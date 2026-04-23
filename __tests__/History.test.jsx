import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import History from '../app/history';

/* ─── Fixtures ───────────────────────────────────────────────────────── */

const FOOD_LOGS = [
  { id: 'f1', food_name: 'Almond Milk',         meal_type: 'breakfast', date_time: '2024-06-01T08:00:00.000Z', calories: 60,  brand: 'BlueDiamond', ingredients: 'almonds, water',  allergens: ['en:tree-nuts'], user_id: 'user-abc' },
  { id: 'f2', food_name: 'Pasta Salad',          meal_type: 'lunch',     date_time: '2024-06-01T12:30:00.000Z', calories: 400, brand: null,           ingredients: 'pasta, tomatoes', allergens: ['en:gluten'],    user_id: 'user-abc' },
  { id: 'f3', food_name: 'Peanut Butter Toast',  meal_type: 'snack',     date_time: '2024-06-02T15:00:00.000Z', calories: 300, brand: null,           ingredients: 'bread, peanuts', allergens: ['en:peanuts'],   user_id: 'user-abc' },
];

const SYMPTOM_LOGS = [
  { id: 's1', symptom: 'hives',  severity: 7, date_time: '2024-06-01T08:30:00.000Z', food_log_ids: ['f1'], user_id: 'user-abc' },
  { id: 's2', symptom: 'nausea', severity: 4, date_time: '2024-06-01T13:00:00.000Z', food_log_ids: ['f2'], user_id: 'user-abc' },
];

/* ─── Supabase mock ──────────────────────────────────────────────────── */

const makeChain = ({ data, error }) => ({
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq:     jest.fn().mockReturnThis(),
  is:     jest.fn().mockReturnThis(),
  order:  jest.fn().mockResolvedValue({ data, error }),
  in:     jest.fn().mockReturnThis(),
});

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

/* ─── Setup ──────────────────────────────────────────────────────────── */

beforeEach(() => {
  const { supabase } = require('../lib/supabase');
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
  supabase.from.mockImplementation((table) => {
    if (table === 'food_log')           return makeChain({ data: FOOD_LOGS,    error: null });
    if (table === 'symptom_log')        return makeChain({ data: SYMPTOM_LOGS, error: null });
    if (table === 'evaluation_history') return makeChain({ data: [],           error: null });
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
  const moment = require('moment');

  const filterByDate = (logs, dateFrom, dateTo) => {
    let out = [...logs];
    if (dateFrom) out = out.filter((f) => moment(f.date_time).startOf('day').isSameOrAfter(moment(dateFrom).startOf('day')));
    if (dateTo)   out = out.filter((f) => moment(f.date_time).startOf('day').isSameOrBefore(moment(dateTo).startOf('day')));
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
  const moment = require('moment');

  const filterByTime = (logs, timeFrom, timeTo) => {
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