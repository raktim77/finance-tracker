import { registerPlugin } from "@capacitor/core";

type NativeChromePlugin = {
  setBackgroundColor(options: { color: string }): Promise<{ color: string }>;
  setStatusBarIcons(options: { style: "light" | "dark" }): Promise<{ style: "light" | "dark" }>;
};

export const NativeChrome = registerPlugin<NativeChromePlugin>("NativeChrome");
