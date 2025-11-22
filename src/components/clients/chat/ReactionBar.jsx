import React from "react";
import { ThumbsUp, ThumbsDown, Copy } from "lucide-react";

export default function ReactionBar({
  isRating,
  feedback,
  onThumbsUp,
  onThumbsDown,
  canCopy,
  onCopy,
}) {
  return (
    <div className="border-t border-border mt-3 pt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onThumbsUp}
            disabled={isRating}
            className={`p-1 hover:bg-accent rounded transition-colors ${
              feedback?.thumbsUp
                ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                : "text-muted-foreground"
            } ${isRating ? "opacity-50 cursor-not-allowed" : ""}`}
            title={feedback?.thumbsUp ? "Remove thumbs up" : "Thumbs up"}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={onThumbsDown}
            disabled={isRating}
            className={`p-1 hover:bg-accent rounded transition-colors ${
              feedback?.thumbsDown
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : "text-muted-foreground"
            } ${isRating ? "opacity-50 cursor-not-allowed" : ""}`}
            title={feedback?.thumbsDown ? "Remove thumbs down" : "Thumbs down"}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
          {canCopy && (
            <button
              onClick={onCopy}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy response"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
