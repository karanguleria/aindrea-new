import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  Info,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import AllNotificationsModal from "./AllNotificationsModal";
import { useAuth } from "@/contexts/userContext";
import { useSocket } from "@/contexts/socketContext";

const NotificationDropdown = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [allNotificationsModalOpen, setAllNotificationsModalOpen] =
    useState(false);
  const notificationTimeoutRef = useRef(null);

  // Determine if user is a creator
  const isCreator = user?.creator === true || user?.role === "creator";

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("Fetching notifications...");
      const response = await apiService.getNotifications({
        limit: 10, // Show last 10 in dropdown
        page: 1,
      });

      console.log("Notification response:", response);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        console.log(
          `Loaded ${response.data.notifications.length} notifications, ${response.data.unreadCount} unread`
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
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
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotif = notifications.find(
          (notif) => notif._id === notificationId
        );
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
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
    // Update unread count if it was unread
    if (!notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Determine route prefix based on user type
    const routePrefix = isCreator ? "/creator" : "/dashboard";
    const briefId = notification.data?.briefId?.toString();

    // Navigate based on notification type
    if (notification.type === "new_brief" && briefId) {
      // New briefs are for creators
      router.push(`/creator/brief-details/${briefId}`);
    } else if (notification.type === "bid_received" && briefId) {
      // Bid received notifications are for clients
      router.push(`/dashboard/brief-details/${briefId}`);
    } else if (notification.type === "bid_accepted" && briefId) {
      // Bid accepted notifications are for creators
      router.push(`/creator/brief-details/${briefId}`);
    } else if (notification.type === "bid_rejected" && briefId) {
      // Bid rejected notifications are for creators
      router.push(`/creator/brief-details/${briefId}`);
    } else if (
      notification.type === "message" ||
      notification.type === "brief_message"
    ) {
      // Message notifications route to conversations
      const conversationId = notification.data?.conversationId?.toString();
      if (conversationId) {
        router.push(
          `${routePrefix}/conversations?conversationId=${conversationId}`
        );
      } else if (briefId) {
        // Fallback to brief details if no conversationId
        router.push(`${routePrefix}/brief-details/${briefId}`);
      }
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

  // Get notification priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
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

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Listen for real-time notification updates via socket
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const handleNewNotification = (notification) => {
      console.log("Received new notification:", notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep only latest 10

      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationDeleted = (data) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== data.notificationId)
      );
    };

    const handleNotificationsRead = () => {
      // Refresh to get updated counts
      fetchNotifications();
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification_deleted", handleNotificationDeleted);
    socket.on("notifications_read", handleNotificationsRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_deleted", handleNotificationDeleted);
      socket.off("notifications_read", handleNotificationsRead);
    };
  }, [socket, isConnected, user]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={5}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
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
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
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
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <div
                            className={`w-2 h-2 rounded-full ${getPriorityColor(
                              notification.priority
                            )}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setIsOpen(false);
                  setAllNotificationsModalOpen(true);
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={allNotificationsModalOpen}
        onClose={() => setAllNotificationsModalOpen(false)}
      />
    </DropdownMenu>
  );
};

export default NotificationDropdown;
