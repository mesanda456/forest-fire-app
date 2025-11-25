import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { ref, set, get, onValue, update } from "firebase/database";
import { db, auth } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import { signOut } from "firebase/auth";

type GlobalSettings = {
  theme?: "light" | "dark";
  defaultLat?: number;
  defaultLon?: number;
  historyLength?: number;
  alertsEnabled?: boolean;
};

type DeviceControl = {
  flameEnabled: boolean;
  servoEnabled: boolean;
};

type Profile = {
  fullName?: string;
  phone?: string;
  role?: string;
};

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  const [profile, setProfile] = useState<Profile>({});
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    theme: "light",
    defaultLat: 6.9271,
    defaultLon: 79.8612,
    historyLength: 10,
    alertsEnabled: true,
  });

  const [devices, setDevices] = useState<Record<string, DeviceControl>>({});
  const uid = auth.currentUser?.uid;

  // Load user profile, devices, and global settings
  useEffect(() => {
    if (!uid) return;

    get(ref(db, `users/${uid}`))
      .then((snap) => snap.exists() && setProfile(snap.val()))
      .catch(console.error);

    get(ref(db, "forest_devices"))
      .then((snap) => {
        if (snap.exists()) {
          setDevices(snap.val());
        } else if (profile.role === "forest_authority") {
          const defaultDevices: Record<string, DeviceControl> = {
            device1: { flameEnabled: false, servoEnabled: false },
          };
          set(ref(db, "forest_devices"), defaultDevices)
            .then(() => setDevices(defaultDevices))
            .catch(console.error);
        }
      })
      .catch(console.error);

    const settingsRef = ref(db, "settings");
    const unsubscribe = onValue(settingsRef, (snap) => {
      const s = snap.val() as GlobalSettings | null;
      if (s) setGlobalSettings((prev) => ({ ...prev, ...s }));
    });

    return () => unsubscribe();
  }, [uid, profile.role]);

  const saveProfile = async () => {
    if (!uid) return;
    try {
      await update(ref(db, `users/${uid}`), {
        fullName: profile.fullName,
        phone: profile.phone,
      });
      Alert.alert("Profile updated!");
    } catch (err) {
      console.error(err);
      Alert.alert("Update failed");
    }
  };

  const logout = async () => {
    await signOut(auth);
    Alert.alert("Logged out!");
  };

  const saveGlobalSettings = () => {
    set(ref(db, "settings"), globalSettings).catch(console.error);
  };

  const toggleDeviceControl = (deviceKey: string, controlKey: keyof DeviceControl) => {
    const newValue = !devices[deviceKey][controlKey];
    update(ref(db, `forest_devices/${deviceKey}`), { [controlKey]: newValue })
      .then(() =>
        setDevices((prev) => ({
          ...prev,
          [deviceKey]: { ...prev[deviceKey], [controlKey]: newValue },
        }))
      )
      .catch(console.error);
  };

  const containerStyle = darkMode ? styles.darkContainer : styles.container;
  const cardStyle = darkMode ? styles.darkCard : styles.card;
  const textStyle = darkMode ? styles.darkText : styles.text;

  return (
    <ScrollView
  style={{ flex: 1 }} // Make ScrollView take full height
  contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20 }}
  showsVerticalScrollIndicator={true}
