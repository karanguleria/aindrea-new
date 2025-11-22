import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Maximize2, ShoppingCart, Heart, Download } from "lucide-react";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import apiService from "@/services/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import toast from "react-hot-toast";
import { useImageProtection } from "@/hooks/useImageProtection";
import { useBillingModal } from "@/contexts/billingModalContext";

export default function SingleImage({
  fullImageUrl,
  imageData,
  onPreview,
  onAddToCart,
  isAddingToCart,
  actionLabel = null,
  processingLabel = null,
  showPrice = true,
  actionIcon: ActionIcon = ShoppingCart,
}) {
  const { hasPaidPlan } = useImageProtection();
  const { openBillingModal } = useBillingModal();
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [price, setPrice] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);

  const optimizedUrl = useMemo(() => {
    if (
      imageData?.optimizedUrl &&
      typeof imageData.optimizedUrl === "string" &&
      imageData.optimizedUrl.trim() !== ""
    ) {
      return imageData.optimizedUrl.trim();
    }
    return null;
  }, [imageData?.optimizedUrl]);

  // Reset loaded flag when image URL changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [fullImageUrl, optimizedUrl]);

  // Memoize the onLoadingComplete callback to prevent infinite loops
  const handleLoadingComplete = useCallback(
    ({ naturalWidth, naturalHeight }) => {
      // Prevent multiple calls for the same image
      if (hasLoadedRef.current) {
        return;
      }
      if (naturalWidth && naturalHeight) {
        hasLoadedRef.current = true;
        const aspectRatio = naturalWidth / naturalHeight;
        setIsHorizontal(aspectRatio > 1.2);
      }
    },
    []
  );

  // Check if image is saved to library
  useEffect(() => {
    const checkLibraryStatus = async () => {
      if (!fullImageUrl) return;
      try {
        const response = await apiService.checkLibraryStatus(fullImageUrl);
        if (response.success) {
          setIsSaved(response.data?.isSaved || false);
        }
      } catch (error) {
        console.error("Failed to check library status:", error);
      }
    };
    checkLibraryStatus();
  }, [fullImageUrl]);

  // Fetch price from backend
  useEffect(() => {
    if (!showPrice) {
      setPrice(null);
      return;
    }

    const fetchPrice = async () => {
      try {
        const response = await apiService.getSinglePriceByType("image");
        if (response.success && response.data?.amount) {
          // Convert from cents to dollars
          setPrice((response.data.amount / 100).toFixed(2));
        } else {
          // Fallback to default price
          setPrice("5.99");
        }
      } catch (error) {
        console.error("Failed to fetch price:", error);
        // Fallback to default price
        setPrice("5.99");
      }
    };
    fetchPrice();
  }, [showPrice]);

  // Handle download for subscribed users
  const handleDownload = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!fullImageUrl) return;

      try {
        // Fetch the image as a blob
        const response = await fetch(fullImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Image downloaded", { id: "download" });
      } catch (error) {
        console.error("Failed to download image:", error);
        toast.error("Failed to download image", { id: "download" });
      }
    },
    [fullImageUrl]
  );

  // Handle save to library
  const handleSaveToLibrary = useCallback(
    async (e) => {
      e.stopPropagation();
      if (isSaving || !fullImageUrl) return;

      // If free user, open billing modal
      if (!hasPaidPlan) {
        openBillingModal();
        return;
      }

      setIsSaving(true);
      try {
        if (isSaved) {
          // Remove from library
          const checkResponse = await apiService.checkLibraryStatus(
            fullImageUrl
          );
          if (checkResponse.success && checkResponse.data?.libraryItemId) {
            await apiService.removeFromLibrary(
              checkResponse.data.libraryItemId
            );
            setIsSaved(false);
            toast.success("Removed from library", { id: "library" });
          }
        } else {
          // Save to library
          const prompt = imageData?.prompt || "Generated image";
          await apiService.saveToLibrary(fullImageUrl, imageData, prompt);
          setIsSaved(true);
          toast.success("Saved to library", { id: "library" });
          // Dispatch event to update library count in header
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("libraryUpdated"));
          }
        }
      } catch (error) {
        console.error("Failed to save/remove from library:", error);
        toast.error(
          isSaved
            ? "Failed to remove from library"
            : "Failed to save to library",
          { id: "library" }
        );
      } finally {
        setIsSaving(false);
      }
    },
    [isSaved, isSaving, fullImageUrl, imageData, hasPaidPlan, openBillingModal]
  );

  if (!fullImageUrl) return null;

  // Adjust max-width based on image orientation
  const maxWidthClass = isHorizontal
    ? "max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl" // Full width for horizontal images
    : "max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"; // Standard width for square/vertical

  return (
    <div className="mt-4 overflow-hidden">
      <ProtectedImage
        className="relative group"
        imageUrl={fullImageUrl}
        showUpgradePrompt={true}
        allowPurchases={true}
      >
        <OptimizedImage
          optimizedUrl={optimizedUrl}
          fallbackUrl={fullImageUrl}
          alt="Generated image"
          width={1024}
          height={1024}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
          className={`rounded-lg w-full ${maxWidthClass} h-auto mx-auto`}
          draggable={false}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onLoadingComplete={handleLoadingComplete}
        />

        {/* Overlay buttons - always visible and clickable */}
        <div className="absolute inset-0 bg-background/10 backdrop-blur-sm transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 z-50 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={onPreview}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
              title="Preview full size"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isSaved
                  ? "bg-red-500 bg-opacity-90 hover:bg-opacity-100"
                  : "bg-black/60 hover:bg-black/80"
              }`}
              title={isSaved ? "Remove from library" : "Save to library"}
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart
                  className={`h-4 w-4 ${
                    isSaved ? "text-white fill-white" : "text-white"
                  }`}
                />
              )}
            </button>
            <button
              onClick={hasPaidPlan ? handleDownload : onAddToCart}
              disabled={isAddingToCart}
              className="p-2 bg-teal-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={
                hasPaidPlan
                  ? "Download image"
                  : actionLabel
                  ? actionLabel
                  : price
                  ? `Add to cart ($${price})`
                  : "Add to cart"
              }
            >
              {isAddingToCart ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : hasPaidPlan ? (
                <Download className="h-4 w-4 text-white" />
              ) : (
                <ActionIcon className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </ProtectedImage>

      {imageData && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>
            <strong>Prompt:</strong> {imageData.prompt}
          </p>
          {imageData.quality && (
            <p>
              <strong>Quality:</strong> {imageData.quality}
            </p>
          )}
          {imageData.style && (
            <p>
              <strong>Style:</strong> {imageData.style}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
