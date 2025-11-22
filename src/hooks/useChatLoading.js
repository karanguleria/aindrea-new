import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { getChatIdFromUrl } from "@/utils/chat/urlHelpers";
import { formatMessagesFromAPI } from "@/utils/chat/messageFormatters";

const MESSAGE_LIMIT = 10;

/**
 * Custom hook for chat loading logic
 * @param {Object} options - Hook options
 * @param {string} options.chatId - Current chat ID from hook
 * @param {Function} options.loadChat - Function to load chat
 * @param {Function} options.isAuthenticated - Function to check authentication
 * @param {boolean} options.authLoading - Authentication loading state
 * @param {boolean} options.contextLoadingChat - Loading state from context
 * @param {Function} options.setMessages - Function to set messages
 * @param {Function} options.setMessageOffset - Function to set message offset
 * @param {Function} options.setHasMoreMessages - Function to set has more messages
 * @param {Function} options.setTotalMessages - Function to set total messages
 * @param {Function} options.scrollToBottom - Function to scroll to bottom
 * @param {Function} options.clearError - Function to clear error
 * @returns {Object} Chat loading state and functions
 */
export const useChatLoading = ({
  chatId,
  loadChat,
  isAuthenticated,
  authLoading,
  contextLoadingChat,
  setMessages,
  setMessageOffset,
  setHasMoreMessages,
  setTotalMessages,
  scrollToBottom,
  clearError,
}) => {
  const router = useRouter();
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const prevChatIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const loadingChatRef = useRef(false);
  const hasLoadedRef = useRef(false); // Track if we've successfully loaded a chat

  // Store function references in refs to avoid dependency issues
  const loadChatRef = useRef(loadChat);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Update refs when functions change
  useEffect(() => {
    loadChatRef.current = loadChat;
    isAuthenticatedRef.current = isAuthenticated;
  }, [loadChat, isAuthenticated]);

  // Reset hasLoadedRef when chatId changes to null (user navigated away)
  useEffect(() => {
    if (!chatId && !getChatIdFromUrl(router)) {
      hasLoadedRef.current = false;
      prevChatIdRef.current = null;
    }
  }, [chatId, router]);

  // Load chat when chatId changes (from hook) or when URL changes
  useEffect(() => {
    console.log("🔵 useChatLoading effect triggered", {
      routerReady: router.isReady,
      authLoading,
      chatId,
      pathname: router.pathname,
      query: router.query,
    });

    // Wait for router and authentication to be ready
    if (!router.isReady || authLoading) {
      console.log("⏸️ Waiting for router/auth:", {
        routerReady: router.isReady,
        authLoading,
      });
      return;
    }

    // Use refs to access functions (avoid dependency issues)
    const currentLoadChat = loadChatRef.current;
    const currentIsAuthenticated = isAuthenticatedRef.current;

    if (!currentLoadChat || !currentIsAuthenticated()) {
      console.log("❌ Missing loadChat or not authenticated:", {
        hasLoadChat: !!currentLoadChat,
        isAuthenticated: currentIsAuthenticated
          ? currentIsAuthenticated()
          : false,
      });
      return;
    }

    // Ensure token is available before loading chat (important when navigating)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.log("❌ No token available");
      // Clear loading state if no token
      setIsLoadingChat(false);
      loadingChatRef.current = false;
      return;
    }

    // Check if isLoggingOut flag is stuck (shouldn't be set if we have a token)
    const isLoggingOut =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggingOut") === "true";
    if (isLoggingOut && token) {
      console.log("🔧 Clearing stuck isLoggingOut flag");
      // If we have a token but isLoggingOut is still set, clear it (stuck flag)
      localStorage.removeItem("isLoggingOut");
    }

    // Skip chat loading on non-chat pages (like bids detail page or brief-details page)
    const isBidsPage = router.pathname?.includes("/bids/");
    const isBriefDetailsPage =
      router.pathname?.includes("/brief-details/") ||
      router.pathname?.includes("/revision-history/");
    if (isBidsPage || isBriefDetailsPage) {
      console.log(
        "⏸️ Skipping chat load on",
        isBidsPage ? "bids" : "brief-details",
        "page"
      );
      setIsLoadingChat(false);
      loadingChatRef.current = false;
      return;
    }

    // Get chatId from URL directly as fallback
    const urlChatId = getChatIdFromUrl(router);
    const effectiveChatId = chatId || urlChatId;

    console.log("📋 ChatId resolution:", {
      chatIdFromHook: chatId,
      chatIdFromUrl: urlChatId,
      effectiveChatId,
      prevChatIdRef: prevChatIdRef.current,
      hasLoadedRef: hasLoadedRef.current,
      contextLoadingChat,
      loadingChatRef: loadingChatRef.current,
    });

    // Early return if no chatId
    if (!effectiveChatId) {
      console.log("❌ No effective chatId found");
      // If we had a chatId before and now we don't, clear the state
      if (prevChatIdRef.current) {
        prevChatIdRef.current = null;
        setMessages([]);
        clearError();
      }
      // Clear loading state when no chatId
      setIsLoadingChat(false);
      loadingChatRef.current = false;
      return;
    }

    // Only skip loading if chatId hasn't changed AND we've already loaded it AND messages exist
    // On refresh, prevChatIdRef.current will be null, so we should load
    // Also check if we're already loading to avoid duplicate loads
    // Note: We check contextLoadingChat here but don't include it in dependencies
    // to prevent effect re-runs that would abort ongoing requests
    if (loadingChatRef.current) {
      console.log("⏸️ Already loading (local ref), skipping");
      // Already loading locally, wait for it to complete
      return;
    }

    // Check contextLoadingChat but don't block if it's true - it might be from a previous load
    // that's about to complete. Only use it as a hint, not a blocker.
    if (contextLoadingChat) {
      console.log(
        "⏸️ Context is loading, but proceeding (might be stale state)"
      );
    }

    // Check if chatId actually changed (on refresh, prevChatIdRef will be null)
    // Also check hasLoadedRef to ensure we load on refresh even if prevChatIdRef matches
    if (
      effectiveChatId === prevChatIdRef.current &&
      prevChatIdRef.current !== null &&
      hasLoadedRef.current
    ) {
      console.log("⏭️ Skipping load - chatId unchanged and already loaded");
      // ChatId hasn't changed and we've successfully loaded it before - skip
      return;
    }

    console.log("✅ Starting chat load:", {
      effectiveChatId,
      prevChatId: prevChatIdRef.current,
      hasLoaded: hasLoadedRef.current,
    });

    // Abort any ongoing load
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this load
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set loading state and prevChatId immediately to prevent duplicate loads
    loadingChatRef.current = true;
    prevChatIdRef.current = effectiveChatId;
    setIsLoadingChat(true);
    setMessages([]);
    clearError();

    const loadCurrentChat = async () => {
      console.log("🚀 loadCurrentChat called", { effectiveChatId });

      // Check if this load was aborted
      if (abortController.signal.aborted) {
        console.log("⚠️ Load aborted before start");
        return;
      }

      // Double-check: If chatId changed while we were setting up, abort
      if (prevChatIdRef.current !== effectiveChatId) {
        console.log("⚠️ ChatId changed during setup, aborting");
        return;
      }

      try {
        console.log("📞 Calling loadChat with:", {
          chatId: effectiveChatId,
          limit: MESSAGE_LIMIT,
          offset: 0,
        });

        // Load chat once - wait for the actual response
        const response = await currentLoadChat(
          effectiveChatId,
          MESSAGE_LIMIT,
          0
        );

        console.log("📥 loadChat response received:", {
          hasResponse: !!response,
          responseType: typeof response,
          hasMessages: response?.messages
            ? Array.isArray(response.messages)
            : false,
          messageCount: response?.messages?.length || 0,
          success: response?.success,
        });

        // Check if response is still null after await
        // This can happen if loadChat returns null (e.g., during logout or chat not found)
        if (!response) {
          console.log("❌ loadChat returned null");
          // Only abort if we don't have a response
          if (abortController.signal.aborted) {
            console.log("⚠️ Load aborted and no response");
            return;
          }
          setMessages([]);
          setChatError({
            type: "not_found",
            message: "Chat not found",
            chatId: effectiveChatId,
          });
          // Make sure to clear loading state even when response is null
          setIsLoadingChat(false);
          loadingChatRef.current = false;
          return;
        }

        // If chat not found or has no messages, show error
        if (
          !response ||
          !response.messages ||
          !Array.isArray(response.messages)
        ) {
          console.log("❌ Invalid response structure:", {
            hasResponse: !!response,
            hasMessages: !!response?.messages,
            isArray: Array.isArray(response?.messages),
          });
          // Even if aborted, if we have an invalid response, process it
          if (abortController.signal.aborted) {
            console.log("⚠️ Load aborted but processing invalid response");
          }
          setMessages([]);
          setChatError({
            type: "not_found",
            message: "Chat not found",
            chatId: effectiveChatId,
          });
          // Clear loading state
          setIsLoadingChat(false);
          loadingChatRef.current = false;
          return;
        }

        // If we have a valid response, process it even if aborted
        // (abort might be from duplicate effect run, not actual cancellation)
        if (abortController.signal.aborted) {
          console.log(
            "⚠️ Load aborted after receiving valid response - processing anyway"
          );
        }

        console.log("✅ Processing successful response:", {
          messageCount: response.messages.length,
          hasPagination: !!response.pagination,
          total: response.pagination?.total,
        });

        // Process successful response - convert messages to frontend format
        const formattedMessages = formatMessagesFromAPI(response.messages);
        console.log("📝 Formatted messages:", {
          count: formattedMessages.length,
        });
        setMessages(formattedMessages);

        // Set pagination state
        const total = response.pagination?.total || 0;
        const loadedCount = formattedMessages.length;

        setMessageOffset(loadedCount); // Track how many we've loaded
        setHasMoreMessages(response.pagination?.hasMore || false);
        setTotalMessages(total);

        // Mark as successfully loaded
        hasLoadedRef.current = true;
        console.log("✅ Chat loaded successfully:", {
          messageCount: formattedMessages.length,
          total,
          hasMore: response.pagination?.hasMore,
        });

        // Clear any errors on successful load
        setChatError(null);

        // Scroll to bottom after messages are rendered on initial load
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        // Don't set error state if request was aborted (user navigated away)
        if (abortController.signal.aborted) {
          console.log("⚠️ Load aborted in catch");
          return;
        }

        console.error("❌ Error loading chat:", error);
        // On any error, show chat not found
        setMessages([]);
        setMessageOffset(0);
        setHasMoreMessages(false);
        setTotalMessages(0);

        setChatError({
          type: "not_found",
          message: "Chat not found",
          chatId: effectiveChatId,
        });
      } finally {
        // Only clear loading state if this load wasn't aborted
        if (!abortController.signal.aborted) {
          console.log("✅ Clearing loading state (not aborted)");
          setIsLoadingChat(false);
          loadingChatRef.current = false;
        } else {
          console.log("⚠️ Clearing loading ref (aborted)");
          // If aborted, still clear the loading ref to allow future loads
          loadingChatRef.current = false;
        }
      }
    };

    loadCurrentChat();

    // Cleanup function to abort ongoing loads when effect re-runs or unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Reset loading state if component unmounts or effect re-runs
      loadingChatRef.current = false;
    };
    // Only depend on primitive values that should trigger a reload
    // Functions are accessed via refs to prevent unnecessary re-runs
    // Note: contextLoadingChat is NOT in dependencies to prevent re-runs when
    // the context loading state changes (which would abort ongoing requests)
  }, [
    chatId,
    router.isReady,
    router.query.id,
    router.query.chatId,
    router.pathname,
    authLoading,
    // contextLoadingChat removed - it causes unnecessary re-runs that abort valid requests
    setMessages,
    setMessageOffset,
    setHasMoreMessages,
    setTotalMessages,
    scrollToBottom,
    clearError,
  ]);

  return {
    isLoadingChat,
    error: chatError,
    setError: setChatError,
  };
};
