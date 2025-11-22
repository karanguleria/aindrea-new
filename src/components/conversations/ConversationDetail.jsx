import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/contexts/socketContext";
import { useAuth } from "@/contexts/userContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Loader2, FileText, X } from "lucide-react";
import MessageItem from "./MessageItem";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";

const ConversationDetail = ({
  conversationId,
  conversation,
  otherParticipant,
}) => {
  const { socket, isConnected, isUserOnline } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load messages
  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!conversationId) return;

      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await apiService.getConversationMessages(
          conversationId,
          pageNum,
          20
        );

        if (response.success) {
          const fetchedMessages = response.data.messages || [];

          if (append) {
            // Save current scroll position
            const scrollElement = scrollAreaRef.current;
            const previousScrollHeight = scrollElement?.scrollHeight || 0;

            setMessages((prev) => [...fetchedMessages, ...prev]);

            // Restore scroll position after new messages are added
            setTimeout(() => {
              if (scrollElement) {
                const newScrollHeight = scrollElement.scrollHeight;
                scrollElement.scrollTop =
                  newScrollHeight - previousScrollHeight;
              }
            }, 0);
          } else {
            setMessages(fetchedMessages);
            setTimeout(() => scrollToBottom(), 100);
          }

          setHasMore(response.data.pagination.hasMore);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        if (error.status === 401) {
          return;
        }
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [conversationId]
  );

  // Initial load
  useEffect(() => {
    if (conversationId) {
      loadMessages(1, false);
    }
  }, [conversationId, loadMessages]);

  // Join conversation room on socket
  useEffect(() => {
    if (socket && isConnected && conversationId) {
      socket.emit("join_conversation", conversationId);

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.conversationId === conversationId) {
          setMessages((prev) => [...prev, data.message]);
          setTimeout(() => scrollToBottom(), 100);

          // Mark as read and emit socket event
          apiService
            .markConversationAsRead(conversationId)
            .catch(console.error);
          socket.emit("mark_read", { conversationId });
        }
      };

      // Listen for typing
      const handleTyping = (data) => {
        if (data.userId !== user?._id?.toString()) {
          setIsTyping(data.isTyping);
          setTypingUserId(data.userId);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          if (data.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              setTypingUserId(null);
            }, 3000);
          }
        }
      };

      // Listen for message read events (update read receipts in real-time)
      const handleMessageRead = (data) => {
        if (
          data.conversationId === conversationId &&
          data.userId !== user?._id?.toString()
        ) {
          // Update all messages to mark them as read by the other user
          setMessages((prev) =>
            prev.map((msg) => {
              // Only update if the message doesn't already have this user in readBy
              if (
                msg.readBy &&
                !msg.readBy.some((id) => id.toString() === data.userId)
              ) {
                return {
                  ...msg,
                  readBy: [...msg.readBy, data.userId],
                };
              }
              return msg;
            })
          );
        }
      };

      socket.on("new_message", handleNewMessage);
      socket.on("typing", handleTyping);
      socket.on("message_read", handleMessageRead);

      return () => {
        socket.emit("leave_conversation", conversationId);
        socket.off("new_message", handleNewMessage);
        socket.off("typing", handleTyping);
        socket.off("message_read", handleMessageRead);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [socket, isConnected, conversationId, user]);

  // Mark conversation as read when viewing
  useEffect(() => {
    if (conversationId && user) {
      apiService.markConversationAsRead(conversationId).catch(console.error);

      // Emit socket event to notify other participants in real-time
      if (socket && isConnected) {
        socket.emit("mark_read", { conversationId });
      }
    }
  }, [conversationId, user, socket, isConnected]);

  // Handle infinite scroll (load older messages on scroll to top)
  const handleScroll = (e) => {
    const element = e.target;
    if (element.scrollTop === 0 && hasMore && !loadingMore) {
      loadMessages(page + 1, true);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploadingFile(true);
      const response = await apiService.uploadConversationAttachment(
        conversationId,
        file
      );

      if (response.success) {
        setAttachments((prev) => [...prev, response.data]);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent.trim() && attachments.length === 0) {
      return;
    }

    try {
      setSending(true);

      const response = await apiService.sendConversationMessage(
        conversationId,
        messageContent.trim(),
        attachments
      );

      if (response.success) {
        setMessageContent("");
        setAttachments([]);
        // Message will be added via socket event
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && isConnected && conversationId) {
      socket.emit("typing", { conversationId, isTyping: true });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          socket.emit("typing", { conversationId, isTyping: false });
        }
      }, 1000);
    }
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const otherParticipantId = otherParticipant?._id || otherParticipant?.id;
  const isOnline = otherParticipantId && isUserOnline(otherParticipantId);

  return (
    <div className="flex flex-col h-full">
      {/* Header with participant info and online status */}
      {otherParticipant && (
        <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30 rounded-t-none">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {otherParticipant.fullName?.charAt(0).toUpperCase() || "?"}
            </div>
            {/* Online indicator */}
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {otherParticipant.fullName || "User"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="text-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
          </div>
        )}

        <div className="space-y-1">
          {messages.map((message, index) => {
            const isMyMessage =
              message.senderId?._id?.toString() === user?._id?.toString() ||
              message.senderId?.toString() === user?._id?.toString();

            return (
              <MessageItem
                key={message._id || index}
                message={message}
                isMyMessage={isMyMessage}
                otherParticipant={otherParticipant}
              />
            );
          })}
        </div>

        {isTyping && typingUserId && (
          <div className="flex gap-3 mb-4">
            <div className="bg-muted rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">Typing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative inline-block p-2 bg-muted rounded"
              >
                {attachment.type?.startsWith("image/") ? (
                  <OptimizedImage
                    optimizedUrl={attachment.optimizedUrl}
                    fallbackUrl={attachment.url}
                    alt={attachment.name}
                    width={320}
                    height={320}
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    <span className="text-xs">{attachment.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || sending}
          >
            {uploadingFile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <Textarea
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 min-h-[48px] max-h-[120px] resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" disabled={sending || uploadingFile}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationDetail;
