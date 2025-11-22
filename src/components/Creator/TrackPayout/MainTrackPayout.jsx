"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import { useState, useCallback } from "react";
import MainContent from "./MainContent";

export default function MainTrackPayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="h-screen text-white relative">
      <div className="relative z-10 flex h-full">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col md:ml-0">
          <Header onToggleSidebar={toggleSidebar} />
          <MainContent />
        </div>
      </div>
    </div>
  );
}
