// food_log.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useRouter } from 'expo-router';

const FoodLog = () => {
  const [foodName, setFoodName] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [log, setLog] = useState([]);

  const router = useRouter();

  const handleFoodNameChange = (text) => setFoodName(text);
  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirmDate = (date) => {
    setSelectedDateTime(date);
    hideDatePicker();
  };

  const handleSubmit = () => {
    if (foodName && selectedDateTime) {
      setLog([...log, { id: Date.now().toString(), foodName, date: selectedDateTime }]);
      setFoodName('');
      setSelectedDateTime(null);
    } else {
      alert('Please enter both food and time.');
    }
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text>{item.foodName}</Text>
      <Text>{moment(item.date).format('MMMM Do YYYY, h:mm a')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter food name"
        value={foodName}
        onChangeText={handleFoodNameChange}
      />
      <Button title="Pick Date & Time" onPress={showDatePicker} />

      {selectedDateTime && (
        <Text style={styles.dateTimeText}>
          {moment(selectedDateTime).format('MMMM Do YYYY, h:mm a')}
        </Text>
      )}

      <Button title="Submit Log" onPress={handleSubmit} />

      <FlatList
        data={log}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
      />

      {/* 👇 Use router.push to go to the symptom log page */}
      <Button
        title="Go to Symptom Log"
        onPress={() =>
          router.push({
            pathname: '/symptom_log',
            params: { foodLogData: JSON.stringify(log) }, // Must serialize objects in Expo Router
          })
        }
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 },
  dateTimeText: { marginVertical: 10, fontSize: 16, color: 'gray' },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});

export default FoodLog;
