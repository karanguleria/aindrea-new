"use client";

import { Header } from "@/components/common/DashboardHeader";
import { Sidebar } from "@/components/common/DashboardSidebar";
import ChatInterface from "@/components/common/ChatInterface";
import { useState, useCallback, Suspense, useEffect, useMemo } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function PersistentLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const router = useRouter();

  // Detect if we're in creator or client context
  const isCreator = router.pathname.startsWith("/creator");
  const baseRoute = isCreator ? "/creator" : "/dashboard";

  // Detect if we're on a chat page (full chat interface) or main dashboard pages
  const isChatPage =
    router.pathname === "/dashboard/chat" ||
    router.pathname === "/creator/chat";
  const isMainDashboardPage =
    router.pathname === "/dashboard" ||
    router.pathname === "/creator/dashboard";
  const shouldHideSideChat = isChatPage || isMainDashboardPage;

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Auto-close sidebar on route change (pathname or query changes)
  useEffect(() => {
    if (router.isReady) {
      setIsSidebarOpen(false);
    }
  }, [router.pathname, router.query, router.isReady]);

  // Also close sidebar on route change events for more reliability
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSidebarOpen(false);
    };

    if (router.events) {
      router.events.on("routeChangeStart", handleRouteChange);
      router.events.on("routeChangeComplete", handleRouteChange);
    }

    return () => {
      if (router.events) {
        router.events.off("routeChangeStart", handleRouteChange);
        router.events.off("routeChangeComplete", handleRouteChange);
      }
    };
  }, [router]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // Chat state management is now handled by useChatState hook in ChatInterface
  // PersistentLayout only handles layout concerns (sidebar, chat visibility)

  // Disabled loading overlay - using smooth transitions instead
  // No loading overlay on page changes for better UX

  return (
    <Suspense fallback={null}>
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
              {/* Chat Interface - Left Side (40%) - Hidden on chat pages and main dashboard */}
              {/* Always call useMemo, but conditionally render the result */}
              {useMemo(() => {
                if (shouldHideSideChat) return null;
                return (
                  <div className="hidden lg:flex lg:w-[40%] xl:w-[30%] 2xl:w-[25%] border-r border-border lg:ml-16">
                    <ChatInterface
                      variant="split"
                      showWelcomeMessage={true}
                      showFeatureCards={false}
                      baseRoute={baseRoute}
                    />
                  </div>
                );
              }, [shouldHideSideChat, baseRoute])}

              {/* Main Content Area - Full width on chat pages and main dashboard, otherwise split */}
              <div
                className={`${
                  shouldHideSideChat
                    ? "w-full"
                    : "w-full lg:w-[60%] xl:w-[70%] 2xl:w-[75%] px-12 lg:px-28"
                } overflow-y-auto my-6 relative`}
              >
                <main className="flex-1 h-full">{children}</main>
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
