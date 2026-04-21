import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type SidebarLayout = "expanded" | "icons";

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  sidebarLayout: SidebarLayout;
  setSidebarLayout: (layout: SidebarLayout) => void;
  toggleSidebarLayout: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  toggleTheme: () => {},
  sidebarLayout: "expanded",
  setSidebarLayout: () => {},
  toggleSidebarLayout: () => {},
});
