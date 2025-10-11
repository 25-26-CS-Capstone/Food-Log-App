import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import { useColorScheme } from 'react-native';

const helpButton = (colorScheme) => (
  <Link href="/modal" asChild>
    <Pressable style={({ pressed }) => [{ marginRight: 150, opacity: pressed ? 0.5 : 1 }]}>
      <Text style={{ fontSize: 18, color: colorScheme === 'white' ? 'dark' : 'blue' }}>
        Help
      </Text>
    </Pressable>
  </Link>
);

const RootLayout = () => {
  const colorScheme = useColorScheme();

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: true, title: '', headerRight: () => helpButton(colorScheme)}} />
        <Stack.Screen name="accountEntry" options={{ headerShown: false }}/>
        <Stack.Screen name="login" options={{title: 'Login'}} />
        <Stack.Screen name="register" options={{title: 'Register'}} />
        <Stack.Screen name="home" options={{headerShown: false}} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Help' }} />
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      </Stack>
  )
}

export default RootLayout

const styles = StyleSheet.create({})