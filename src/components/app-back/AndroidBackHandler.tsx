import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import { useDismissibleLayerRegistry } from "./DismissibleLayerProvider";
import type { PluginListenerHandle } from "@capacitor/core";
import { useToast } from "../ui/confirm-modal/useToast";

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const { dismissTopmost } = useDismissibleLayerRegistry();
  const toast = useToast();
  const lastBackPressTimeRef = useRef(0);

  useEffect(() => {
    if (!isNativeAndroidApp()) return;

    let listener: PluginListenerHandle | null = null;
    let isMounted = true;

    const handleExit = () => {
      const now = Date.now();

      if (now - lastBackPressTimeRef.current < 2000) {
        CapacitorApp.exitApp();
        return;
      }

      lastBackPressTimeRef.current = now;
      toast.show("Press back again to exit");
    };

    const setup = async () => {
      const l = await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        const dismissedLayer = dismissTopmost();
        if (dismissedLayer) return;

        if (canGoBack) {
          navigate(-1);
          return;
        }

        handleExit();
      });

      if (isMounted) {
        listener = l;
      } else {
        l.remove();
      }
    };

    setup();

    return () => {
      isMounted = false;
      listener?.remove();
    };
  }, [dismissTopmost, navigate, toast]);

  return null;
}
