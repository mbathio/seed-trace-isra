// frontend/src/layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar";
import AppSidebar from "../components/layout/AppSidebar";
import Header from "../components/layout/Header";

const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
