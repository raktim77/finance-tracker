import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

type SmsListenerPlugin = {
  addListener(
    eventName: "smsReceived",
    callback: (data: { message: string; sender: string }) => void
  ): Promise<PluginListenerHandle>;

  getStoredSms(): Promise<{ data: string }>;

  clearStoredSms(): Promise<void>;

  // 🔥 ADD THIS
  getLastClickedSms(): Promise<{ message: string | null; sender: string | null }>;
};

export const SmsListener = registerPlugin<SmsListenerPlugin>("SmsListener");