// src/layouts/MainLayout.tsx
import React from "react";
import Header from "./Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header stays on top */}
      <Header />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* (Optional) Footer later */}
    </div>
  );
};

export default MainLayout;
