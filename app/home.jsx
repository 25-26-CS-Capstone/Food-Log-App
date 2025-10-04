import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const home = () => {
  return (
    <View style={[{justifyContent: 'center'}, {alignItems: 'center'}, {flex:1}]}>
      <Text>Home</Text>
    </View>
  )
}

export default home

const styles = StyleSheet.create({})