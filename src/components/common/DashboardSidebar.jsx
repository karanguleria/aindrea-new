"use client";
import React, { useMemo, useCallback, useRef } from "react";
import {
  Menu,
  Search,
  User,
  LogOut,
  MessageSquare,
  Edit,
  FolderOpen,
  Briefcase,
  PackagePlus,
  FileText,
  Image as ImageIcon,
  Palette,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Receipt,
  Wallet,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useAuth } from "@/contexts/userContext";
import { useChat } from "@/contexts/chatContext";
import { useProfileModal } from "@/contexts/profileModalContext";
import { useRouter } from "next/router";
import { ChatList } from "@/components/clients/chat/ChatList";
import { DeleteChatModal } from "@/components/clients/chat/DeleteChatModal";
import { RenameChatModal } from "@/components/clients/chat/RenameChatModal";
import { SearchModal } from "@/components/clients/chat/SearchModal";

export function Sidebar({
  isOpen,
  onToggle,
  isTransparent = false,
  forceFixed = false,
}) {
  const { isDark } = useThemeUtils();
  const { logout } = useAuth();
  const { openProfileModal } = useProfileModal();
  const router = useRouter();
  const {
    chats,
    chatsLoaded,
    loadChats,
    currentChatId,
    setCurrentChatId,
    deleteChat,
    updateChatTitle,
    clearCurrentChat,
    clearAllChatData,
  } = useChat();

  // Detect OS for keyboard shortcuts
  const [isMac, setIsMac] = React.useState(false);
  React.useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  // Detect if we're in creator or client context based on route
  const isCreator = router.pathname.startsWith("/creator");
  const basePath = isCreator ? "/creator" : "/dashboard";

  // Quick Links configuration based on role - memoized to prevent re-renders
  const quickLinks = useMemo(() => {
    if (isCreator) {
      return [
        {
          label: "My Assets",
          icon: FolderOpen,
          path: `${basePath}/my-assets`,
        },
        {
          label: "Library",
          icon: Heart,
          path: `${basePath}/library`,
        },
        {
          label: "My Projects",
          icon: Briefcase,
          path: `${basePath}/my-projects`,
        },
        {
          label: "Briefs",
          icon: Briefcase,
          path: `${basePath}/briefs`,
        },
        {
          label: "Bidding History",
          icon: FileText,
          path: `${basePath}/bidding-history`,
        },
        {
          label: "Conversations",
          icon: MessageSquare,
          path: `${basePath}/conversations`,
        },
        {
          label: "Submit Deliverable",
          icon: PackagePlus,
          path: `${basePath}/submit-deliverable`,
        },
        {
          label: "Image Canvas",
          icon: Palette,
          path: `${basePath}/image-selection-canvas`,
        },
        {
          label: "Invoice History",
          icon: Receipt,
          path: `${basePath}/invoice-history`,
        },
        {
          label: "Wallet History",
          icon: Wallet,
          path: `${basePath}/wallet-history`,
        },
        {
          label: "Complaints",
          icon: MessageSquare,
          path: `${basePath}/complaints`,
        },
      ];
    } else {
      // Client quick links
      return [
        {
          label: "My Assets",
          icon: FolderOpen,
          path: `${basePath}/my-assets`,
        },
        {
          label: "Library",
          icon: Heart,
          path: `${basePath}/library`,
        },
        {
          label: "Create Brief",
          icon: FileText,
          path: `${basePath}/create-new-brief`,
        },
        {
          label: "Briefs",
          icon: Briefcase,
          path: `${basePath}/briefs`,
        },
        {
          label: "Conversations",
          icon: MessageSquare,
          path: `${basePath}/conversations`,
        },
        {
          label: "Image Canvas",
          icon: Palette,
          path: `${basePath}/image-selection-canvas`,
        },
        {
          label: "Invoice History",
          icon: Receipt,
          path: `${basePath}/invoice-history`,
        },
        {
          label: "Wallet History",
          icon: Wallet,
          path: `${basePath}/wallet-history`,
        },
        {
          label: "Complaints",
          icon: MessageSquare,
          path: `${basePath}/complaints`,
        },
      ];
    }
  }, [isCreator, basePath]);

  // Modal state management
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);

  // Section collapse state
  const [isQuickLinksOpen, setIsQuickLinksOpen] = React.useState(true);
  const [isChatsOpen, setIsChatsOpen] = React.useState(true);

  const handleLogout = useCallback(async () => {
    await logout();
    clearAllChatData();
  }, [logout, clearAllChatData]);

  const handleNewChat = useCallback(() => {
    clearCurrentChat();
  }, [clearCurrentChat]);

  const handleChatSelect = useCallback(
    (chatId) => {
      if (chatId !== currentChatId) {
        setCurrentChatId(chatId);
      }
      router.push(`${basePath}/chat?chatId=${chatId}`, undefined, {
        shallow: true,
      });
    },
    [currentChatId, setCurrentChatId, router, basePath]
  );

  // Modal handlers - memoized to prevent re-renders
  const handleDeleteChat = useCallback(
    (chatId) => {
      const chat = chats.find((c) => c._id === chatId);
      setSelectedChat(chat);
      setDeleteModalOpen(true);
    },
    [chats]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setIsDeleting(true);
      await deleteChat(selectedChat._id);
      setDeleteModalOpen(false);
      setSelectedChat(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedChat, deleteChat]);

  const handleRenameChat = useCallback(
    (chatId) => {
      const chat = chats.find((c) => c._id === chatId);
      setSelectedChat(chat);
      setRenameModalOpen(true);
    },
    [chats]
  );

  const handleConfirmRename = useCallback(
    async (newTitle) => {
      if (!selectedChat) return;

      try {
        setIsRenaming(true);
        await updateChatTitle(selectedChat._id, newTitle);
        setRenameModalOpen(false);
        setSelectedChat(null);
      } catch (error) {
        console.error("Error updating chat title:", error);
      } finally {
        setIsRenaming(false);
      }
    },
    [selectedChat, updateChatTitle]
  );

  // Load chats on component mount regardless of sidebar state
  React.useEffect(() => {
    if (!chatsLoaded) {
      loadChats();
    }
  }, [loadChats, chatsLoaded]);

  // Clear chat selection when navigating to dashboard (but not if chatId is in URL)
  React.useEffect(() => {
    // Only clear chat when specifically navigating to the dashboard page (not chat page)
    // AND there's no chatId in the URL query
    const hasChatIdInUrl = router.query.chatId || router.query.id;
    if (
      router.pathname === `${basePath}/dashboard` &&
      currentChatId &&
      !hasChatIdInUrl
    ) {
      setCurrentChatId(null);
    }
  }, [
    router.pathname,
    router.query.chatId,
    router.query.id,
    currentChatId,
    setCurrentChatId,
    basePath,
  ]);

  // Removed page navigation loading state - no loading overlay on route changes

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      // Ctrl+Shift+O or Cmd+Shift+O for new chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "O") {
        e.preventDefault();
        handleNewChat();
        router.push(`${basePath}/chat`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, basePath, handleNewChat]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 bg-background/50 z-40 ${
            !forceFixed ? "lg:hidden" : ""
          }`}
          onClick={onToggle}
        />
      )}

      <TooltipProvider>
        <div
          className={`
            ${isOpen ? "w-64" : "w-16"} 
            ${
              forceFixed ? "fixed" : "lg:z-auto lg:relative"
            } left-0 top-0 bottom-0 z-50 min-h-screen bg-background border-r border-sidebar-border 
            flex flex-col overflow-y-auto custom-scrollbar transition-all duration-300
            ${
              isOpen
                ? "w-64 translate-x-0"
                : "w-16 -translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* Top Section with Logo and Menu */}
          <div
            className={`flex items-center justify-between p-3 ${
              isOpen ? "lg:mt-0.75" : "lg:mt-2"
            } border-b border-sidebar-border`}
          >
            <Link
              href={`${basePath}${isCreator ? "/dashboard" : ""}`}
              className={`flex items-center ${!isOpen ? "hidden" : ""}`}
            >
              <Image
                src={
                  isDark ? "/images/logo-light.png" : "/images/logo-dark.png"
                }
                alt="Background"
                width={"50"}
                height={"50"}
              />
            </Link>
            {!isOpen ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Open sidebar"
                    aria-expanded={isOpen}
                    variant="ghost"
                    size="icon"
                    className="text-sidebar-foreground hover:text-foreground hover:bg-accent/50 active:text-secondary-foreground transition-colors"
                    onClick={onToggle}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {"Open sidebar"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                aria-label="Close sidebar"
                aria-expanded={isOpen}
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:text-foreground hover:bg-accent/50 active:text-secondary-foreground transition-colors"
                onClick={onToggle}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation Section */}
          <div className="flex-1 p-4 space-y-1">
            {/* New Chat */}
            <Link href={`${basePath}/chat`} onClick={handleNewChat}>
              <div
                className={`group flex items-center gap-3 ${
                  !isOpen
                    ? "justify-center"
                    : `hover:text-foreground hover:bg-accent/50 rounded-lg px-3 py-2 ${
                        router.pathname === `${basePath}/chat` &&
                        !router.query.chatId &&
                        !router.query.id
                          ? "bg-accent text-foreground"
                          : ""
                      }`
                } transition-colors cursor-pointer ${
                  router.pathname === `${basePath}/chat` &&
                  !router.query.chatId &&
                  !router.query.id &&
                  !isOpen
                    ? "bg-accent/50"
                    : ""
                }`}
              >
                {!isOpen ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="transparent"
                        size="icon"
                        className="text-sidebar-foreground"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      New chat
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-sm text-sidebar-foreground">
                      New chat
                    </span>
                    <div
                      className={`flex items-center text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isMac ? "gap-0" : "gap-1"
                      }`}
                    >
                      <kbd
                        className={`${
                          isMac ? "ps-1.25 pr-1.5 pt-1.5 pb-1" : ""
                        } text-[${isMac ? "10px" : "12px"}] font-semibold`}
                      >
                        {isMac ? "⌘" : "Ctrl"}
                      </kbd>
                      <span className={`text-[${isMac ? "14px" : "12px"}]`}>
                        +
                      </span>
                      <kbd
                        className={`${
                          isMac ? "px-1.5 py-0.5" : ""
                        } text-sm font-semibold`}
                      >
                        ⇧
                      </kbd>
                      <span className={`text-[${isMac ? "14px" : "12px"}]`}>
                        +
                      </span>
                      <kbd
                        className={`${
                          isMac ? "px-1.5 py-0.5" : ""
                        } text-sm font-semibold`}
                      >
                        O
                      </kbd>
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Search Chats */}
            <div
              className={`group flex items-center gap-3 ${
                !isOpen
                  ? "justify-center"
                  : "hover:text-foreground hover:bg-accent/50 rounded-lg px-3 py-2"
              } transition-colors cursor-pointer`}
              onClick={() => setSearchModalOpen(true)}
            >
              {!isOpen ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="transparent"
                      size="icon"
                      className="text-sidebar-foreground"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Search chats
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center justify-between flex-1">
                  <span className="text-sm text-sidebar-foreground">
                    Search chats
                  </span>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="ps-1.25 pr-1.5 pt-1.5 pb-1 text-[11px] font-semibold">
                      {isMac ? "⌘" : "Ctrl"}
                    </kbd>
                    <span className="text-[10px]">+</span>
                    <kbd className="px-1.5 py-0.5 text-sm font-semibold">K</kbd>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links Section */}
            {quickLinks.length > 0 && (
              <>
                <div>
                  <hr
                    className={`my-2 border-border ${
                      isOpen ? "hidden" : "block"
                    }`}
                  />
                  {isOpen && (
                    <div
                      className="flex items-center justify-between my-2 cursor-pointer hover:bg-accent/50 rounded-lg px-3 py-2 transition-colors"
                      onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
                    >
                      <h3 className="text-sidebar-foreground text-sm font-medium">
                        Quick Links
                      </h3>
                      {isQuickLinksOpen ? (
                        <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                      )}
                    </div>
                  )}
                </div>

                {(!isOpen || isQuickLinksOpen) &&
                  quickLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive =
                      router.pathname === link.path ||
                      (link.path !== `${basePath}/chat` &&
                        router.pathname.startsWith(link.path));
                    return (
                      <Link key={link.path} href={link.path}>
                        <div
                          className={`flex items-center gap-3 ${
                            !isOpen
                              ? "justify-center"
                              : `hover:text-foreground hover:bg-accent/50 rounded-lg px-3 py-2 ${
                                  isActive ? "bg-accent text-foreground" : ""
                                }`
                          } transition-colors cursor-pointer ${
                            isActive && !isOpen ? "bg-accent/50" : ""
                          }`}
                        >
                          {!isOpen ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="transparent"
                                  size="icon"
                                  className={`text-sidebar-foreground ${
                                    isActive ? "text-foreground" : ""
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" sideOffset={8}>
                                {link.label}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span
                              className={`text-sm ${
                                isActive
                                  ? "text-foreground font-medium"
                                  : "text-sidebar-foreground"
                              }`}
                            >
                              {link.label}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
              </>
            )}

            {/* Chats Section - Only show when sidebar is open */}
            {isOpen && (
              <div>
                <hr
                  className={`my-2 border-border ${
                    isOpen ? "hidden" : "block"
                  }`}
                />
                <div
                  className="flex items-center justify-between my-2 cursor-pointer hover:bg-accent/50 rounded-lg px-3 py-2 transition-colors"
                  onClick={() => setIsChatsOpen(!isChatsOpen)}
                >
                  <h3 className="text-sidebar-foreground text-sm font-medium">
                    Chats
                  </h3>
                  {isChatsOpen ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  )}
                </div>
                {isChatsOpen && (
                  <ChatList
                    isOpen={isOpen}
                    onChatSelect={handleChatSelect}
                    onDeleteChat={handleDeleteChat}
                    onRenameChat={handleRenameChat}
                  />
                )}
              </div>
            )}
          </div>

          {/* Bottom Section with Separator */}
          <div className="p-4 border-t border-sidebar-border">
            {/* Profile */}
            <div
              className={`flex items-center gap-3 mb-1 ${
                !isOpen
                  ? "justify-center"
                  : "hover:text-foreground hover:bg-accent/50 rounded-lg px-3 py-2"
              }`}
            >
              {!isOpen ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="transparent"
                      size="icon"
                      className="text-sidebar-foreground"
                      onClick={openProfileModal}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Profile
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span
                  className="text-sm text-sidebar-foreground"
                  onClick={openProfileModal}
                >
                  Profile
                </span>
              )}
            </div>

            {/* Log Out */}
            <div
              className={`flex items-center gap-3 ${
                !isOpen
                  ? "justify-center"
                  : "hover:text-foreground hover:bg-accent/50 rounded-lg px-3 py-2"
              }`}
            >
              {!isOpen ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="transparent"
                      size="icon"
                      onClick={handleLogout}
                      className="text-sidebar-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Log out
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span
                  className="text-sm text-sidebar-foreground"
                  onClick={handleLogout}
                >
                  Log out
                </span>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Modals - rendered at root level */}
      <DeleteChatModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedChat(null);
        }}
        onConfirm={handleConfirmDelete}
        chatTitle={selectedChat?.title.toLowerCase() || ""}
        isLoading={isDeleting}
      />

      <RenameChatModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setSelectedChat(null);
        }}
        onConfirm={handleConfirmRename}
        currentTitle={selectedChat?.title || ""}
        isLoading={isRenaming}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />
    </>
  );
}
