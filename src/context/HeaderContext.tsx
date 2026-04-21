import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeAndroidApp } from "../lib/capacitor/platform";
import { NativeChrome } from "../lib/capacitor/nativeChrome";

export const SURFACE_COLOR = "#fffcf7";

export type HeaderConfig = {
  heroColor?: string | null;
  heroHeight?: number;
  showLogo?: boolean;
  scrollTitle?: string | null;
  scrollAction?: string | null;
  onAction?: (() => void) | null;
};

type HeaderState = {
  backgroundColor: string;
  textColor: string;
  showShadow: boolean;
  titleVisible: boolean;
  actionVisible: boolean;
  title: string;
  actionLabel: string;
  onAction: (() => void) | null;
  logoVisible: boolean;
};

type HeaderContextValue = {
  state: HeaderState;
  registerConfig: (config: HeaderConfig) => void;
  onScroll: (scrollY: number) => void;
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

function parseHex(hex: string) {
  const color = hex.replace("#", "");
  const normalized =
    color.length === 3
      ? color
          .split("")
          .map((part) => part + part)
          .join("")
      : color.slice(0, 6);

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function toHexByte(value: number) {
  return Math.max(0, Math.min(255, value))
    .toString(16)
    .padStart(2, "0");
}

function normalizeHexColor(color: string) {
  const trimmed = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  return null;
}

function getSurfaceColor() {
  if (typeof document === "undefined") return SURFACE_COLOR;

  const cssSurface = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-surface")
    .trim();

  return normalizeHexColor(cssSurface) ?? SURFACE_COLOR;
}

function lerpColor(hexA: string, hexB: string, t: number) {
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  const red = Math.round(r1 + (r2 - r1) * t);
  const green = Math.round(g1 + (g2 - g1) * t);
  const blue = Math.round(b1 + (b2 - b1) * t);

  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function contrastColor(hex: string) {
  const [red, green, blue] = parseHex(hex);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.55 ? "#111111" : "#ffffff";
}

function iconsForTextColor(textColor: string) {
  return textColor === "#ffffff" ? "light" : "dark";
}

function syncNativeHeader(backgroundColor: string, textColor: string) {
  if (!isNativeAndroidApp()) return;

  const iconStyle = iconsForTextColor(textColor);

  void StatusBar.setBackgroundColor({ color: "#00000000" }).catch(() => {});
  void StatusBar.setStyle({
    style: iconStyle === "dark" ? Style.Light : Style.Dark,
  }).catch(() => {});
  void NativeChrome.setBackgroundColor({ color: backgroundColor }).catch(() => {});
  void NativeChrome.setStatusBarIcons({ style: iconStyle }).catch(() => {});
}

const defaultState: HeaderState = {
  backgroundColor: SURFACE_COLOR,
  textColor: "#111111",
  showShadow: false,
  titleVisible: false,
  actionVisible: false,
  title: "",
  actionLabel: "",
  onAction: null,
  logoVisible: true,
};

export function HeaderProvider({ children }: { children: ReactNode }) {
  const configRef = useRef<Required<HeaderConfig>>({
    heroColor: null,
    heroHeight: 200,
    showLogo: true,
    scrollTitle: null,
    scrollAction: null,
    onAction: null,
  });
  const [state, setState] = useState<HeaderState>(() => ({
    ...defaultState,
    backgroundColor: getSurfaceColor(),
  }));

  const registerConfig = useCallback((config: HeaderConfig) => {
    const nextConfig = {
      heroColor: null,
      heroHeight: 200,
      showLogo: true,
      scrollTitle: null,
      scrollAction: null,
      onAction: null,
      ...config,
    };
    configRef.current = nextConfig;

    const surfaceColor = getSurfaceColor();
    const heroColor = nextConfig.heroColor || surfaceColor;
    const textColor = nextConfig.heroColor
      ? contrastColor(nextConfig.heroColor)
      : "#111111";

    syncNativeHeader(heroColor, textColor);
    setState({
      backgroundColor: heroColor,
      textColor,
      showShadow: false,
      titleVisible: false,
      actionVisible: false,
      title: nextConfig.scrollTitle || "",
      actionLabel: nextConfig.scrollAction || "",
      onAction: nextConfig.onAction,
      logoVisible: nextConfig.showLogo !== false,
    });
  }, []);

  const onScroll = useCallback((scrollY: number) => {
    const cfg = configRef.current;
    const heroHeight = cfg.heroHeight ?? 200;
    const transitionStart = Math.max(0, heroHeight - 80);
    const transitionEnd = Math.max(transitionStart + 1, heroHeight - 16);
    const t = Math.max(
      0,
      Math.min(1, (scrollY - transitionStart) / (transitionEnd - transitionStart))
    );
    const scrolled = t >= 1;
    const surfaceColor = getSurfaceColor();
    const heroColor = cfg.heroColor || surfaceColor;
    const heroText = cfg.heroColor ? contrastColor(cfg.heroColor) : "#111111";

    const backgroundColor = cfg.heroColor
      ? t < 1
        ? lerpColor(heroColor, surfaceColor, t)
        : surfaceColor
      : surfaceColor;
    const textColor = cfg.heroColor && t < 0.5 ? heroText : "#111111";

    syncNativeHeader(backgroundColor, textColor);
    setState((prev) => ({
      ...prev,
      backgroundColor,
      textColor,
      showShadow: scrolled || (!cfg.heroColor && scrollY > 8),
      titleVisible: scrolled && !!cfg.scrollTitle,
      actionVisible: scrolled && !!cfg.scrollAction,
      logoVisible: cfg.showLogo !== false && !scrolled,
    }));
  }, []);

  const value = useMemo(
    () => ({ state, registerConfig, onScroll }),
    [onScroll, registerConfig, state]
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const ctx = useContext(HeaderContext);
  if (!ctx) {
    throw new Error("useHeaderContext must be used inside <HeaderProvider>");
  }
  return ctx;
}
