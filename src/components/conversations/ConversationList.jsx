import React from "react";
import { MessageCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/userContext";

const ConversationList = ({ conversations, loading, currentUserId }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Determine route prefix based on user type
  const routePrefix = user?.creator ? "/creator" : "/dashboard";
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
      <div className="space-y-4">
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
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Conversations Yet
        </h3>
        <p className="text-muted-foreground">
          Start a conversation by submitting a bid or accepting a bid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.otherParticipant;
        const unreadCount = conversation.unreadCount || 0;
        const lastMessage = conversation.lastMessage;

        return (
          <div
            key={conversation._id}
            onClick={() => router.push(`${routePrefix}/conversations?conversationId=${conversation._id}`)}
            className="block cursor-pointer"
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(otherParticipant?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {otherParticipant?.fullName || "Unknown User"}
                      </h4>
                      {lastMessage?.timestamp && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content || "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="ml-2 bg-primary text-primary-foreground"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conversation.briefId && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Brief: {conversation.briefId?.projectTitle || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;

