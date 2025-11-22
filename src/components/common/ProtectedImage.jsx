"use client";

import React, { useEffect, useRef, useState } from "react";
import { useImageProtection } from "@/hooks/useImageProtection";
import { useBillingModal } from "@/contexts/billingModalContext";
import { useAuth } from "@/contexts/userContext";
import { Lock, Download } from "lucide-react";
import apiService from "@/services/api";
import Image from "next/image";

/**
 * Protected Image Wrapper Component
 * Applies protection techniques to prevent downloads and screenshots
 * for users without paid plans
 */
export function ProtectedImage({
  children,
  className = "",
  imageUrl,
  showUpgradePrompt = true,
  allowPurchases = false,
  ...props
}) {
  const containerRef = useRef(null);
  const { shouldProtect, hasPaidPlan, isAdmin } = useImageProtection();
  const { openBillingModal } = useBillingModal();
  const { isAuthenticated, token } = useAuth();
  const [watermarkUrl, setWatermarkUrl] = useState(null);
  const [loadingWatermark, setLoadingWatermark] = useState(false);

  // Apply protection only if user doesn't have paid plan (shouldProtect already checks this)
  const needsProtection = shouldProtect && !isAdmin;

  // Fetch watermark URL from subscription
  useEffect(() => {
    // Don't fetch if not authenticated or if protection is not needed
    if (!needsProtection || !token || !isAuthenticated()) {
      // Clear watermark if user logged out
      if (!token) {
        setWatermarkUrl(null);
        setLoadingWatermark(false);
      }
      return;
    }

    const fetchWatermark = async () => {
      // Double-check authentication before making the call
      if (!token || !isAuthenticated()) {
        setWatermarkUrl(null);
        setLoadingWatermark(false);
        return;
      }

      try {
        setLoadingWatermark(true);
        const response = await apiService.getCurrentUserSubscription();
        if (response.success && response.data?.watermarkFileUrl) {
          setWatermarkUrl(response.data.watermarkFileUrl);
        }
      } catch (error) {
        console.error("Failed to fetch watermark:", error);
        
        // Handle 401 (unauthorized) - user logged out, stop trying
        if (error.status === 401) {
          setWatermarkUrl(null);
          setLoadingWatermark(false);
          return;
        }
      } finally {
        setLoadingWatermark(false);
      }
    };

    fetchWatermark();
  }, [needsProtection, token]);

  useEffect(() => {
    if (!needsProtection || !containerRef.current) return;

    const container = containerRef.current;

    // Disable right-click context menu - more aggressive approach
    const handleContextMenu = (e) => {
      // Check if the event target is within our protected container
      if (container.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Also handle on images directly (more reliable)
    const handleImageContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Find all images within the container and disable right-click
    const images = container.querySelectorAll("img");
    const imageCleanup = [];

    images.forEach((img) => {
      img.addEventListener("contextmenu", handleImageContextMenu, {
        capture: true,
      });
      // Store reference for cleanup
      imageCleanup.push({ img, handler: handleImageContextMenu });
      // Also disable on the image element directly via attribute
      img.setAttribute("oncontextmenu", "return false;");
    });

    // Disable drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Ctrl+S (Save), Ctrl+C (Copy), Ctrl+P (Print), Print Screen
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" ||
          e.key === "S" ||
          e.key === "c" ||
          e.key === "C" ||
          e.key === "p" ||
          e.key === "P")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Print Screen
      if (e.key === "PrintScreen" || (e.shiftKey && e.key === "F13")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable copy event
    const handleCopy = (e) => {
      e.preventDefault();
      e.clipboardData.setData("text/plain", "");
      return false;
    };

    // Attach event listeners
    container.addEventListener("contextmenu", handleContextMenu);
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("selectstart", handleSelectStart);
    container.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      container.removeEventListener("dragstart", handleDragStart);
      container.removeEventListener("selectstart", handleSelectStart);
      container.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);

      // Remove image event listeners
      imageCleanup.forEach(({ img, handler }) => {
        img.removeEventListener("contextmenu", handler, { capture: true });
        img.removeAttribute("oncontextmenu");
      });
    };
  }, [needsProtection]);

  // Handle overlay click to show upgrade prompt
  const handleOverlayClick = () => {
    if (showUpgradePrompt && openBillingModal) {
      openBillingModal();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        userSelect: needsProtection ? "none" : "auto",
        WebkitUserSelect: needsProtection ? "none" : "auto",
        WebkitUserDrag: needsProtection ? "none" : "auto",
        WebkitTouchCallout: needsProtection ? "none" : "auto",
      }}
      {...props}
    >
      {/* Render children with onContextMenu disabled if protection is needed */}
      {needsProtection ? (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          style={{ pointerEvents: "auto" }}
        >
          {children}
        </div>
      ) : (
        children
      )}

      {/* Protection Overlay for Free Users */}
      {needsProtection && (
        <>
          {/* Semi-transparent overlay - no blur, just watermark */}
          <div
            className={`absolute inset-0 bg-transparent z-10 ${
              allowPurchases ? "pointer-events-none" : "pointer-events-auto"
            }`}
            onClick={allowPurchases ? undefined : handleOverlayClick}
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          />

          {/* Watermark Image Overlay */}
          {watermarkUrl && (
            <div
              className="absolute inset-0 z-20 pointer-events-none flex items-start justify-end"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                padding: "clamp(0.5rem, 2vw, 1rem)",
              }}
            >
              <div 
                className="relative"
                style={{
                  width: "clamp(3rem, 15%, 6rem)",
                  height: "clamp(3rem, 15%, 6rem)",
                  minWidth: "2rem",
                  minHeight: "2rem",
                }}
              >
                <Image
                  src={watermarkUrl}
                  alt="Watermark"
                  fill
                  className="object-contain opacity-60"
                  style={{
                    objectFit: "contain",
                    mixBlendMode: "multiply",
                    pointerEvents: "none",
                  }}
                  unoptimized
                  priority={false}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                />
              </div>
            </div>
          )}

          {/* Upgrade Prompt Overlay - Only show if watermark is not available or on click */}
          {/* Hide upgrade prompt overlay when allowPurchases is true to not block purchase buttons */}
          {showUpgradePrompt && !watermarkUrl && !allowPurchases && (
            <div
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto"
              onClick={handleOverlayClick}
            >
              <div className="bg-black/80 backdrop-blur-md rounded-lg px-6 py-4 text-center max-w-sm mx-4 border border-white/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Protected Content
                    </h3>
                    <p className="text-white/80 text-sm mb-3">
                      Upgrade your plan to download and use images without
                      watermarks
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOverlayClick();
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                      <Download className="h-4 w-4" />
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
