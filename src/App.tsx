import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OAuthFinish from "./pages/auth/OAuthFinish";
import AuthCard from "./pages/auth/AuthCard";

import { useAuth } from "./lib/context/useAuth";
import FullscreenLogoLoaderMotion from "./components/loader/FullscreenLogoLoaderMotion";
import { Analytics } from "@vercel/analytics/react";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/Analytics";
import MorePage from "./pages/More";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { isNativeAndroidApp } from "./lib/capacitor/platform";
import AndroidBackHandler from "./components/app-back/AndroidBackHandler";
import { ThemeContext } from "./context/ThemeContext";
import { NativeChrome } from "./lib/capacitor/nativeChrome";
window.addEventListener("unhandledrejection", (event) => {
  console.error("UNHANDLED PROMISE:", event.reason);
});
import { StatusBar, Style } from '@capacitor/status-bar';
import { useContext, useEffect } from "react";
import { initDB, insertPendingSMS } from "./lib/localDb";
import { SmsListener } from "./plugins/smsListener";
import { parseSMS } from "./lib/smsParser";
import type { PluginListenerHandle } from "@capacitor/core";
import PendingReview from "./pages/PendingReview";



function HomeWrapper() {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLogoLoaderMotion />;
  if (user) return <Navigate to="/dashboard" replace />;
  if (isNativeAndroidApp()) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}

function LoginWrapper() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <FullscreenLogoLoaderMotion />;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <MainLayout>
      <AuthCard onAuthSuccess={() => navigate("/dashboard", { replace: true })} />
    </MainLayout>
  );
}

async function setupStatusBar(theme: "light" | "dark") {
  if (!isNativeAndroidApp()) return;

  await StatusBar.setOverlaysWebView({ overlay: true });
  await StatusBar.setBackgroundColor({ color: '#00000000' }); // transparent
  await StatusBar.setStyle({
    style: theme === "dark" ? Style.Dark : Style.Light,
  });
}

function normalizeColor(value: string) {
  const color = value.trim();
  return color || "#0B0F1A";
}

function toHexByte(value: string) {
  return Math.max(0, Math.min(255, Number.parseInt(value, 10)))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function rgbToHex(color: string) {
  const match = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!match) return null;

  return `#${toHexByte(match[1])}${toHexByte(match[2])}${toHexByte(match[3])}`;
}

function expandHexColor(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, red, green, blue] = color;
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  return null;
}

function resolveCssColorToHex(value: string) {
  const normalized = normalizeColor(value);
  const directHex = expandHexColor(normalized);
  if (directHex) return directHex;

  const directRgb = rgbToHex(normalized);
  if (directRgb) return directRgb;

  const probe = document.createElement("div");
  probe.style.display = "none";
  probe.style.backgroundColor = normalized;
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe).backgroundColor;
  probe.remove();

  return rgbToHex(computed) ?? "#0B0F1A";
}

function isLightColor(color: string) {
  const hex = color.replace("#", "");
  const normalized = hex.length === 3
    ? hex.split("").map((part) => part + part).join("")
    : hex.slice(0, 6);

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.72;
}

function resolveNativeChromeColor(pathname: string) {
  const css = getComputedStyle(document.documentElement);
  const background = resolveCssColorToHex(css.getPropertyValue("--color-background"));
  const surface = resolveCssColorToHex(css.getPropertyValue("--color-surface"));
  const elevated = resolveCssColorToHex(css.getPropertyValue("--color-surface-elevated"));

  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/oauth-finish")) {
    return surface;
  }

  if (pathname === "/dashboard") {
    return elevated;
  }

  return background;
}

function NativeChromeSync() {
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (!isNativeAndroidApp()) return;

    const color = resolveNativeChromeColor(location.pathname);
    const iconStyle = isLightColor(color) ? "dark" : "light";

    void setupStatusBar(iconStyle === "light" ? "dark" : "light");
    void NativeChrome.setBackgroundColor({ color }).catch((error) => {
      console.error("Failed to sync native background", error);
    });
    void NativeChrome.setSystemBarIcons({ style: iconStyle }).catch((error) => {
      console.error("Failed to sync system bar icon style", error);
    });
  }, [location.pathname, theme]);

  return null;
}

