import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

type SmsListenerPlugin = {
  addListener(
    eventName: "smsReceived",
    callback: (data: { message: string; sender: string; timestamp: number }) => void
  ): Promise<PluginListenerHandle>;

    addListener(
    eventName: "notificationClicked",
    callback: (data: { message: string; sender: string; timestamp: number }) => void
  ): Promise<PluginListenerHandle>;

  getStoredSms(): Promise<{ data: string }>;

  clearStoredSms(): Promise<void>;

  // 🔥 ADD THIS
  getLastClickedSms(): Promise<{ message: string | null; sender: string | null; timestamp:number }>;
};

export const SmsListener = registerPlugin<SmsListenerPlugin>("SmsListener");