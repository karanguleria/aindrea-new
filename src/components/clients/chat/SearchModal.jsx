import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  MessageSquare,
  Calendar,
  MoreVertical,
  Trash2,
  Edit3,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BaseModal } from "@/components/ui/base-modal";
import { useChat } from "@/contexts/chatContext";
import { useRouter } from "next/router";
import {
  formatDistanceToNow,
  isThisWeek,
  isThisMonth,
  subMonths,
} from "date-fns";

export function SearchModal({
  isOpen,
  onClose,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
}) {
  const { chats, currentChatId, loading, searchChats } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Detect OS for keyboard shortcuts
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchChats(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChatClick = async (chatId) => {
    onChatSelect(chatId);
    router.push(`/dashboard/chat?id=${chatId}`);
    onClose();
  };

  const handleNewChat = () => {
    router.push(`/dashboard/chat`);
    onClose();
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  const handleRenameChat = (chatId, e) => {
    e.stopPropagation();
    onRenameChat(chatId);
  };

  // Filter out empty chats (chats without messages)
  const chatsWithMessages = chats.filter(
    (chat) => chat.messages && chat.messages.length > 0
  );

  // Categorize chats by time period
  const categorizeChats = (chats) => {
    const today = new Date();
    const lastWeek = [];
    const lastMonth = [];
    const older = [];

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);

      if (isThisWeek(chatDate, { weekStartsOn: 0 })) {
        lastWeek.push(chat);
      } else if (isThisMonth(chatDate)) {
        lastMonth.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { lastWeek, lastMonth, older };
  };

  const displayChats = searchQuery ? searchResults : chatsWithMessages;
  const categorizedChats = !searchQuery ? categorizeChats(displayChats) : null;

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Keyboard shortcuts within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape or Ctrl+K to close modal
      if (e.key === "Escape" || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        onClose();
      }
      // Ctrl+Shift+O for new chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "O") {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const ChatItem = ({ chat }) => (
    <div
      key={chat._id}
      className={`group relative rounded-lg transition-colors cursor-pointer ${
        currentChatId === chat._id
          ? "bg-accent/50 text-accent-foreground border border-accent-foreground/10"
          : "hover:bg-accent/50"
      }`}
      onClick={() => handleChatClick(chat._id)}
    >
      <div className="flex items-center gap-3 py-2 px-3">
        <MessageSquare
          className={`h-4 w-4 flex-shrink-0 ${
            currentChatId === chat._id
              ? "text-accent-foreground"
              : "text-sidebar-foreground"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium truncate ${
              currentChatId === chat._id
                ? "text-accent-foreground"
                : "text-sidebar-foreground"
            }`}
          >
            {chat.title}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="end"
              className="border border-border shadow-lg flex flex-col"
              sideOffset={5}
              style={{ zIndex: 10000 }}
            >
              <DropdownMenuItem
                onClick={(e) => handleRenameChat(chat._id, e)}
                className="text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleDeleteChat(chat._id, e)}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chats"
      maxWidth="max-w-2xl"
      height="h-[600px]"
      fixedHeight={true}
    >
      <div className="flex flex-col space-y-3 h-full">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10 pr-10 text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setIsSearching(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className="group w-full flex items-center text-foreground justify-between gap-2 bg-accent/50 hover:bg-accent/60"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </div>
          <div
            className={`flex items-center text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isMac ? "gap-0" : "gap-1"
            }`}
          >
            <kbd
              className={`${isMac ? "ps-1.25 pr-1.5 pt-1.5 pb-1" : "-mb-0.5"} text-[${
                isMac ? "10px" : "12px"
              }] font-semibold`}
            >
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <span className={`text-[${isMac ? "14px" : "12px"}]`}>+</span>
            <kbd
              className={`${
                isMac ? "px-1.5 py-0.5" : ""
              } text-sm font-semibold`}
            >
              ⇧
            </kbd>
            <span className={`text-[${isMac ? "14px" : "12px"}]`}>+</span>
            <kbd
              className={`${
                isMac ? "px-1.5 py-0.5" : ""
              } text-sm font-semibold`}
            >
              O
            </kbd>
          </div>
        </Button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading chats...</span>
              </div>
            </div>
          ) : searchQuery ? (
            // Search Results
            displayChats.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                No chats found
              </div>
            ) : (
              <div className="space-y-1">
                {displayChats.map((chat) => (
                  <ChatItem key={chat._id} chat={chat} />
                ))}
              </div>
            )
          ) : (
            // Categorized Chats
            <>
              {categorizedChats.lastWeek.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2">
                    Last 7 Days
                  </h3>
                  {categorizedChats.lastWeek.map((chat) => (
                    <ChatItem key={chat._id} chat={chat} />
                  ))}
                </div>
              )}

              {categorizedChats.lastMonth.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2">
                    Last 30 Days
                  </h3>
                  {categorizedChats.lastMonth.map((chat) => (
                    <ChatItem key={chat._id} chat={chat} />
                  ))}
                </div>
              )}

              {categorizedChats.older.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2">
                    Older
                  </h3>
                  {categorizedChats.older.map((chat) => (
                    <ChatItem key={chat._id} chat={chat} />
                  ))}
                </div>
              )}

              {displayChats.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No chats yet
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
