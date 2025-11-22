import React, { useState, useEffect, useRef, useCallback } from "react";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useAuth } from "@/contexts/userContext";
import { useChat } from "@/contexts/chatContext";
import { useUsage } from "@/contexts/usageContext";
import { useBillingModal } from "@/contexts/billingModalContext";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChatContainer } from "@/components/clients/chat/ChatContainer";
import { ChatInput } from "@/components/clients/chat/ChatInput";
import { FeatureCards } from "@/components/clients/Dashboard/FeatureCards";
import ErrorFallback from "@/components/common/ErrorFallback";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useChatState } from "@/hooks/useChatState";
import { useUserAssets } from "@/hooks/useUserAssets";
import { useChatLoading } from "@/hooks/useChatLoading";
import { useMessagePagination } from "@/hooks/useMessagePagination";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { formatMessagesFromAPI } from "@/utils/chat/messageFormatters";
import { detectVariantCount } from "@/utils/chat/promptDetection";

export default function ChatInterface({
  variant = "dashboard", // "dashboard", "chat", "split", "mobile"
  showWelcomeMessage = true,
  showFeatureCards = true,
  customWelcomeMessage = null,
  onNewChat = null,
  loadChat: loadChatProp = null, // Keep prop for backward compatibility, but prefer context
  currentChatId = null, // Deprecated - use useChatState hook instead
  clearCurrentChat = null,
  baseRoute = "/dashboard",
}) {
  const { isDark } = useThemeUtils();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const {
    createChat,
    sendMessage: sendMessageToChat,
    loadChat: loadChatFromContext,
    chats,
    chatsLoaded,
    loadingChat: contextLoadingChat,
  } = useChat();
  const {
    canGenerate,
    remainingGenerations,
    maxMonthlyGenerations,
    refreshUsage,
  } = useUsage();
  const { openBillingModal } = useBillingModal();
  const router = useRouter();

  // Use centralized chat state hook
  const {
    chatId,
    setChatId,
    clearChatId: clearChatState,
  } = useChatState({
    variant,
    autoSync: true,
    loadFromUrl: true,
  });

  // Use loadChat from context, fallback to prop for backward compatibility
  const loadChat = loadChatFromContext || loadChatProp;

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState("text");
  const [retryCount, setRetryCount] = useState(0);

  // Pagination and scroll state
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Use custom hooks for complex logic
  const { userAssets, handleAssetAdded, handleViewAssets } = useUserAssets({
    user,
    authLoading,
    baseRoute,
  });

  const {
    messageOffset,
    hasMoreMessages,
    isLoadingMore,
    totalMessages,
    setMessageOffset,
    setHasMoreMessages,
    setTotalMessages,
  } = useMessagePagination({
    chatId,
    loadChat,
    setMessages,
    messagesContainerRef,
  });

  const { detectImageGeneration, detectVariantCount: detectVariants } =
    useImageGeneration(variant);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Error state
  const [error, setError] = useState(null);

  // Use chat loading hook
  const {
    isLoadingChat,
    error: chatError,
    setError: setChatError,
  } = useChatLoading({
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
  });

  // Sync error state from chat loading hook
  useEffect(() => {
    if (chatError) {
      setError(chatError);
    } else {
      setError(null);
    }
  }, [chatError]);

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    clearError();
    // Check if we're on a brief-details or revision-history page
    // On these pages, router.query.id is the brief ID, not a chat ID
    const isBriefDetailsPage =
      router.pathname?.includes("/brief-details/") ||
      router.pathname?.includes("/revision-history/");

    // Use chatId from hook (which handles URL/context sync)
    if (!chatId || !loadChat) return;
    try {
      setIsLoadingChat(true);
      setMessages([]);
      const response = await loadChat(chatId, 10, 0);
      if (response && response.messages) {
        const formattedMessages = formatMessagesFromAPI(response.messages);
        setMessages(formattedMessages);
        setMessageOffset(formattedMessages.length);
        setHasMoreMessages(response.pagination?.hasMore || false);
        setTotalMessages(
          response.pagination?.total || formattedMessages.length
        );
        setTimeout(() => scrollToBottom(), 100);
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Removed local reload helper; rely on provided loadChat

  // Load more messages is handled by useMessagePagination hook

  // Only scroll to bottom when explicitly needed (new messages sent/received)
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Listen for chat refresh events (e.g., forceGenerate from message button)
  useEffect(() => {
    const handler = async (e) => {
      const targetChatId = e?.detail?.chatId || chatId;
      if (!targetChatId || !loadChat) return;
      try {
        const response = await loadChat(targetChatId, 10, 0);
        if (response && response.messages) {
          const formattedMessages = formatMessagesFromAPI(response.messages);
          setMessages(formattedMessages);
          setMessageOffset(formattedMessages.length);
          setHasMoreMessages(response.pagination?.hasMore || false);
          setTotalMessages(
            response.pagination?.total || formattedMessages.length
          );
          setShouldScrollToBottom(true);
        }
      } catch (err) {
        console.error("Failed to refresh chat:", err);
      }
    };
    window.addEventListener("chatNeedsRefresh", handler);
    return () => window.removeEventListener("chatNeedsRefresh", handler);
  }, [chatId, loadChat]);

  const handleFeedbackUpdate = (messageIndex, feedback) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[messageIndex]) {
        updated[messageIndex] = {
          ...updated[messageIndex],
          feedback,
        };
      }
      return updated;
    });
  };

  // Image generation detection is handled by useImageGeneration hook

  const handleSendMessage = async (messageData, mode = "text") => {
    const messageText =
      typeof messageData === "string" ? messageData : messageData.text;
    const files =
      typeof messageData === "object" && messageData.files
        ? messageData.files
        : [];

    if (!messageText.trim() && files.length === 0) return;

    const variantCount = detectVariants(messageText);

    if (!isAuthenticated()) {
      toast.error("Please log in to use the chat feature", {
        id: "chat-feature",
      });
      router.push("/");
      return;
    }

    const finalMode = mode;

    if (finalMode === "image" && !canGenerate) {
      const limitDisplay =
        maxMonthlyGenerations === null
          ? "unlimited"
          : `${remainingGenerations || 0}/${maxMonthlyGenerations}`;
      toast.error(
        `Monthly generation limit reached (${limitDisplay}). Upgrade your plan for unlimited generations.`,
        {
          duration: 5000,
          id: "generation-limit",
        }
      );
      if (openBillingModal) {
        openBillingModal();
      }
      return;
    }

    const userMessage = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      feedback: { thumbsUp: false, thumbsDown: false },
      ...(files.length > 0 && { files }),
    };

    // Capture chatId at the start to track if user switches chats
    const initialChatId = chatId;
    const loadingMessageId = `loading-${Date.now()}`;
    let loadingReplaced = false;
    const baseLoadingMessage = {
      id: loadingMessageId,
      message: "",
      isUser: false,
      timestamp: null,
      isLoading: true,
      loadingSteps: [
        {
          id: "understanding",
          stage: "understanding",
          label: "Understanding request",
          status: "in_progress",
        },
      ],
      variantCount:
        finalMode === "image" ? Math.max(variantCount || 0, 1) : null,
      feedback: { thumbsUp: false, thumbsDown: false },
    };

    setMessages((prev) => [...prev, userMessage, baseLoadingMessage]);
    setIsLoading(true);
    setShouldScrollToBottom(true);

    const loadingState = {
      steps: baseLoadingMessage.loadingSteps.map((step) => ({
        ...step,
        stage: step.stage || step.id,
      })),
      variantCount: baseLoadingMessage.variantCount,
    };

    const updateLoadingMessage = (updates) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId ? { ...msg, ...updates } : msg
        )
      );
    };

    updateLoadingMessage({
      loadingSteps: loadingState.steps,
      variantCount: loadingState.variantCount,
    });

    const replaceLoadingMessage = (replacement) => {
      loadingReplaced = true;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === loadingMessageId ? replacement : msg))
      );
    };

    const applyProgressEvent = (event) => {
      if (!event || !event.stage || loadingReplaced) {
        return;
      }

      const stageKey = event.stage;
      const label =
        event.label ||
        stageKey
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      const status = event.status || "completed";

      if (typeof event.variantCount === "number") {
        loadingState.variantCount = event.variantCount;
      }

      const existingIndex = loadingState.steps.findIndex(
        (step) => step.stage === stageKey
      );

      const updatedStep = {
        id: stageKey,
        stage: stageKey,
        label,
        status,
        ...(event.variantCount !== undefined
          ? { variantCount: event.variantCount }
          : {}),
      };

      if (existingIndex >= 0) {
        loadingState.steps[existingIndex] = {
          ...loadingState.steps[existingIndex],
          ...updatedStep,
        };
      } else {
        loadingState.steps.push(updatedStep);
      }

      updateLoadingMessage({
        loadingSteps: loadingState.steps.map((step) => ({
          id: step.stage,
          stage: step.stage,
          label: step.label,
          status: step.status,
          ...(step.variantCount !== undefined
            ? { variantCount: step.variantCount }
            : {}),
        })),
        variantCount: loadingState.variantCount,
      });
    };

    const buildLoadingSteps = (modeValue, variantsValue = 0) => {
      const steps = [
        {
          id: "understanding",
          stage: "understanding",
          label: "Understanding request",
          status: "completed",
        },
      ];

      if (modeValue === "image") {
        const safeCount =
          typeof variantsValue === "number" && variantsValue > 0
            ? variantsValue
            : 1;
        steps.push({
          id: "generating_image",
          stage: "generating_image",
          label:
            safeCount > 1
              ? `Generating ${safeCount} image variants`
              : "Generating image",
          status: "completed",
          variantCount: safeCount,
        });
      } else {
        steps.push({
          id: "generating_text",
          stage: "generating_text",
          label: "Generating response",
          status: "completed",
        });
      }

      return steps;
    };

    try {
      let response;
      let isNewChat = false;

      // Only create new chat if we don't have a chatId
      const shouldCreateNewChat = !chatId;

      if (shouldCreateNewChat) {
        isNewChat = true;
        const chatTitle =
          finalMode === "image"
            ? `Image: ${messageText.substring(0, 30)}${
                messageText.length > 30 ? "..." : ""
              }`
            : messageText.length > 30
            ? messageText.substring(0, 30) + "..."
            : messageText;

        response = await createChat(
          messageText,
          chatTitle,
          finalMode,
          [],
          files,
          variantCount
        );

        if (!response) {
          throw new Error("Failed to create chat");
        }

        // createChat returns the chat object directly (not wrapped in data)
        const createdChatId = response?._id || response?.data?._id;

        if (createdChatId) {
          // Set chatId using hook (this will sync to URL and context)
          setChatId(createdChatId, { syncUrl: true, syncContext: true });
        }
      } else {
        // Use existing chat - ensure context has the chatId
        // The hook should already have synced it, but double-check
        if (chatId) {
          response = await sendMessageToChat(
            messageText,
            finalMode,
            [],
            files,
            variantCount,
            { onProgress: applyProgressEvent }
          );
        } else {
          throw new Error("No chat ID available");
        }
      }

      // Check if user switched chats while waiting for response
      // This prevents responses from appearing in the wrong chat
      // Only check this for existing chats (not new chats, where initialChatId is null)
      if (!isNewChat && initialChatId !== null && initialChatId !== chatId) {
        // Remove loading message if chat was switched
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessageId)
        );
        setIsLoading(false);
        return; // Don't add response to messages if chat was switched
      }

      if (isNewChat) {
        // createChat returns the chat object directly (not wrapped in data)
        const createdChatId = response?._id || response?.data?._id;
        // For new chats, verify the created chat ID matches what we set
        if (createdChatId && createdChatId !== chatId) {
          // Chat ID mismatch - update to match the created chat
          console.warn("Chat ID mismatch for new chat, updating:", {
            createdChatId,
            currentChatId: chatId,
          });
          setChatId(createdChatId, { syncUrl: true, syncContext: true });
        }
      }

      let aiPayload;
      let processingTimeline = [];
      let resolvedMode = finalMode;
      let resolvedVariantCount =
        finalMode === "image" ? Math.max(variantCount || 0, 1) : 0;

      if (isNewChat) {
        // createChat returns the chat object directly (not wrapped in data)
        // The response is the chat object with _id, messages, etc.
        const chatPayload = response?.data || response;
        const assistantMessage = chatPayload?.messages?.find(
          (msg) => msg.role === "assistant"
        );

        if (!assistantMessage) {
          console.error("Assistant response missing. Response structure:", {
            response,
            chatPayload,
            messages: chatPayload?.messages,
          });
          throw new Error("Assistant response missing");
        }

        aiPayload = {
          content: assistantMessage.content,
          imageUrl: assistantMessage.imageUrl,
          imageData: assistantMessage.imageData,
          imageMeta: assistantMessage.imageMeta,
          variants: assistantMessage.variants,
          mode: assistantMessage.mode || finalMode,
        };

        if (aiPayload.variants && aiPayload.variants.length > 0) {
          resolvedMode = "image";
          resolvedVariantCount = aiPayload.variants.length;
        } else if (aiPayload.imageUrl) {
          resolvedMode = "image";
          resolvedVariantCount = 1;
        } else {
          resolvedMode = aiPayload.mode || "text";
          resolvedVariantCount = 0;
        }
      } else {
        aiPayload = response.aiResponse;
        processingTimeline = response.processingTimeline || [];

        if (response?.meta?.finalMode) {
          resolvedMode = response.meta.finalMode;
        } else if (aiPayload?.mode) {
          resolvedMode = aiPayload.mode;
        } else if (aiPayload?.variants?.length || aiPayload?.imageUrl) {
          resolvedMode = "image";
        } else {
          resolvedMode = "text";
        }

        if (typeof response?.meta?.variantCount === "number") {
          resolvedVariantCount = response.meta.variantCount;
        } else if (aiPayload?.variants?.length) {
          resolvedVariantCount = aiPayload.variants.length;
        } else if (aiPayload?.imageUrl) {
          resolvedVariantCount = 1;
        } else {
          resolvedVariantCount = 0;
        }
      }

      if (Array.isArray(processingTimeline) && processingTimeline.length > 0) {
        processingTimeline.forEach((step) =>
          applyProgressEvent({
            ...step,
            stage: step.stage || step.id,
          })
        );
      } else {
        loadingState.variantCount =
          resolvedMode === "image"
            ? Math.max(resolvedVariantCount || 0, 1)
            : null;
        const fallbackSteps = buildLoadingSteps(
          resolvedMode,
          resolvedVariantCount
        );
        fallbackSteps.forEach((step) =>
          applyProgressEvent({
            ...step,
            stage: step.stage || step.id,
          })
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        message: aiPayload?.content || "",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mode: resolvedMode,
        imageUrl: aiPayload?.imageUrl || null,
        imageData: aiPayload?.imageData || null,
        imageMeta: aiPayload?.imageMeta || null,
        variants: aiPayload?.variants || null,
        feedback: aiPayload?.feedback || { thumbsUp: false, thumbsDown: false },
      };

      replaceLoadingMessage(assistantMessage);
      setShouldScrollToBottom(true);

      if (
        resolvedMode === "image" &&
        (assistantMessage.imageUrl ||
          (Array.isArray(assistantMessage.variants) &&
            assistantMessage.variants.length > 0))
      ) {
        try {
          await refreshUsage();
        } catch (usageError) {
          console.warn("Failed to refresh usage stats", usageError);
        }
      }
    } catch (error) {
      if (
        error?.error === "LIMIT_EXCEEDED" ||
        error?.message?.includes("LIMIT_EXCEEDED")
      ) {
        const limitInfo = error.limitInfo || {};
        const limitDisplay = limitInfo.limit
          ? `${limitInfo.current}/${limitInfo.limit}`
          : `${limitInfo.current || 0}`;
        toast.error(
          `Monthly generation limit reached (${limitDisplay}). Upgrade your plan for unlimited generations.`,
          {
            duration: 5000,
            id: "generation-limit",
          }
        );
        if (openBillingModal) {
          openBillingModal();
        }
      }

      if (error?.type === "network") {
        setError({
          type: "network",
          message: "Network error. Please check your connection.",
          chatId: chatId,
        });
      } else if (error?.status === 401) {
        toast.error("Please log in to continue", { id: "chat-feature" });
        router.push("/");
        return;
      } else if (error?.message) {
        setError({
          type: "unknown",
          message: error.message || "Failed to send message",
          chatId: chatId,
        });
      }

      const errorResponse = {
        id: `error-${Date.now()}`,
        message: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        feedback: { thumbsUp: false, thumbsDown: false },
      };

      applyProgressEvent({
        stage: "unexpected_error",
        label: "Something went wrong",
        status: "completed",
      });

      if (loadingReplaced) {
        setMessages((prev) => [...prev, errorResponse]);
      } else {
        replaceLoadingMessage(errorResponse);
      }
      setShouldScrollToBottom(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt, mode) => {
    // This will be handled by the same handleSendMessage function
    // The mode will determine which AI service to use
    await handleSendMessage(prompt, mode);
  };

  const handleEditImage = async (editData) => {
    if (!chatId) {
      toast.error("No active chat. Please start a chat first.", {
        id: "chat-feature",
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast.error("Please log in to use the image editing feature", {
        id: "chat-feature",
      });
      router.push("/");
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      message: `Edit image: ${editData.prompt}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      feedback: { thumbsUp: false, thumbsDown: false },
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setShouldScrollToBottom(true); // Scroll when sending message

    try {
      // Call API to edit image
      const response = await apiService.editImage(
        chatId,
        editData.image,
        editData.prompt,
        editData.mask
      );

      if (response.success) {
        // Add AI response with edited image
        const aiResponse = {
          id: Date.now() + 1,
          message: "",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          mode: "image-edit",
          imageUrl: response.data.imageUrl,
          imageMeta: response.data.imageMeta,
          feedback: { thumbsUp: false, thumbsDown: false },
        };

        setMessages((prev) => [...prev, aiResponse]);
        setShouldScrollToBottom(true); // Scroll when receiving response
        toast.success("Image edited successfully!", { id: "chat-feature" });
      } else {
        throw new Error(response.message || "Failed to edit image");
      }
    } catch (error) {
      toast.error(error.message || "Failed to edit image. Please try again.", {
        id: "chat-feature",
      });

      const errorResponse = {
        id: Date.now() + 1,
        message:
          "Sorry, I encountered an error editing the image. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mode: "image-edit",
        imageMeta: response.data.imageMeta,
        feedback: { thumbsUp: false, thumbsDown: false },
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to AiNDREA</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to start chatting with AI and generating images
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error fallback if there's an error (but not while loading to prevent flash)
  if (error && !isLoadingChat) {
    return (
      <div className="flex h-full flex-col bg-muted-background">
        <ErrorFallback
          error={error}
          onRetry={handleRetry}
          onClear={clearError}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col relative w-full">
      {!isLoadingChat && messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-between relative z-10 overflow-y-auto min-h-0 custom-scrollbar">
          {showWelcomeMessage && (
            <div className="max-w-5xl w-full h-full px-6 text-center flex flex-col justify-center xl:gap-6">
              <div className="mt-12">
                <div className="flex justify-center mb-6">
                  <Image
                    src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                    alt="Logo"
                    width={80}
                    height={80}
                    priority
                  />
                </div>
                <div className="max-w-2xl mx-auto mb-8">
                  {customWelcomeMessage || (
                    <>
                      <h1 className="text-2xl md:text-3xl text-foreground mb-4">
                        Hi {user?.fullName}!
                      </h1>
                      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                        What's on your mind to create today?
                      </h2>
                      <p className="text-base text-foreground mb-8">
                        Hi there! I'm AiNDREA-your creative partner. What type
                        of asset are you looking for today?
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Feature Cards - only show for dashboard */}
              {showFeatureCards && variant === "dashboard" && (
                <div className="max-w-5xl w-full">
                  <FeatureCards />
                </div>
              )}
            </div>
          )}
          {!showWelcomeMessage && (
            <div className="w-full h-full flex items-center justify-center px-6">
              <div className="text-center max-w-xl">
                <div className="flex justify-center mb-4">
                  <Image
                    src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                    alt="Logo"
                    width={60}
                    height={60}
                    priority
                  />
                </div>
                <h2 className="text-xl font-medium text-foreground mb-2">
                  Hi {user?.fullName || "there"}!
                </h2>
                <p className="text-base text-muted-foreground">
                  How can I help you today?
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat messages area */}
      {!isLoadingChat && messages.length > 0 && (
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative z-20"
        >
          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Loading older messages...</span>
              </div>
            </div>
          )}

          {/* Show message count if there are more messages */}
          {hasMoreMessages && !isLoadingMore && totalMessages > 0 && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
                Scroll up to load more ({totalMessages - messageOffset} older
                messages)
              </div>
            </div>
          )}

          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            chatId={chatId}
            onFeedbackUpdate={handleFeedbackUpdate}
            userAssets={userAssets}
            onAssetAdded={handleAssetAdded}
            onViewAssets={handleViewAssets}
          />
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Subtle loading indicator for chat switching - non-blocking */}
      {isLoadingChat && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      )}

      {/* Chat input - always visible */}
      <div className="flex-shrink-0 pb-4 pt-2 bg-transparent relative z-10">
        <ChatInput
          onSendMessage={handleSendMessage}
          onGenerateImage={handleGenerateImage}
          onEditImage={handleEditImage}
          chatMode={currentMode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}
