import React, { useEffect } from "react";
import { X } from "lucide-react";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function PreviewModal({
  open,
  image,
  onClose,
  onSelectVariant,
}) {
  // Handle ESC key to close preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open || !image) return null;

  console.log(image);

  const isVariant = !!image.variant;
  const meta = isVariant ? image.variant?.meta : image.meta;
  const hasMeta = !!(
    meta &&
    (meta.title ||
      meta.description ||
      (Array.isArray(meta.tags) && meta.tags.length > 0))
  );
  const formatTag = (t) =>
    String(t || "")
      .replace(/[-_]+/g, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-[100vh] overflow-auto"
        style={{ zIndex: 99999 }}
      >
        <div className="min-h-full flex flex-col items-center justify-center p-4 relative">
          <div
            className="flex items-center justify-between w-full mb-4 absolute top-[4%] mx-auto"
            style={{ zIndex: 100000 }}
          >
            <div className="bg-black/60 text-white px-4 py-2 rounded-lg">
              <p className="font-medium">
                {isVariant
                  ? `Variant #${
                      image.variant?.variantNumber || image.index + 1
                    }`
                  : "Image Preview"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-black/60 hover:bg-white/20 rounded-full transition-colors"
              title="Close (Esc)"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div
            className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start relative"
            style={{ zIndex: 99999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image on small first, on large move to right */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <ProtectedImage
                className="relative w-full"
                imageUrl={image.url}
                showUpgradePrompt={false}
                allowPurchases={true}
              >
                <OptimizedImage
                  optimizedUrl={
                    image.optimizedUrl ||
                    image.variant?.optimizedUrl ||
                    image.meta?.optimizedUrl
                  }
                  fallbackUrl={image.url}
                  alt="Preview"
                  width={1920}
                  height={1920}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-lg mx-auto"
                  draggable={false}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                />
              </ProtectedImage>
            </div>

            {/* Meta panel: small below image, on large left */}
            {hasMeta && (
              <div className="order-2 lg:order-1 bg-black/60 text-white rounded-lg p-4 h-max">
                {meta.title && (
                  <div className="text-lg font-semibold mb-1">{meta.title}</div>
                )}
                {meta.description && (
                  <div className="text-sm whitespace-pre-line opacity-90">
                    {meta.description}
                  </div>
                )}
                {Array.isArray(meta.tags) && meta.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {meta.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-primary text-white"
                      >
                        #{formatTag(t)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isVariant && (
            <div
              className="flex items-center justify-center w-full absolute bottom-[8%] max-w-4xl mx-auto"
              style={{ zIndex: 100000 }}
            >
              <div className="flex gap-3 bg-black/60 px-6 py-3 rounded-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVariant?.(image.index);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Select This Variant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
