"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./userContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);
  const messageGroupTimeoutRef = useRef({});
  const messageGroupRef = useRef({});

  useEffect(() => {
    if (!token || !user) {
      // Disconnect if no token or user
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5012";

    const newSocket = io(API_BASE_URL, {
      auth: {
        token: token,
      },
      extraHeaders: {
        "auth-token": token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      // Emit that user is now active
      if (!document.hidden) {
        newSocket.emit("user_active");
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab or minimized
        newSocket.emit("user_inactive");
      } else {
        // User returned to the tab
        newSocket.emit("user_active");
      }
    };

    // Handle window focus/blur
    const handleFocus = () => {
      if (!document.hidden) {
        newSocket.emit("user_active");
      }
    };

    const handleBlur = () => {
      newSocket.emit("user_inactive");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [token, user]);

  // Listen for new messages globally (for toast notifications)
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      const { conversationId, message } = data;

      // Extract sender ID (handle both populated object and string ID)
      const senderId = message.senderId?._id || message.senderId;
      const currentUserId = user._id?.toString() || user.id?.toString();

      // Only show toast if message is not from current user
      if (senderId && senderId.toString() !== currentUserId) {
        const senderName = message.senderId?.fullName || "Someone";
        const senderKey = senderId.toString();
        
        // Check if user is viewing this specific conversation
        const isViewingThisConversation = 
          window.location.pathname.includes('/conversations') && 
          window.location.search.includes(`conversationId=${conversationId}`);
        
        // Don't show toast if user is actively viewing this conversation
        if (isViewingThisConversation) {
          return;
        }

        // Prepare message preview
        const previewSource = (message.content && message.content.trim().length > 0)
          ? message.content.trim()
          : (message.attachments && message.attachments.length > 0)
            ? "Sent an attachment"
            : "Sent a message";
        const preview = previewSource.length > 100
          ? `${previewSource.slice(0, 100)}...`
          : previewSource;

        // Group messages from same sender
        if (!messageGroupRef.current[senderKey]) {
          messageGroupRef.current[senderKey] = {
            count: 1,
            senderName,
            conversationId,
            lastPreview: preview,
          };
        } else {
          const group = messageGroupRef.current[senderKey];
          group.count++;
          group.lastPreview = preview;
        }

        // Clear existing timeout for this sender
        if (messageGroupTimeoutRef.current[senderKey]) {
          clearTimeout(messageGroupTimeoutRef.current[senderKey]);
        }

        // Set new timeout to show grouped notification
        messageGroupTimeoutRef.current[senderKey] = setTimeout(() => {
          const group = messageGroupRef.current[senderKey];
          if (group) {
            const messageText = group.count > 1 
              ? `${group.count} new messages from ${group.senderName}`
              : `New message from ${group.senderName}`;

            const previewText = group.lastPreview
              ? `\n"${group.lastPreview}"`
              : "";
            
            toast.success(`${messageText}${previewText}`, {
              duration: 4000,
              id: `msg-${senderKey}`, // Unique ID to prevent duplicates
            });
          }
          
          // Clean up
          delete messageGroupRef.current[senderKey];
          delete messageGroupTimeoutRef.current[senderKey];
        }, 1000); // Wait 1 second to group messages
      }
    };

    // Handle user online/active status
    const handleUserOnline = (data) => {
      // User is now online and active
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    // Handle user offline status
    const handleUserOffline = (data) => {
      // User disconnected completely
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    // Handle user inactive status (tab hidden but still connected)
    const handleUserInactive = (data) => {
      // Keep them in online users but they're just inactive
      // We could add a separate activeUsers set if needed
      console.log(`User ${data.userId} is now inactive`);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("user_inactive_status", handleUserInactive);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("user_inactive_status", handleUserInactive);
      
      // Clear all message grouping timeouts on cleanup
      Object.values(messageGroupTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      messageGroupTimeoutRef.current = {};
      messageGroupRef.current = {};
    };
  }, [socket, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId?.toString()),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

