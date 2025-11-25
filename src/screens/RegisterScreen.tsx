// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, set, serverTimestamp } from "firebase/database";

type Props = { navigation: any };

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("Hiker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      return alert("Please fill required fields.");
    }

    try {
      setLoading(true);

      // Create user account
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // SAVE TO REALTIME DATABASE
      await set(ref(db, "users/" + cred.user.uid), {
        fullName,
        phone,
        email: cred.user.email,
        role,
        createdAt: Date.now(),
      });

      alert("Account created!");
    //   navigation.replace("MainTabs");
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>

        <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={styles.input} />
        <TextInput placeholder="Phone (optional)" value={phone} onChangeText={setPhone} style={styles.input} />
        <TextInput placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={role} onValueChange={(v) => setRole(v)}>
            <Picker.Item label="Hiker" value="Hiker" />
            <Picker.Item label="Police Officer" value="Police" />
            <Picker.Item label="Firefighter" value="Firefighter" />
            <Picker.Item label="Forest Authority" value="forest_authority" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 12, alignItems: "center" }}>
          <Text style={{ color: "#1366d6" }}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#0f172a" },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrap: { backgroundColor: "#f1f5f9", borderRadius: 10, marginBottom: 12 },
  button: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
