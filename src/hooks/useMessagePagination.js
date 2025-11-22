import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { formatMessagesFromAPI } from "@/utils/chat/messageFormatters";

const MESSAGE_LIMIT = 10;

/**
 * Custom hook for message pagination
 * @param {string} chatId - Current chat ID
 * @param {Function} loadChat - Function to load chat messages
 * @param {Function} setMessages - Function to update messages state
 * @param {Object} messagesContainerRef - Ref to messages container element
 * @returns {Object} Pagination state and functions
 */
export const useMessagePagination = ({
  chatId,
  loadChat,
  setMessages,
  messagesContainerRef,
}) => {
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !hasMoreMessages || isLoadingMore) {
      return;
    }

    // Safety check: don't load if we've already loaded all messages
    if (messageOffset >= totalMessages) {
      setHasMoreMessages(false);
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await loadChat(chatId, MESSAGE_LIMIT, messageOffset);
      if (response && response.messages) {
        const loadedCount = response.messages.length;

        // Convert messages to frontend format
        const formattedMessages = formatMessagesFromAPI(response.messages);

        // Deduplicate messages before prepending
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = formattedMessages.filter(
            (m) => !existingIds.has(m.id)
          );

          return [...newMessages, ...prev];
        });

        // Update pagination state
        const newOffset = messageOffset + loadedCount;
        setMessageOffset(newOffset);
        setHasMoreMessages(response.pagination?.hasMore || false);
        setTotalMessages(response.pagination?.total || 0);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      toast.error("Failed to load older messages", { id: "load-more" });
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    chatId,
    hasMoreMessages,
    isLoadingMore,
    messageOffset,
    totalMessages,
    loadChat,
    setMessages,
  ]);

  // Detect scroll to top with debouncing
  useEffect(() => {
    const container = messagesContainerRef?.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      // Clear any pending scroll handling
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Debounce scroll event (wait 100ms after scroll stops)
      scrollTimeout = setTimeout(() => {
        if (container.scrollTop < 50 && hasMoreMessages && !isLoadingMore) {
          const previousScrollHeight = container.scrollHeight;
          const previousScrollTop = container.scrollTop;

          loadMoreMessages().then(() => {
            // Maintain scroll position after loading more messages
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight;
              const newScrollTop =
                previousScrollTop + (newScrollHeight - previousScrollHeight);
              container.scrollTop = newScrollTop;
            });
          });
        }
      }, 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages, messagesContainerRef]);

  // Reset pagination when chatId changes
  useEffect(() => {
    setMessageOffset(0);
    setHasMoreMessages(false);
    setIsLoadingMore(false);
    setTotalMessages(0);
  }, [chatId]);

  return {
    messageOffset,
    hasMoreMessages,
    isLoadingMore,
    totalMessages,
    loadMoreMessages,
    setMessageOffset,
    setHasMoreMessages,
    setTotalMessages,
  };
};

