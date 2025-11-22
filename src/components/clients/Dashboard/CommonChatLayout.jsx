"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import ChatSection from "@/components/modules/client/ChatSection";
import { useState, useCallback, Suspense } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommonChatLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen text-white relative">
        {/* Content */}
        <div className="relative z-10 flex h-screen bg-background">
          <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
          <div className="flex-1 flex flex-col md:ml-0">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="flex-1 flex overflow-hidden">
              {/* Desktop Chat Section - Hidden on mobile */}
              <div className="hidden lg:block lg:w-[25%]">
                <ChatSection />
              </div>

              {/* Main Content Area */}
              <div className="w-full lg:w-[75%] p-6 overflow-y-auto min-h-[90dvh] px-8 lg:px-6">
                <main className="flex-1 overflow-y-auto">{children}</main>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Chat Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            size="icon"
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>

        {isChatOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={toggleChat}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Chat</h3>
                <Button
                  onClick={toggleChat}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatSection />
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
