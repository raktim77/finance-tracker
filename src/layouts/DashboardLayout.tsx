import { useContext } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";
import { ThemeContext } from "../context/ThemeContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarLayout, toggleSidebarLayout } = useContext(ThemeContext);
  const collapsed = sidebarLayout === "icons";

  return (
    <div className="flex h-screen bg-[var(--color-background)]">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Right Side */}
      <div className="flex flex-col flex-1">

        {/* Topbar */}
        <Topbar toggleSidebar={toggleSidebarLayout} />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto md:p-6">
          {children}
        </main>

        {/* Bottom navbar for mobile */}
        <BottomNav />

      </div>

    </div>
  );
};

export default DashboardLayout;
