import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import { useDismissibleLayerRegistry } from "./DismissibleLayerProvider";

const DEBUG_ANDROID_BACK =
  typeof import.meta !== "undefined" && import.meta.env.DEV;

function debugAndroidBack(message: string, payload?: unknown) {
  if (!DEBUG_ANDROID_BACK) {
    return;
  }

  if (payload === undefined) {
    console.log(`[AndroidBack] ${message}`);
    return;
  }

  try {
    console.log(`[AndroidBack] ${message}\n${JSON.stringify(payload, null, 2)}`);
  } catch {
    console.log(`[AndroidBack] ${message}`, payload);
  }
}

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const { dismissTopmost } = useDismissibleLayerRegistry();

  useEffect(() => {
    if (!isNativeAndroidApp()) {
      debugAndroidBack("listener not attached because app is not native Android");
      return;
    }

    debugAndroidBack("disabling Capacitor default back handler");
    void CapacitorApp.toggleBackButtonHandler({ enabled: false })
      .then(() => {
        debugAndroidBack("default back handler disabled");
      })
      .catch((error) => {
        debugAndroidBack("failed to disable default back handler", {
          message: error instanceof Error ? error.message : String(error),
        });
      });

    debugAndroidBack("attaching backButton listener");
    const listenerPromise = CapacitorApp.addListener("backButton", async ({ canGoBack }) => {
      debugAndroidBack("backButton event fired", { canGoBack });

      const dismissedLayer = dismissTopmost();
      debugAndroidBack("dismissTopmost result", { dismissedLayer });

      if (dismissedLayer) {
        return;
      }

      if (canGoBack) {
        debugAndroidBack("navigating back in router");
        navigate(-1);
        return;
      }

      debugAndroidBack("exiting app because no layer and no history");
      await CapacitorApp.exitApp();
    });

    return () => {
      debugAndroidBack("removing backButton listener");
      void listenerPromise.then((listener) => listener.remove());
      void CapacitorApp.toggleBackButtonHandler({ enabled: true }).catch(() => {});
    };
  }, [dismissTopmost, navigate]);

  return null;
}
