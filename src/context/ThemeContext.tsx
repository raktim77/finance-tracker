"use client";
import React, { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import type { SidebarLayout, Theme } from "./ThemeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      return stored ? stored : "dark";
    }
    return "dark";
  });
  const [sidebarLayout, setSidebarLayout] = useState<SidebarLayout>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebarLayout") as SidebarLayout | null;
      return stored ? stored : "expanded";
    }
    return "expanded";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sidebarLayout", sidebarLayout);
  }, [sidebarLayout]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleSidebarLayout = () => {
    setSidebarLayout((prev) => (prev === "expanded" ? "icons" : "expanded"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        sidebarLayout,
        setSidebarLayout,
        toggleSidebarLayout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
