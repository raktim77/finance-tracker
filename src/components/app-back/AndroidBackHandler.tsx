import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import { useDismissibleLayerRegistry } from "./DismissibleLayerProvider";

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const { dismissTopmost } = useDismissibleLayerRegistry();

  useEffect(() => {
    if (!isNativeAndroidApp()) {
      return;
    }

    const listenerPromise = CapacitorApp.addListener(
      "backButton",
      async ({ canGoBack }) => {
        if (dismissTopmost()) {
          return;
        }

        if (canGoBack) {
          navigate(-1);
          return;
        }

        await CapacitorApp.exitApp();
      }
    );

    return () => {
      void listenerPromise.then((listener) => listener.remove());
    };
  }, [dismissTopmost, navigate]);

  return null;
}
