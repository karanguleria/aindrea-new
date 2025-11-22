import React from "react";
import ChatInterface from "@/components/common/ChatInterface";

export default function MainContent() {
  return (
    <ChatInterface 
      variant="dashboard"
      showWelcomeMessage={true}
      showFeatureCards={true}
    />
  );
}