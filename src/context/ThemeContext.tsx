"use client";
import React, { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import type { SidebarLayout, Theme } from "./ThemeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      return stored ? stored : "system";
    }
    return "system";
  });
  const [sidebarLayout, setSidebarLayout] = useState<SidebarLayout>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebarLayout") as SidebarLayout | null;
      return stored ? stored : "expanded";
    }
    return "expanded";
  });

  useEffect(() => {
    const root = document.documentElement;

    const appliedTheme =
      theme === "system" ? getSystemTheme() : theme;

    root.classList.remove("light", "dark");
    root.classList.add(appliedTheme);
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      const root = document.documentElement;
      const systemTheme = getSystemTheme();

      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    };

    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sidebarLayout", sidebarLayout);
  }, [sidebarLayout]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "light" ? "dark" : prev === "dark" ? "system" : "light"
    );
  };

  const toggleSidebarLayout = () => {
    setSidebarLayout((prev) => (prev === "expanded" ? "icons" : "expanded"));
  };

  const getSystemTheme = (): "light" | "dark" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
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
