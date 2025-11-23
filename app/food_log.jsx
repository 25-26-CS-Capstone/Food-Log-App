import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, StyleSheet, Text, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const MEAL_COLORS = {
  breakfast: "#fbc02d",
  lunch: "#ff8f00",
  dinner: "#e53935",
  snack: "#00bcd4",
};


const FoodLog = () => {
  const [foodName, setFoodName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [mealType, setMealType] = useState("Breakfast"); // default meal type
  const [log, setLog] = useState([]);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const router = useRouter();

  // Load stored logs on mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const storedLog = await AsyncStorage.getItem("foodLog");
        if (storedLog) setLog(JSON.parse(storedLog));
      } catch (error) {
        console.error("Error loading food log:", error);
      }
    };
    loadLogs();
  }, []);

  // Date picker handlers
  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // Time picker handlers
  const showTimePicker = () => setTimePickerVisible(true);
  const hideTimePicker = () => setTimePickerVisible(false);
  const handleConfirmTime = (time) => {
    setSelectedTime(time);
    hideTimePicker();
  };

  // Submit log
  const handleSubmit = async () => {
    if (!foodName || !selectedDate || !selectedTime || !mealType) {
      Alert.alert("Missing info", "Please enter food, date, time, and meal type.");
      return;
    }

    // Combine date and time into one Date object
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0
    );

    const newLog = {
      id: Date.now().toString(),
      foodName,
      mealType,
      date: combinedDateTime,
      mealType,
      color: MEAL_COLORS[mealType] || "#bbb",
    };

    const updatedLog = [...log, newLog];
    setLog(updatedLog);

    try {
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
      Alert.alert("Log Saved", "Your food log has been saved!");
    } catch (error) {
      console.error("Error saving food log:", error);
      Alert.alert("Error", "There was an error saving your log.");
    }

    // Reset inputs
    setFoodName("");
    setSelectedDate(null);
    setSelectedTime(null);
    setMealType("Breakfast");
  };

  // Delete log
  const deleteLog = async (id) => {
    try {
      const updatedLog = log.filter((item) => item.id !== id);
      setLog(updatedLog);
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
    } catch (error) {
      console.error("Error deleting food log:", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Log", "Are you sure you want to delete this food log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteLog(id), style: "destructive" },
    ]);
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text>{item.foodName} ({item.mealType})</Text>
      <Text>{moment(item.date).format("MMMM Do YYYY, h:mm a")}</Text>
      <Button title="Delete" color="red" onPress={() => confirmDelete(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter food name"
        value={foodName}
        onChangeText={setFoodName}
      />

      <Text style={styles.label}>Select Meal Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={mealType}
          onValueChange={(itemValue) => setMealType(itemValue)}
          style={{ height: 50, marginBottom: 10 }}
          itemStyle={{ height: 60 }}
        >
          <Picker.Item label="Breakfast" value="breakfast" />
          <Picker.Item label="Lunch" value="lunch" />
          <Picker.Item label="Dinner" value="dinner" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>
      </View>

      <Button title="Pick Date" onPress={showDatePicker} />
      {selectedDate && (
        <Text style={styles.dateTimeText}>{moment(selectedDate).format("MMMM Do YYYY")}</Text>
      )}

      <Button title="Pick Time" onPress={showTimePicker} />
      {selectedTime && (
        <Text style={styles.dateTimeText}>{moment(selectedTime).format("h:mm a")}</Text>
      )}

      <Button title="Submit Log" onPress={handleSubmit} />

      <FlatList
        data={log}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
      />

      <Button
        title="Go to Symptom Log"
        onPress={() =>
          router.push({
            pathname: "/symptom_log",
            query: { foodLogData: JSON.stringify(log) },
          })
        }
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        avoidKeyboard={true}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        avoidKeyboard={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  label: { marginTop: 10, marginBottom: 5, fontSize: 16 },
  pickerContainer: {
  borderWidth: 1,
  borderColor: "gray",
  marginBottom: 10,
  borderRadius: 5,
  //overflow: "hidden",
},

  dateTimeText: { marginVertical: 5, fontSize: 16, color: "gray" },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
});

export default FoodLog;
