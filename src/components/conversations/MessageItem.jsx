import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import OptimizedImage from "@/components/common/OptimizedImage";

const MessageItem = ({ message, isMyMessage, otherParticipant }) => {
  const formatTime = (date) => {
    if (!date) return "";
    return format(new Date(date), "h:mm a");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isRead = message.readBy && message.readBy.length > 1;

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isMyMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isMyMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {getInitials(otherParticipant?.fullName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isMyMessage ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 ${
            isMyMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, idx) => (
                <div key={idx} className="space-y-1">
                  {attachment.type?.startsWith("image/") ? (
                    <OptimizedImage
                      optimizedUrl={attachment.optimizedUrl}
                      fallbackUrl={attachment.url}
                      alt={attachment.name}
                      width={800}
                      height={800}
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline break-all"
                    >
                      {attachment.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
            isMyMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isMyMessage && (
            <span>
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
