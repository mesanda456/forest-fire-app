import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../context/ThemeContext";

interface SectionData {
  temperature?: number;
  humidity?: number;
  smoke?: number;
}

interface HistoryBuffer {
  temperature: number[];
  humidity: number[];
  smoke: number[];
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [sectionsData, setSectionsData] = useState<Record<string, SectionData>>({});
  const [historyData, setHistoryData] = useState<Record<string, HistoryBuffer>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devicesRef = ref(db, "forest_devices");

    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) updateHistory(data);

        setSectionsData(data || {});
        setLoading(false);
      },
      (error) => {
        console.error("Firebase Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update history buffer
  const updateHistory = (data: Record<string, any>) => {
    setHistoryData((prev) => {
      const updated = { ...prev };

      Object.keys(data).forEach((key) => {
        if (!updated[key]) {
          updated[key] = { temperature: [], humidity: [], smoke: [] };
        }

        const buffer = updated[key];
        const payload = data[key]?.last?.data ?? {};

        if (typeof payload.temperature === "number")
          pushValue(buffer.temperature, payload.temperature);

        if (typeof payload.humidity === "number")
          pushValue(buffer.humidity, payload.humidity);

        if (typeof payload.smoke === "number")
          pushValue(buffer.smoke, payload.smoke);
      });

      return { ...updated };
    });
  };

  const pushValue = (arr: number[], value: number) => {
    arr.push(value);
    if (arr.length > 10) arr.shift();
  };

  const sectionKeys = Object.keys(sectionsData);
  const windowWidth = Dimensions.get("window").width - 40;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={darkMode ? "#34d399" : "#2563eb"} />
      </View>
    );
  }

  if (sectionKeys.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: darkMode ? "#fff" : "#6b7280", fontSize: 18 }}>
          No section data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: darkMode ? "#0f1724" : "#f0f4f8" }]}
      contentContainerStyle={styles.contentContainer}
    >
      {sectionKeys.map((key) => {
        const history = historyData[key] ?? { temperature: [], humidity: [], smoke: [] };

        return (
          <View
            key={key}
            style={[styles.sectionCard, { backgroundColor: darkMode ? "#1e293b" : "#fff" }]}
          >
            <Text style={[styles.sectionTitle, { color: darkMode ? "#e6eef8" : "#1f2937" }]}>
              {key}
            </Text>

            {renderChart(
              "Temperature (°C)",
              history.temperature,
              "255,99,132",
              darkMode ? "#2c2f3b" : "#ffe5e5",
              windowWidth,
              darkMode
            )}

            {renderChart(
              "Humidity (%)",
              history.humidity,
              "54,162,235",
              darkMode ? "#2c2f3b" : "#e5f0ff",
              windowWidth,
              darkMode
            )}

            {renderChart(
              "Smoke Level",
              history.smoke,
              "255,206,86",
              darkMode ? "#2c2f3b" : "#fff7e5",
              windowWidth,
              darkMode
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const renderChart = (
  label: string,
  values: number[],
  rgb: string,
  bgColor: string,
  width: number,
  darkMode: boolean
) => {
  const dataValues = values.length ? values : [0];
  const labels = dataValues.map((_, i) => `T${i + 1}`);

  return (
    <View style={styles.chartWrapper}>
      <Text style={[styles.chartTitle, { color: darkMode ? "#e6eef8" : "#374151" }]}>{label}</Text>

      <LineChart
        data={{
          labels,
          datasets: [{ data: dataValues }],
        }}
        width={width}
        height={180}
        bezier
        chartConfig={{
          backgroundGradientFrom: bgColor,
          backgroundGradientTo: darkMode ? "#0f1724" : "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(${rgb}, ${opacity})`,
          labelColor: (opacity = 1) =>
            `rgba(${darkMode ? "255,255,255" : "0,0,0"}, ${opacity})`,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: `rgba(${rgb},1)`,
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 15, paddingBottom: 30, gap: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionCard: {
    borderRadius: 20,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
  chartWrapper: { marginBottom: 18 },
  chartTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  chart: { borderRadius: 15 },
});

