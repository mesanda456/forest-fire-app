// App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "./src/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import OverviewScreen from "./src/screens/OverviewScreen";
import MapScreens from "./src/screens/MapScreens";
import HistoryScreen from "./src/screens/HistoryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main bottom tabs
function MainTabs() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#fff" : "#000",
        tabBarStyle: { backgroundColor: isDark ? "#0f1724" : "#fff" },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Overview":
              return <Ionicons name="grid-outline" size={size} color={color} />;
            case "Map":
              return <Ionicons name="map-outline" size={size} color={color} />;
            case "History":
              return <Ionicons name="stats-chart-outline" size={size} color={color} />;
            case "Settings":
              return <Ionicons name="settings-outline" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Map" component={MapScreens} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// App component with auth check
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // You can add a splash screen here

  return (
    <ThemeProvider>
      <NavigationContainer>
        {user ? (
          <MainTabs />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </ThemeProvider>
  );
}
