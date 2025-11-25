// src/screens/LoginScreen.tsx
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

type Props = { navigation: any };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!email || !password) {
      return alert("Please enter email and password.");
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    //   navigation.replace("MainTabs");
    } catch (err: any) {
      alert(err.message || "Login failed");
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Forest Monitor</Text>

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={loginUser} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkWrap}>
          <Text style={styles.linkText}>Don't have an account? Create one</Text>
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
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  subtitle: { color: "#64748b", marginBottom: 16 },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#0f172a",
  },
  button: {
    backgroundColor: "#1366d6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkWrap: { marginTop: 14, alignItems: "center" },
  linkText: { color: "#1366d6" },
});