>
  {/* Profile */}
  <View style={[cardStyle]}>
    <Text style={[styles.title, textStyle]}>My Profile</Text>
    <Text style={[styles.label, textStyle]}>Full Name</Text>
    <TextInput
      style={[styles.input, darkMode && styles.inputDark]}
      value={profile.fullName || ""}
      onChangeText={(t) => setProfile({ ...profile, fullName: t })}
    />
    <Text style={[styles.label, textStyle]}>Phone</Text>
    <TextInput
      style={[styles.input, darkMode && styles.inputDark]}
      value={profile.phone || ""}
      onChangeText={(t) => setProfile({ ...profile, phone: t })}
    />
    <Text style={[styles.label, textStyle]}>Role</Text>
    <TextInput
      style={[styles.input, { backgroundColor: "#eef2ff" }]}
      value={profile.role || ""}
      editable={false}
    />
    <TouchableOpacity style={styles.button} onPress={saveProfile}>
      <Text style={styles.buttonText}>Save Changes</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.button, { backgroundColor: "#fff", borderWidth: 1, marginTop: 12 }]}
      onPress={logout}
    >
      <Text style={[styles.buttonText, { color: "#0f172a" }]}>Log Out</Text>
    </TouchableOpacity>
  </View>

  {/* Theme */}
  <View style={[cardStyle]}>
    <Text style={[styles.subtitle, textStyle]}>Theme</Text>
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.themeToggle, darkMode && styles.themeToggleDark]}
    >
      <Text style={{ fontSize: 16 }}>{theme === "light" ? "🌞 Light" : "🌙 Dark"}</Text>
    </TouchableOpacity>
  </View>

  {/* Global Settings */}
  <View style={[cardStyle]}>
    <Text style={[styles.subtitle, textStyle]}>Global Settings</Text>
    <Text style={textStyle}>Default Latitude</Text>
    <TextInput
      value={String(globalSettings.defaultLat ?? "")}
      onChangeText={(v) => setGlobalSettings((p) => ({ ...p, defaultLat: Number(v) }))}
      style={[styles.input, darkMode && styles.inputDark]}
      keyboardType="numeric"
    />
    <Text style={textStyle}>Default Longitude</Text>
    <TextInput
      value={String(globalSettings.defaultLon ?? "")}
      onChangeText={(v) => setGlobalSettings((p) => ({ ...p, defaultLon: Number(v) }))}
      style={[styles.input, darkMode && styles.inputDark]}
      keyboardType="numeric"
    />
    <Button title="Save Global Settings" onPress={saveGlobalSettings} />
  </View>

  {/* Device Controls */}
  {profile.role === "forest_authority" && (
    <View style={[cardStyle]}>
      <Text style={[styles.subtitle, textStyle]}>Device Controls</Text>
      {Object.keys(devices).length === 0 ? (
        <Text style={textStyle}>No devices registered.</Text>
      ) : (
        Object.keys(devices).map((deviceKey) => {
          const device = devices[deviceKey];
          return (
            <View key={deviceKey} style={styles.deviceRow}>
              <Text style={textStyle}>{deviceKey}</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <View style={{ marginRight: 20, alignItems: "center" }}>
                  <Text style={textStyle}>Flame Sensor</Text>
                  <Switch
                    value={device?.flameEnabled ?? false}
                    onValueChange={() => toggleDeviceControl(deviceKey, "flameEnabled")}
                  />
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={textStyle}>Servo Motor</Text>
                  <Switch
                    value={device?.servoEnabled ?? false}
                    onValueChange={() => toggleDeviceControl(deviceKey, "servoEnabled")}
                  />
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  )}
</ScrollView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f7fb" },
  darkContainer: { flex: 1, backgroundColor: "#0f1724" },
  card: { width: "100%", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 12, elevation: 5 },
  darkCard: { width: "100%", backgroundColor: "#112233", padding: 20, marginBottom: 20, borderRadius: 12, elevation: 5 },
  centerCard: { alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  label: { fontWeight: "600", marginBottom: 4 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  inputDark: { borderColor: "#555", backgroundColor: "#1a1f2b", color: "#fff" },
  button: { backgroundColor: "#1366d6", padding: 14, borderRadius: 10, marginTop: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  text: { color: "#000" },
  darkText: { color: "#fff" },
  themeToggle: { padding: 10, borderRadius: 8, backgroundColor: "#ddd", marginBottom: 12 },
  themeToggleDark: { backgroundColor: "#223344" },
  deviceRow: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 12 },
});
