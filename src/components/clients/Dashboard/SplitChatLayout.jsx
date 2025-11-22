"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import ChatInterface from "@/components/common/ChatInterface";
import { useState, useCallback, Suspense } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function SplitChatLayout({ children, rightContent }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const router = useRouter();

  // Detect if we're in creator or client context
  const isCreator = router.pathname.startsWith("/creator");
  const baseRoute = isCreator ? "/creator" : "/dashboard";

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // Chat state management is now handled by useChatState hook in ChatInterface

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen text-white relative bg-muted-background">
        {/* Content */}
        <div className="relative z-10 flex h-screen">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            forceFixed={true}
          />
          <div className="flex-1 flex flex-col md:ml-0">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="flex-1 flex overflow-hidden">
              {/* Chat Interface - Left Side (40%) */}
              <div className="hidden lg:flex lg:w-[40%] xl:w-[30%] 2xl:w-[25%] border-r border-border lg:ml-16">
                <ChatInterface
                  variant="split"
                  showWelcomeMessage={true}
                  showFeatureCards={false}
                  baseRoute={baseRoute}
                />
              </div>

              {/* Main Content Area - Right Side (60%) */}
              <div className="w-full lg:w-[60%] xl:w-[70%] 2xl:w-[75%] overflow-y-auto my-6 px-12 lg:px-28">
                <main className="flex-1 h-full">
                  {rightContent || children}
                </main>
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

        {/* Mobile Chat Drawer */}
        {isChatOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={toggleChat}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
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
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatInterface
                  variant="mobile"
                  showWelcomeMessage={true}
                  showFeatureCards={false}
                  baseRoute={baseRoute}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
