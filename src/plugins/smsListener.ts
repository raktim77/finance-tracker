import { registerPlugin } from "@capacitor/core";

type SmsListenerPlugin = {
  addListener(
    eventName: "smsReceived",
    callback: (data: { message: string; sender: string }) => void
  ): Promise<void>;
};

export const SmsListener = registerPlugin<SmsListenerPlugin>("SmsListener");