import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Welcome = () => {
  const router = useRouter();

  return (
    <View style={styles.container} >
      <Text style={styles.text}>Welcome to the Food Log App!</Text>
      <View style={styles.buttonWrapper}>
        <View style={{marginVertical:5}}>
          <Button title="Login" onPress={() => router.navigate('/login')} />
        </View>
        <View style={{marginVertical:5}}>
          <Button title="New account" onPress={() => router.navigate('/register')} />
        </View>   
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonWrapper: {
    width: 200
  }
});

export default Welcome;