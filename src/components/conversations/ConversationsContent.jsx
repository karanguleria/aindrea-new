import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/userContext";
import ConversationDetail from "./ConversationDetail";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import apiService from "@/services/api";
import toast from "react-hot-toast";

const ConversationsContent = ({ conversationId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation();
    } else {
      setConversation(null);
      setLoading(false);
    }
  }, [conversationId, user]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversationById(conversationId);

      if (response.success) {
        setConversation(response.data.conversation);
      } else {
        toast.error("Failed to load conversation");
        setConversation(null);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load conversation");
      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            Select a conversation
          </h2>
          <p className="text-muted-foreground">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <p className="text-muted-foreground">
            The conversation you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <Card className="h-full flex flex-col border-0 shadow-none py-0">
        <ConversationDetail
          conversationId={conversationId}
          conversation={conversation}
          otherParticipant={conversation.otherParticipant}
        />
      </Card>
    </div>
  );
};

export default ConversationsContent;
