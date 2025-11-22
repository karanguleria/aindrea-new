import ImageGenerationChat from "@/components/common/ImageGenerationChat";
import { useState } from "react";

export function ImageGenerationInput({ onGenerateImage }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onGenerateImage?.(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <form onSubmit={handleSubmit} className="relative">
        <ImageGenerationChat
          message={message}
          setMessage={setMessage}
          onGenerateImage={onGenerateImage}
        />
      </form>
    </div>
  );
}
