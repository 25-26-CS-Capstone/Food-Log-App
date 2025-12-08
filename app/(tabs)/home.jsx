import { StyleSheet, View, Button } from 'react-native'
import React from 'react'
import { navigate } from 'expo-router/build/global-state/routing'
import { useRouter } from "expo-router";

const home = () => {
  return (
    <View style={styles.container}>

    <View style={styles.buttonWrapper}>
        <Button title="Add New Food Log(s)" onPress={() => navigate('../food_log')} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="View Previous Food Log(s)" onPress={() => navigate('../previous_logs')} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="View Food Calendar" onPress={() => navigate('../calendar')} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="View History (Food + Symptoms)" onPress={() => navigate('../history')} />
      </View>
    </View>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonWrapper: {
    width: 250,
    marginVertical: 6,
  },
});
