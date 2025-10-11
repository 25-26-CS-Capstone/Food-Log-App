import { StyleSheet } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Link } from 'expo-router'


const TabsLayout = () => {

  return (
      <Tabs>
        <Tabs.Screen name="home" options={{headerShown: false}} />
        <Tabs.Screen name="settings" options={{headerShown: false}} />
      </Tabs>
  )
}

export default TabsLayout

const styles = StyleSheet.create({})