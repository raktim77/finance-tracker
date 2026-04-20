import { Capacitor } from "@capacitor/core";

export function isNativeCapacitorApp() {
  return Capacitor.isNativePlatform();
}

export function isNativeAndroidApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}
