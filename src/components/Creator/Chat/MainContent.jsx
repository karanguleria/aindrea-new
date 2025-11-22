import React, { useEffect } from "react";
import ChatInterface from "@/components/common/ChatInterface";
import { useChat } from "@/contexts/chatContext";
import { useRouter } from "next/router";

export default function MainContent() {
  const { currentChatId, loadChat, clearCurrentChat, setCurrentChatId } = useChat();
  const router = useRouter();

  // Clean up URL params on mount - normalize id and chatId
  // Set chatId first before cleaning URL to prevent "chat not found" error
  useEffect(() => {
    if (!router.isReady) return;
    
    const chatId = router.query.chatId || router.query.id;
    
    // If we have a chatId in URL, set it FIRST before any URL cleanup
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
    
    // Clean up URL to only have chatId (remove id if it exists and is duplicate)
    // Do this after setting the chatId to avoid race conditions
    if (chatId) {
      if (router.query.id && router.query.id === chatId && router.query.chatId) {
        // Both id and chatId exist, remove id
        router.replace(
          {
            pathname: router.pathname,
            query: { chatId: chatId },
          },
          undefined,
          { shallow: true }
        );
      } else if (router.query.id && router.query.id === chatId && !router.query.chatId) {
        // Only id exists, convert to chatId
        router.replace(
          {
            pathname: router.pathname,
            query: { chatId: chatId },
          },
          undefined,
          { shallow: true }
        );
      }
    } else if (!chatId && currentChatId) {
      // If no chatId in URL but we have one in context, clear it
      clearCurrentChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.chatId, router.query.id]);

  const handleNewChat = () => {
    // Clear current chat and messages
    clearCurrentChat();
    // Clear URL parameter to show new chat state
    router.replace("/creator/chat", undefined, { shallow: true });
  };

  // Get chatId from URL (prioritize chatId over id)
  const urlChatId = router.query.chatId || router.query.id;

  return (
    <ChatInterface
      variant="chat"
      showWelcomeMessage={false}
      showFeatureCards={false}
      onNewChat={handleNewChat}
      loadChat={loadChat}
      currentChatId={urlChatId || currentChatId}
      clearCurrentChat={clearCurrentChat}
      baseRoute="/creator" // Pass the base route for creator
    />
  );
}
