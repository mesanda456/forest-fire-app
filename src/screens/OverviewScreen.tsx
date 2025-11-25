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
import { Audio } from "expo-av";

export default function OverviewScreen() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [deviceData, setDeviceData] = useState<any>({});

  // Track which devices already alerted
  const alertedDevices = useRef<Set<string>>(new Set());

  // Sound reference
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load sound once
  const loadSound = async () => {
    if (soundRef.current) return;

   const { sound } = await Audio.Sound.createAsync(
  require("../assets/sounds/fire_alarm.mp3")

);

    soundRef.current = sound;
  };

  // Play alarm sound
  const playAlarm = async () => {
    try {
      await loadSound();
      await soundRef.current?.setPositionAsync(0);
      await soundRef.current?.playAsync();
    } catch (err) {
      console.log("Sound error:", err);
    }
  };

  // Stop alarm sound
  const stopAlarm = async () => {
    try {
      await soundRef.current?.stopAsync();
    } catch {}
  };

  useEffect(() => {
    const mainRef = ref(db, "forest_devices");

    const unsubscribe = onValue(mainRef, (snapshot) => {
      const allDevices = snapshot.val();
      if (!allDevices) return;

      const deviceKeys = Object.keys(allDevices);
      setDeviceList(deviceKeys);
      setDeviceData(allDevices);

      deviceKeys.forEach((devKey) => {
        const d = allDevices[devKey]?.last;

        if (!d) return;

        // FIRE detection
        const isFire =
          d.fireDetected === "true" ||
          d.temperature > 50 ||
          d.gas > 900;

        // RAIN detection
        const isHeavyRain = d.rainAnalog >= 1500 || d.rainPercent >= 70;

        // If a fire happens → alert + sound
        if (isFire && !alertedDevices.current.has(devKey)) {
          Alert.alert("🔥 FIRE ALERT", `${devKey}\nFire danger detected!`);
          playAlarm();
          alertedDevices.current.add(devKey);
        }

        // Rain → alert only, no sound
        if (isHeavyRain && !alertedDevices.current.has(devKey)) {
          Alert.alert("🌧 HEAVY RAIN ALERT", `${devKey}\nHeavy rain detected.`);
          alertedDevices.current.add(devKey);
        }

        // Clear alert when safe
        if (!isFire && !isHeavyRain && alertedDevices.current.has(devKey)) {
          alertedDevices.current.delete(devKey);

          // Stop alarm sound when fire is gone
          stopAlarm();
        }
      });
    });

    return () => {
      unsubscribe();
      soundRef.current?.unloadAsync();
    };
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
          Monitoring all IoT devices in real-time.
          Fire alerts include sound. Rain alerts are silent.
        </Text>
      </View>

      <FlatList
        data={deviceList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingVertical: 20, gap: 15 }}
        renderItem={({ item }) => {
          const data = deviceData[item]?.last;
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
