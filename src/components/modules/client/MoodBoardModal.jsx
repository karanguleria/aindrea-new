import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/clients/chat/ChatMessage";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";
import { getFullImageUrl } from "@/utils/chat/imageUrlHelpers";

/**
 * Mood Board Modal Component
 * Displays the full chat history of a connected chat
 */
export default function MoodBoardModal({ isOpen, onClose, briefId, chatId }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageGenerations, setImageGenerations] = useState([]);

  // Fetch chat history
  useEffect(() => {
    if (isOpen && briefId && chatId) {
      fetchChatHistory();
    }
  }, [isOpen, briefId, chatId]);

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBriefChat(briefId);
      if (response.success) {
        setChat(response.data.chat);
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);

        // Extract image generation attempts
        const imageMessages = fetchedMessages.filter(
          (msg) =>
            msg.imageUrl ||
            (msg.variants && msg.variants.length > 0) ||
            msg.mode === "image" ||
            msg.mode === "image-variation"
        );
        setImageGenerations(imageMessages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  // Extract image URL from message (handles imageUrl, variants, etc.)
  const extractImageUrl = (msg) => {
    // Try imageUrl first
    if (msg.imageUrl) {
      return msg.imageUrl;
    }
    // Try variants
    if (msg.variants && Array.isArray(msg.variants) && msg.variants.length > 0) {
      const firstVariant = msg.variants[0];
      return typeof firstVariant === "object" ? firstVariant.url : firstVariant;
    }
    return null;
  };

  // Get optimized URL from message data
  const getOptimizedUrl = (msg) => {
    if (msg.imageData?.optimizedUrl) {
      return msg.imageData.optimizedUrl;
    }
    if (msg.variants && Array.isArray(msg.variants) && msg.variants.length > 0) {
      const firstVariant = msg.variants[0];
      if (typeof firstVariant === "object" && firstVariant.optimizedUrl) {
        return firstVariant.optimizedUrl;
      }
    }
    return null;
  };

  // Image generation item component with error handling
  const ImageGenerationItem = ({ msg, idx }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = extractImageUrl(msg);
    const fullUrl = getFullImageUrl(imageUrl);
    const optimizedUrl = getOptimizedUrl(msg);
    const optimizedFullUrl = optimizedUrl ? getFullImageUrl(optimizedUrl) : null;

    return (
      <div className="relative border border-border rounded-lg overflow-hidden group bg-muted">
        {fullUrl && !imageError ? (
          <OptimizedImage
            optimizedUrl={optimizedFullUrl}
            fallbackUrl={fullUrl}
            alt={`Generation ${idx + 1}`}
            width={200}
            height={200}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-32 object-cover"
            onError={() => {
              console.error(`Failed to load image ${idx + 1}:`, fullUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {msg.variants && Array.isArray(msg.variants) && msg.variants.length > 1 && (
          <Badge className="absolute top-2 right-2 bg-primary/80 text-white z-10">
            {msg.variants.length} variants
          </Badge>
        )}
        {msg.content && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 line-clamp-2">
            {msg.content.substring(0, 100)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Mood Board - {chat?.title || "Chat History"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View the complete chat history and image generation attempts
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages in this chat</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Image Generation History Section */}
              {imageGenerations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      Image Generation Attempts ({imageGenerations.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageGenerations.map((msg, idx) => (
                      <ImageGenerationItem key={idx} msg={msg} idx={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Conversation</h4>
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg.content}
                      isUser={msg.role === "user"}
                      timestamp={msg.timestamp}
                      imageUrl={msg.imageUrl}
                      imageData={msg.imageData}
                      imageMeta={msg.imageMeta}
                      variants={msg.variants}
                      files={msg.files}
                      messageIndex={null} // Disable rating in mood board
                      chatId={chatId}
                      isLast={index === messages.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
