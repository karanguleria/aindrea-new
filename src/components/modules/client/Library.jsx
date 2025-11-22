import React, { useState, useEffect } from "react";
import { Heart, Download, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageHeader from "./ImageHeader";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useUsage } from "@/contexts/usageContext";

export default function Library() {
  const { isDark } = useThemeUtils();
  const router = useRouter();
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const { canExportWatermarkFree, refreshUsage } = useUsage();

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
    fetchLibrary();
  }, [router.asPath]);

  // Listen for library updates
  useEffect(() => {
    const handleLibraryUpdate = () => {
      fetchLibrary();
    };
    window.addEventListener("libraryUpdated", handleLibraryUpdate);
    return () =>
      window.removeEventListener("libraryUpdated", handleLibraryUpdate);
  }, []);

  // Handle remove from library
  const handleRemoveFromLibrary = async (itemId) => {
    if (removingItems.has(itemId)) return;
    setRemovingItems((prev) => new Set(prev).add(itemId));
    try {
      await apiService.removeFromLibrary(itemId);
      setLibraryItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Removed from library", { id: "library-remove" });
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

      // Use saveAssetWithCredits API
      const response = await apiService.saveAssetWithCredits({
        imageUrl: fullImageUrl,
        prompt,
        imageData,
      });

      if (response.success) {
        toast.success("Image downloaded successfully!", {
          id: "library-download",
        });
        await refreshUsage();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("assetsUpdated"));
        }
      } else {
        throw new Error(response.message || "Download failed");
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
  const handleCheckout = async (item) => {
    // Add to cart first
    await handleAddToCart(item);

    // Small delay to ensure cart is updated
    await new Promise((resolve) => setTimeout(resolve, 300));

    const isCreator = router.pathname.startsWith("/creator");
    const checkoutPath = isCreator
      ? "/creator/stripe-payment-checkout"
      : "/dashboard/stripe-payment-checkout";

    // Get cart and find the item ID
    try {
      const cartResponse = await apiService.getCart();
      if (cartResponse.success && cartResponse.data?.items) {
        const imageUrl = item.imageUrl || item.variantData?.url || item.url;
        const fullImageUrl = getFullImageUrl(imageUrl);
        const cartItem = cartResponse.data.items.find((cartItem) => {
          const cartImageUrl = cartItem.imageUrl || cartItem.imageData?.url;
          return cartImageUrl === fullImageUrl || cartImageUrl === imageUrl;
        });
        if (cartItem) {
          router.push(`${checkoutPath}?itemId=${cartItem._id}`);
        } else {
          router.push(checkoutPath);
        }
      } else {
        router.push(checkoutPath);
      }
    } catch (error) {
      console.error("Failed to get cart:", error);
      router.push(checkoutPath);
    }
  };

  return (
    <>
      <ImageHeader title="My Library" buttonText={null} />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
              Save images from chat to your library by clicking the heart icon!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {libraryItems.length}{" "}
                {libraryItems.length === 1 ? "item" : "items"} saved
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(item)}
                          disabled={!canExportWatermarkFree}
                          className="w-full bg-white/90 hover:bg-white text-black"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCheckout(item)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase
                        </Button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFromLibrary(item._id)}
                        disabled={removingItems.has(item._id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 z-10"
                        title="Remove from library"
                      >
                        {removingItems.has(item._id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </ProtectedImage>

                    {/* Prompt text */}
                    <div className="p-3">
                      <p
                        className="text-sm text-foreground truncate"
                        title={prompt}
                      >
                        {prompt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
