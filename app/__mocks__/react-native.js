// Mock React components
import React from 'react'

export const Platform = {
  OS: 'ios', // Default to 'ios'
  Version: 123,
  isTesting: true,
  select: objs => objs[Platform.OS], // Selects value based on current OS
};

// Use jest mocks when running inside Jest; otherwise expose safe no-op fallbacks
const safeJestFn = (impl) => (typeof jest !== 'undefined' ? (impl ? jest.fn(impl) : jest.fn()) : (impl ? impl : () => {}));

export const Alert = {
  alert: safeJestFn(),
  prompt: safeJestFn(),
  alertWithButtons: safeJestFn(),
};

export const StyleSheet = {
  create: safeJestFn((styles) => styles),
  flatten: safeJestFn((style) => style),
};

export const TextInput = React.forwardRef(({ 
  placeholder, 
  placeholderTextColor, 
  secureTextEntry, 
  value,
  onChangeText,
  testID,
  ...restProps 
}, ref) => {
  return React.createElement('input', {
    ...restProps,
    ref,
    placeholder,
    value,
    onChange: (e) => onChangeText?.(e.target.value),
    type: secureTextEntry ? 'password' : 'text',
    testID: testID || placeholder,
    'data-testid': testID || placeholder,
  })
});

export const Button = ({ title, onPress, disabled, testID, ...props }) => 
  React.createElement('button', {
    ...props,
    onClick: onPress,
    disabled,
    testID: testID || title,
    'data-testid': testID || title,
  }, title);

export const Text = ({ children, testID, ...props }) => 
  React.createElement('span', { ...props, testID }, children);

export const View = ({ children, testID, ...props }) => 
  React.createElement('div', { ...props, testID }, children);

export default {
  Platform,
  Alert,
  StyleSheet,
  TextInput,
  Button,
  Text,
  View,
};
