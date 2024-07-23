"use client";

import { useEffect, ReactNode } from "react";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";

export default function ClientApplication({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorScheme]);

  return children;
}
