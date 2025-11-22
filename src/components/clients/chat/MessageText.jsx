import React from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function MessageText({ message, chatId }) {
  const router = useRouter();

  // Detect brief suggestion message
  const isBriefSuggestion = message && (
    message.includes("creative brief") || 
    message.includes("Would you like to start a creative brief") ||
    message.includes("start a creative brief")
  );

  const handleBriefRedirect = () => {
    if (chatId) {
      router.push(`/dashboard/create-new-brief?chatId=${chatId}`);
    } else {
      router.push("/dashboard/create-new-brief");
    }
  };
  const formatMessage = (text) => {
    const lines = text.split("\n");
    const formattedLines = lines.map((line, index) => {
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
              {numberedMatch[1]}
            </span>
            <div className="flex-1">
              <div
                dangerouslySetInnerHTML={{
                  __html: numberedMatch[2].replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
              />
            </div>
          </div>
        );
      }

      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
      if (boldMatch) {
        let formattedLine = line;
        boldMatch.forEach((match) => {
          const boldText = match.replace(/\*\*/g, "");
          formattedLine = formattedLine.replace(
            match,
            `<strong>${boldText}</strong>`
          );
        });
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }

      return <div key={index}>{line}</div>;
    });

    return formattedLines;
  };

  if (!message || !message.trim()) return null;

  // If it's a brief suggestion, render with a clickable button
  if (isBriefSuggestion) {
    return (
      <div className="space-y-3">
        <div className="text-sm leading-relaxed">{formatMessage(message)}</div>
        <Button
          onClick={handleBriefRedirect}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          Create Brief Now
        </Button>
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed">{formatMessage(message)}</div>
  );
}
