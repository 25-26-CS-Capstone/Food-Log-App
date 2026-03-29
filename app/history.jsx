import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button, Pressable, Alert } from "react-native";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { Stack } from "expo-router";

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

  const [evaluationHistory, setEvaluationHistory] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("food");
  const [sortBy, setSortBy] = useState("date");

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);
  const [filterPickerMode, setFilterPickerMode] = useState(null); // null | 'dateFrom' | 'dateTo' | 'timeFrom' | 'timeTo'

  useEffect(() => {
    loadFoodLogs();
    loadSymptomLogs();
    loadEvaluationHistory();
  }, []);

const loadFoodLogs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (error) throw error;

    setFoodLogs(data ?? []);
  } catch (err) {
    console.error('Error loading food logs:', err);
  }
};

  const loadSymptomLogs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('symptom_log')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('date_time', { ascending: false });

    if (error) throw error;
    setSymptomLogs(data ?? []);
  } catch (err) {
    console.error('Error loading symptom logs:', err);
  }
};

  const loadEvaluationHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('evaluation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('evaluated_at', { ascending: false });
    setEvaluationHistory(data ?? []);
  } catch (err) {
    console.error('Error loading evaluation history:', err);
  }
};

  const getSymptomsForFood = (foodId) => {
  return symptomLogs.filter((s) => s.food_log_ids?.includes(foodId));
  };

  const getEvaluationForSymptom = (symptomObj) => {
    return evaluationHistory.find(e => e.symptom_log_id === symptomObj.id);
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
    setSymptomFoodName(symptomObj.foodName);
    setSymptomFields({
      symptom: symptomObj.symptom,
      time: new Date(symptomObj.date_time),
    });
    setSymptomModal(true);
  };

  const handleDeleteSymptom = async (symptom) => {
    try {
      const { error } = await supabase
        .from('symptom_log')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', symptom.id);

      if (error) throw error;
      setSymptomLogs(prev => prev.filter(s => s.id !== symptom.id));
    } catch (err) {
      console.error('Error deleting symptom:', err);
      Alert.alert('Error', 'Failed to delete symptom.');
    }
  };

  const saveSymptom = async () => {
    if (!editingSymptom) return;
    try {
      const { error } = await supabase
        .from('symptom_log')
        .update({
          symptom: symptomFields.symptom,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSymptom.id);

      if (error) throw error;
      setSymptomLogs(prev =>
        prev.map(s => s.id === editingSymptom.id
          ? { ...s, symptom: symptomFields.symptom }
          : s
        )
      );
      setSymptomModal(false);
    } catch (err) {
      console.error('Error updating symptom:', err);
      Alert.alert('Error', 'Failed to update symptom.');
    }
  };

  const deleteSymptom = async () => {
    try {
      const { error } = await supabase
        .from('symptom_log')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', editingSymptom.id);

      if (error) throw error;
      setSymptomLogs(prev => prev.filter(s => s.id !== editingSymptom.id));
      setSymptomModal(false);
    } catch (err) {
      console.error('Error deleting symptom:', err);
      Alert.alert('Error', 'Failed to delete symptom.');
    }
  };

  const openEditFoodTime = (food) => {
    setEditingFood(food);
    setFoodTime(moment(food.date_time).toDate());
    setFoodModal(true);
  };

  const saveFoodTime = async () => {
  try {
    const { error } = await supabase
      .from('food_log')
      .update({ date_time: foodTime.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', editingFood.id);

    if (error) throw error;

    setFoodLogs(prev =>
      prev.map(f => f.id === editingFood.id ? { ...f, date_time: foodTime } : f)
    );
    setFoodModal(false);
  } catch (err) {
    console.error('Error updating food time:', err);
    Alert.alert('Error', 'Failed to update time.');
  }
};

  const deleteFoodLog = async () => {
  try {
    const now = new Date().toISOString();

    // Soft delete the food log
    const { error: foodError } = await supabase
      .from('food_log')
      .update({ deleted_at: now })
      .eq('id', foodToDelete.id);

    if (foodError) throw foodError;

    // Soft delete all symptoms linked to this food log
    const linkedSymptomIds = symptomLogs
      .filter(s => s.food_log_ids?.includes(foodToDelete.id))
      .map(s => s.id);

    if (linkedSymptomIds.length > 0) {
      const { error: symptomError } = await supabase
        .from('symptom_log')
        .update({ deleted_at: now })
        .in('id', linkedSymptomIds);

      if (symptomError) throw symptomError;
    }

    setFoodLogs(prev => prev.filter(f => f.id !== foodToDelete.id));
    setSymptomLogs(prev => prev.filter(s => !linkedSymptomIds.includes(s.id)));
    setDeleteFoodModal(false);
  } catch (err) {
    console.error('Error deleting food log:', err);
    Alert.alert('Error', 'Failed to delete log.');
  }
};

  const getFilteredAndSortedLogs = () => {
    let filtered = foodLogs;

    if (searchQuery.trim()) {
      if (searchType === "food") {
        filtered = filtered.filter((food) =>
          food.food_name?.toLowerCase().includes(searchQuery.toLowerCase())  
        );
      } else {
        const matchingFoodIds = new Set();
        symptomLogs.forEach((s) => {
          if (s.symptom.toLowerCase().includes(searchQuery.toLowerCase())) {
            s.food_log_ids?.forEach(id => matchingFoodIds.add(id));  
          }
        });
        filtered = filtered.filter((food) => matchingFoodIds.has(food.id));  
      }
    }

    if (dateFrom) {
      filtered = filtered.filter((food) =>
        moment(food.date_time).startOf('day').isSameOrAfter(moment(dateFrom).startOf('day'))
      );
    }
    if (dateTo) {
      filtered = filtered.filter((food) =>
        moment(food.date_time).startOf('day').isSameOrBefore(moment(dateTo).startOf('day'))
      );
    }
    if (timeFrom) {
      const fromMins = moment(timeFrom).hours() * 60 + moment(timeFrom).minutes();
      filtered = filtered.filter((food) => {
        const logMins = moment(food.date_time).hours() * 60 + moment(food.date_time).minutes();
        return logMins >= fromMins;
      });
    }
    if (timeTo) {
      const toMins = moment(timeTo).hours() * 60 + moment(timeTo).minutes();
      filtered = filtered.filter((food) => {
        const logMins = moment(food.date_time).hours() * 60 + moment(food.date_time).minutes();
        return logMins <= toMins;
      });
    }

    if (sortBy === "date") {
      filtered = [...filtered].sort((a, b) => moment(b.date_time).diff(moment(a.date_time)));
    } else if (sortBy === "alpha-asc") {
      filtered = [...filtered].sort((a, b) => a.food_name?.localeCompare(b.food_name));  
    } else if (sortBy === "alpha-desc") {
      filtered = [...filtered].sort((a, b) => b.food_name?.localeCompare(a.food_name));  
    }

    return filtered;
  };

  const confirmDeleteFood = (food) => {
    setFoodToDelete(food);
    setDeleteFoodModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>

        <Stack.Screen 
          options={{
            title: 'History',
            headerStyle: { backgroundColor: "#0ea5e9"},
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }} 
        />

        <Text style={styles.title}>History</Text>
        <Pressable
          style={[styles.button, { padding: 10, marginLeft: 'auto' }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="funnel" size={30} color="black" />
        </Pressable>
      </View>
    

      {foodLogs.length === 0 && (
        <Text style={styles.empty}>No food has been logged yet.</Text>
      )}

      {getFilteredAndSortedLogs().map((food) => {
        const symptoms = getSymptomsForFood(food.id); 
        const hasSymptoms = symptoms.length > 0;

        return (
          <View key={food.id} style={styles.card}>
            <Text style={styles.foodTitle}>{food.food_name}</Text>

            {food.brand ? (
              <Text style={styles.detail}>Brand: {food.brand}</Text>
            ) : null}

            <Text style={styles.subHeader}>Calories:</Text>
            <Text style={styles.detail}>
              {food.calories != null ? food.calories : "Unknown"}
            </Text>

            <Text style={styles.subHeader}>Ingredients:</Text>
            <Text style={styles.detail}>
              {food.ingredients || "Not provided"}
            </Text>

            <Text style={styles.subHeader}>Allergens:</Text>
            <Text style={styles.detail}>
              {food.allergens?.length ? food.allergens.join(", ") : "No allergens detected"}
            </Text>


            <Text style={styles.subHeader}>Symptoms:</Text>

            {/* NO SYMPTOMS */}
            {!hasSymptoms && (
              <>
                <Text style={styles.noSymptom}>
                  No symptoms logged for this food.
                </Text>
{/*                
                {/* ADD SYMPTOM *}
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addSymptom(food.foodName)}
                >
                  <Text style={styles.addText}>Add Symptom</Text>
                </TouchableOpacity>
*/}
              </>
            )}

{hasSymptoms &&
  symptoms.map((s) => {
    const evaluation = getEvaluationForSymptom(s);

    return (
      <View key={s.id} style={styles.symptomBox}>
        <Text style={styles.symptom}>{s.symptom}</Text>

        {evaluation && (
          <View style={styles.evaluationBox}>
            <Text style={styles.riskText}>Risk: {evaluation.risk}</Text>
            <Text style={styles.confidenceText}>Confidence: {evaluation.confidence}</Text>
            <Text style={styles.evalDate}>
              Evaluated {moment(evaluation.evaluated_at).format("MMM D, h:mm a")}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => openEditSymptom(s)}
        >
          <Text style={styles.smallBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallBtnDelete}
          onPress={() => handleDeleteSymptom(s)}
        >
          <Text style={styles.smallBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  })}

            {/*
            {hasSymptoms && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addSymptom(food.foodName)}
              >
                <Text style={styles.addText}>Add Symptom</Text>
              </TouchableOpacity>
            )}
            */}

            <Text style={styles.detail}>
              Logged: {moment(food.date_time).format("MMMM Do YYYY, h:mm a")}
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

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalBG}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            {/* Search Type Buttons */}
            <Text style={styles.label}>Search by:</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  searchType === "food" && styles.toggleBtnActive,
                ]}
                onPress={() => setSearchType("food")}
              >
                <Text style={styles.toggleBtnText}>Food</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  searchType === "symptom" && styles.toggleBtnActive,
                ]}
                onPress={() => setSearchType("symptom")}
              >
                <Text style={styles.toggleBtnText}>Symptom</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`Search by ${searchType}...`}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Date Range Filter */}
            <Text style={styles.label}>Date Range:</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.datePickerBtn}
                onPress={() => setFilterPickerMode('dateFrom')}
              >
                <Text style={styles.datePickerText}>
                  {dateFrom ? moment(dateFrom).format('MMM D, YYYY') : 'From Date'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.datePickerBtn}
                onPress={() => setFilterPickerMode('dateTo')}
              >
                <Text style={styles.datePickerText}>
                  {dateTo ? moment(dateTo).format('MMM D, YYYY') : 'To Date'}
                </Text>
              </Pressable>
            </View>

            {/* Time Interval Filter */}
            <Text style={styles.label}>Time Interval:</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.datePickerBtn}
                onPress={() => setFilterPickerMode('timeFrom')}
              >
                <Text style={styles.datePickerText}>
                  {timeFrom ? moment(timeFrom).format('h:mm A') : 'From Time'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.datePickerBtn}
                onPress={() => setFilterPickerMode('timeTo')}
              >
                <Text style={styles.datePickerText}>
                  {timeTo ? moment(timeTo).format('h:mm A') : 'To Time'}
                </Text>
              </Pressable>
            </View>

            {/* Date/Time picker for filter fields */}
            <DateTimePickerModal
              isVisible={filterPickerMode !== null}
              mode={filterPickerMode && filterPickerMode.startsWith('date') ? 'date' : 'time'}
              date={
                filterPickerMode === 'dateFrom' ? (dateFrom || new Date()) :
                filterPickerMode === 'dateTo' ? (dateTo || new Date()) :
                filterPickerMode === 'timeFrom' ? (timeFrom || new Date()) :
                filterPickerMode === 'timeTo' ? (timeTo || new Date()) :
                new Date()
              }
              onConfirm={(date) => {
                if (filterPickerMode === 'dateFrom') setDateFrom(date);
                else if (filterPickerMode === 'dateTo') setDateTo(date);
                else if (filterPickerMode === 'timeFrom') setTimeFrom(date);
                else if (filterPickerMode === 'timeTo') setTimeTo(date);
                setFilterPickerMode(null);
              }}
              onCancel={() => setFilterPickerMode(null)}
            />

            <Text style={styles.label}>Sort by:</Text>
            <View style={styles.dropdownContainer}>
              <Pressable
                style={[
                  styles.sortOption,
                  sortBy === "date" && styles.sortOptionActive,
                ]}
                onPress={() => setSortBy("date")}
              >
                <Text>Date (Newest)</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sortOption,
                  sortBy === "alpha-asc" && styles.sortOptionActive,
                ]}
                onPress={() => setSortBy("alpha-asc")}
              >
                <Text>A - Z</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sortOption,
                  sortBy === "alpha-desc" && styles.sortOptionActive,
                ]}
                onPress={() => setSortBy("alpha-desc")}
              >
                <Text>Z - A</Text>
              </Pressable>
            </View>
            <Button
              title="Clear Filters"
              onPress={() => {
                setSearchQuery("");
                setSortBy("date");
                setSearchType("food");
                setDateFrom(null);
                setDateTo(null);
                setTimeFrom(null);
                setTimeTo(null);
              }}
            />
            <Button
              title="Close"
              onPress={() => setFilterModalVisible(false)}
              color="#666"
            />
          </View>
        </View>
      </Modal>

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
              date={symptomFields.time || new Date()}
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
  container: { padding: 20, backgroundColor: "#eef2ff", flex: 1 },
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
  headerContainer: {
    flexDirection: 'row', 
    padding: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  toggleBtnActive: {
    backgroundColor: "#0077FF",
    borderColor: "#0077FF",
  },
  toggleBtnText: {
    fontWeight: "600",
    color: "#333",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  sortOptionActive: {
    backgroundColor: "#e3f2fd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  datePickerBtn: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0077FF',
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  datePickerText: {
    color: '#0077FF',
    fontWeight: '600',
    fontSize: 12,
  },
  evaluationBox: {
  marginTop: 6,
  padding: 8,
  backgroundColor: "#fff5f5",
  borderRadius: 8,
  },

  riskText: {
    fontWeight: "700",
    color: "#b00020",
  },

  confidenceText: {
    fontSize: 13,
  },

  evalDate: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },
});
