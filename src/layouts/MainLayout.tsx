// src/layouts/MainLayout.tsx
import React from "react";
import Header from "./Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        data-route-scroll-container
        className="flex-1 overflow-auto"
        style={{ paddingTop: "calc(var(--header-h) + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)))" }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
