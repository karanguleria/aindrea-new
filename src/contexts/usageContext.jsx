"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/userContext";
import apiService from "@/services/api";
import toast from "react-hot-toast";

const UsageContext = createContext();

export function UsageProvider({ children }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [usage, setUsage] = useState({
    monthlyGenerations: 0,
    maxMonthlyGenerations: null, // null = unlimited
    watermarkFreeExportsUsed: 0,
    maxWatermarkFreeExports: null, // null = unlimited or no watermark-free exports
    remainingGenerations: null,
    remainingWatermarkFreeExports: null,
  });
  const [loading, setLoading] = useState(true);

  // Routes that don't require usage API call (auth pages)
  const authRoutes = [
    "/",
    "/client-signup",
    "/creator-signup",
    "/client-profile-setup",
    "/creator-profile-setup",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if current route is an auth route
  const isAuthRoute = () => {
    if (typeof window === "undefined" || !router.pathname) return false;
    return authRoutes.includes(router.pathname);
  };

  // Check if we should fetch usage
  const shouldFetchUsage = () => {
    // Don't fetch if on auth routes
    if (isAuthRoute()) {
      return false;
    }
    // Don't fetch if not authenticated (no token)
    if (!token || !isAuthenticated()) {
      return false;
    }
    return true;
  };

  // Fetch usage stats
  const fetchUsage = async () => {
    // Skip if we shouldn't fetch usage
    if (!shouldFetchUsage()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getUserUsage();
      if (response.success && response.data) {
        const { usage: usageData, limits, remaining } = response.data;
        setUsage({
          monthlyGenerations: usageData?.monthlyGenerations || 0,
          maxMonthlyGenerations: limits?.maxMonthlyGenerations,
          watermarkFreeExportsUsed: usageData?.watermarkFreeExportsUsed || 0,
          maxWatermarkFreeExports: limits?.maxWatermarkFreeExports,
          remainingGenerations: remaining?.monthlyGenerations,
          remainingWatermarkFreeExports: remaining?.watermarkFreeExports,
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      
      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        setLoading(false);
        return;
      }
      
      // Don't show toast on initial load failure
      if (!loading) {
        toast.error("Failed to fetch usage stats");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user can generate images
  const checkCanGenerate = () => {
    // If unlimited (null), always allow
    if (usage.maxMonthlyGenerations === null) {
      return true;
    }
    // Check if remaining generations > 0
    return (
      (usage.remainingGenerations ??
        usage.maxMonthlyGenerations - usage.monthlyGenerations) > 0
    );
  };

  // Check if user can export without watermark
  const checkCanExportWatermarkFree = () => {
    // If no limit (null) or unlimited, allow
    if (usage.maxWatermarkFreeExports === null) {
      return true; // ENTERPRISE or no watermark-free exports available
    }
    // Check if remaining exports > 0
    return (
      (usage.remainingWatermarkFreeExports ??
        usage.maxWatermarkFreeExports - usage.watermarkFreeExportsUsed) > 0
    );
  };

  // Refresh usage stats
  const refreshUsage = async () => {
    await fetchUsage();
  };

  // Initial fetch and refetch on route/token changes
  useEffect(() => {
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, token]);

  const value = {
    usage,
    loading,
    checkCanGenerate,
    checkCanExportWatermarkFree,
    refreshUsage,
    // Helper getters
    monthlyGenerations: usage.monthlyGenerations,
    maxMonthlyGenerations: usage.maxMonthlyGenerations,
    watermarkFreeExportsUsed: usage.watermarkFreeExportsUsed,
    maxWatermarkFreeExports: usage.maxWatermarkFreeExports,
    remainingGenerations: usage.remainingGenerations,
    remainingWatermarkFreeExports: usage.remainingWatermarkFreeExports,
    canGenerate: checkCanGenerate(),
    canExportWatermarkFree: checkCanExportWatermarkFree(),
  };

  return (
    <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
  );
}

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
};
