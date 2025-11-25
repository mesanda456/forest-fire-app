import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  sectionId: string;
  data: any;
  darkMode?: boolean;
};

export default function SectionCard({ sectionId, data, darkMode = false }: Props) {
  // ---------------------------
  // 🔥 CARD STATUS COLOR LOGIC
  // ---------------------------
  const getStatusColor = () => {
    const isFire =
      data.fireDetected === "true" ||
      data.flameDigital === 1 ||
      data.temperature > 50 ||
      data.gas > 600;

    const isWarning =
      data.temperature > 40 ||
      data.gas > 500 ||
      data.rainPercent > 50;

    if (isFire) return "#f87171"; // Red
    if (isWarning) return "#facc15"; // Yellow
    return "#4ade80"; // Green
  };

  const background = darkMode ? "#1e293b" : getStatusColor();
  const textColor = darkMode ? "#fff" : "#000";

  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {sectionId}
      </Text>

      {/* 🔥 Fire Related */}
      <Text style={{ color: textColor }}>
        🔥 Fire Detected: {data.fireDetected === "true" ? "YES" : "No"}
      </Text>

      <Text style={{ color: textColor }}>
        🔥 Flame Digital: {data.flameDigital}
      </Text>

      <Text style={{ color: textColor }}>
        🔥 Flame Analog: {data.flameAnalog}
      </Text>

      {/* 🌡 Temperature */}
      <Text style={{ color: textColor }}>
        🌡 Temperature: {data.temperature} °C
      </Text>

      {/* 💧 Humidity */}
      <Text style={{ color: textColor }}>
        💧 Humidity: {data.humidity}%
      </Text>

      {/* 🧪 Gas */}
      <Text style={{ color: textColor }}>
        🧪 Gas: {data.gas}
      </Text>

      {/* 🌞 Light */}
      <Text style={{ color: textColor }}>
        💡 Light: {data.ldrAnalog} ({data.lightDescription})
      </Text>

      {/* 🌧 Rain */}
      <Text style={{ color: textColor }}>
        🌧 Rain: {data.rainPercent.toFixed(1)}% ({data.rainStatus})
      </Text>

      {/* Time */}
      <Text style={{ color: textColor, marginTop: 4, fontSize: 12 }}>
        ⏱ Updated: {data.timestamp}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
});
