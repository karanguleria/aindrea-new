"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter } from "next/router";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useChat } from "@/contexts/chatContext";

export default function CommonDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { isDark } = useThemeUtils();
  const { setCurrentChatId, currentChatId } = useChat();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Check if we're on the dashboard route
  const isDashboardRoute =
    router.pathname === "/dashboard" ||
    router.pathname === "/creator/dashboard";

  // Clear chat when on main dashboard page
  useEffect(() => {
    if (isDashboardRoute && currentChatId) {
      setCurrentChatId(null);
    }
  }, [isDashboardRoute]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen text-white relative bg-muted-background">
        {/* Background Images with Fading Effect - only on dashboard route and dark mode */}
        {/* {isDashboardRoute && isDark && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 lg:left-[10%] lg:right-0 lg:top-[-20%] bg-[url('/images/dashboard-bg-2.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent lg:from-background lg:via-background/30 lg:to-transparent"></div>
            </div>
            <div className="absolute inset-0 bg-[url('/images/bgauth.webp')] bg-cover bg-center bottom-0 opacity-60"></div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at top left, transparent 0%, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%), radial-gradient(ellipse at top right, transparent 0%, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%), radial-gradient(ellipse at bottom left, transparent 0%, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%), radial-gradient(ellipse at bottom right, transparent 0%, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)",
              }}
            ></div>
          </div>
        )} */}

        {/* Content */}
        <div className="relative z-10 flex h-screen">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            isTransparent={isDashboardRoute && isDark}
          />
          <div className="flex-1 flex flex-col md:ml-0">
            <Header
              onToggleSidebar={toggleSidebar}
              isTransparent={isDashboardRoute && isDark}
            />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
