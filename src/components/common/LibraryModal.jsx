"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Download,
  ShoppingCart,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useUsage } from "@/contexts/usageContext";
import { useAuth } from "@/contexts/userContext";
import OptimizedImage from "@/components/common/OptimizedImage";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import { Separator } from "@/components/ui/separator";

export function LibraryModal({ isOpen, onClose }) {
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [itemToRemove, setItemToRemove] = useState(null);
  const router = useRouter();
  const { canExportWatermarkFree, refreshUsage } = useUsage();
  const { user } = useAuth();

  // Check if user is on free trial (free plan)
  const isFreeTrial =
    user?.subscription?.plan === "free" || !user?.subscription?.plan;

  // Get backend URL
  const getBackendUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl && typeof window !== "undefined") {
      const currentHost = window.location.hostname;
      if (currentHost.includes("aindrea.ai")) {
        return "https://apis.aindrea.ai";
      }
    }
    return apiUrl || "http://localhost:5012";
  };

  // Create full image URL
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendUrl = getBackendUrl();
    return `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  const getOptimizedImageUrl = (item) => {
    const candidate =
      item?.imageData?.optimizedUrl ||
      item?.optimizedUrl ||
      item?.variantData?.optimizedUrl;
    if (!candidate || typeof candidate !== "string") return null;
    return getFullImageUrl(candidate);
  };

  // Fetch library items
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLibrary(100, 0);
      if (response.success && Array.isArray(response.data?.items)) {
        setLibraryItems(response.data.items);
      } else {
        setLibraryItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch library:", error);
      toast.error("Failed to load library items");
      setLibraryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  // Listen for library updates
  useEffect(() => {
    const handleLibraryUpdate = () => {
      if (isOpen) {
        fetchLibrary();
      }
    };
    window.addEventListener("libraryUpdated", handleLibraryUpdate);
    return () =>
      window.removeEventListener("libraryUpdated", handleLibraryUpdate);
  }, [isOpen]);

  // Handle remove from library
  const handleRemoveFromLibrary = async (itemId) => {
    if (removingItems.has(itemId)) return;
    setRemovingItems((prev) => new Set(prev).add(itemId));
    try {
      await apiService.removeFromLibrary(itemId);
      setLibraryItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Removed from library", { id: "library-remove" });
      setItemToRemove(null);
      // Update library count in header
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("libraryUpdated"));
      }
    } catch (error) {
      console.error("Failed to remove from library:", error);
      toast.error("Failed to remove from library", { id: "library-remove" });
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Confirm removal
  const confirmRemove = (item) => {
    setItemToRemove(item);
  };

  // Cancel removal
  const cancelRemove = () => {
    setItemToRemove(null);
  };

  // Handle download with credits
  const handleDownload = async (item) => {
    try {
      const imageUrl = item.imageUrl || item.variantData?.url || item.url;
      if (!imageUrl) {
        toast.error("Image URL not found");
        return;
      }

      const fullImageUrl = getFullImageUrl(imageUrl);
      const imageData = item.imageData || item.variantData || {};
      const prompt = item.prompt || "Saved image";

      // Step 1: Create license with credits
      const licenseResponse = await apiService.saveAssetWithCredits({
        imageUrl: fullImageUrl,
        prompt,
        imageData,
        variantData: item.variantData,
      });

      if (!licenseResponse.success) {
        throw new Error(licenseResponse.message || "Failed to create license");
      }

      const licenseId = licenseResponse.data?.license?.id;

      if (!licenseId) {
        throw new Error("License ID not found in response");
      }

      // Step 2: Download the actual file using the license ID
      const { data: blob, headers } = await apiService.downloadAsset(licenseId);

      // Step 3: Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const headerFilename = headers
        ?.get("content-disposition")
        ?.match(/filename="(.+)"/)?.[1];
      const filename = prompt
        ? `${prompt.substring(0, 50).replace(/[^a-z0-9]/gi, "_")}.png`
        : headerFilename || "library-image.png";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!", {
        id: "library-download",
      });
      await refreshUsage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("assetsUpdated"));
      }
    } catch (error) {
      console.error("Download error:", error);
      if (error?.status === 402) {
        toast.error("Insufficient credits. Please upgrade your plan.", {
          id: "library-download",
        });
      } else {
        toast.error(error.message || "Failed to download image", {
          id: "library-download",
        });
      }
    }
  };

  // Handle add to cart
  const handleAddToCart = async (item) => {
    try {
      const imageUrl = item.imageUrl || item.variantData?.url || item.url;
      if (!imageUrl) {
        toast.error("Image URL not found");
        return;
      }

      const fullImageUrl = getFullImageUrl(imageUrl);
      const imageData = item.imageData || item.variantData || {};
      const prompt = item.prompt || "Saved image";

      await apiService.addToCart(fullImageUrl, imageData, prompt);
      toast.success("Added to cart", { id: "library-cart" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart", { id: "library-cart" });
    }
  };

  // Handle checkout for single item
  const handleCheckout = (item) => {
    const isCreator = router.pathname.startsWith("/creator");
    const checkoutPath = isCreator
      ? "/creator/stripe-payment-checkout"
      : "/dashboard/stripe-payment-checkout";

    // Add item to cart first, then redirect
    handleAddToCart(item).then(() => {
      const imageUrl = item.imageUrl || item.variantData?.url || item.url;
      const fullImageUrl = getFullImageUrl(imageUrl);

      // Get cart and find the item ID
      apiService.getCart().then((cartResponse) => {
        if (cartResponse.success && cartResponse.data?.items) {
          const cartItem = cartResponse.data.items.find(
            (cartItem) => cartItem.imageUrl === fullImageUrl
          );
          if (cartItem) {
            router.push(`${checkoutPath}?itemId=${cartItem._id}`);
            onClose();
          } else {
            router.push(checkoutPath);
            onClose();
          }
        } else {
          router.push(checkoutPath);
          onClose();
        }
      });
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                My Library
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-foreground">Loading library...</span>
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-foreground text-lg mb-2">
                  Your library is empty
                </p>
                <p className="text-muted-foreground text-sm">
                  Save images from chat to your library!
                </p>
              </div>
            ) : (
              <>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Here are your saved images
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {libraryItems.map((item) => {
                    const imageUrl =
                      item.imageUrl || item.variantData?.url || item.url;
                    const fullImageUrl = getFullImageUrl(imageUrl);
                    const optimizedUrl = getOptimizedImageUrl(item);
                    const prompt = item.prompt || "Saved image";

                    return (
                      <div
                        key={item._id}
                        className="group relative rounded-lg overflow-hidden border border-border bg-muted-background hover:border-primary/50 transition-all"
                      >
                        <ProtectedImage
                          className="relative aspect-square"
                          imageUrl={fullImageUrl}
                          showUpgradePrompt={false}
                        >
                          <OptimizedImage
                            optimizedUrl={optimizedUrl}
                            fallbackUrl={fullImageUrl}
                            alt={prompt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                            draggable={false}
                          />

                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isFreeTrial ? (
                              // Free trial: Show Purchase button
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={() => handleCheckout(item)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                title="Purchase"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            ) : (
                              // Paid plan: Show Download button only
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={() => handleDownload(item)}
                                disabled={!canExportWatermarkFree}
                                className="bg-white/90 hover:bg-white text-black disabled:opacity-50"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => confirmRemove(item)}
                            disabled={removingItems.has(item._id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 z-10"
                            title="Remove from library"
                          >
                            {removingItems.has(item._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </ProtectedImage>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Removal */}
      <Dialog
        open={!!itemToRemove}
        onOpenChange={(open) => !open && cancelRemove()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Library?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove this image from your library? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={cancelRemove}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                itemToRemove && handleRemoveFromLibrary(itemToRemove._id)
              }
              disabled={removingItems.has(itemToRemove?._id)}
            >
              {removingItems.has(itemToRemove?._id) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
