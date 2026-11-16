"use client";

import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

interface AdminSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
});

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Don't render sidebar or margins on login page
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminSidebarContext.Provider
      value={{ sidebarOpen, setSidebarOpen, openSidebar, closeSidebar }}
    >
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0e0e12] text-carbon dark:text-white transition-colors">
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </AdminSidebarContext.Provider>
  );
}
