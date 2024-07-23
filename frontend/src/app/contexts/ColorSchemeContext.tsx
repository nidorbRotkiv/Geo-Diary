"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ColorScheme } from "@/app/globalInterfaces";

type ColorSchemeContextType = {
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
};

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  useEffect(() => {
    const savedColorScheme = sessionStorage.getItem("colorScheme") as ColorScheme | null;

    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
      return;
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const updateColorScheme = (e: MediaQueryListEvent) => {
        const newColorScheme = e.matches ? "dark" : "light";
        setColorScheme(newColorScheme);
        sessionStorage.setItem("colorScheme", newColorScheme);
      };

      const initialColorScheme = mediaQuery.matches ? "dark" : "light";
      setColorScheme(initialColorScheme);
      sessionStorage.setItem("colorScheme", initialColorScheme);

      mediaQuery.addEventListener("change", updateColorScheme);

      return () => mediaQuery.removeEventListener("change", updateColorScheme);
    }
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme: () => ColorSchemeContextType = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
};
