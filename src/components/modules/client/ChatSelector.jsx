import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MessageCircle,
  Check,
  Calendar,
  X,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * ChatSelector Component
 * 
 * Allows users to select a chat conversation to link to a brief during brief creation.
 * Displays a list of user's chats with search functionality.
 * 
 * @param {Object} props - Component props
 * @param {string|null} props.selectedChatId - Currently selected chat ID
 * @param {Function} props.onSelectChat - Callback when a chat is selected (receives chatId)
 * @param {Function} props.onClearSelection - Callback to clear the selected chat
 * @param {boolean} props.disabled - Whether the selector is disabled
 * @returns {JSX.Element} Chat selector component
 */
export default function ChatSelector({
  selectedChatId,
  onSelectChat,
  onClearSelection,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch user chats
  useEffect(() => {
    if (open) {
      fetchChats();
    }
  }, [open, debouncedSearch]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserChats(1, 50, debouncedSearch);
      if (response.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chatId) => {
    if (selectedChatId === chatId) {
      // Deselect if already selected
      onClearSelection();
    } else {
      onSelectChat(chatId);
      setOpen(false);
      toast.success("Chat selected");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return "No messages";
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content?.substring(0, 100) || "No content";
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {selectedChatId ? "Change Chat" : "Select Chat"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Select Chat to Link</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </DialogHeader>
          <hr className="border-border mb-5" />
          <div className="space-y-4 px-4 overflow-y-auto max-h-[calc(80vh-10rem)] mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading chats...</p>
              </div>
            )}

            {/* Chats List */}
            {!loading && chats.length > 0 && (
              <div className="space-y-2">
                {chats.map((chat) => {
                  const isSelected = selectedChatId === chat._id;
                  return (
                    <Card
                      key={chat._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-background"
                      }`}
                      onClick={() => handleSelectChat(chat._id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <h4 className="font-semibold text-foreground truncate">
                                {chat.title}
                              </h4>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {getPreviewText(chat.messages || (chat.lastMessage ? [chat.lastMessage] : []))}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(chat.updatedAt || chat.createdAt)}
                              </div>
                              <span>{chat.messageCount || chat.messages?.length || 0} messages</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && chats.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Chats Found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "You don't have any chats yet. Create a chat to link it to this brief."}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

