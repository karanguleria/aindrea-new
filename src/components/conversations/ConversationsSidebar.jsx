import React from "react";
import { MessageCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSocket } from "@/contexts/socketContext";

const ConversationsSidebar = ({
  conversations,
  loading,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange,
}) => {
  const { isUserOnline } = useSocket();
  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
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

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Conversations Yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Start a conversation by submitting a bid or accepting a bid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted-background">
      {/* Search Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.otherParticipant;
            const unreadCount = conversation.unreadCount || 0;
            const lastMessage = conversation.lastMessage;
            const isSelected =
              selectedConversationId === conversation._id.toString();

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={
                          isSelected
                            ? "bg-primary-foreground text-primary"
                            : "bg-muted"
                        }
                      >
                        {getInitials(otherParticipant?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    {otherParticipant && isUserOnline(otherParticipant._id || otherParticipant.id) && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-semibold truncate ${
                          isSelected
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {otherParticipant?.fullName || "Unknown User"}
                      </h4>
                      {lastMessage?.timestamp && (
                        <span
                          className={`text-xs flex items-center gap-1 flex-shrink-0 ml-2 ${
                            isSelected
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {lastMessage?.content || "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className={`ml-2 flex-shrink-0 ${
                            isSelected
                              ? "bg-primary-foreground text-primary"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conversation.briefId && (
                      <p
                        className={`text-xs mt-1 truncate ${
                          isSelected
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        Brief: {conversation.briefId?.projectTitle || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConversationsSidebar;
