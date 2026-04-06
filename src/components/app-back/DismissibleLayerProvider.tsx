import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";

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
  const [layers, setLayers] = useState<Record<string, DismissibleLayer>>({});
  const orderRef = useRef(0);

  const registerLayer = useCallback((layer: LayerRegistration) => {
    const order = ++orderRef.current;

    setLayers((current) => ({
      ...current,
      [layer.id]: {
        ...layer,
        order,
      },
    }));

    return () => {
      setLayers((current) => {
        if (!current[layer.id]) {
          return current;
        }

        const next = { ...current };
        delete next[layer.id];
        return next;
      });
    };
  }, []);

  const updateLayer = useCallback(
    (id: string, layer: Partial<LayerRegistration>) => {
      setLayers((current) => {
        const existing = current[id];
        if (!existing) {
          return current;
        }

        const nextIsActive = layer.isActive ?? existing.isActive;
        const nextDismiss = layer.dismiss ?? existing.dismiss;
        const nextPriority = layer.priority ?? existing.priority;

        if (
          existing.isActive === nextIsActive &&
          existing.dismiss === nextDismiss &&
          existing.priority === nextPriority
        ) {
          return current;
        }

        return {
          ...current,
          [id]: {
            ...existing,
            ...layer,
          },
        };
      });
    },
    []
  );

  const getTopmostLayer = useCallback(() => {
    const activeLayers = Object.values(layers).filter((layer) => layer.isActive);

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
  }, [layers]);

  const dismissTopmost = useCallback(() => {
    const topmostLayer = getTopmostLayer();

    if (!topmostLayer) {
      return false;
    }

    topmostLayer.dismiss();
    return true;
  }, [getTopmostLayer]);

  const hasOpenLayers = useCallback(
    () => Object.values(layers).some((layer) => layer.isActive),
    [layers]
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
