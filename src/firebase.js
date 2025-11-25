// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmEE-Bm7HICrRigTgzZLSKjwllMTJP_-s",
  authDomain: "iot-forest.firebaseapp.com",
  databaseURL: "https://iot-forest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-forest",
  storageBucket: "iot-forest.firebasestorage.app",
  messagingSenderId: "714300492074",
  appId: "1:714300492074:web:9d58a0a34e5d4f17a43653",
  measurementId: "G-ZLKJ6V5SLP"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});