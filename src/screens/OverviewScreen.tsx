import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import SectionCard from "../components/SectionCard";
import { useTheme } from "../context/ThemeContext";

export default function OverviewScreen() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [deviceData, setDeviceData] = useState<any>({});
  const alertedDevices = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 🔥 FIXED PATH HERE
    const mainRef = ref(db, "forest_devices");

    const unsubscribe = onValue(mainRef, (snapshot) => {
      const allDevices = snapshot.val();

      if (allDevices) {
        const deviceKeys = Object.keys(allDevices); // device_01, device_02 etc.
        setDeviceList(deviceKeys);
        setDeviceData(allDevices);

        // --------------------------------------------------
        // 🔥 FIRE + RAIN ALERT CHECK FOR EACH DEVICE /last
        // --------------------------------------------------
        deviceKeys.forEach((devKey) => {
          const d = allDevices[devKey]?.last; // <-- ✔ correct sensor data path

          if (!d) return;

          const isFire =
            d.fireDetected === "true" ||
            d.temperature > 50 ||
            d.gas > 900;

          const isHeavyRain = d.rainAnalog >= 1500 || d.rainPercent >= 70;

          // Show alert only once
          if ((isFire || isHeavyRain) && !alertedDevices.current.has(devKey)) {
            let msg = `${devKey}\n`;
            if (isFire) msg += "🔥 Fire Danger Detected!\n";
            if (isHeavyRain) msg += "🌧 Heavy Rain Detected!";

            Alert.alert("⚠ Warning Alert", msg);
            alertedDevices.current.add(devKey);
          }

          // Remove when safe
          if (!isFire && !isHeavyRain && alertedDevices.current.has(devKey)) {
            alertedDevices.current.delete(devKey);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const containerStyle = darkMode ? styles.darkContainer : styles.container;
  const textStyle = darkMode ? styles.darkText : styles.text;
  const infoCardStyle = darkMode ? styles.darkInfoCard : styles.infoCard;
  const cardStyle = darkMode ? styles.darkCard : styles.card;

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, textStyle]}>🌲 Forest Safety Dashboard</Text>

      <View style={infoCardStyle}>
        <Text style={styles.infoText}>
          Monitoring all IoT devices in real-time. Alerts will auto-trigger for
          fire or heavy rain.
        </Text>
      </View>

      {/* DEVICE CARDS */}
      <FlatList
        data={deviceList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingVertical: 20, gap: 15 }}
        renderItem={({ item }) => {
          const data = deviceData[item]?.last; // <-- ✔ FIXED card data path

          if (!data) return null;

          const danger =
            data.fireDetected === "true" ||
            data.temperature > 50 ||
            data.gas > 600 ||
            data.rainAnalog >= 1500;

          return (
            <View style={[cardStyle, danger && styles.cardDanger]}>
              <SectionCard sectionId={item} data={data} darkMode={darkMode} />
            </View>
          );
        }}
      />

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  darkContainer: { flex: 1, backgroundColor: "#0f1724" },
  contentContainer: { flexGrow: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  text: { color: "#1f2937" },
  darkText: { color: "#fff" },
  infoCard: {
    backgroundColor: "#d1fae5",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  darkInfoCard: {
    backgroundColor: "#112233",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  card: {
    width: Dimensions.get("window").width * 0.7,
    borderRadius: 15,
    backgroundColor: "#fff",
    padding: 15,
    elevation: 5,
  },
  darkCard: {
    width: Dimensions.get("window").width * 0.7,
    borderRadius: 15,
    backgroundColor: "#1e293b",
    padding: 15,
    elevation: 5,
  },
  cardDanger: {
    borderColor: "#f87171",
    borderWidth: 2,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#065f46",
  },
  footer: { height: 50 },
});
