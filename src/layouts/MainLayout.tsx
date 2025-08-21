// src/layouts/MainLayout.tsx
import React from "react";
import Header from "./Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">{children}</main>
    </div>
  );
};

export default MainLayout;
