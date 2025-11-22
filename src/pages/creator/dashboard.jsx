import Dashboard from "@/components/modules/creator/Dashboard";
import SplitChatLayout from "@/components/clients/Dashboard/SplitChatLayout";
import React, { useEffect } from "react";
import { useChat } from "@/contexts/chatContext";

export default function CreatorDashboard() {
  const { setCurrentChatId, currentChatId } = useChat();

  // Clear chat when on main dashboard page
  useEffect(() => {
    if (currentChatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId, setCurrentChatId]);

  return (
    <SplitChatLayout>
      <Dashboard />
    </SplitChatLayout>
  );
}
