import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import { useDismissibleLayerRegistry } from "./DismissibleLayerProvider";
import type { PluginListenerHandle } from "@capacitor/core";
import { useToast } from "../ui/confirm-modal/useToast";

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const { dismissTopmost } = useDismissibleLayerRegistry();
  const toast = useToast()
let lastBackPressTime = 0;

function handleExit() {
  const now = Date.now();

  if (now - lastBackPressTime < 2000) {
    CapacitorApp.exitApp();
  } else {
    lastBackPressTime = now;
    toast.show("Press back again to exit")
  }
}
 useEffect(() => {
  if (!isNativeAndroidApp()) return;

  let listener: PluginListenerHandle | null = null;
  let isMounted = true;

  const setup = async () => {
    const l = await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      const dismissedLayer = dismissTopmost();
      if (dismissedLayer) return;

      if (canGoBack) {
        navigate(-1);
        return;
      }

      handleExit(); // we'll define this next
    });

    if (isMounted) {
      listener = l;
    } else {
      l.remove(); // cleanup if already unmounted
    }
  };

  setup();

  return () => {
    isMounted = false;
    listener?.remove();
  };
}, [dismissTopmost, navigate]);

  return null;
}

async function showToast(message: string) {
  await Toast.show({
    text: message,
    duration: "short",
  });
}