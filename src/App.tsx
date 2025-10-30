import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { Analytics } from "@vercel/analytics/react";
// import LoginPage from "./pages/auth/LoginPage";
import AuthCard from "./pages/auth/AuthCard";
import { useAuth } from "./lib/context/useAuth";
import Dashboard from "./pages/Dashboard";
import FullscreenLogoLoaderMotion from "./components/loader/FullscreenLogoLoaderMotion";


function HomeWrapper() {
  const { user, loading } = useAuth();
  // synchronously redirect if we already have a user
  if (loading) return <FullscreenLogoLoaderMotion />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Home />;
}

function LoginWrapper() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // synchronously redirect if we already have a user
  if (loading) return <FullscreenLogoLoaderMotion />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <AuthCard onAuthSuccess={() => navigate("/dashboard", { replace: true })} />;


  // If user logs in inside AuthCard, navigate to dashboard

}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLogoLoaderMotion />;
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          {/* Expose login explicitly at /login */}
          <Route path="/login" element={<LoginWrapper />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
      <Analytics />
    </Router>
  );
}

export default App;
