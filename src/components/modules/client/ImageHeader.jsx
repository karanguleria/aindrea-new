import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chatContext";
import { useRouter } from "next/router";

export default function ImageHeader({
  title,
  buttonText,
  onButtonClick,
  onClose,
  backRoute,
}) {
  const { currentChatId } = useChat();
  const router = useRouter();

  // Detect if we're in creator or client context
  const isCreator = router.pathname.startsWith("/creator");
  const baseRoute = isCreator ? "/creator" : "/dashboard";

  // Check if we're on a revision detail page
  const isRevisionDetailPage =
    router.pathname?.includes("/revision-history/") && router.query.revisionId;

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    // If backRoute is provided, use it
    if (backRoute) {
      router.push(backRoute);
      return;
    }

    // If on revision detail page, go back to revision history
    if (isRevisionDetailPage && router.query.id) {
      const briefId = router.query.id;
      router.push(`${baseRoute}/revision-history/${briefId}`);
      return;
    }

    // Redirect to chat page with current chat ID if available
    if (currentChatId || router.query.chatId) {
      const chatId = currentChatId || router.query.chatId;
      router.push(`${baseRoute}/chat?id=${chatId}`);
    } else {
      // No chat ID, go to simple chat page
      router.push(`${baseRoute}/chat`);
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    // Default back behavior if no onButtonClick provided
    if (backRoute) {
      router.push(backRoute);
      return;
    }

    // If on revision detail page, go back to revision history
    if (isRevisionDetailPage && router.query.id) {
      const briefId = router.query.id;
      router.push(`${baseRoute}/revision-history/${briefId}`);
      return;
    }

    // Default: go back in history
    router.back();
  };

  return (
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      </div>

      {buttonText && (
        <Button
          onClick={handleButtonClick}
          variant="outline"
          className="px-6 border-0 text-primary-foreground bg-primary"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
