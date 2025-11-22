"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import apiService from "@/services/api";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [lastUserId, setLastUserId] = useState(null);
  
  // Track ongoing chat loads to queue concurrent requests
  const ongoingLoadsRef = useRef(new Map());

  // Load user's chats
  const loadChats = useCallback(async () => {
    // Don't reload if already loading or if chats are already loaded
    if (loading || chatsLoaded) {
      return;
    }

    // Check if we're logging out - don't load chats during logout
    const isLoggingOut =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggingOut") === "true";
    if (isLoggingOut) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getUserChats(1, 50); // Load first 50 chats
      if (response.success) {
        setChats(response.data.chats);
        setChatsLoaded(true);
      }
    } catch (error) {
      // Silently handle errors during logout
      if (error.silent) {
        return;
      }
      // Only log non-silent errors
      if (!error.silent) {
        console.error("Error loading chats:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, chatsLoaded]);

  // Create a new chat
  const createChat = useCallback(
    async (
      firstMessage,
      title,
      mode = "text",
      context = [],
      files = [],
      variantCount = 1
    ) => {
      try {
        const response = await apiService.createChat(
          firstMessage,
          title,
          mode,
          context,
          files,
          variantCount
        );
        if (response.success) {
          const newChat = response.data;
          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(newChat._id);
          return newChat;
        }
      } catch (error) {
        // Silently handle errors during logout
        if (error.silent) {
          return null;
        }
        console.error("Error creating chat:", error);
        throw error;
      }
    },
    []
  );

  // Load a specific chat with optional pagination
  const loadChat = useCallback(
    async (chatId, limit = 10, offset = 0) => {
      console.log("🔵 chatContext.loadChat called:", { chatId, limit, offset });

      // Create a unique key for this request (chatId + limit + offset)
      const requestKey = `${chatId}-${limit}-${offset}`;
      
      // If there's already an ongoing load for this exact request, wait for it
      if (ongoingLoadsRef.current.has(requestKey)) {
        console.log("⏸️ Waiting for existing load:", requestKey);
        return ongoingLoadsRef.current.get(requestKey);
      }

      console.log("🚀 Creating new load promise:", requestKey);

      // Create a new promise for this load
      const loadPromise = (async () => {
        // Check if we're logging out - don't load chat during logout
        const isLoggingOut =
          typeof window !== "undefined" &&
          localStorage.getItem("isLoggingOut") === "true";
        if (isLoggingOut) {
          console.log("⚠️ Logging out, skipping load");
          setLoadingChat(false);
          ongoingLoadsRef.current.delete(requestKey);
          return null;
        }

        try {
          console.log("📡 Calling apiService.getChatById:", { chatId, limit, offset });
          setLoadingChat(true);
          const response = await apiService.getChatById(chatId, limit, offset);
          
          console.log("📥 apiService.getChatById response:", {
            success: response?.success,
            hasData: !!response?.data,
            hasMessages: !!response?.data?.messages,
            messageCount: response?.data?.messages?.length || 0,
            hasPagination: !!response?.pagination,
          });

          if (response.success) {
            console.log("✅ Chat loaded successfully in context");
            setCurrentChatId(chatId);
            // Return both data and pagination
            const result = {
              ...response.data,
              pagination: response.pagination,
            };
            console.log("📤 Returning chat data:", {
              hasMessages: !!result.messages,
              messageCount: result.messages?.length || 0,
              hasPagination: !!result.pagination,
            });
            return result;
          } else {
            // API returned success: false (chat not found or other error)
            const errorMessage = response.message || "Chat not found";
            console.error("❌ Error loading chat:", errorMessage);

            // Handle "Chat not found" or "resource not found" errors gracefully
            if (
              errorMessage.includes("Chat not found") ||
              errorMessage.includes("not found") ||
              errorMessage.includes("The requested resource was not found")
            ) {
              // Remove the chat from the list if it doesn't exist
              setChats((prev) => prev.filter((chat) => chat._id !== chatId));
              if (currentChatId === chatId) {
                setCurrentChatId(null);
              }
              return null;
            }

            // For other errors, throw to be caught by catch block
            throw new Error(errorMessage);
          }
        } catch (error) {
          // Silently handle errors during logout
          if (error.silent) {
            setLoadingChat(false);
            ongoingLoadsRef.current.delete(requestKey);
            return null;
          }

          // Only log non-silent errors
          if (!error.silent) {
            console.error("Error loading chat:", error);
          }

          // Handle "Chat not found" or "resource not found" errors gracefully
          if (
            error.message?.includes("Chat not found") ||
            error.message?.includes("not found") ||
            error.message?.includes("The requested resource was not found") ||
            (error.status && error.status === 404)
          ) {
            // Remove the chat from the list if it doesn't exist
            setChats((prev) => prev.filter((chat) => chat._id !== chatId));
            if (currentChatId === chatId) {
              setCurrentChatId(null);
            }
            return null;
          }

          throw error;
        } finally {
          setLoadingChat(false);
          // Remove from ongoing loads map
          ongoingLoadsRef.current.delete(requestKey);
        }
      })();

      // Store the promise in the map
      ongoingLoadsRef.current.set(requestKey, loadPromise);
      
      return loadPromise;
    },
    [currentChatId]
  );

  // Send message to current chat
  const sendMessage = async (
    content,
    mode = "text",
    context = [],
    files = [],
    variantCount = 1,
    options = {}
  ) => {
    if (!currentChatId) {
      throw new Error("No chat selected");
    }

    try {
      const response = await apiService.sendMessage(
        currentChatId,
        content,
        mode,
        context,
        files,
        variantCount,
        options.forceGenerate || false,
        options
      );
      if (response.success) {
        // Update the chat in the list with the new message
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === currentChatId
              ? { ...chat, updatedAt: new Date().toISOString() }
              : chat
          )
        );
        return response.data;
      }
    } catch (error) {
      // Silently handle errors during logout
      if (error.silent) {
        return null;
      }
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Update chat title
  const updateChatTitle = async (chatId, title) => {
    try {
      const response = await apiService.updateChatTitle(chatId, title);
      if (response.success) {
        setChats((prev) =>
          prev.map((chat) => (chat._id === chatId ? { ...chat, title } : chat))
        );
      }
    } catch (error) {
      // Silently handle errors during logout
      if (error.silent) {
        return;
      }
      console.error("Error updating chat title:", error);
      throw error;
    }
  };

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      const response = await apiService.deleteChat(chatId);
      if (response.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
        }
        return { success: true };
      }
    } catch (error) {
      // Silently handle errors during logout
      if (error.silent) {
        return { success: true };
      }

      console.error("Error deleting chat:", error);

      // Handle specific error cases
      if (error.message?.includes("Chat not found")) {
        // If chat doesn't exist, remove it from the list anyway
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
        }
        return { success: true, message: "Chat was already deleted" };
      }

      // Re-throw other errors
      throw error;
    }
  };

  // Search chats
  const searchChats = async (query) => {
    try {
      const response = await apiService.searchChats(query);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      // Silently handle errors during logout
      if (error.silent) {
        return [];
      }
      console.error("Error searching chats:", error);
      throw error;
    }
  };

  // Get current chat
  const getCurrentChat = () => {
    return chats.find((chat) => chat._id === currentChatId);
  };

  // Clear current chat
  const clearCurrentChat = () => {
    setCurrentChatId(null);
  };

  // Clear all chat data (for logout)
  const clearAllChatData = useCallback(() => {
    setChats([]);
    setCurrentChatId(null);
    setLoading(false);
    setChatsLoaded(false);
    setLoadingChat(false);
    setLastUserId(null);
  }, []);

  // Clear chat data when user changes (for security)
  useEffect(() => {
    // Get current user from localStorage
    const getCurrentUserId = () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user)._id : null;
      }
      return null;
    };

    const currentUserId = getCurrentUserId();

    // If user changed or logged out, clear chat data
    if (lastUserId && lastUserId !== currentUserId) {
      console.log("🔄 User changed, clearing chat data");
      clearAllChatData();
    }

    // Update last user ID
    if (currentUserId) {
      setLastUserId(currentUserId);
    }
  }, [lastUserId, clearAllChatData]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        loading,
        chatsLoaded,
        loadingChat,
        loadChats,
        createChat,
        loadChat,
        sendMessage,
        updateChatTitle,
        deleteChat,
        searchChats,
        getCurrentChat,
        clearCurrentChat,
        clearAllChatData,
        setCurrentChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook for using chat context
export const useChat = () => useContext(ChatContext);
