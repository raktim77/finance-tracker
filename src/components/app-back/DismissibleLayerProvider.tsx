import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";

const DEBUG_BACK_STACK =
  typeof import.meta !== "undefined" && import.meta.env.DEV;

function debugBackStack(message: string, payload?: unknown) {
  if (!DEBUG_BACK_STACK) {
    return;
  }

  if (payload === undefined) {
    console.log(`[BackStack] ${message}`);
    return;
  }

  try {
    console.log(`[BackStack] ${message}\n${JSON.stringify(payload, null, 2)}`);
  } catch {
    console.log(`[BackStack] ${message}`, payload);
  }
}

type DismissibleLayer = {
  id: string;
  isActive: boolean;
  dismiss: () => void;
  priority: number;
  order: number;
};

type LayerRegistration = {
  id: string;
  isActive: boolean;
  dismiss: () => void;
  priority: number;
};

type LayerRegistryContextValue = {
  registerLayer: (layer: LayerRegistration) => () => void;
  updateLayer: (id: string, layer: Partial<LayerRegistration>) => void;
  dismissTopmost: () => boolean;
  hasOpenLayers: () => boolean;
};

const DismissibleLayerContext = createContext<LayerRegistryContextValue | null>(
  null
);

export function DismissibleLayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const layersRef = useRef<Record<string, DismissibleLayer>>({});
  const orderRef = useRef(0);

  const registerLayer = useCallback((layer: LayerRegistration) => {
    const order = ++orderRef.current;
    layersRef.current[layer.id] = {
      ...layer,
      order,
    };

    debugBackStack("register layer", {
      id: layer.id,
      isActive: layer.isActive,
      priority: layer.priority,
      order,
      layerCount: Object.keys(layersRef.current).length,
    });

    return () => {
      delete layersRef.current[layer.id];

      debugBackStack("unregister layer", {
        id: layer.id,
        layerCount: Object.keys(layersRef.current).length,
      });
    };
  }, []);

  const updateLayer = useCallback(
    (id: string, layer: Partial<LayerRegistration>) => {
      const existing = layersRef.current[id];
      if (!existing) {
        return;
      }

      const nextIsActive = layer.isActive ?? existing.isActive;
      const nextDismiss = layer.dismiss ?? existing.dismiss;
      const nextPriority = layer.priority ?? existing.priority;

      if (
        existing.isActive === nextIsActive &&
        existing.dismiss === nextDismiss &&
        existing.priority === nextPriority
      ) {
        return;
      }

      layersRef.current[id] = {
        ...existing,
        ...layer,
      };

      debugBackStack("update layer", {
        id,
        isActive: nextIsActive,
        priority: nextPriority,
      });
    },
    []
  );

  const getTopmostLayer = useCallback(() => {
    const activeLayers = Object.values(layersRef.current).filter(
      (layer) => layer.isActive
    );

    if (activeLayers.length === 0) {
      return null;
    }

    activeLayers.sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }

      return right.order - left.order;
    });

    return activeLayers[0] ?? null;
  }, []);

  const dismissTopmost = useCallback(() => {
    const topmostLayer = getTopmostLayer();

    if (!topmostLayer) {
      debugBackStack("dismissTopmost found no active layer", {
        layers: Object.values(layersRef.current).map((layer) => ({
          id: layer.id,
          isActive: layer.isActive,
          priority: layer.priority,
          order: layer.order,
        })),
      });
      return false;
    }

    debugBackStack("dismissTopmost closing layer", {
      id: topmostLayer.id,
      priority: topmostLayer.priority,
      order: topmostLayer.order,
    });
    topmostLayer.dismiss();
    return true;
  }, [getTopmostLayer]);

  const hasOpenLayers = useCallback(
    () => Object.values(layersRef.current).some((layer) => layer.isActive),
    []
  );

  const value = useMemo(
    () => ({
      registerLayer,
      updateLayer,
      dismissTopmost,
      hasOpenLayers,
    }),
    [dismissTopmost, hasOpenLayers, registerLayer, updateLayer]
  );

  return (
    <DismissibleLayerContext.Provider value={value}>
      {children}
    </DismissibleLayerContext.Provider>
  );
}

export function useDismissibleLayer({
  open,
  onDismiss,
  priority = 0,
  enabled = true,
  enabledInNativeAppOnly = true,
}: {
  open: boolean;
  onDismiss: () => void;
  priority?: number;
  enabled?: boolean;
  enabledInNativeAppOnly?: boolean;
}) {
  const context = useContext(DismissibleLayerContext);
  const id = useId();
  const layerIdRef = useRef(`dismissible-layer-${id.replace(/:/g, "")}`);
  const onDismissRef = useRef(onDismiss);
  const isEnabled =
    enabled && (!enabledInNativeAppOnly || isNativeAndroidApp());
  const registerLayer = context?.registerLayer;
  const updateLayer = context?.updateLayer;

  useLayoutEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    onDismissRef.current();
  }, []);

  useEffect(() => {
    if (!registerLayer || !isEnabled) {
      return;
    }

    return registerLayer({
      id: layerIdRef.current,
      isActive: open,
      dismiss,
      priority,
    });
  }, [dismiss, isEnabled, open, priority, registerLayer]);

  useEffect(() => {
    if (!updateLayer || !isEnabled) {
      return;
    }

    updateLayer(layerIdRef.current, {
      isActive: open,
      dismiss,
      priority,
    });
  }, [dismiss, isEnabled, open, priority, updateLayer]);
}

export function useDismissibleLayerRegistry() {
  const context = useContext(DismissibleLayerContext);

  if (!context) {
    throw new Error(
      "useDismissibleLayerRegistry must be used within DismissibleLayerProvider"
    );
  }

  return context;
}
