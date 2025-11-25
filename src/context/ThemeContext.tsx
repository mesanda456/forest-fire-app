import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (t: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>("light");

  useEffect(() => {
    const settingsRef = ref(db, "settings");
    const unsubscribe = onValue(settingsRef, (snap) => {
      const s = snap.val();
      if (s?.theme) setThemeState(s.theme);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    set(ref(db, "settings/theme"), next).catch(console.error);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
