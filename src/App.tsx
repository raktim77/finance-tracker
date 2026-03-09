import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import Wallets from "./pages/Wallets";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/Analytics";

function HomeWrapper() {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLogoLoaderMotion />;
  if (user) return <Navigate to="/dashboard" replace />;

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLogoLoaderMotion />;
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
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
        {/* Wallets */}
        <Route
          path="/wallets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Wallets />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <Analytics />
    </Router>
  );
}

export default App;