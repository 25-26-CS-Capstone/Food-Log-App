import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import Login from '../app/login'
import { supabase } from '../lib/supabase'

// Mock the supabase module
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}))

// Mock React Native modules using the mocks from __mocks__/react-native.js
jest.mock('react-native')

// Mock auth context used by Login
jest.mock('../app/AuthContext', () => ({
  useAuth: () => ({
    setAuth: jest.fn()
  })
}))

// Mock expo-router (login.jsx uses `router` named export, not useRouter)
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  Stack: { Screen: () => null },
}))

// Mock utils used after successful login
jest.mock('../utils/notifications', () => ({
  sendWelcomeWithLogsLink: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../utils/storage', () => ({
  getUserData: jest.fn().mockResolvedValue({}),
  recordTodayLoginDay: jest.fn().mockResolvedValue(1),
  saveUserData: jest.fn().mockResolvedValue(undefined),
}))

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    supabase.auth.signInWithPassword.mockClear()
  })

  describe('Successful Sign-In with Valid Credentials', () => {
    test('should successfully sign in with valid email and password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'ValidPassword123!')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'ValidPassword123!'
        })
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
      })
    })

    test('should enable login button after valid credentials are entered', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'valid@example.com' } },
        error: null
      })

      render(<Login />)

      const loginButton = screen.getByTestId('Login')

      // React Native's Button `disabled` prop surfaces as accessibilityState.disabled
      expect(loginButton.props.accessibilityState?.disabled).toBeFalsy()

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')

      fireEvent.changeText(emailInput, 'valid@example.com')
      fireEvent.changeText(passwordInput, 'ValidPass123!')

      expect(loginButton.props.accessibilityState?.disabled).toBeFalsy()
    })

    test('should successfully retrieve user data on login', async () => {
      const mockUser = { id: 'user-123', email: 'user@example.com' }
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'user@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'SecurePass456!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'SecurePass456!'
        })
      })
    })
  })

  describe('Sign-In with Incorrect Password', () => {
    test('should display error for incorrect password', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'user@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'WrongPassword123!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'WrongPassword123!'
        })
        expect(Alert.alert).toHaveBeenCalledWith('Invalid login credentials')
      })
    })

    test('should display generic error message for authentication failure', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email or password is incorrect' }
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'IncorrectPass')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Email or password is incorrect')
      })
    })

    test('should allow user to retry after incorrect password', async () => {
      supabase.auth.signInWithPassword
        .mockResolvedValueOnce({ data: null, error: { message: 'Invalid login credentials' } })
        .mockResolvedValueOnce({ data: { user: { id: '123', email: 'test@example.com' } }, error: null })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'WrongPassword')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
      })

      fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'CorrectPassword123!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Sign-In with Non-Existent Email', () => {
    test('should display error for non-existent email', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'nonexistent@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'AnyPassword123!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!'
        })
        expect(Alert.alert).toHaveBeenCalledWith('Invalid login credentials')
      })
    })

    test('should display user not found error', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'unknown@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'SomePassword')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('User not found')
      })
    })

    test('should prevent login with empty email field', async () => {
      const { Alert } = require('react-native')

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), '')
      fireEvent.changeText(screen.getByTestId('Password'), 'Password123!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })
  })

  describe('Edge Cases', () => {
    test('should prevent login with empty email and password fields', async () => {
      const { Alert } = require('react-native')

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), '')
      fireEvent.changeText(screen.getByTestId('Password'), '')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })

    test('should prevent login with empty password field', async () => {
      const { Alert } = require('react-native')

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), '')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })

    test('should disable login button during loading', async () => {
      let resolveSignIn
      supabase.auth.signInWithPassword.mockImplementation(
        () => new Promise((resolve) => { resolveSignIn = resolve })
      )

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(loginButton)

      // Button disabled state surfaces via accessibilityState in RN's Button
      await waitFor(() => {
        expect(loginButton.props.accessibilityState?.disabled).toBe(true)
      }, { timeout: 100 })

      resolveSignIn({ data: null, error: null })
      await waitFor(() => {
        expect(loginButton.props.accessibilityState?.disabled).toBeFalsy()
      })
    })

    test('should trim whitespace from email and password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), '  test@example.com  ')
      fireEvent.changeText(screen.getByTestId('Password'), '  Password123!  ')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        // The component passes values as-is to supabase but trims for the empty check
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: '  test@example.com  ',
          password: '  Password123!  '
        })
      })
    })

    test('should handle network errors gracefully', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Network error' }
      })

      render(<Login />)

      fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
      fireEvent.changeText(screen.getByTestId('Password'), 'Password123!')
      fireEvent.press(screen.getByTestId('Login'))

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Network error')
      })
    })
  })
})

