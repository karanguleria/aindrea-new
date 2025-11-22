"use client";

import {
  Settings,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Monitor,
  User,
  CreditCard,
  LogOut,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/userContext";
import { useChat } from "@/contexts/chatContext";
import { useProfileModal } from "@/contexts/profileModalContext";
import { useBillingModal } from "@/contexts/billingModalContext";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import { LibraryModal } from "@/components/common/LibraryModal";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import { useState, useEffect } from "react";

export function Header({ onToggleSidebar, isTransparent = false }) {
  const { logout, user } = useAuth();
  const { clearAllChatData } = useChat();
  const { theme, resolvedTheme, changeTheme } = useTheme();
  const { isProfileModalOpen, openProfileModal, closeProfileModal } =
    useProfileModal();
  const { openBillingModal } = useBillingModal();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const handleLogout = async () => {
    // Clear chat data first (before logout clears token)
    clearAllChatData();
    // Then logout (which will redirect)
    logout();
  };

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await apiService.getCart();
        const items = response.data?.items || [];
        setCartCount(items.length);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Fetch library count
  useEffect(() => {
    const fetchLibraryCount = async () => {
      try {
        const response = await apiService.getLibrary(1, 0);
        if (response.success && response.data) {
          setLibraryCount(
            response.data.total || response.data.items?.length || 0
          );
        }
      } catch (error) {
        console.error("Error fetching library count:", error);
      }
    };

    fetchLibraryCount();

    // Listen for library updates
    const handleLibraryUpdate = () => {
      fetchLibraryCount();
    };
    window.addEventListener("libraryUpdated", handleLibraryUpdate);

    return () => {
      window.removeEventListener("libraryUpdated", handleLibraryUpdate);
    };
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    return user?.fullName || "User";
  };

  // Get display email
  const getDisplayEmail = () => {
    return user?.email || "user@example.com";
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  };

  // Handle cart navigation based on user role
  const handleCartClick = () => {
    const isCreator = router.pathname.startsWith("/creator");
    const targetPath = isCreator
      ? "/creator/image-selection-canvas"
      : "/dashboard/image-selection-canvas";
    router.push(targetPath);
  };

  return (
    <div
      className={`flex items-center border-b border-border justify-between lg:justify-end px-6 py-2 gap-4 transition-all duration-200 ${
        isTransparent
          ? "header-glass-effect0"
          : "bg-background/95 backdrop-blur-sm"
      }`}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors"
            >
              {getThemeIcon()}
              <span className="hidden sm:inline text-sm font-medium">
                {getThemeLabel()}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 backdrop-blur-md border-border shadow-lg rounded-xl"
          >
            <DropdownMenuItem
              onClick={() => changeTheme("light")}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-lg"
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === "light" && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeTheme("dark")}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-lg"
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeTheme("system")}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-lg"
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
              {theme === "system" && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Library Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors relative"
          onClick={() => setIsLibraryModalOpen(true)}
        >
          <Heart className="h-5 w-5" />
          {libraryCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {libraryCount > 99 ? "99+" : libraryCount}
            </span>
          )}
        </Button>

        {/* Cart Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors relative"
          onClick={handleCartClick}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-0 text-foreground hover:bg-accent/50 rounded-xl transition-colors min-h-max"
            >
              <Avatar className="h-8 w-8 ring-2 ring-border/50">
                <AvatarImage src={user?.avatar || user?.profileImage} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left py-2">
                <div className="text-sm font-medium">{getDisplayName()}</div>
                <div className="text-xs text-muted-foreground">
                  {getDisplayEmail()}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-background/95 backdrop-blur-md border-border shadow-lg rounded-xl"
          >
            <div className="px-3 py-2 border-b border-border/50">
              <div className="text-sm font-medium">{getDisplayName()}</div>
              <div className="text-xs text-muted-foreground">
                {getDisplayEmail()}
              </div>
            </div>
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 mt-1 cursor-pointer hover:bg-accent/50 rounded-lg"
              onClick={openProfileModal}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-lg"
              onClick={openBillingModal}
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-lg text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Library Modal */}
      <LibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
      />
    </div>
  );
}
