import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import apiService from "@/services/api";

/**
 * Custom hook for managing user assets
 * @param {Object} options - Hook options
 * @param {Object} options.user - Current user object
 * @param {boolean} options.authLoading - Authentication loading state
 * @param {string} options.baseRoute - Base route for navigation (default: "/dashboard")
 * @returns {Object} User assets state and handlers
 */
export const useUserAssets = ({
  user,
  authLoading,
  baseRoute = "/dashboard",
}) => {
  const [userAssets, setUserAssets] = useState([]);
  const router = useRouter();

  const fetchUserAssets = useCallback(async () => {
    try {
      if (!user) {
        return;
      }
      const response = await apiService.getUserAssets();
      if (response?.success && Array.isArray(response.data?.assets)) {
        setUserAssets(response.data.assets);
      }
    } catch (error) {
      console.error("Failed to fetch user assets:", error);
    }
  }, [user]);

  const handleAssetAdded = useCallback((license) => {
    if (!license) return;

    const imageUrl =
      license?.assetMetadata?.imageUrl ||
      license?.imageUrl ||
      license?.assetMetadata?.downloadUrl ||
      null;

    const assetRecord = {
      id: license?.id || license?._id || imageUrl || Date.now().toString(),
      assetId: license?.assetId,
      imageUrl,
      licenseType: license?.licenseType,
      name:
        license?.assetMetadata?.prompt ||
        license?.assetMetadata?.originalName ||
        license?.name ||
        `Asset ${license?.id || license?._id || ""}`.trim(),
    };

    if (!assetRecord.imageUrl && !assetRecord.assetId) {
      return;
    }

    setUserAssets((prev) => {
      const exists = prev.some(
        (asset) =>
          (asset.id && assetRecord.id && asset.id === assetRecord.id) ||
          (asset.imageUrl &&
            assetRecord.imageUrl &&
            asset.imageUrl === assetRecord.imageUrl)
      );
      if (exists) {
        return prev;
      }
      return [assetRecord, ...prev];
    });
  }, []);

  const handleViewAssets = useCallback(() => {
    if (!router) return;
    const normalizedBaseRoute = baseRoute.endsWith("/")
      ? baseRoute.slice(0, -1)
      : baseRoute;
    router.push(`${normalizedBaseRoute}/my-assets`);
  }, [router, baseRoute]);

  // Fetch assets when user is available
  useEffect(() => {
    if (!authLoading && user) {
      fetchUserAssets();
    }
  }, [authLoading, user, fetchUserAssets]);

  // Clear assets when user logs out
  useEffect(() => {
    if (!authLoading && !user) {
      setUserAssets([]);
    }
  }, [authLoading, user]);

  // Listen for assets updated events
  useEffect(() => {
    const handleAssetsUpdatedEvent = () => {
      fetchUserAssets();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("assetsUpdated", handleAssetsUpdatedEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("assetsUpdated", handleAssetsUpdatedEvent);
      }
    };
  }, [fetchUserAssets]);

  return {
    userAssets,
    handleAssetAdded,
    handleViewAssets,
    fetchUserAssets,
  };
};
