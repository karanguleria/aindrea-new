"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import { useState, useCallback, Suspense, useEffect } from "react";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useChat } from "@/contexts/chatContext";
import { useRouter } from "next/router";

export default function CommonCreatorLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useThemeUtils();
  const { setCurrentChatId, currentChatId } = useChat();
  const router = useRouter();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Clear chat when on main dashboard page
  useEffect(() => {
    const isDashboardRoute = router.pathname === "/creator/dashboard";
    if (isDashboardRoute && currentChatId) {
      setCurrentChatId(null);
    }
  }, [router.pathname, currentChatId, setCurrentChatId]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen text-white relative bg-muted-background">
        <div className="relative z-10 flex h-screen">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            isTransparent={isDark}
          />
          <div className="flex-1 flex flex-col md:ml-0">
            <Header
              onToggleSidebar={toggleSidebar}
              isTransparent={isDark}
            />
            <main className="flex-1 overflow-y-auto my-6 px-12 lg:px-28">{children}</main>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
