import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--color-background)]">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Right Side */}
      <div className="flex flex-col flex-1">

        {/* Topbar */}
        <Topbar toggleSidebar={() => setCollapsed(!collapsed)} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* Bottom navbar for mobile */}
        <BottomNav />

      </div>

    </div>
  );
};

export default DashboardLayout;