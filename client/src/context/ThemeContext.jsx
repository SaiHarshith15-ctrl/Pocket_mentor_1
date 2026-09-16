import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const PALETTES = [
  { id: "indigo", name: "Indigo Modern", hex: "#4F46E5", ring: "ring-indigo-400" },
  { id: "emerald", name: "Emerald Zen", hex: "#059669", ring: "ring-emerald-400" },
  { id: "violet", name: "Cyber Violet", hex: "#7C3AED", ring: "ring-purple-400" },
  { id: "rose", name: "Sunset Rose", hex: "#E11D48", ring: "ring-rose-400" },
  { id: "teal", name: "Ocean Teal", hex: "#0D9488", ring: "ring-teal-400" },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("pocket_theme");
    return stored ? stored : "light"; // Default is light as requested
  });

  const [palette, setPalette] = useState(() => {
    const stored = localStorage.getItem("pocket_palette");
    return stored ? stored : "indigo"; // Default is indigo (existing app color)
  });

  // Apply or remove dark class on <html> and sync data-palette
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("pocket_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-palette", palette);
    localStorage.setItem("pocket_palette", palette);
  }, [palette]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, palette, setPalette, PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
