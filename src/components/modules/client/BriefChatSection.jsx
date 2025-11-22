import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Unlink,
  Grid3x3,
} from "lucide-react";
import { ChatMessage } from "@/components/clients/chat/ChatMessage";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";
import { getFullImageUrl } from "@/utils/chat/imageUrlHelpers";
import MoodBoardModal from "./MoodBoardModal";

export default function BriefChatSection({
  briefId,
  chatId,
  isClient = false,
  onChatLinked,
  onChatUnlinked,
}) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [imageGenerations, setImageGenerations] = useState([]);
  const [moodBoardOpen, setMoodBoardOpen] = useState(false);

  // Fetch brief chat
  useEffect(() => {
    if (briefId && chatId) {
      fetchBriefChat();
    }
  }, [briefId, chatId]);

  const fetchBriefChat = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBriefChat(briefId);
      if (response.success) {
        setChat(response.data.chat);
        setMessages(response.data.messages || []);

        // Extract image generation attempts
        const imageMessages = (response.data.messages || []).filter(
          (msg) =>
            msg.imageUrl ||
            (msg.variants && msg.variants.length > 0) ||
            msg.mode === "image" ||
            msg.mode === "image-variation"
        );
        setImageGenerations(imageMessages);
      }
    } catch (error) {
      console.error("Error fetching brief chat:", error);
      toast.error("Failed to load chat context");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkChat = async () => {
    if (!confirm("Are you sure you want to unlink this chat from the brief?")) {
      return;
    }

    try {
      const response = await apiService.unlinkChatFromBrief(briefId);
      if (response.success) {
        toast.success("Chat unlinked successfully");
        setChat(null);
        setMessages([]);
        setImageGenerations([]);
        if (onChatUnlinked) {
          onChatUnlinked();
        }
      } else {
        toast.error("Failed to unlink chat");
      }
    } catch (error) {
      console.error("Error unlinking chat:", error);
      toast.error("Failed to unlink chat");
    }
  };

  // Extract image URL from message (handles imageUrl, variants, etc.)
  const extractImageUrl = (msg) => {
    // Try imageUrl first
    if (msg.imageUrl) {
      return msg.imageUrl;
    }
    // Try variants
    if (
      msg.variants &&
      Array.isArray(msg.variants) &&
      msg.variants.length > 0
    ) {
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
    if (
      msg.variants &&
      Array.isArray(msg.variants) &&
      msg.variants.length > 0
    ) {
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
    const optimizedFullUrl = optimizedUrl
      ? getFullImageUrl(optimizedUrl)
      : null;

    return (
      <div className="relative border border-border rounded-lg overflow-hidden group bg-muted">
        {fullUrl && !imageError ? (
          <OptimizedImage
            optimizedUrl={optimizedFullUrl}
            fallbackUrl={fullUrl}
            alt={`Generation ${idx + 1}`}
            width={200}
            height={200}
            sizes="(max-width: 768px) 50vw, 33vw"
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
        {msg.variants &&
          Array.isArray(msg.variants) &&
          msg.variants.length > 1 && (
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

  if (!chatId) {
    return null; // Don't render if no chat linked
  }

  return (
    <Card className="border-border py-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Chat Context</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoodBoardOpen(true)}
              className="flex items-center gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              View Mood Board
            </Button>
            {/* {isClient && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlinkChat}
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            )} */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {chat && (
          <p className="text-sm text-muted-foreground mt-2">{chat.title}</p>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chat context...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages in this chat</p>
            </div>
          ) : (
            <>
              {imageGenerations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      Image Generation Attempts ({imageGenerations.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageGenerations.map((msg, idx) => (
                      <ImageGenerationItem key={idx} msg={msg} idx={idx} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}

      {/* Mood Board Modal */}
      <MoodBoardModal
        isOpen={moodBoardOpen}
        onClose={() => setMoodBoardOpen(false)}
        briefId={briefId}
        chatId={chatId}
      />
    </Card>
  );
}
