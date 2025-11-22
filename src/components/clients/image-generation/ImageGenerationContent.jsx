import { useState, useEffect, useRef } from "react";
import { ImageGenerationContainer } from "./ImageGenerationContainer";
import { ImageGenerationInput } from "./ImageGenerationInput";
import apiService from "@/services/api";
import toast from "react-hot-toast";
// No authentication needed for live chat

export default function ImageGenerationContent() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const imagesEndRef = useRef(null);
  // No authentication or routing needed for live chat

  const scrollToBottom = () => {
    imagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [images]);

  // No need to create chat or load from database - this is live chat only

  const handleGenerateImage = async (prompt) => {
    if (!prompt.trim()) return;

    // Live chat - no database operations needed

    const userMessage = {
      id: Date.now(),
      message: `Generate image: ${prompt}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setImages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiService.generateImage(
        prompt,
        "standard",
        "photographic",
        "gemini"
      );

      const imageMessage = {
        id: Date.now() + 1,
        message: "Here's your generated image:",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        imageUrl: response.data?.imageUrl || response.data?.url,
        imageData: response.data,
      };

      setImages((prev) => [...prev, imageMessage]);
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.", { id: "image-generation" });

      const errorResponse = {
        id: Date.now() + 1,
        message:
          "Sorry, I couldn't generate the image. Please try again with a different prompt.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setImages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Live chat - no authentication required

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <ImageGenerationContainer images={images} isLoading={isLoading} />
        <div ref={imagesEndRef} />
      </div>
      <div className="flex-shrink-0 py-6 bg-background border-t border-border">
        <ImageGenerationInput onGenerateImage={handleGenerateImage} />
      </div>
    </div>
  );
}
