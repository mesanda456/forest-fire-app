import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE, LatLng } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { useTheme } from "../context/ThemeContext";

export default function MapScreen() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [devices, setDevices] = useState<Record<string, any>>({});
  const mapRef = useRef<MapView | null>(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const devicesRef = ref(db, "forest_devices");
    const unsubscribe = onValue(devicesRef, (snap) => {
      const val = snap.val();
      console.log("Devices from Firebase:", val);
      if (val) setDevices(val);
      else setDevices({});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);

  useEffect(() => {
    const points: LatLng[] = Object.keys(devices)
      .map((k) => devices[k]?.last)
      .filter((d) => d && d.latitude != null && d.longitude != null)
      .map((d) => ({ latitude: d.latitude, longitude: d.longitude }));

    if (!mapRef.current || points.length === 0) return;

    if (points.length === 1) {
      mapRef.current.animateToRegion(
        { ...points[0], latitudeDelta: 0.01, longitudeDelta: 0.01 },
        800
      );
    } else {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 120, right: 60, bottom: 120, left: 60 },
        animated: true,
      });
    }
  }, [devices]);

  const mapStyle = darkMode
    ? [
        { elementType: "geometry", stylers: [{ color: "#0f1724" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#e6eef8" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
      ]
    : [];

  const DEFAULT_RADIUS = 100;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={(r) => { mapRef.current = r; }}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{ latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        customMapStyle={mapStyle}
      >
        {Object.keys(devices).map((key) => {
          const d = devices[key]?.last;
          if (!d || d.latitude == null || d.longitude == null) return null;

          const isAlert =
            d.fireDetected === "true" ||
            (typeof d.temperature === "number" && d.temperature > 50) ||
            (typeof d.gas === "number" && d.gas > 600) ||
            (typeof d.rainAnalog === "number" && d.rainAnalog >= 1500);

          const coord = { latitude: d.latitude, longitude: d.longitude };

          if (!isAlert) {
            return (
              <Marker
                key={key}
                identifier={key}
                coordinate={coord}
                title={key}
                description={`Temp: ${d.temperature ?? "N/A"} | Gas: ${d.gas ?? "N/A"}`}
                pinColor="green"
              />
            );
          }

          // Alert marker with blinking red circle
          return (
            <Marker key={key} identifier={key} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
              <Animated.View style={[styles.alertMarker, { opacity: blinkAnim }]} />
              <Circle
                center={coord}
                radius={d.geofenceRadius ?? DEFAULT_RADIUS}
                strokeColor="rgba(248,113,113,0.8)"
                fillColor="rgba(248,113,113,0.15)"
                strokeWidth={2}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const ALERT_SIZE = 36;

const styles = StyleSheet.create({
  alertMarker: {
    width: ALERT_SIZE,
    height: ALERT_SIZE,
    borderRadius: ALERT_SIZE / 2,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
  },
});
