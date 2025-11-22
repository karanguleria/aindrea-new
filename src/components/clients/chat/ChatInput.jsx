import Chat from "@/components/common/Chat";
import { useState } from "react";

export function ChatInput({
  onSendMessage,
  onGenerateImage,
  onEditImage,
  chatMode = "text",
  onModeChange,
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <div className="relative">
        <Chat
          message={message}
          setMessage={setMessage}
          chatMode={chatMode}
          onSendMessage={onSendMessage}
          onGenerateImage={onGenerateImage}
          onEditImage={onEditImage}
          onModeChange={onModeChange}
        />
      </div>
    </div>
  );
}
