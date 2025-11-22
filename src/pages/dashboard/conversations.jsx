import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/userContext";
import { useRouter } from "next/router";
import ConversationsSidebar from "@/components/conversations/ConversationsSidebar";
import ConversationsContent from "@/components/conversations/ConversationsContent";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function Conversations() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get conversation ID from URL query
  useEffect(() => {
    if (router.query.conversationId) {
      setSelectedConversationId(router.query.conversationId);
    }
  }, [router.query.conversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversations(page, 20);

      if (response.success) {
        if (page === 1) {
          setConversations(response.data.conversations);
        } else {
          setConversations((prev) => [...prev, ...response.data.conversations]);
        }
        setHasMore(
          response.data.pagination.current < response.data.pagination.pages
        );
      } else {
        toast.error("Failed to load conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, page]);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.otherParticipant?.fullName?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower) ||
      conv.briefId?.projectTitle?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    // Update URL without page reload
    router.push(
      {
        pathname: router.pathname,
        query: { conversationId },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] max-w-7xl mx-auto rounded-lg overflow-hidden border border-border bg-background shadow-lg">
      {/* Left Sidebar - Conversations List (WhatsApp style) */}
      <div className="w-full lg:w-[300px] xl:w-[360px] border-r border-border bg-background overflow-hidden">
        <ConversationsSidebar
          conversations={filteredConversations}
          loading={loading}
          currentUserId={user?._id || user?.id}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Right Content - Conversation Detail */}
      <div className="flex-1 overflow-hidden bg-muted/10">
        <ConversationsContent conversationId={selectedConversationId} />
      </div>
    </div>
  );
}
