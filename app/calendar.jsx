import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useRouter } from "expo-router";

const DEMO_LOGS = {
  "2025-10-28": [
    { name: "Oatmeal + Banana", meal: "breakfast", calories: 320, protein: 9, carbs: 58, fat: 7, allergens: [] },
    { name: "Grilled Chicken Salad", meal: "lunch", calories: 480, protein: 35, carbs: 24, fat: 22, allergens: [] },
    { name: "Yogurt (Peanut topping)", meal: "snack", calories: 210, protein: 11, carbs: 18, fat: 9, allergens: ["peanut"] }
  ],
  "2025-10-29": [
    { name: "Avocado Toast", meal: "breakfast", calories: 360, protein: 10, carbs: 42, fat: 16, allergens: ["gluten"] },
    { name: "Veggie Pasta", meal: "dinner", calories: 620, protein: 19, carbs: 92, fat: 17, allergens: ["gluten"] }
  ]
};

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
      acc.calories += e.calories || 0;
      acc.protein += e.protein || 0;
      acc.carbs += e.carbs || 0;
      acc.fat += e.fat || 0;
      if (e.allergens && e.allergens.length) acc.hasAllergen = true;
      acc.meals.add(e.meal);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, hasAllergen: false, meals: new Set() }
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(ymd(today));

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const cells = useMemo(() => monthMatrix(year, monthIndex), [year, monthIndex]);

  const selectedEntries = DEMO_LOGS[selected] || [];
  const totals = aggregateDay(selectedEntries);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCursor(new Date(year, monthIndex - 1, 1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{monthName}</Text>
        <TouchableOpacity onPress={() => setCursor(new Date(year, monthIndex + 1, 1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)); setSelected(ymd(t)); }}
          style={styles.todayBtn}
        >
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <Text key={d} style={styles.weekCell}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          const key = ymd(d);
          const inMonth = d.getMonth() === monthIndex;
          const isToday = key === ymd(today);
          const isSelected = key === selected;
          const data = aggregateDay(DEMO_LOGS[key] || []);
          const pct = Math.max(0, Math.min(1, data.calories / DAILY_GOAL_CAL));

          return (
            <TouchableOpacity
              key={key + i}
              style={[
                styles.cell,
                !inMonth && styles.cellFaded,
                isSelected && styles.cellSelected,
                isToday && styles.cellTodayBorder
              ]}
              onPress={() => setSelected(key)}
            >
              <Text style={[styles.dateNum, !inMonth && styles.fadedText]}>{d.getDate()}</Text>
              <View style={styles.dotRow}>
                {Array.from(data.meals).map((m) => (
                  <View key={key + m} style={[styles.dot, { backgroundColor: MEAL_COLORS[m] || "#bbb" }]} />
                ))}
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>
              {data.hasAllergen && <Text style={styles.allergen}>⚠</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        {Object.entries(MEAL_COLORS).map(([meal, color]) => (
          <View key={meal} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{meal}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <Text style={styles.allergen}>⚠</Text>
          <Text style={styles.legendText}>allergen present</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailDate}>{new Date(selected).toDateString()}</Text>
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

        {selectedEntries.length ? (
          <View style={{ marginTop: 10 }}>
            {selectedEntries.map((e, idx) => (
              <View key={idx} style={styles.entryRow}>
                <View style={[styles.entryDot, { backgroundColor: MEAL_COLORS[e.meal] || "#888" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName}>{e.name}</Text>
                  <Text style={styles.entryMeta}>
                    {e.meal} • {e.calories} kcal{e.allergens && e.allergens.length ? ` • ⚠ ${e.allergens.join(", ")}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noLogs}>No logs for this date.</Text>
        )}
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
  page: { padding: 16, backgroundColor: "#f8fbff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  navBtn: { padding: 8, backgroundColor: "#e2e8f0", borderRadius: 10 },
  navBtnText: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  headerRow: { marginTop: 10, marginBottom: 6, flexDirection: "row" },
  todayBtn: { backgroundColor: "#22c55e", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  todayText: { color: "white", fontWeight: "700" },
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
  legend: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, marginVertical: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { color: "#475569" },
  detailCard: { backgroundColor: "white", borderRadius: 12, padding: 16, marginTop: 6, marginBottom: 40, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailDate: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  addBtn: { backgroundColor: "#2563eb", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  addBtnText: { color: "white", fontWeight: "700" },
  totalsRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  totalBox: { flex: 1, backgroundColor: "#f1f5f9", padding: 10, borderRadius: 10, alignItems: "center" },
  totalLabel: { color: "#475569", fontWeight: "700" },
  totalValue: { color: "#0f172a", fontSize: 16, fontWeight: "800", marginTop: 2 },
  entryRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  entryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  entryName: { fontWeight: "700", color: "#0f172a" },
  entryMeta: { color: "#475569", marginTop: 2 },
  noLogs: { color: "#6b7280", fontStyle: "italic", marginTop: 10 }
});
