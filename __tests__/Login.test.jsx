import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import Login from '../app/login';

// Mock dependencies
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles empty input validation', async () => {
    const { getByText } = render(<Login />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter both email and password.'
    );
  });

  it('handles successful login', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const { supabase } = require('../lib/supabase');
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null });

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('handles login error', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const { supabase } = require('../lib/supabase');
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid credentials' }
    });

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('handles web platform alerts', async () => {
    Platform.OS = 'web';
    global.window = { alert: jest.fn() };

    const { getByText } = render(<Login />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(window.alert).toHaveBeenCalledWith(
      'Please enter both email and password.'
    );
  });
});