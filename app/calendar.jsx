import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import { supabase } from '../lib/supabase';

const MEAL_COLORS = {
  breakfast: "#fbc02d",
  lunch: "#ff8f00",
  dinner: "#e53935",
  snack: "#00bcd4"
};

const DAILY_GOAL_CAL = 2000;

const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
function ymd(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startIdx = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - startIdx);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function aggregateDay(entries = []) {
  return entries.reduce(
    (acc, e) => {
      if (e.calories) acc.calories += Number(e.calories);
      if (e.protein)  acc.protein  += Number(e.protein);
      if (e.carbs)    acc.carbs    += Number(e.carbs);
      if (e.fat)      acc.fat      += Number(e.fat);

      if (e.meal_type && e.color) {
        acc.meals.add(JSON.stringify({ type: e.meal_type, color: e.color }));
      }
      if (e.allergens?.length) acc.hasAllergen = true;

      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, meals: new Set(), hasAllergen: false }
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [foodList, setFoodList] = useState([]);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(ymd(today));
  const [logsByDate, setLogsByDate] = useState({});
  const [symptomLogs, setSymptomLogs] = useState([]);

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const cells = useMemo(() => monthMatrix(year, monthIndex), [year, monthIndex]);

  const loadLogs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: foodData, error: foodError } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (foodError) throw foodError;

    const grouped = {};
    (foodData ?? []).forEach((item) => {
      const key = ymd(new Date(item.date_time));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    setLogsByDate(grouped);
    setFoodList(foodData ?? []);

    const { data: symptomData, error: symptomError } = await supabase
      .from('symptom_log')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (symptomError) throw symptomError;
    setSymptomLogs(symptomData ?? []);

  } catch (err) {
    console.error('Error loading logs:', err);
  }
};

  useFocusEffect(
    React.useCallback(() => {
      loadLogs();
    }, [])
  );

  const selectedEntries = logsByDate[selected] || [];
  const totals = aggregateDay(selectedEntries);

  const selectedSymptoms = symptomLogs.filter(s =>
    s.food_log_ids?.some(id => {
      const food = foodList.find(f => f.id === id);
      return food && ymd(new Date(food.date_time)) === selected;
    })
  );

  let healthScore = 100;

  selectedSymptoms.forEach((s) => {
    if (s.riskLevel === "High") healthScore -= 40;
    else if (s.riskLevel === "Moderate") healthScore -= 25;
    else if (s.riskLevel === "Low") healthScore -= 10;
  });

  if (totals.calories > DAILY_GOAL_CAL) healthScore -= 10;
  healthScore = Math.max(0, healthScore);

  const totalFoodEntries = Object.values(logsByDate).flat().length;
  const totalSymptomEntries = symptomLogs.length;
  const highRiskDays = symptomLogs.filter(s => s.riskLevel === "High").length;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen
        options={{
          title: 'Calendar',
          headerStyle: { backgroundColor: "#f59e0b"},
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCursor(new Date(year, monthIndex - 1, 1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{monthName}</Text>

        <TouchableOpacity onPress={() => setCursor(new Date(year, monthIndex + 1, 1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Text key={d} style={styles.weekCell}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          const key = ymd(d);
          const inMonth = d.getMonth() === monthIndex;
          const isToday = key === ymd(today);
          const isSelected = key === selected;

          const dayData = aggregateDay(logsByDate[key] || []);
          const pct = Math.min(1, dayData.calories / DAILY_GOAL_CAL);

          const severeDay = symptomLogs.some(
            s => ymd(new Date(s.foodDate)) === key && s.riskLevel === "High"
          );

          return (
            <TouchableOpacity
              key={key + i}
              style={[
                styles.cell,
                !inMonth && styles.cellFaded,
                isSelected && styles.cellSelected,
                isToday && styles.cellTodayBorder,
                severeDay && { backgroundColor: "#fee2e2" }
              ]}
              onPress={() => setSelected(key)}
            >
              <Text style={[styles.dateNum, !inMonth && styles.fadedText]}>{d.getDate()}</Text>

              <View style={styles.dotRow}>
                {Array.from(dayData.meals).map((m, idx) => {
                  const meal = JSON.parse(m);
                  return <View key={idx} style={[styles.dot, { backgroundColor: meal.color }]} />;
                })}
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>

              {dayData.hasAllergen && <Text style={styles.allergen}>⚠</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailDate}>
  {new Date(
    selected.split("-")[0],
    selected.split("-")[1] - 1,
    selected.split("-")[2]
  ).toDateString()}
</Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: "/food_log", params: { date: selected } })}
          >
            <Text style={styles.addBtnText}>+ Add Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalsRow}>
          <TotalBox label="Calories" value={totals.calories} />
          <TotalBox label="Protein" value={`${totals.protein} g`} />
          <TotalBox label="Carbs" value={`${totals.carbs} g`} />
          <TotalBox label="Fat" value={`${totals.fat} g`} />
        </View>

        {/* Health Score */}
        <Text style={{ marginTop: 12, fontWeight: "800", fontSize: 16 }}>
          Health Score: {healthScore}%
        </Text>

        {/* Symptom Summary */}
        {selectedSymptoms.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "700", color: "#b91c1c" }}>
              Symptoms Summary:
            </Text>
            {selectedSymptoms.map((s, i) => (
              <Text key={i} style={{ color: "#7f1d1d", fontSize: 13 }}>
                • {s.symptom} ({s.riskLevel})
              </Text>
            ))}
          </View>
        )}

      {selectedEntries.length ? (
      <View style={{ marginTop: 10 }}>
        {selectedEntries.map((entry, index) => {
        const matchedSymptoms = symptomLogs.filter(s =>
        s.food_log_ids?.includes(entry.id)
      );

      return (
        <View key={entry.id || index} style={{ marginBottom: 12 }}>
          <View style={styles.entryRow}>
            <Text style={styles.entryName}>{entry.food_name}</Text>
            <Text style={styles.entryMeta}>
              {new Date(entry.date_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {matchedSymptoms.length > 0 && (
            <View style={{ marginTop: 4, paddingLeft: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#b91c1c' }}>
                Symptoms:
              </Text>
              {matchedSymptoms.map((sym) => (
                <Text key={sym.id} style={{ fontSize: 12, color: '#7f1d1d' }}>
                  • {sym.symptom} (Severity: {sym.severity}/10)
                </Text>
              ))}
              </View>
          )}
          </View>
        );
      })}
        </View>
      ) : (
      <Text style={styles.noLogs}>No logs for this date.</Text>
      )}
      </View>

      {/* Weekly Summary */}
      <View style={styles.detailCard}>
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
          Weekly Summary
        </Text>
        <Text>Total Food Entries: {totalFoodEntries}</Text>
        <Text>Total Symptom Logs: {totalSymptomEntries}</Text>
        <Text>High Risk Days: {highRiskDays}</Text>
      </View>
    </ScrollView>
  );
}

function TotalBox({ label, value }) {
  return (
    <View style={styles.totalBox}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={styles.totalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#eef2ff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  navBtn: { padding: 8, backgroundColor: "#e2e8f0", borderRadius: 10 },
  navBtnText: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  weekRow: { flexDirection: "row", marginTop: 10 },
  weekCell: { flex: 1, textAlign: "center", color: "#475569", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", borderRadius: 12, overflow: "hidden", backgroundColor: "#ffffff", marginTop: 6 },
  cell: { width: `${100 / 7}%`, paddingVertical: 10, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: "#eef2f7", borderBottomWidth: 1, borderBottomColor: "#eef2f7", minHeight: 76 },
  cellFaded: { backgroundColor: "#fafafa" },
  cellSelected: { backgroundColor: "#ecfdf5" },
  cellTodayBorder: { borderColor: "#22c55e", borderWidth: 2 },
  dateNum: { fontWeight: "800", color: "#0f172a" },
  fadedText: { color: "#94a3b8" },
  dotRow: { flexDirection: "row", marginTop: 6, gap: 4, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressTrack: { marginTop: 6, height: 5, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, backgroundColor: "#22c55e" },
  allergen: { position: "absolute", top: 6, right: 6, color: "#e11d48", fontWeight: "900" },
  detailCard: { backgroundColor: "white", borderRadius: 12, padding: 16, marginTop: 6, marginBottom: 40 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailDate: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  addBtn: { backgroundColor: "#2563eb", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  addBtnText: { color: "white", fontWeight: "700" },
  totalsRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  totalBox: { flex: 1, backgroundColor: "#f1f5f9", padding: 10, borderRadius: 10, alignItems: "center" },
  totalLabel: { color: "#475569", fontWeight: "700" },
  totalValue: { color: "#0f172a", fontSize: 16, fontWeight: "800", marginTop: 2 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  entryName: { fontWeight: "700", color: "#0f172a" },
  entryMeta: { color: "#475569", marginTop: 2 },
  noLogs: { color: "#6b7280", fontStyle: "italic", marginTop: 10 }
});
