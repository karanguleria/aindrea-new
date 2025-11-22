import React from "react";
import ChatInterface from "@/components/common/ChatInterface";
import { useRouter } from "next/router";

export default function MainContent() {
  const router = useRouter();

  const handleNewChat = () => {
    // Clear URL parameter to show new chat state
    // Chat state is managed by useChatState hook in ChatInterface
    router.replace("/dashboard/chat", undefined, { shallow: true });
  };

  return (
    <ChatInterface
      variant="chat"
      showWelcomeMessage={false}
      showFeatureCards={false}
      onNewChat={handleNewChat}
      baseRoute="/dashboard"
    />
  );
}
