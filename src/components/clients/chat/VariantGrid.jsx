import React, { useState, useEffect, useCallback, useRef } from "react";
import { Maximize2, ShoppingCart, Heart, Download } from "lucide-react";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import apiService from "@/services/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import toast from "react-hot-toast";
import { useImageProtection } from "@/hooks/useImageProtection";
import { useBillingModal } from "@/contexts/billingModalContext";

export default function VariantGrid({
  variants = [],
  selectedVariant,
  onSelect,
  onPreview,
  onAddSelectedToCart,
  isAddingToCart,
  message,
  imageData,
  getFullImageUrl,
  actionLabel = null,
  processingLabel = null,
  showPrice = true,
  actionIcon: ActionIcon = ShoppingCart,
}) {
  const { hasPaidPlan } = useImageProtection();
  const { openBillingModal } = useBillingModal();
  const [imageAspects, setImageAspects] = useState({});
  const [price, setPrice] = useState(null);
  const [savedVariants, setSavedVariants] = useState(new Set());
  const [savingVariants, setSavingVariants] = useState(new Set());
  const handlersRef = useRef(new Map());
  const loadedImagesRef = useRef(new Set());

  // Create stable handlers for each variant index
  const getLoadingHandler = useCallback((index) => {
    if (!handlersRef.current.has(index)) {
      handlersRef.current.set(index, ({ naturalWidth, naturalHeight }) => {
        // Prevent multiple calls for the same image
        if (loadedImagesRef.current.has(index)) {
          return;
        }
        if (naturalWidth && naturalHeight) {
          loadedImagesRef.current.add(index);
          const aspectRatio = naturalWidth / naturalHeight;
          setImageAspects((prev) => {
            // Only update if the value actually changed to prevent infinite loops
            if (prev[index] === aspectRatio) {
              return prev;
            }
            return { ...prev, [index]: aspectRatio };
          });
        }
      });
    }
    return handlersRef.current.get(index);
  }, []);

  // Clean up handlers and loaded images when variants change
  useEffect(() => {
    const currentIndices = new Set(variants.map((_, i) => i));
    // Reset all loaded images when variants change
    loadedImagesRef.current.clear();
    // Clean up handlers for removed variants
    for (const [index] of handlersRef.current) {
      if (!currentIndices.has(index)) {
        handlersRef.current.delete(index);
      }
    }
  }, [variants]);

  // Check library status for all variants
  useEffect(() => {
    const checkAllVariants = async () => {
      const savedSet = new Set();
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const originalUrl = variant?.url || variant;
        const variantUrl = getFullImageUrl(originalUrl);
        if (variantUrl) {
          try {
            const response = await apiService.checkLibraryStatus(variantUrl);
            if (response.success && response.data?.isSaved) {
              savedSet.add(i);
            }
          } catch (error) {
            console.error(`Failed to check library status for variant ${i}:`, error);
          }
        }
      }
      setSavedVariants(savedSet);
    };
    if (variants.length > 0) {
      checkAllVariants();
    }
  }, [variants, getFullImageUrl]);

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
  const handleDownloadVariant = useCallback(
    async (variant, index, e) => {
      e.stopPropagation();
      const originalUrl = variant?.url || variant;
      const variantUrl = getFullImageUrl(originalUrl);
      if (!variantUrl) return;

      try {
        // Fetch the image as a blob
        const response = await fetch(variantUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `variant-${variant.variantNumber || index + 1}-${Date.now()}.png`;
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
    [getFullImageUrl]
  );

  // Handle save to library for variant
  const handleSaveVariantToLibrary = useCallback(async (variant, index, e) => {
    e.stopPropagation();
    if (savingVariants.has(index)) return;

    // If free user, open billing modal
    if (!hasPaidPlan) {
      openBillingModal();
      return;
    }

    const originalUrl = variant?.url || variant;
    const variantUrl = getFullImageUrl(originalUrl);
    if (!variantUrl) return;

    setSavingVariants((prev) => new Set(prev).add(index));
    try {
      const isSaved = savedVariants.has(index);
      if (isSaved) {
        // Remove from library
        const checkResponse = await apiService.checkLibraryStatus(variantUrl);
        if (checkResponse.success && checkResponse.data?.libraryItemId) {
          await apiService.removeFromLibrary(checkResponse.data.libraryItemId);
          setSavedVariants((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
          toast.success("Removed from library", { id: "library" });
        }
      } else {
        // Save to library
        const prompt = variant?.prompt || imageData?.prompt || `Variant ${variant.variantNumber || index + 1}`;
        const variantData = {
          variantNumber: variant?.variantNumber || index + 1,
          ...variant,
        };
        await apiService.saveToLibrary(variantUrl, imageData, prompt, variantData);
        setSavedVariants((prev) => new Set(prev).add(index));
        toast.success("Saved to library", { id: "library" });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("libraryUpdated"));
        }
      }
    } catch (error) {
      console.error("Failed to save/remove from library:", error);
      toast.error(
        savedVariants.has(index)
          ? "Failed to remove from library"
          : "Failed to save to library",
        { id: "library" }
      );
    } finally {
      setSavingVariants((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  }, [savedVariants, savingVariants, variants, imageData, getFullImageUrl, hasPaidPlan, openBillingModal]);

  return (
    <div className="mt-4">
      <div
        className={`grid ${
          variants.length === 1
            ? "grid-cols-1 max-w-2xl mx-auto"
            : variants.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : variants.length === 3
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        } gap-4`}
      >
        {variants.map((variant, index) => {
          const originalUrl = variant?.url || variant;
          const optimizedUrl = variant?.optimizedUrl
            ? getFullImageUrl(variant?.optimizedUrl)
            : null;
          const variantUrl = getFullImageUrl(originalUrl);
          const isSelected = selectedVariant === index;

          const aspectRatio = imageAspects[index];
          const isHorizontal = aspectRatio && aspectRatio > 1.2;
          const isVertical = aspectRatio && aspectRatio < 0.8;

          // Dynamic aspect ratio based on image orientation
          const aspectClass = isHorizontal
            ? "aspect-video" // 16:9 for horizontal
            : isVertical
            ? "aspect-[3/4]" // 3:4 for vertical
            : "aspect-square"; // 1:1 for square

          return (
            <ProtectedImage
              key={index}
              className={`relative group rounded-lg overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? "ring-4 ring-primary shadow-lg scale-105"
                  : "hover:ring-2 hover:ring-primary/50 hover:scale-102"
              }`}
              imageUrl={variantUrl}
              showUpgradePrompt={false}
            >
              <div
                onClick={(e) => {
                  onSelect?.(variant, index, e);
                }}
                className={`${aspectClass} relative bg-gray-100`}
              >
                <OptimizedImage
                  optimizedUrl={optimizedUrl}
                  fallbackUrl={variantUrl}
                  alt={`Variant ${variant.variantNumber || index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain"
                  draggable={false}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  onLoadingComplete={getLoadingHandler(index)}
                />

                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium z-40">
                  #{variant.variantNumber || index + 1}
                </div>

                {/* Overlay buttons - always visible and clickable */}
                <div className="absolute top-2 right-2 flex gap-1.5 z-40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    onClick={(e) => handleSaveVariantToLibrary(variant, index, e)}
                    disabled={savingVariants.has(index)}
                    className={`p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      savedVariants.has(index)
                        ? "bg-red-500 bg-opacity-90 hover:bg-opacity-100"
                        : "bg-black/60 hover:bg-black/80"
                    }`}
                    title={
                      savedVariants.has(index)
                        ? "Remove from library"
                        : "Save to library"
                    }
                  >
                    {savingVariants.has(index) ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart
                        className={`h-4 w-4 ${
                          savedVariants.has(index) ? "text-white fill-white" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={(e) => onPreview?.(variant, index, e)}
                    className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    title="Preview full size (or Shift+Click)"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none z-40">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium">
                      ✓ Selected
                    </div>
                  </div>
                )}
              </div>
            </ProtectedImage>
          );
        })}
      </div>

      {selectedVariant !== null ? (
        <div className="mt-4 flex justify-center">
          <button
            onClick={
              hasPaidPlan
                ? (e) => {
                    const variant = variants[selectedVariant];
                    handleDownloadVariant(variant, selectedVariant, e);
                  }
                : onAddSelectedToCart
            }
            disabled={isAddingToCart}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {hasPaidPlan ? (
              <Download className="h-4 w-4" />
            ) : (
              <ActionIcon className="h-4 w-4" />
            )}
            {isAddingToCart
              ? processingLabel || "Adding..."
              : hasPaidPlan
              ? "Download"
              : actionLabel
              ? actionLabel
              : price
              ? `Add to Cart ($${price})`
              : "Add to Cart"}
          </button>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            👆 Click on your favorite variant to select it
          </p>
        </div>
      )}
    </div>
  );
}
