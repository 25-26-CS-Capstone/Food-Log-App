/*import { StyleSheet, Text, View } from 'react-native'
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
*/

/*
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { searchFood } from '../app/usdaAPI';  // adjust path if needed

const Home = () => {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    const results = await searchFood(query);
    setFoods(results);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USDA Food Search</Text>

      <TextInput
        style={styles.input}
        placeholder="Search for food..."
        value={query}
        onChangeText={setQuery}
      />

      <Button title="Search" onPress={handleSearch} />

      <ScrollView style={styles.results}>
        {foods.map((food) => (
          <View key={food.fdcId} style={styles.card}>
            <Text style={styles.name}>{food.description}</Text>
            <Text>
              Calories:{' '}
              {food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 'N/A'} kcal
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  results: { marginTop: 10 },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  name: { fontWeight: 'bold', fontSize: 16 },
});
*/
/*
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  Pressable,
} from 'react-native';
import { searchFood, getFoodDetails } from '../app/usdaAPI';

const Home = () => {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  const handleSearch = async () => {
    setSelectedFood(null); // reset selected details
    if (!query) return;
    const results = await searchFood(query);
    setFoods(results);
  };

  const handleSelectFood = async (fdcId) => {
    const details = await getFoodDetails(fdcId);
    setSelectedFood(details);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USDA Food Search</Text>

      <TextInput
        style={styles.input}
        placeholder="Search for food..."
        value={query}
        onChangeText={setQuery}
      />

      <Button title="Search" onPress={handleSearch} />

      {!selectedFood ? (
        <ScrollView style={styles.results}>
          {foods.map((food) => (
            <Pressable
              key={food.fdcId}
              onPress={() => handleSelectFood(food.fdcId)}
              style={styles.card}
            >
              <Text style={styles.name}>{food.description}</Text>
              <Text>
                Calories:{' '}
                {food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 'N/A'} kcal
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>{selectedFood.name}</Text>
          <Text style={styles.detailText}>Calories: {selectedFood.calories}</Text>
          <Text style={styles.detailText}>Ingredients: {selectedFood.ingredients}</Text>
          <Text style={styles.detailText}>Allergens: {selectedFood.allergens}</Text>

          <Button title="Back to Results" onPress={() => setSelectedFood(null)} />
        </View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  results: { marginTop: 10 },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  details: {
    marginTop: 20,
  },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  detailText: { marginBottom: 8, fontSize: 16 },
});
*/

import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../app/lib/supabase';
import { useRouter } from 'expo-router';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
      else router.replace('/login');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else router.replace('/login');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
