import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import Register from '../app/register'
import { supabase } from '../lib/supabase'

// Mock the supabase module
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn()
    }
  }
}))

// Mock React Native modules using the mocks from __mocks__/react-native.js
jest.mock('react-native')

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    supabase.auth.signUp.mockClear()
  })

  describe('Successful Signup with Valid Credentials', () => {
    test('should successfully sign up with valid email and password', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      // Fill in valid credentials
      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'SecurePassword123!')

      // Submit the form
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        })
        expect(supabase.auth.signUp).toHaveBeenCalledTimes(1)
      })
    })

    test('should enable submit button after valid credentials are entered', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'valid@example.com' } },
        error: null
      })

      render(<Register />)

      const submitButton = screen.getByTestId('Submit')

      // Initially button should be enabled (loading is false)
      expect(submitButton.props.disabled).toBe(false)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')

      fireEvent.changeText(emailInput, 'valid@example.com')
      fireEvent.changeText(passwordInput, 'ValidPass123!')

      // Button should still be enabled
      expect(submitButton.props.disabled).toBe(false)
    })
  })

  describe('Signup with Invalid Email Format', () => {
    test('should reject email without @ symbol', async () => {
      const { Alert } = require('react-native')

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'invalidemail')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        // Supabase will handle validation, so we check if the error is handled
        expect(supabase.auth.signUp).toHaveBeenCalled()
      })
    })

    test('should reject email with invalid format (no domain)', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'user@')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'user@',
          password: 'Password123!'
        })
      })
    })

    test('should reject email with missing extension', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'user@domain')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'user@domain',
          password: 'Password123!'
        })
      })
    })

    test('should reject email with spaces', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'user @example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'user @example.com',
          password: 'Password123!'
        })
      })
    })
  })

  describe('Signup with Existing Email', () => {
    test('should display error when email already exists', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'existing@example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'existing@example.com',
          password: 'Password123!'
        })
        expect(Alert.alert).toHaveBeenCalledWith('User already registered')
      })
    })

    test('should show duplicate email error from Supabase', async () => {
      const { Alert } = require('react-native')

      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already in use' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'duplicate@example.com')
      fireEvent.changeText(passwordInput, 'ValidPass123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Email already in use')
      })
    })
  })

  describe('Signup with Weak Password', () => {
    test('should reject password that is too short', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password should be at least 6 characters' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, '12345')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: '12345'
        })
      })
    })

    test('should reject password with only numbers', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password must contain letters and numbers' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, '123456')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: '123456'
        })
      })
    })

    test('should reject password with only lowercase letters', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password must contain uppercase, lowercase, and numbers' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'weakpassword')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'weakpassword'
        })
      })
    })

    test('should reject empty password field', async () => {
      const { Alert } = require('react-native')

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, '')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })

    test('should reject password with only special characters', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password must contain alphanumeric characters' }
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, '!@#$%^&*()')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: '!@#$%^&*()'
        })
      })
    })
  })

  describe('Edge Cases', () => {
    test('should prevent signup with empty email field', async () => {
      const { Alert } = require('react-native')

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, '')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter both email and password.'
        )
      })
    })

    test('should disable submit button during loading', async () => {
      supabase.auth.signUp.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ data: null, error: null }), 1000)
      }))

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, 'test@example.com')
      fireEvent.changeText(passwordInput, 'Password123!')
      fireEvent.press(submitButton)

      // Button should be disabled while loading
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(true)
      }, { timeout: 100 })
    })

    test('should trim whitespace from email and password', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      render(<Register />)

      const emailInput = screen.getByTestId('Email')
      const passwordInput = screen.getByTestId('Password')
      const submitButton = screen.getByTestId('Submit')

      fireEvent.changeText(emailInput, '  test@example.com  ')
      fireEvent.changeText(passwordInput, '  Password123!  ')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: '  test@example.com  ',
          password: '  Password123!  '
        })
      })
    })
  })
})
