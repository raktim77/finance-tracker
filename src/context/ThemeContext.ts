import { createContext } from "react";

export type Theme = "light" | "dark";
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
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  sidebarLayout: "expanded",
  setSidebarLayout: () => {},
  toggleSidebarLayout: () => {},
});
