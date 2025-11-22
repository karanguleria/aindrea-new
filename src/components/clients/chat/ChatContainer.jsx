import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";

export function ChatContainer({
  messages = [],
  isLoading = false,
  chatId,
  onFeedbackUpdate,
  userAssets = [],
  onAssetAdded = () => {},
  onViewAssets = () => {},
}) {
  const sampleMessages = [
    {
      id: 1,
      message:
        "Hi! 👋 I'm here to help you shape your creative idea into a clear brief and match you with the right creator to bring it to life.",
      isUser: false,
      timestamp: "2:30 PM",
      feedback: { thumbsUp: false, thumbsDown: false },
    },
  ];

  const displayMessages = messages.length > 0 ? messages : sampleMessages;
  const hasLoadingMessage = displayMessages.some((msg) => msg.isLoading);

  return (
    <div className="px-6 py-6 space-y-4">
      <div className="max-w-4xl mx-auto">
        {displayMessages.map((msg, index) => {
          // Only allow rating for actual assistant messages from the database
          // Skip sample messages and user messages
          const canRate = msg.id !== 1 && !msg.isUser && chatId;
          const messageIndex = canRate ? index : null;
          const isLast = index === displayMessages.length - 1;

          isLast && console.log(msg);

          return (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              avatar={msg.avatar}
              imageUrl={msg.imageUrl}
              imageData={msg.imageData}
              imageMeta={msg.imageMeta}
              variants={msg.variants}
              files={msg.files || []}
              messageIndex={messageIndex}
              chatId={chatId}
              onFeedbackUpdate={onFeedbackUpdate}
              feedback={msg.feedback}
              isLast={isLast}
              userAssets={userAssets}
              onAssetAdded={onAssetAdded}
              onViewAssets={onViewAssets}
              isLoadingMessage={msg.isLoading}
              loadingSteps={msg.loadingSteps}
              variantCount={msg.variantCount}
            />
          );
        })}

        {/* Loading indicator */}
        {isLoading && !hasLoadingMessage && (
          <div className="flex justify-start mb-6">
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-transparent border border-border text-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Generating response...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
