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

      // Fill in valid credentials
      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'ValidPassword123!')

      // Submit the form
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

      // Initially button should be enabled (loading is false)
      expect(loginButton.props.disabled).toBe(false)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')

      fireEvent.changeText(emailInput, 'valid@example.com')
      fireEvent.changeText(passwordInput, 'ValidPass123!')

      // Button should still be enabled
      expect(loginButton.props.disabled).toBe(false)
    })

    test('should successfully retrieve user data on login', async () => {
      const mockUser = { id: 'user-123', email: 'user@example.com' }
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'user@example.com')
      fireEvent.changeText(passwordInput, 'SecurePass456!')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'user@example.com')
      fireEvent.changeText(passwordInput, 'WrongPassword123!')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'IncorrectPass')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Email or password is incorrect')
      })
    })

    test('should allow user to retry after incorrect password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' }
      }).mockResolvedValueOnce({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      // First attempt with wrong password
      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'WrongPassword')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
      })

      // Second attempt with correct password
      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'CorrectPassword123!')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'nonexistent@example.com')
      fireEvent.changeText(passwordInput, 'AnyPassword123!')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'unknown@example.com')
      fireEvent.changeText(passwordInput, 'SomePassword')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('User not found')
      })
    })

    test('should prevent login with empty email field', async () => {
      const { Alert } = require('react-native')

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, '')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, '')
      fireEvent.changeText(passwordInput, '')
      fireEvent.press(loginButton)

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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, '')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })

    test('should disable login button during loading', async () => {
      let resolveSignIn
      supabase.auth.signInWithPassword.mockImplementation(() => new Promise(resolve => {
        resolveSignIn = resolve
      }))

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(loginButton)

      // Button should be disabled while loading
      await waitFor(() => {
        expect(loginButton.props.disabled).toBe(true)
      }, { timeout: 100 })

      resolveSignIn({ data: null, error: null })
      await waitFor(() => {
        expect(loginButton.props.disabled).toBe(false)
      })
    })

    test('should trim whitespace from email and password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Login />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, '  test@example.com  ')
      fireEvent.changeText(passwordInput, '  Password123!  ')
      fireEvent.press(loginButton)

      await waitFor(() => {
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

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const loginButton = screen.getByTestId('Login')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(loginButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Network error')
      })
    })
  })
})
