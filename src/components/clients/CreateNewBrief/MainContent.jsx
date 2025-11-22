import React, { useState } from "react";
import ChatSection from "@/components/modules/client/ChatSection";
import CreateNewBrief from "@/components/modules/client/CreateNewBrief";

export default function MainContent() {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex-1 bg-background flex">
      <ChatSection />
      <div className="w-[75%] p-6 overflow-y-auto max-h-[90dvh]">
        <CreateNewBrief />
      </div>
    </div>
  );
}
