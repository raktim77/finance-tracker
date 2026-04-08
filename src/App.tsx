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
import { isNativeAndroidApp } from "./lib/capacitor/platform";
import AndroidBackHandler from "./components/app-back/AndroidBackHandler";
import { ThemeContext } from "./context/ThemeContext";
import { NativeChrome } from "./lib/capacitor/nativeChrome";
window.addEventListener("unhandledrejection", (event) => {
  console.error("UNHANDLED PROMISE:", event.reason);
});
import { StatusBar, Style } from '@capacitor/status-bar';
import { useContext, useEffect } from "react";



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
  return value.trim() || "#0B0F1A";
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
  const background = normalizeColor(css.getPropertyValue("--color-background"));
  const surface = normalizeColor(css.getPropertyValue("--color-surface"));
  const elevated = normalizeColor(css.getPropertyValue("--color-surface-elevated"));

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

  return (
    <Router>
      <NativeChromeSync />
      <AndroidBackHandler />
      <Routes>

        {/* Marketing Pages */}
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />

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
