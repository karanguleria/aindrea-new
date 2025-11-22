"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useChat } from "@/contexts/chatContext";

/**
 * Centralized hook for managing chat state across all pages
 * Handles synchronization between URL query params, context, and local state
 *
 * @param {Object} options - Configuration options
 * @param {string} options.variant - Page variant: 'dashboard', 'chat', 'split', 'mobile'
 * @param {boolean} options.autoSync - Whether to automatically sync URL and context (default: true)
 * @param {boolean} options.loadFromUrl - Whether to load chatId from URL on mount (default: true)
 * @returns {Object} Chat state and control functions
 */
export function useChatState({
  variant = "dashboard",
  autoSync = true,
  loadFromUrl = true,
} = {}) {
  const router = useRouter();
  const { currentChatId, setCurrentChatId, loadChat } = useChat();
  const [localChatId, setLocalChatId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isNavigatingRef = useRef(false);
  const lastSyncedChatIdRef = useRef(null);

  // Normalize chatId from URL (handle array case)
  const normalizeChatId = useCallback((value) => {
    if (Array.isArray(value)) {
      return value[0] || null;
    }
    return value || null;
  }, []);

  // Get chatId from URL
  const getUrlChatId = useCallback(() => {
    if (!router.isReady) return null;

    // Check if we're on a brief-details, revision-history, or bids page
    // On these pages, router.query.id is the brief ID, not a chat ID
    const isBriefDetailsPage =
      router.pathname?.includes("/brief-details/") ||
      router.pathname?.includes("/revision-history/");
    const isBidsPage = router.pathname?.includes("/bids/");

    const urlChatId = normalizeChatId(
      router.query.chatId || (!isBriefDetailsPage && !isBidsPage ? router.query.id : null)
    );

    return urlChatId;
  }, [
    router.isReady,
    router.query.chatId,
    router.query.id,
    router.pathname,
    normalizeChatId,
  ]);

  // Update URL with chatId (shallow routing)
  const updateUrl = useCallback(
    (chatId) => {
      if (!router.isReady || isNavigatingRef.current) return;

      const currentPath = router.pathname;
      const urlChatId = getUrlChatId();

      // Don't add chatId to brief-details, revision-history, or bids pages
      const isBriefDetailsPage =
        currentPath?.includes("/brief-details/") ||
        currentPath?.includes("/revision-history/");
      const isBidsPage = currentPath?.includes("/bids/");

      if (isBriefDetailsPage || isBidsPage) {
        // On these pages, don't modify the URL - the id parameter is for the brief/bid, not chat
        return;
      }

      if (chatId && chatId !== urlChatId) {
        // Add or update chatId in URL
        router.replace(
          {
            pathname: currentPath,
            query: { ...router.query, chatId },
          },
          undefined,
          { shallow: true }
        );
        lastSyncedChatIdRef.current = chatId;
      } else if (!chatId && urlChatId) {
        // Remove chatId from URL
        const { chatId: _, id: __, ...otherQuery } = router.query;
        router.replace(
          {
            pathname: currentPath,
            query: otherQuery,
          },
          undefined,
          { shallow: true }
        );
        lastSyncedChatIdRef.current = null;
      }
    },
    [router, getUrlChatId]
  );

  // Get the effective chatId (priority: URL > local > context)
  const getEffectiveChatId = useCallback(() => {
    const urlChatId = getUrlChatId();
    return urlChatId || localChatId || currentChatId;
  }, [getUrlChatId, localChatId, currentChatId]);

  // Set chatId and sync to URL and context
  const setChatId = useCallback(
    (chatId, options = {}) => {
      const { syncUrl = true, syncContext = true } = options;

      // Update local state
      if (chatId !== localChatId) {
        setLocalChatId(chatId);
      }

      // Sync to context
      if (syncContext && chatId !== currentChatId) {
        setCurrentChatId(chatId);
      }

      // Sync to URL
      if (syncUrl && autoSync) {
        updateUrl(chatId);
      }
    },
    [localChatId, currentChatId, setCurrentChatId, autoSync, updateUrl]
  );

  // Initialize: Load chatId from URL on mount and when URL changes
  useEffect(() => {
    if (!router.isReady || !loadFromUrl) return;

    const urlChatId = getUrlChatId();

    // If URL has chatId, always use it as source of truth (even if already initialized)
    if (urlChatId) {
      if (urlChatId !== localChatId) {
        setLocalChatId(urlChatId);
      }
      if (urlChatId !== currentChatId) {
        setCurrentChatId(urlChatId);
      }
    } else if (!isInitialized) {
      // Only do these on initial mount (not on URL changes)
      if (currentChatId && variant === "dashboard") {
        // Dashboard: If context has chatId but URL doesn't, add it to URL
        // This handles the case where user created a chat and we need to persist it
        updateUrl(currentChatId);
        setLocalChatId(currentChatId);
      } else if (currentChatId) {
        // Other variants: Use context chatId as local state
        setLocalChatId(currentChatId);
      }
    }

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [
    router.isReady,
    loadFromUrl,
    isInitialized,
    getUrlChatId,
    currentChatId,
    setCurrentChatId,
    variant,
    updateUrl,
    localChatId,
    router.query.chatId,
    router.query.id,
    router.pathname,
  ]);

  // Auto-sync: Keep URL, context, and local state in sync
  // Use ref to track last synced values to prevent unnecessary updates
  const lastUrlChatIdRef = useRef(null);
  const lastEffectiveChatIdRef = useRef(null);
  const lastPathnameRef = useRef(null);
  const isUpdatingRef = useRef(false); // Prevent recursive updates

  // Check if current path is a dashboard page that should preserve chatId
  const shouldPreserveChatId = useCallback(() => {
    if (!router.pathname) return false;
    // Preserve chatId on dashboard pages (not on auth pages, chat page, brief-details, or bids pages)
    const isDashboardPage =
      router.pathname.startsWith("/dashboard") ||
      router.pathname.startsWith("/creator");
    const isChatPage =
      router.pathname === "/dashboard/chat" ||
      router.pathname === "/creator/chat";
    const isBriefDetailsPage =
      router.pathname?.includes("/brief-details/") ||
      router.pathname?.includes("/revision-history/");
    const isBidsPage = router.pathname?.includes("/bids/");
    return isDashboardPage && !isChatPage && !isBriefDetailsPage && !isBidsPage;
  }, [router.pathname]);

  useEffect(() => {
    if (!autoSync || !router.isReady) return;
    if (isNavigatingRef.current) return;
    if (isUpdatingRef.current) return; // Prevent recursive updates

    const urlChatId = getUrlChatId();
    const effectiveChatId = getEffectiveChatId();
    const preserveChatId = shouldPreserveChatId();
    const pathnameChanged = router.pathname !== lastPathnameRef.current;

    // Skip if nothing changed
    if (
      urlChatId === lastUrlChatIdRef.current &&
      effectiveChatId === lastEffectiveChatIdRef.current &&
      !pathnameChanged
    ) {
      return;
    }

    // Set updating flag to prevent recursive updates
    isUpdatingRef.current = true;

    try {
      // If URL changed, update local and context (this handles navigation to pages with chatId in URL)
      if (urlChatId && urlChatId !== effectiveChatId) {
        // Only update if actually different to prevent unnecessary re-renders
        if (urlChatId !== localChatId) {
          setLocalChatId(urlChatId);
        }
        if (urlChatId !== currentChatId) {
          setCurrentChatId(urlChatId);
        }
        lastSyncedChatIdRef.current = urlChatId;
        lastUrlChatIdRef.current = urlChatId;
        lastEffectiveChatIdRef.current = urlChatId;
      }
      // If local/context changed and URL doesn't have it, update URL
      else if (
        effectiveChatId &&
        effectiveChatId !== urlChatId &&
        effectiveChatId !== lastSyncedChatIdRef.current
      ) {
        updateUrl(effectiveChatId);
        lastUrlChatIdRef.current = urlChatId;
        lastEffectiveChatIdRef.current = effectiveChatId;
      }
      // If navigating to a dashboard page and we have a chatId in URL, preserve it
      else if (pathnameChanged && urlChatId && preserveChatId) {
        // Keep the chatId in URL and sync to local/context only if different
        if (urlChatId !== effectiveChatId) {
          if (urlChatId !== localChatId) {
            setLocalChatId(urlChatId);
          }
          if (urlChatId !== currentChatId) {
            setCurrentChatId(urlChatId);
          }
        }
        lastSyncedChatIdRef.current = urlChatId;
        lastUrlChatIdRef.current = urlChatId;
        lastEffectiveChatIdRef.current = urlChatId || effectiveChatId;
      }
      // If chatId was explicitly cleared (not just navigating), remove from URL
      else if (!effectiveChatId && urlChatId && !preserveChatId) {
        updateUrl(null);
        lastUrlChatIdRef.current = null;
        lastEffectiveChatIdRef.current = null;
      } else {
        // Update refs even if no action taken
        lastUrlChatIdRef.current = urlChatId;
        lastEffectiveChatIdRef.current = effectiveChatId;
      }

      lastPathnameRef.current = router.pathname;
    } finally {
      // Reset updating flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [
    autoSync,
    router.isReady,
    router.query.chatId,
    router.query.id,
    router.pathname,
    getUrlChatId,
    getEffectiveChatId,
    currentChatId,
    setCurrentChatId,
    updateUrl,
    localChatId,
    shouldPreserveChatId,
  ]);

  // Handle route changes
  useEffect(() => {
    if (!router.events) return;

    const handleRouteChangeStart = () => {
      isNavigatingRef.current = true;
    };

    const handleRouteChangeComplete = () => {
      isNavigatingRef.current = false;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  // Clear chatId
  const clearChatId = useCallback(() => {
    setLocalChatId(null);
    setCurrentChatId(null);
    if (autoSync) {
      updateUrl(null);
    }
  }, [setCurrentChatId, autoSync, updateUrl]);

  const effectiveChatId = getEffectiveChatId();

  return {
    chatId: effectiveChatId,
    localChatId,
    setChatId,
    clearChatId,
    isInitialized,
    isNavigating: isNavigatingRef.current,
  };
}
