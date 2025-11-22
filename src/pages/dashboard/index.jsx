import MainContent from "@/components/clients/Dashboard/MainContent";
import React from "react";

export default function DashboardPage() {
  // Dashboard page no longer clears chatId - it allows chat continuation
  // Chat state is managed by useChatState hook in ChatInterface
  return <MainContent />;
}