function scrollElementIntoView(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;

  const header = document.querySelector("header");
  const headerH = header ? (header as HTMLElement).offsetHeight : 72;
  const top = element.getBoundingClientRect().top + window.scrollY - (headerH + 8);

  window.scrollTo({ top, left: 0, behavior: "smooth" });
  return true;
}

function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    const restoreScroll = () => {
      const hashId = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
      if (hashId && scrollElementIntoView(hashId)) {
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      document
        .querySelectorAll<HTMLElement>("[data-route-scroll-container]")
        .forEach((element) => {
          element.scrollTo({ top: 0, left: 0, behavior: "auto" });
          element.scrollTop = 0;
        });
    };

    const frameId = window.requestAnimationFrame(restoreScroll);
    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLogoLoaderMotion />;
  return user ? <>{children}</> : <Navigate to={isNativeAndroidApp() ? "/login" : "/"} replace />;
}


function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setupStatusBar(theme);
  }, [theme]);

  // MESSAGES WORK

  useEffect(() => {
    if (!isNativeAndroidApp()) return;
    initDB();
  }, []);
  useEffect(() => {
    if (!isNativeAndroidApp()) return;
    let listener: PluginListenerHandle | null = null;
    const setupListener = async () => {
      listener = await SmsListener.addListener("smsReceived", async (sms) => {
        console.log("SMS RECEIVED:", sms);

        const parsed = parseSMS(sms.message);

        console.log("PARSED:", parsed);

        await insertPendingSMS({
          raw_message: sms.message,
          sender: sms.sender,
          amount: parsed.amount,
          type: parsed.type,
          merchant: parsed.merchant ?? '',
          confidence: parsed.confidence,
          timestamp: Date.now()

        });
      });
    };

    setupListener();

    return () => {
      // 🔥 cleanup to prevent duplicate listeners
      listener?.remove();
    };
  }, []);


  useEffect(() => {
    if (!isNativeAndroidApp()) return;
    const sync = async () => {
      try {
        const res = await SmsListener.getStoredSms();
        const list = JSON.parse(res.data || "[]");

        console.log("SYNC LIST:", list);

        for (const sms of list) {
          const parsed = parseSMS(sms.message);

          console.log("SYNC PARSED:", parsed);

          await insertPendingSMS({
            raw_message: sms.message,
            sender: sms.sender,
            amount: parsed.amount,
            type: parsed.type,
            merchant: parsed.merchant ?? "",
            confidence: parsed.confidence,
            timestamp: Date.now()

          });
        }

        // ✅ clear native storage after sync
        if (list.length > 0) {
          await SmsListener.clearStoredSms();
        }

      } catch (err) {
        console.error("SMS sync failed", err);
      }
    };

    sync();
  }, []);


  useEffect(() => {
    if (!isNativeAndroidApp()) return;
    const handleNotificationOpen = async () => {
      try {
        const res = await SmsListener.getLastClickedSms();

        if (res?.message) {
          console.log("🔔 Opened from notification:", res);

          // 🔥 TEMP: navigate to transactions page
          // later we’ll go to a dedicated review screen
          window.location.href = "/transactions";

          // 👉 OPTIONAL (future)
          // you can store this in global state / context
          // so Transactions page highlights it
        }

      } catch (err) {
        console.error("Failed to get last clicked SMS", err);
      }
    };

    handleNotificationOpen();
  }, []);

  return (
    <Router>
      <NativeChromeSync />
      <ScrollRestoration />
      <AndroidBackHandler />
      <Routes>

        {/* Marketing Pages */}
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />

        <Route
          path="/terms"
          element={
            <MainLayout>
              <TermsOfService />
            </MainLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          }
        />

        {/* OAuth callback */}
        <Route path="/oauth-finish" element={<OAuthFinish />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {isNativeAndroidApp() && (
          <Route
            path="/pending-review"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PendingReview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        )}
        <Route
            path="/pending-review"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PendingReview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        {/* Transactions */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/transactions/:account_id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Wallets */}
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Accounts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Budgets */}
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Budgets />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* More */}
        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MorePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isNativeAndroidApp() ? "/login" : "/"} replace />}
        />

      </Routes>

      <Analytics />
    </Router>
  );
}

export default App;
