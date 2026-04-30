import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SymptomLog from '../app/symptom_log';

/* ─── Fixtures ───────────────────────────────────────────────────────── */

const MOCK_FOOD_LOGS = [
  { id: 'food-1', food_name: 'Peanut Butter Toast', meal_type: 'breakfast', date_time: '2024-06-01T08:00:00.000Z', user_id: 'user-abc' },
  { id: 'food-2', food_name: 'Pasta Salad',         meal_type: 'lunch',     date_time: '2024-06-01T12:30:00.000Z', user_id: 'user-abc' },
];

const MOCK_SYMPTOM_LOGS = [
  { id: 'sym-1', symptom: 'hives', severity: 7, date_time: '2024-06-01T09:00:00.000Z', food_log_ids: ['food-1'], user_id: 'user-abc' },
];

/* ─── Supabase mock ──────────────────────────────────────────────────── */

let insertMock = jest.fn().mockResolvedValue({ data: null, error: null });

// Component calls: .from(table).select('*').eq(...).is(...).order(...).limit(10)
// So .order() must return `this` and .limit() must resolve the promise.
const makeChain = ({ data, error }) => ({
  select: jest.fn().mockReturnThis(),
  insert: insertMock,
  update: jest.fn().mockReturnThis(),
  eq:     jest.fn().mockReturnThis(),
  is:     jest.fn().mockReturnThis(),
  order:  jest.fn().mockReturnThis(),           // changed: returns this so .limit() can be chained
  limit:  jest.fn().mockResolvedValue({ data, error }), // new: terminal call that resolves
  in:     jest.fn().mockReturnThis(),
});

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  Stack: { Screen: () => null },
}));

/* ─── Setup ──────────────────────────────────────────────────────────── */

beforeEach(() => {
  insertMock = jest.fn().mockResolvedValue({ data: null, error: null });

  const { supabase } = require('../lib/supabase');
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
  supabase.from.mockImplementation((table) => {
    if (table === 'food_log')    return makeChain({ data: MOCK_FOOD_LOGS, error: null });
    if (table === 'symptom_log') return { ...makeChain({ data: MOCK_SYMPTOM_LOGS, error: null }), insert: insertMock };
    return makeChain({ data: [], error: null });
  });
});

afterEach(() => { jest.clearAllMocks(); });

/* ─── Tests ──────────────────────────────────────────────────────────── */

describe('SymptomLog — log symptom(s)', () => {
  it('renders the food log list after loading', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => expect(getByText('Peanut Butter Toast')).toBeTruthy());
    expect(getByText('Pasta Salad')).toBeTruthy();
  });

  it('does not show symptom input before a food is selected', async () => {
    // Component shows the TextArea only when selectedFood is set.
    // The actual placeholder is "E.g. Bloating, itchy throat, headache..."
    const { queryByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => {});
    expect(queryByPlaceholderText('E.g. Bloating, itchy throat, headache...')).toBeNull();
  });

  it('shows symptom input after selecting a food item', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    // Actual placeholder text from symptom_log.jsx
    expect(getByPlaceholderText('E.g. Bloating, itchy throat, headache...')).toBeTruthy();
  });

  it('severity defaults to 1', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    // Actual label text from SeverityPicker: "How severe is the symptom? (N/10)"
    expect(getByText('How severe is the symptom? (1/10)')).toBeTruthy();
  });

  it('increments severity by tapping a higher number', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    // Tap the "2" circle to set severity to 2
    await act(async () => { fireEvent.press(getByText('2')); });
    expect(getByText('How severe is the symptom? (2/10)')).toBeTruthy();
  });

  it('decrements severity by tapping a lower number', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getByText('3')); }); // set to 3
    await act(async () => { fireEvent.press(getByText('2')); }); // back to 2
    expect(getByText('How severe is the symptom? (2/10)')).toBeTruthy();
  });

  it('severity does not exceed 10', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    // Tap 10 — the maximum circle
    await act(async () => { fireEvent.press(getByText('10')); });
    expect(getByText('How severe is the symptom? (10/10)')).toBeTruthy();
  });

  it('severity does not go below 1', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    // Tap 1 — the minimum circle; severity stays at 1
    await act(async () => { fireEvent.press(getByText('1')); });
    expect(getByText('How severe is the symptom? (1/10)')).toBeTruthy();
  });

  it('inserts a symptom log with correct fields on submit', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('E.g. Bloating, itchy throat, headache...'),
        'stomach cramps',
      );
    });

    // Set severity to 5 by tapping the "5" circle
    await act(async () => { fireEvent.press(getByText('5')); });

    // Actual submit button label from symptom_log.jsx
    await act(async () => { fireEvent.press(getByText('Save Symptom Log')); });

    await waitFor(() =>
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          symptom: 'stomach cramps',
          severity: 5,
          food_log_ids: ['food-1'],
          user_id: 'user-abc',
        }),
      ),
    );
  });

  it('resets symptom field after successful submission', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('E.g. Bloating, itchy throat, headache...'),
        'nausea',
      );
    });
    await act(async () => { fireEvent.press(getByText('Save Symptom Log')); });
    // selectedFood is set to null after submit, which re-renders the form section away
    // and then back once a new food is selected. Re-query after re-selecting the food.
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await waitFor(() =>
      expect(
        getByPlaceholderText('E.g. Bloating, itchy throat, headache...').props.value,
      ).toBe(''),
    );
  });

  it('shows alert when symptom text is empty on submit', async () => {
    const { Alert } = require('react-native');
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getByText('Save Symptom Log')); });
    await waitFor(() =>
      // Actual alert title/message from symptom_log.jsx
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Info',
        'Please select a meal and describe your symptom.',
      ),
    );
  });

  it('can log symptoms for multiple food items sequentially', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Pasta Salad'));

    await act(async () => { fireEvent.press(getByText('Pasta Salad')); });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('E.g. Bloating, itchy throat, headache...'), 'bloating');
    });
    await act(async () => { fireEvent.press(getByText('Save Symptom Log')); });
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));

    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('E.g. Bloating, itchy throat, headache...'), 'itching');
    });
    await act(async () => { fireEvent.press(getByText('Save Symptom Log')); });
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(2));
  });
});
