import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Loader2,
  MessageCircle,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/userContext";
import Image from "next/image";

export default function CreatorBriefCommunication({ briefId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString();
  };

  // Check if file is an image
  const isImageFile = (type) => {
    return type && type.startsWith("image/");
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await apiService.getBriefMessages(briefId);
      if (response.success) {
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);
        lastMessageCountRef.current = fetchedMessages.length;

        // Scroll to bottom after fetching
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      
      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        setLoading(false);
        return;
      }
      
      if (loading) {
        toast.error("Failed to load messages");
      }
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial fetch
  useEffect(() => {
    if (briefId) {
      fetchMessages();
    }
  }, [briefId]);

  // Polling for new messages
  useEffect(() => {
    if (!briefId || !user) return;

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiService.getBriefMessages(briefId);
        if (response.success) {
          const fetchedMessages = response.data.messages || [];
          const newCount = fetchedMessages.length;

          // Only update if there are new messages
          if (newCount > lastMessageCountRef.current) {
            setMessages(fetchedMessages);
            lastMessageCountRef.current = newCount;
            scrollToBottom();
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
        
        // Handle 401 (unauthorized) - user logged out, stop polling and let API service handle redirect
        if (error.status === 401) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          return;
        }
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [briefId, user]);

  // Handle file upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed."
      );
      return;
    }

    setUploadingFile(true);
    try {
      const response = await apiService.uploadBriefAttachment(briefId, file);
      if (response.success) {
        setAttachments([
          ...attachments,
          {
            url: response.data.url,
            name: response.data.name,
            type: response.data.type,
          },
        ]);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
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

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() && attachments.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    setSending(true);
    try {
      const response = await apiService.sendBriefMessage(
        briefId,
        messageContent.trim(),
        attachments
      );
      if (response.success) {
        setMessageContent("");
        setAttachments([]);
        // Refresh messages
        await fetchMessages();
        scrollToBottom();
      } else {
        toast.error(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }
      
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key (Shift+Enter for new line, Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Messages List */}
        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isClient = message.senderType === "client";
              const sender = message.senderId;
              const senderName = sender?.fullName || "Unknown";
              const senderInitials = senderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={message.messageId || index}
                  className={`flex gap-3 ${
                    isClient ? "" : "flex-row-reverse"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{senderInitials}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 ${
                      isClient ? "items-start" : "items-end"
                    } flex flex-col gap-1`}
                  >
                    <div className={`flex items-center gap-2 mb-1 ${isClient ? "" : "flex-row-reverse"}`}>
                      <span className="text-sm font-medium">{senderName}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.senderType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        isClient
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, attIndex) => (
                            <div key={attIndex} className="mt-2">
                              {isImageFile(attachment.type) ? (
                                <div className="relative rounded-md overflow-hidden">
                                  <Image
                                    src={attachment.url}
                                    alt={attachment.name || "Attachment"}
                                    width={300}
                                    height={200}
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm truncate flex-1">
                                    {attachment.name || "File"}
                                  </span>
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <Separator className="my-4" />

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative inline-flex items-center gap-2 p-2 border rounded-md bg-muted"
              >
                {isImageFile(attachment.type) ? (
                  <Image
                    src={attachment.url}
                    alt={attachment.name}
                    width={60}
                    height={60}
                    className="object-cover rounded"
                  />
                ) : (
                  <FileText className="h-8 w-8" />
                )}
                <span className="text-xs max-w-[100px] truncate">
                  {attachment.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 min-h-[80px]"
              disabled={sending}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploadingFile}
              >
                {uploadingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sending || (!messageContent.trim() && attachments.length === 0)}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
        </div>
      </CardContent>
    </Card>
  );
}

