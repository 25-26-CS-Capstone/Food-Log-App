import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import Register from '../app/register'
import { supabase } from '../lib/supabase'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn()
    }
  }
}))

jest.mock('react-native')

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  test('navigates back to login page', () => {
    render(<Register />)

    fireEvent.press(screen.getByTestId('BackToLogin'))

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  test('submits valid credentials to Supabase', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    })

    render(<Register />)

    fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
    fireEvent.changeText(screen.getByTestId('Password'), 'SecurePassword123!')
    fireEvent.press(screen.getByTestId('Submit'))

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePassword123!'
      })
    })
  })

  test('rejects invalid email before calling Supabase', async () => {
    const { Alert } = require('react-native')

    render(<Register />)

    fireEvent.changeText(screen.getByTestId('Email'), 'invalidemail')
    fireEvent.changeText(screen.getByTestId('Password'), 'Password123!')
    fireEvent.press(screen.getByTestId('Submit'))

    await waitFor(() => {
      expect(supabase.auth.signUp).not.toHaveBeenCalled()
      expect(Alert.alert).toHaveBeenCalledWith('Invalid Email', 'Please enter a valid email address.')
    })
  })

  test('rejects short password before calling Supabase', async () => {
    const { Alert } = require('react-native')

    render(<Register />)

    fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
    fireEvent.changeText(screen.getByTestId('Password'), '12345')
    fireEvent.press(screen.getByTestId('Submit'))

    await waitFor(() => {
      expect(supabase.auth.signUp).not.toHaveBeenCalled()
      expect(Alert.alert).toHaveBeenCalledWith('Weak Password', 'Password must be at least 6 characters long.')
    })
  })

  test('shows duplicate email error from Supabase', async () => {
    const { Alert } = require('react-native')

    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already in use' }
    })

    render(<Register />)

    fireEvent.changeText(screen.getByTestId('Email'), 'duplicate@example.com')
    fireEvent.changeText(screen.getByTestId('Password'), 'ValidPass123!')
    fireEvent.press(screen.getByTestId('Submit'))

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'duplicate@example.com',
        password: 'ValidPass123!'
      })
      expect(Alert.alert).toHaveBeenCalledWith('Email already in use')
    })
  })

  test('rejects empty password', async () => {
    const { Alert } = require('react-native')

    render(<Register />)

    fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
    fireEvent.changeText(screen.getByTestId('Password'), '')
    fireEvent.press(screen.getByTestId('Submit'))

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password.')
    })
  })

  test('disables submit button while signup is pending', async () => {
    let resolveSignUp
    supabase.auth.signUp.mockImplementation(() => new Promise((resolve) => {
      resolveSignUp = resolve
    }))

    render(<Register />)

    const submitButton = screen.getByTestId('Submit')
    fireEvent.changeText(screen.getByTestId('Email'), 'test@example.com')
    fireEvent.changeText(screen.getByTestId('Password'), 'Password123!')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(submitButton.props.disabled).toBe(true)
    }, { timeout: 100 })

    resolveSignUp({ data: null, error: null })
    await waitFor(() => {
      expect(submitButton.props.disabled).toBe(false)
    })
  })
})
