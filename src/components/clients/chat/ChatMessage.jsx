import { useThemeUtils } from "@/hooks/use-theme-utils";
import Image from "next/image";
import { Download, FolderOpen, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import MessageText from "./MessageText";
import UploadedFiles from "./UploadedFiles";
import VariantGrid from "./VariantGrid";
import SingleImage from "./SingleImage";
import ReactionBar from "./ReactionBar";
import { usePreviewModal } from "@/contexts/previewModalContext";
import { useAuth } from "@/contexts/userContext";
import { useUsage } from "@/contexts/usageContext";
import {
  getBackendUrl,
  isPlaceholderImage,
  getFullImageUrl,
  normalizeImageUrl,
} from "@/utils/chat/imageUrlHelpers";
import {
  filterValidVariants,
  detectGptImpliedGeneration,
  createAssetUrlSet,
} from "@/utils/chat/variantHelpers";
import {
  formatMessageForDisplay,
  containsActionMarkers,
} from "@/utils/chat/messageFormatters";

export function ChatMessage({
  message,
  isUser = false,
  timestamp,
  imageUrl,
  imageData,
  imageMeta,
  variants,
  files = [],
  messageIndex,
  chatId,
  onFeedbackUpdate,
  feedback: initialFeedback,
  isLast = false,
  userAssets = [],
  onAssetAdded = () => {},
  onViewAssets = () => {},
  isLoadingMessage = false,
  loadingSteps = [],
  variantCount = null,
}) {
  const { isDark } = useThemeUtils();
  const router = useRouter();
  const { openPreviewModal } = usePreviewModal();
  const { user } = useAuth();
  const {
    canExportWatermarkFree,
    remainingWatermarkFreeExports,
    refreshUsage,
    loading: usageLoading,
  } = useUsage();
  const [isRating, setIsRating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [feedback, setFeedback] = useState(() => {
    // Initialize feedback from prop or default values
    return initialFeedback || { thumbsUp: false, thumbsDown: false };
  });

  const resolvedLoadingSteps = Array.isArray(loadingSteps) ? loadingSteps : [];

  const LoadingBubble = () => {
    if (resolvedLoadingSteps.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span>Understanding request...</span>
        </div>
      );
    }

    const activeStep =
      resolvedLoadingSteps.find((step) => step.status === "in_progress") ||
      resolvedLoadingSteps[resolvedLoadingSteps.length - 1];

    const resolvedVariant = activeStep?.variantCount || variantCount || 0;
    const displayVariantCount = resolvedVariant > 0 ? resolvedVariant : 1;
    const skeletonCount = Math.min(Math.max(displayVariantCount, 1), 4);
    const gridClass =
      skeletonCount === 1
        ? "grid-cols-1"
        : skeletonCount === 2
        ? "grid-cols-2"
        : "grid-cols-2 md:grid-cols-3";

    return (
      <div className="space-y-3">
        {resolvedLoadingSteps.map((step) => {
          const isCompleted = step.status === "completed";
          const icon = isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          );

          return (
            <div
              key={step.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {icon}
              <span>{step.label}</span>
              {step.id === "generating_image" && displayVariantCount > 1 && (
                <span className="text-xs text-muted-foreground/80">
                  Preparing {displayVariantCount} variants
                </span>
              )}
            </div>
          );
        })}

        {activeStep?.id === "generating_image" && (
          <div className={`mt-3 grid gap-3 ${gridClass}`}>
            {Array.from({ length: skeletonCount }).map((_, idx) => (
              <div
                key={idx}
                className="h-36 rounded-xl border border-border/60 bg-muted animate-pulse"
              />
            ))}
          </div>
        )}

        {activeStep?.id === "generating_text" && (
          <div className="mt-3 space-y-2">
            <div className="h-3 rounded bg-muted animate-pulse" />
            <div className="h-3 rounded bg-muted/80 animate-pulse w-5/6" />
            <div className="h-3 rounded bg-muted/60 animate-pulse w-2/3" />
          </div>
        )}
      </div>
    );
  };

  // Update feedback state when initialFeedback prop changes
  useEffect(() => {
    if (initialFeedback) {
      setFeedback(initialFeedback);
    }
  }, [initialFeedback]);

  const normalizeImageUrlMemo = useCallback((url) => {
    return normalizeImageUrl(url);
  }, []);

  const assetUrlSet = useMemo(() => {
    return createAssetUrlSet(userAssets);
  }, [userAssets]);

  const fullImageUrl = getFullImageUrl(imageUrl);

  // Filter out placeholder images from variants
  const validVariants = filterValidVariants(variants);
  const hasValidVariants = validVariants.length > 0;
  const normalizedFullImageUrl = fullImageUrl
    ? normalizeImageUrl(fullImageUrl)
    : "";
  const isSingleImageInAssets =
    normalizedFullImageUrl && assetUrlSet.has(normalizedFullImageUrl);
  const selectedVariantUrlNormalized =
    hasValidVariants &&
    selectedVariant !== null &&
    validVariants[selectedVariant]
      ? normalizeImageUrl(
          validVariants[selectedVariant]?.url || validVariants[selectedVariant]
        )
      : "";
  const isSelectedVariantInAssets =
    !!selectedVariantUrlNormalized &&
    assetUrlSet.has(selectedVariantUrlNormalized);

  // Clean markers for display
  const displayMessage = formatMessageForDisplay(message);
  const hasActionMarkers = containsActionMarkers(message);

  // Detect if GPT implied generation but no image arrived
  const gptImpliedGeneration = detectGptImpliedGeneration(
    displayMessage,
    isUser
  );

  const showGenerateNowButton =
    isLast &&
    !isUser &&
    gptImpliedGeneration &&
    !fullImageUrl &&
    !hasValidVariants &&
    !hasActionMarkers;

  const planName = user?.subscription?.plan
    ? user.subscription.plan.toLowerCase()
    : "free";

  const canAutoLicense = useMemo(() => {
    if (usageLoading) {
      return false;
    }

    if (user?.isAdmin) {
      return true;
    }

    const hasUnlimitedDownloads =
      planName !== "free" &&
      (remainingWatermarkFreeExports === null ||
        remainingWatermarkFreeExports === undefined);

    const hasCredits =
      typeof remainingWatermarkFreeExports === "number" &&
      remainingWatermarkFreeExports > 0;

    return (
      hasUnlimitedDownloads ||
      (canExportWatermarkFree && hasCredits && planName !== "free")
    );
  }, [
    user?.isAdmin,
    planName,
    canExportWatermarkFree,
    remainingWatermarkFreeExports,
    usageLoading,
  ]);

  const variantActionLabel = isSelectedVariantInAssets
    ? "View in Assets"
    : canAutoLicense
    ? "Save to Assets"
    : undefined;
  const variantProcessingLabel =
    !isSelectedVariantInAssets && canAutoLicense ? "Saving..." : undefined;
  const VariantActionIcon = isSelectedVariantInAssets
    ? FolderOpen
    : canAutoLicense
    ? Download
    : undefined;

  const singleActionLabel = isSingleImageInAssets
    ? "View in Assets"
    : canAutoLicense
    ? "Save to Assets"
    : undefined;
  const singleProcessingLabel =
    !isSingleImageInAssets && canAutoLicense ? "Saving..." : undefined;
  const SingleActionIcon = isSingleImageInAssets
    ? FolderOpen
    : canAutoLicense
    ? Download
    : undefined;

  const attemptAutoLicense = useCallback(
    async (imageUrl, variantDetails = {}) => {
      if (!canAutoLicense || !imageUrl) {
        return false;
      }

      try {
        const response = await apiService.saveAssetWithCredits({
          imageUrl,
          prompt:
            variantDetails.prompt ||
            imageData?.prompt ||
            variantDetails?.meta?.prompt ||
            displayMessage ||
            message,
          imageData,
          variantMeta: variantDetails.meta || null,
          variantNumber: variantDetails.variantNumber || null,
          chatId,
          messageId: message?.id || message?._id || null,
          assetType: "image",
        });

        const licensePayload =
          response?.data?.license || response?.license || null;
        if (licensePayload) {
          onAssetAdded(licensePayload);
        }

        toast.success("Image saved to your assets!", { id: "asset-save" });
        await refreshUsage();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("assetsUpdated"));
        }
        return true;
      } catch (error) {
        if (error?.status === 402) {
          await refreshUsage();
          return false;
        }

        console.error("Failed to auto-license image:", error);
        return false;
      }
    },
    [
      canAutoLicense,
      imageData,
      displayMessage,
      message,
      chatId,
      refreshUsage,
      onAssetAdded,
    ]
  );

  const [isForceGenerating, setIsForceGenerating] = useState(false);

  const handleGenerateNow = async () => {
    if (isForceGenerating) return;
    try {
      setIsForceGenerating(true);
      const resp = await apiService.sendMessage(
        chatId,
        "Generate image now",
        "text",
        [],
        [],
        1,
        true // forceGenerate
      );
      toast.success("Generating image...", { id: "force-generate" });
      // Notify the chat to refresh
      window.dispatchEvent(
        new CustomEvent("chatNeedsRefresh", { detail: { chatId } })
      );
    } catch (e) {
      console.error("Force generate failed", e);
      toast.error("Failed to start generation", { id: "force-generate" });
    } finally {
      setIsForceGenerating(false);
    }
  };

  // Handle variant selection (toggle on/off)
  const handleVariantSelect = (variant, index, e) => {
    // Skip placeholder images
    if (isPlaceholderImage(variant?.url || variant)) {
      return;
    }

    // If shift-click or ctrl-click, open preview modal instead
    if (e?.shiftKey || e?.ctrlKey) {
      const variantUrl = getFullImageUrl(variant?.url || variant);
      openPreviewModal(
        {
          url: variantUrl,
          variant: variant,
          index: index,
        },
        (idx) => {
          setSelectedVariant(idx);
          toast.success(`Variant ${idx + 1} selected!`);
        }
      );
      return;
    }

    if (selectedVariant === index) {
      // Deselect if clicking the same variant
      setSelectedVariant(null);
      toast.success("Variant deselected", {
        id: "variant-select",
      });
    } else {
      // Select new variant
      setSelectedVariant(index);
      toast.success(`Variant ${variant.variantNumber || index + 1} selected!`, {
        id: "variant-select",
      });
    }
  };

  // Handle variant preview
  const handleVariantPreview = (variant, index, e) => {
    e.stopPropagation();
    const variantUrl = getFullImageUrl(variant?.url || variant);
    openPreviewModal(
      {
        url: variantUrl,
        variant: variant,
        index: index,
      },
      (idx) => {
        setSelectedVariant(idx);
        toast.success(`Variant ${idx + 1} selected!`);
      }
    );
  };

  // Handle single image preview
  const handleSingleImagePreview = (e) => {
    e?.stopPropagation?.();
    if (!fullImageUrl) return;
    openPreviewModal({
      url: fullImageUrl,
      variant: null,
      index: 0,
      meta: imageMeta,
    });
  };

  // Get current image URL (selected variant or default)
  const getCurrentImageUrl = () => {
    if (hasValidVariants && selectedVariant !== null) {
      return getFullImageUrl(
        validVariants[selectedVariant]?.url || validVariants[selectedVariant]
      );
    }
    return !isPlaceholderImage(fullImageUrl) ? fullImageUrl : null;
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(displayMessage);
      toast.success("Response copied to clipboard!", { id: "chat-message" });
    } catch (error) {
      console.error("Failed to copy response:", error);
      toast.error("Failed to copy response", { id: "chat-message" });
    }
  };

  const handleCopyImage = async () => {
    try {
      if (fullImageUrl) {
        const response = await fetch(fullImageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        toast.success("Image copied to clipboard!", { id: "chat-message" });
      }
    } catch (error) {
      console.error("Failed to copy image:", error);
      toast.error("Failed to copy image", { id: "chat-message" });
    }
  };

  const handleThumbsUp = async () => {
    if (
      !chatId ||
      messageIndex === null ||
      typeof messageIndex !== "number" ||
      isRating
    ) {
      return;
    }

    setIsRating(true);
    try {
      const newThumbsUp = !feedback.thumbsUp;
      const newThumbsDown = newThumbsUp ? false : feedback.thumbsDown;
      await apiService.rateMessage(
        chatId,
        messageIndex,
        newThumbsUp,
        newThumbsDown
      );

      const newFeedback = { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown };
      setFeedback(newFeedback);

      // Notify parent component of feedback update
      if (onFeedbackUpdate) {
        onFeedbackUpdate(messageIndex, newFeedback);
      }
    } catch (error) {
      console.error("Failed to rate message:", error);
      toast.error("Failed to rate message", { id: "chat-message" });
    } finally {
      setIsRating(false);
    }
  };

  const handleThumbsDown = async () => {
    if (
      !chatId ||
      messageIndex === null ||
      typeof messageIndex !== "number" ||
      isRating
    ) {
      return;
    }

    setIsRating(true);
    try {
      const newThumbsDown = !feedback.thumbsDown;
      const newThumbsUp = newThumbsDown ? false : feedback.thumbsUp;

      await apiService.rateMessage(
        chatId,
        messageIndex,
        newThumbsUp,
        newThumbsDown
      );

      const newFeedback = { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown };
      setFeedback(newFeedback);

      // Notify parent component of feedback update
      if (onFeedbackUpdate) {
        onFeedbackUpdate(messageIndex, newFeedback);
      }
    } catch (error) {
      console.error("Failed to rate message:", error);
      toast.error("Failed to rate message", { id: "chat-message" });
    } finally {
      setIsRating(false);
    }
  };

  const handleAddToCart = async () => {
    if (isSingleImageInAssets) {
      onViewAssets();
      return;
    }

    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      // If variants exist and one is selected, use that variant
      let urlToStore = imageUrl;
      if (variants && variants.length > 0 && selectedVariant !== null) {
        urlToStore =
          variants[selectedVariant]?.url || variants[selectedVariant];
      }

      const autoSuccess = await attemptAutoLicense(urlToStore, {
        meta:
          variants && variants.length > 0 && selectedVariant !== null
            ? variants[selectedVariant]?.meta
            : imageData?.meta,
        variantNumber:
          variants && variants.length > 0 && selectedVariant !== null
            ? variants[selectedVariant]?.variantNumber || selectedVariant + 1
            : null,
      });

      if (autoSuccess) {
        return;
      }

      const response = await apiService.addToCart(
        urlToStore,
        imageData,
        imageData?.prompt || message
      );

      // Check if image already exists in cart
      if (response.alreadyExists) {
        toast.success("Image already in cart!", { id: "cart-add" });
      } else {
        toast.success("Image added to cart!", { id: "cart-add" });
      }

      // Check if we're already on the image-selection-canvas page
      const isCreator = router.pathname.startsWith("/creator");
      const targetPath = isCreator
        ? "/creator/image-selection-canvas"
        : "/dashboard/image-selection-canvas";

      const isAlreadyOnCanvasPage = router.pathname === targetPath;

      if (isAlreadyOnCanvasPage) {
        // If already on canvas page, just dispatch custom event to refresh cart
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        // Preserve query parameters if they exist, but standardize to use 'chatId'
        const queryParams = new URLSearchParams(window.location.search);

        // Remove 'id' if both 'id' and 'chatId' exist, keep only 'chatId'
        if (queryParams.has("id") && queryParams.has("chatId")) {
          queryParams.delete("id");
        } else if (queryParams.has("id") && !queryParams.has("chatId")) {
          // Rename 'id' to 'chatId' for consistency
          const idValue = queryParams.get("id");
          queryParams.delete("id");
          queryParams.set("chatId", idValue);
        }

        const redirectPath = queryParams.toString()
          ? `${targetPath}?${queryParams.toString()}`
          : targetPath;

        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart", { id: "cart-add" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full border border-border bg-transparent flex items-center justify-center ps-0.5 pb-0.5">
            <Image
              src={isDark ? "/images/logo.png" : "/images/logo.svg"}
              alt="logo"
              width={22}
              height={22}
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-[90%] sm:max-w-[80%] ${
          isUser ? "order-1" : "order-2"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground ml-2"
              : "bg-transparent border border-border text-foreground"
          }`}
        >
          {isLoadingMessage ? (
            <LoadingBubble />
          ) : (
            <>
              {displayMessage && displayMessage.trim() && !hasValidVariants && (
                <MessageText message={displayMessage} chatId={chatId} />
              )}

              {files && files.length > 0 && (
                <UploadedFiles files={files} isUser={isUser} />
              )}

              {hasValidVariants && !isUser && (
                <>
                  {displayMessage && displayMessage.trim() && (
                    <div className="text-sm leading-relaxed mb-4">
                      <MessageText message={displayMessage} chatId={chatId} />
                    </div>
                  )}
                  <VariantGrid
                    variants={validVariants}
                    selectedVariant={selectedVariant}
                    onSelect={handleVariantSelect}
                    onPreview={handleVariantPreview}
                    onAddSelectedToCart={async () => {
                      if (selectedVariant === null) return;

                      if (isSelectedVariantInAssets) {
                        onViewAssets();
                        return;
                      }

                      const variant = validVariants[selectedVariant];
                      const variantUrl = getFullImageUrl(
                        variant?.url || variant
                      );

                      if (!variantUrl) {
                        toast.error("Unable to process this variant", {
                          id: "cart-add",
                        });
                        return;
                      }

                      setIsAddingToCart(true);
                      try {
                        const variantMeta = variant?.meta || null;
                        const variantNumber =
                          variant?.variantNumber || selectedVariant + 1;

                        const autoSuccess = await attemptAutoLicense(
                          variantUrl,
                          {
                            meta: variantMeta,
                            variantNumber,
                          }
                        );

                        if (autoSuccess) {
                          return;
                        }

                        await apiService.addToCart(
                          variantUrl,
                          imageData,
                          imageData?.prompt || displayMessage
                        );
                        toast.success("Selected variant added to cart!", {
                          id: "cart-add",
                        });
                        const isCreator =
                          router.pathname.startsWith("/creator");
                        const targetPath = isCreator
                          ? "/creator/image-selection-canvas"
                          : "/dashboard/image-selection-canvas";
                        setTimeout(() => router.push(targetPath), 500);
                      } catch (error) {
                        toast.error("Failed to add to cart", {
                          id: "cart-add",
                        });
                      } finally {
                        setIsAddingToCart(false);
                      }
                    }}
                    isAddingToCart={isAddingToCart}
                    message={message}
                    imageData={imageData}
                    getFullImageUrl={getFullImageUrl}
                    actionLabel={variantActionLabel}
                    processingLabel={variantProcessingLabel}
                    actionIcon={VariantActionIcon}
                    showPrice={!canAutoLicense && !isSelectedVariantInAssets}
                  />
                </>
              )}

              {fullImageUrl &&
                !isUser &&
                !hasValidVariants &&
                !isPlaceholderImage(fullImageUrl) && (
                  <SingleImage
                    fullImageUrl={fullImageUrl}
                    imageData={imageData}
                    onPreview={handleSingleImagePreview}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={isAddingToCart}
                    actionLabel={singleActionLabel}
                    processingLabel={singleProcessingLabel}
                    actionIcon={SingleActionIcon}
                    showPrice={!canAutoLicense && !isSingleImageInAssets}
                  />
                )}

              {showGenerateNowButton && (
                <div className="mt-3">
                  <button
                    onClick={handleGenerateNow}
                    disabled={isForceGenerating}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      isForceGenerating
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isForceGenerating ? "Generating..." : "Generate now"}
                  </button>
                </div>
              )}
            </>
          )}

          {!isUser && !isLoadingMessage && messageIndex !== null && (
            <ReactionBar
              isRating={isRating}
              feedback={feedback}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              canCopy={!fullImageUrl}
              onCopy={fullImageUrl ? undefined : handleCopyResponse}
            />
          )}
        </div>

        {timestamp && (
          <div
            className={`text-xs text-muted-foreground mt-2 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3 order-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-lg">
              U
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
