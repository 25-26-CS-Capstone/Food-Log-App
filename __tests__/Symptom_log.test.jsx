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

const makeChain = ({ data, error }) => ({
  select: jest.fn().mockReturnThis(),
  insert: insertMock,
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
    const { queryByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => {}); // let effects settle
    expect(queryByPlaceholderText('Describe symptoms (e.g. hives, nausea)')).toBeNull();
  });

  it('shows symptom input after selecting a food item', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    expect(getByPlaceholderText('Describe symptoms (e.g. hives, nausea)')).toBeTruthy();
  });

  it('severity defaults to 1', async () => {
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    expect(getByText('Severity: 1/10')).toBeTruthy();
  });

  it('increments severity with + button', async () => {
    const { getByText, getAllByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getAllByText('+')[0]); });
    expect(getByText('Severity: 2/10')).toBeTruthy();
  });

  it('decrements severity with - button', async () => {
    const { getByText, getAllByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getAllByText('+')[0]); }); // → 2
    await act(async () => { fireEvent.press(getAllByText('+')[0]); }); // → 3
    await act(async () => { fireEvent.press(getAllByText('-')[0]); }); // → 2
    expect(getByText('Severity: 2/10')).toBeTruthy();
  });

  it('severity does not exceed 10', async () => {
    const { getByText, getAllByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    for (let i = 0; i < 12; i++) {
      await act(async () => { fireEvent.press(getAllByText('+')[0]); });
    }
    expect(getByText('Severity: 10/10')).toBeTruthy();
  });

  it('severity does not go below 1', async () => {
    const { getByText, getAllByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getAllByText('-')[0]); });
    await act(async () => { fireEvent.press(getAllByText('-')[0]); });
    expect(getByText('Severity: 1/10')).toBeTruthy();
  });

  it('inserts a symptom log with correct fields on submit', async () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('Describe symptoms (e.g. hives, nausea)'),
        'stomach cramps',
      );
    });

    // Increase severity to 5
    for (let i = 0; i < 4; i++) {
      await act(async () => { fireEvent.press(getAllByText('+')[0]); });
    }

    await act(async () => { fireEvent.press(getByText('Submit Symptom')); });

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
    const input = getByPlaceholderText('Describe symptoms (e.g. hives, nausea)');
    await act(async () => { fireEvent.changeText(input, 'nausea'); });
    await act(async () => { fireEvent.press(getByText('Submit Symptom')); });
    await waitFor(() => expect(input.props.value).toBe(''));
  });

  it('shows alert when symptom text is empty on submit', async () => {
    const { Alert } = require('react-native');
    const { getByText } = render(<SymptomLog />);
    await waitFor(() => getByText('Peanut Butter Toast'));
    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => { fireEvent.press(getByText('Submit Symptom')); });
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please select a food and enter a symptom.',
      ),
    );
  });

  it('can log symptoms for multiple food items sequentially', async () => {
    const { getByText, getByPlaceholderText } = render(<SymptomLog />);
    await waitFor(() => getByText('Pasta Salad'));

    await act(async () => { fireEvent.press(getByText('Pasta Salad')); });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Describe symptoms (e.g. hives, nausea)'), 'bloating');
    });
    await act(async () => { fireEvent.press(getByText('Submit Symptom')); });
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));

    await act(async () => { fireEvent.press(getByText('Peanut Butter Toast')); });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Describe symptoms (e.g. hives, nausea)'), 'itching');
    });
    await act(async () => { fireEvent.press(getByText('Submit Symptom')); });
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(2));
  });
});