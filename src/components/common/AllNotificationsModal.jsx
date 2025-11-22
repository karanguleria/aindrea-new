import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  Info,
  X,
  MessageCircle,
  Loader2,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/userContext";

/**
 * All Notifications Modal Component
 * Displays all notifications with pagination
 */
export default function AllNotificationsModal({ isOpen, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Determine if user is a creator
  const isCreator = user?.creator === true || user?.role === "creator";

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications({
        limit: limit,
        page: pageNum,
      });

      if (response.success) {
        const newNotifications = response.data.notifications || [];
        if (append) {
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        setUnreadCount(response.data.unreadCount || 0);
        setTotal(response.data.pagination?.total || 0);
        setHasMore(
          newNotifications.length === limit &&
            pageNum * limit < (response.data.pagination?.total || 0)
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchNotifications(1, false);
    }
  }, [isOpen]);

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        const deletedNotif = notifications.find(
          (notif) => notif._id === notificationId
        );
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read and delete from backend
    try {
      // Mark as read first
      if (!notification.isRead) {
        await apiService.markNotificationAsRead(notification._id);
      }
      // Delete notification from backend
      await apiService.deleteNotification(notification._id);
    } catch (error) {
      console.error("Error handling notification click:", error);
      // Still remove from UI even if backend call fails
    }

    // Remove notification from UI
    setNotifications((prev) =>
      prev.filter((notif) => notif._id !== notification._id)
    );
    // Update unread count and total if it was unread
    if (!notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setTotal((prev) => Math.max(0, prev - 1));
    } else {
      setTotal((prev) => Math.max(0, prev - 1));
    }

    // Determine route prefix based on user type
    const routePrefix = isCreator ? "/creator" : "/dashboard";
    const briefId = notification.data?.briefId?.toString();

    // Navigate based on notification type
    if (notification.type === "new_brief" && briefId) {
      // New briefs are for creators
      router.push(`/creator/brief-details/${briefId}`);
      onClose();
    } else if (notification.type === "bid_received" && briefId) {
      // Bid received notifications are for clients
      router.push(`/dashboard/brief-details/${briefId}`);
      onClose();
    } else if (notification.type === "bid_accepted" && briefId) {
      // Bid accepted notifications are for creators
      router.push(`/creator/brief-details/${briefId}`);
      onClose();
    } else if (notification.type === "bid_rejected" && briefId) {
      // Bid rejected notifications are for creators
      router.push(`/creator/brief-details/${briefId}`);
      onClose();
    } else if (
      notification.type === "message" ||
      notification.type === "brief_message"
    ) {
      // Message notifications route to conversations
      const conversationId = notification.data?.conversationId?.toString();
      if (conversationId) {
        router.push(`${routePrefix}/conversations?conversationId=${conversationId}`);
      } else if (briefId) {
        // Fallback to brief details if no conversationId
        router.push(`${routePrefix}/brief-details/${briefId}`);
      }
      onClose();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_brief":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "bid_received":
        return <Users className="w-4 h-4 text-green-500" />;
      case "bid_accepted":
        return <Check className="w-4 h-4 text-green-500" />;
      case "bid_rejected":
        return <X className="w-4 h-4 text-red-500" />;
      case "message":
      case "brief_message":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "payment_received":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "project_completed":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-muted-background">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              All Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View and manage all your notifications
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex-1 flex flex-col overflow-hidden">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <p className="text-sm text-muted-foreground">
              {total} total notifications
            </p>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="h-8"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1 pr-4">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`relative p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 border ${
                      !notification.isRead
                        ? "bg-primary/5 border-primary/20"
                        : "border-border"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {notification.data?.amount && (
                              <Badge variant="outline" className="text-xs">
                                ${notification.data.amount}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
