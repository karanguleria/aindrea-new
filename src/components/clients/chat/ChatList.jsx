import { useMemo, useCallback, memo } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, Trash2, Edit3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat } from "@/contexts/chatContext";
import { isChatPage } from "@/utils/chat/urlHelpers";

export const ChatList = memo(function ChatList({
  isOpen,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
}) {
  const router = useRouter();
  const { chats, currentChatId, loading } = useChat();

  // Check if we're on the chat page
  const isOnChatPage = isChatPage(router.pathname);

  // Memoize handlers to prevent re-renders
  const handleChatClick = useCallback(
    async (chatId) => {
      onChatSelect(chatId);
    },
    [onChatSelect]
  );

  const handleDeleteChat = useCallback(
    (chatId, e) => {
      e.stopPropagation();
      onDeleteChat(chatId);
    },
    [onDeleteChat]
  );

  const handleRenameChat = useCallback(
    (chatId, e) => {
      e.stopPropagation();
      onRenameChat(chatId);
    },
    [onRenameChat]
  );

  // Filter out empty chats (chats without messages) - memoized to prevent re-renders
  // Support both old format (messages array) and new format (messageCount)
  const chatsWithMessages = useMemo(() => {
    return chats.filter((chat) => {
      // New optimized format
      if (chat.messageCount !== undefined) {
        return chat.messageCount > 0;
      }
      // Old format (backward compatibility)
      if (chat.messages) {
        return chat.messages.length > 0;
      }
      // Default: show the chat
      return true;
    });
  }, [chats]);

  if (!isOpen) {
    return (
      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-lg h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : (
          chatsWithMessages.slice(0, 5).map((chat) => {
            const isActive = isOnChatPage && currentChatId === chat._id;
            return (
              <Tooltip key={chat._id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    className={`w-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:text-primary"
                    }`}
                    onClick={() => handleChatClick(chat._id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {chat.title}
                </TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {/* Chat List */}
        <div className="space-y-1 max-h-96 overflow-y-auto thin-scrollbar">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading chats...</span>
              </div>
            </div>
          ) : chatsWithMessages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No chats yet
            </div>
          ) : (
            chatsWithMessages.map((chat) => {
              const isActive = isOnChatPage && currentChatId === chat._id;
              return (
                <div
                  key={chat._id}
                  className={`group relative rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent/50 text-accent-foreground border border-accent-foreground/20"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <div className="flex items-center gap-3 px-3 py-1">
                    <MessageSquare
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-sidebar-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isActive
                            ? "text-accent-foreground"
                            : "text-sidebar-foreground"
                        }`}
                      >
                        {chat.title}
                      </div>
                      {/* <div
                      className={`text-xs flex items-center gap-1 ${
                        currentChatId === chat._id
                          ? "text-accent-foreground/70"
                          : "text-sidebar-foreground/70"
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(chat.updatedAt), {
                        addSuffix: true,
                      })}
                    </div> */}
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
                      <DropdownMenuContent
                        align="end"
                        className="divide-y divide-border border border-border shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={(e) => handleRenameChat(chat._id, e)}
                          className="rounded-none"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
});
