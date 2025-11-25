
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, db } from "../firebase";
import { ref, get, update } from "firebase/database";
import { signOut } from "firebase/auth";

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    loadProfile();
  }, [uid]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const snapshot = await get(ref(db, `users/${uid}`));
      setProfile(snapshot.exists() ? snapshot.val() : {});
    } catch (err) {
      console.error(err);
      Alert.alert("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.fullName) {
      return Alert.alert("Full name is required!");
    }
    try {
      setLoading(true);
      await update(ref(db, `users/${uid}`), {
        fullName: profile.fullName,
        phone: profile.phone,
      });
      Alert.alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigation.replace("Login"); // Navigate to Login screen
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1366d6" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.center}>
        <Text>No profile found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        value={profile.fullName || ""}
        onChangeText={(t) => setProfile({ ...profile, fullName: t })}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={profile.phone || ""}
        onChangeText={(t) => setProfile({ ...profile, phone: t })}
      />

      <Text style={styles.label}>Role</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eef2ff" }]}
        value={profile.role || ""}
        editable={false}
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#fff", borderWidth: 1, marginTop: 12 }]}
        onPress={logout}
      >
        <Text style={[styles.buttonText, { color: "#0f172a" }]}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#0f172a" },
  label: { color: "#475569", marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eef8",
  },
  button: {
    backgroundColor: "#1366d6",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
