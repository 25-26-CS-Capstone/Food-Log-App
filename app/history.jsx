import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function History() {
  const [foodLogs, setFoodLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);

  const [symptomModal, setSymptomModal] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState(null);
  const [symptomFields, setSymptomFields] = useState({});
  const [symptomFoodName, setSymptomFoodName] = useState("");

  const [foodModal, setFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodTime, setFoodTime] = useState(new Date());

  const [deleteFoodModal, setDeleteFoodModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    loadFoodLogs();
    loadSymptomLogs();
  }, []);

  const loadFoodLogs = async () => {
    const saved = await AsyncStorage.getItem("foodLog");
    setFoodLogs(saved ? JSON.parse(saved) : []);
  };

  const loadSymptomLogs = async () => {
    const saved = await AsyncStorage.getItem("symptomLog");
    setSymptomLogs(saved ? JSON.parse(saved) : []);
  };

  const getSymptomsForFood = (foodName) => {
    return symptomLogs.filter((s) => s.food === foodName);
  };

  const addSymptom = (foodName) => {
    setEditingSymptom(null);
    setSymptomFoodName(foodName);
    setSymptomFields({
      symptom: "",
      time: new Date(),
    });
    setSymptomModal(true);
  };

  const openEditSymptom = (symptomObj) => {
    setEditingSymptom(symptomObj);
    setSymptomFoodName(symptomObj.food);
    setSymptomFields({
      symptom: symptomObj.symptom,
      time: moment(symptomObj.time, "MMMM Do YYYY, h:mm a").toDate(),
    });
    setSymptomModal(true);
  };

  const saveSymptom = async () => {
    let updated;

    if (editingSymptom) {
      updated = symptomLogs.map((s) =>
        s.id === editingSymptom.id
          ? {
              ...s,
              symptom: symptomFields.symptom,
              time: moment(symptomFields.time).format("MMMM Do YYYY, h:mm a"),
            }
          : s
      );
    } else {
      const newSymptom = {
        id: Date.now().toString(),
        food: symptomFoodName,
        symptom: symptomFields.symptom,
        time: moment(symptomFields.time).format("MMMM Do YYYY, h:mm a"),
      };

      updated = [...symptomLogs, newSymptom];
    }

    setSymptomLogs(updated);
    await AsyncStorage.setItem("symptomLog", JSON.stringify(updated));
    setSymptomModal(false);
  };

  const deleteSymptom = async () => {
    const updated = symptomLogs.filter((s) => s.id !== editingSymptom.id);
    setSymptomLogs(updated);
    await AsyncStorage.setItem("symptomLog", JSON.stringify(updated));
    setSymptomModal(false);
  };

  const openEditFoodTime = (food) => {
    setEditingFood(food);
    setFoodTime(moment(food.date).toDate());
    setFoodModal(true);
  };

  const saveFoodTime = async () => {
    const updated = foodLogs.map((f) =>
      f.id === editingFood.id ? { ...f, date: foodTime } : f
    );

    setFoodLogs(updated);
    await AsyncStorage.setItem("foodLog", JSON.stringify(updated));
    setFoodModal(false);
  };

  const confirmDeleteFood = (food) => {
    setFoodToDelete(food);
    setDeleteFoodModal(true);
  };

  const deleteFoodLog = async () => {
    const newFoodLogs = foodLogs.filter((f) => f.id !== foodToDelete.id);
    const newSymptomLogs = symptomLogs.filter(
      (s) => s.food !== foodToDelete.foodName
    );

    setFoodLogs(newFoodLogs);
    setSymptomLogs(newSymptomLogs);

    await AsyncStorage.setItem("foodLog", JSON.stringify(newFoodLogs));
    await AsyncStorage.setItem("symptomLog", JSON.stringify(newSymptomLogs));

    setDeleteFoodModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>History</Text>

      {foodLogs.length === 0 && (
        <Text style={styles.empty}>No food has been logged yet.</Text>
      )}

      {foodLogs.map((food) => {
        const symptoms = getSymptomsForFood(food.foodName);
        const hasSymptoms = symptoms.length > 0;

        return (
          <View key={food.id} style={styles.card}>
            <Text style={styles.foodTitle}>{food.foodName}</Text>

            {food.brand ? (
              <Text style={styles.detail}>Brand: {food.brand}</Text>
            ) : null}

            <Text style={styles.subHeader}>Calories:</Text>
            <Text style={styles.detail}>
              {food.product?.calories != null ? food.product.calories: "Unknown"}
            </Text>

            <Text style={styles.subHeader}>Ingredients:</Text>
            <Text style={styles.detail}>
              {food.product?.ingredients || "Not provided"}
            </Text>

            <Text style={styles.subHeader}>Allergens:</Text>
            <Text style={styles.detail}>
              {food.product?.allergens?.length
                ? food.product.allergens.join(", ") : "No allergens detected"}
            </Text>


            <Text style={styles.subHeader}>Symptoms:</Text>

            {/* NO SYMPTOMS */}
            {!hasSymptoms && (
              <>
                <Text style={styles.noSymptom}>
                  No symptoms logged for this food.
                </Text>

                {/* ADD SYMPTOM */}
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addSymptom(food.foodName)}
                >
                  <Text style={styles.addText}>Add Symptom</Text>
                </TouchableOpacity>
              </>
            )}

            {hasSymptoms &&
              symptoms.map((s) => (
                <View key={s.id} style={styles.symptomBox}>
                  <Text style={styles.symptom}>{s.symptom}</Text>

                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => openEditSymptom(s)}
                  >
                    <Text style={styles.smallBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallBtnDelete}
                    onPress={() => openEditSymptom(s)}
                  >
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}

            {hasSymptoms && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addSymptom(food.foodName)}
              >
                <Text style={styles.addText}>Add Symptom</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.detail}>
              Logged: {moment(food.date).format("MMMM Do YYYY, h:mm a")}
            </Text>

            {/* EDIT TIME */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => openEditFoodTime(food)}
            >
              <Text style={styles.editText}>Edit Time</Text>
            </TouchableOpacity>

            {/* DELETE FOOD LOG */}
            <TouchableOpacity
              style={styles.deleteFoodBtn}
              onPress={() => confirmDeleteFood(food)}
            >
              <Text style={styles.deleteFoodText}>Delete Entire Log</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Modal visible={symptomModal} transparent animationType="slide">
        <View style={styles.modalBG}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingSymptom ? "Edit Symptom" : "Add Symptom"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Symptom"
              value={symptomFields.symptom}
              onChangeText={(v) =>
                setSymptomFields({ ...symptomFields, symptom: v })
              }
            />

            <Button
              title="Pick Time"
              onPress={() => setPickerVisible(true)}
            />

            <DateTimePickerModal
              isVisible={pickerVisible}
              mode="datetime"
              date={symptomFields.time}
              onConfirm={(date) => {
                setSymptomFields({ ...symptomFields, time: date });
                setPickerVisible(false);
              }}
              onCancel={() => setPickerVisible(false)}
            />

            <View style={styles.row}>
              <Button title="Save" onPress={saveSymptom} />

              {editingSymptom && (
                <Button title="Delete" color="red" onPress={deleteSymptom} />
              )}
            </View>

            <Button
              title="Cancel"
              color="gray"
              onPress={() => setSymptomModal(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={foodModal} transparent animationType="slide">
        <View style={styles.modalBG}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Log Time</Text>

            <Button
              title="Pick Time"
              onPress={() => setPickerVisible(true)}
            />

            <DateTimePickerModal
              isVisible={pickerVisible}
              mode="datetime"
              date={foodTime}
              onConfirm={(date) => {
                setFoodTime(date);
                setPickerVisible(false);
              }}
              onCancel={() => setPickerVisible(false)}
            />

            <View style={styles.row}>
              <Button title="Save" onPress={saveFoodTime} />
              <Button
                title="Cancel"
                color="gray"
                onPress={() => setFoodModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteFoodModal} transparent animationType="fade">
        <View style={styles.modalBG}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Food Log?</Text>
            <Text style={styles.detail}>
              This will also delete all symptoms attached to it.
            </Text>

            <View style={styles.row}>
              <Button title="Delete" color="red" onPress={deleteFoodLog} />
              <Button
                title="Cancel"
                onPress={() => setDeleteFoodModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  empty: { color: "#777", fontStyle: "italic", marginTop: 20 },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
  },
  foodTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  detail: { fontSize: 14, marginTop: 4 },
  subHeader: { fontWeight: "700", marginTop: 10 },
  noSymptom: { color: "#777", marginTop: 6, fontStyle: "italic" },
  symptomBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  symptom: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b00020",
  },
  smallBtn: {
    backgroundColor: "#0077FF",
    padding: 5,
    marginTop: 6,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  smallBtnDelete: {
    backgroundColor: "#cc0000",
    padding: 5,
    marginTop: 6,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  smallBtnText: { color: "white", fontWeight: "700" },
  addBtn: {
    backgroundColor: "#22aaff",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  addText: { color: "white", fontWeight: "700", textAlign: "center" },
  editBtn: {
    backgroundColor: "#0077FF",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  editText: { color: "white", textAlign: "center", fontWeight: "700" },
  deleteFoodBtn: {
    backgroundColor: "#cc0000",
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  deleteFoodText: { color: "white", textAlign: "center", fontWeight: "700" },
  modalBG: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
