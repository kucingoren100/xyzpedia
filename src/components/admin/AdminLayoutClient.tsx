"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

interface AdminSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  isCollapsed: false,
  toggleCollapse: () => {},
});

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("xyzpedia_admin_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch (e) {
      // Ignore in private browsing
    }
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("xyzpedia_admin_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Don't render sidebar or margins on login page
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminSidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        openSidebar,
        closeSidebar,
        isCollapsed,
        toggleCollapse,
      }}
    >
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0e0e12] text-carbon dark:text-white transition-colors">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          {children}
        </div>
      </div>
    </AdminSidebarContext.Provider>
  );
}
