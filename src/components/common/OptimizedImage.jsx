import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  getPreferredImageUrl,
  shouldBypassOptimization,
  buildImageAlt,
} from "@/utils/imageUtils";

export function OptimizedImage({
  optimizedUrl,
  fallbackUrl,
  alt,
  className,
  fill = false,
  sizes,
  width,
  height,
  priority = false,
  loading = "lazy",
  quality = 85,
  onError,
  onLoadingComplete,
  draggable = false,
  ...rest
}) {
  const preferredSrc = useMemo(
    () => getPreferredImageUrl(optimizedUrl, fallbackUrl),
    [optimizedUrl, fallbackUrl]
  );
  const [currentSrc, setCurrentSrc] = useState(() => preferredSrc);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const prevPreferredSrcRef = useRef(preferredSrc);
  const imageKeyRef = useRef(0);
  const hasCalledLoadingCompleteRef = useRef(false);

  useEffect(() => {
    // Only update if the value actually changed to prevent unnecessary re-renders
    if (prevPreferredSrcRef.current !== preferredSrc) {
      prevPreferredSrcRef.current = preferredSrc;
      setCurrentSrc(preferredSrc);
      setHasTriedFallback(false);
      hasCalledLoadingCompleteRef.current = false;
      // Force Image component to remount with new key to prevent stale state
      imageKeyRef.current += 1;
    }
  }, [preferredSrc]);

  // Memoize error handler to prevent recreation on every render
  const handleError = useCallback(
    (event) => {
      if (!hasTriedFallback && fallbackUrl && currentSrc !== fallbackUrl) {
        setHasTriedFallback(true);
        setCurrentSrc(fallbackUrl);
        hasCalledLoadingCompleteRef.current = false;
        // Force Image component to remount with new key
        imageKeyRef.current += 1;
        return;
      }
      onError?.(event);
    },
    [hasTriedFallback, fallbackUrl, currentSrc, onError]
  );

  // Memoize onLoadingComplete to prevent recreation and multiple calls
  const handleLoadingComplete = useCallback(
    (params) => {
      // Prevent multiple calls for the same image load
      if (hasCalledLoadingCompleteRef.current) {
        return;
      }
      hasCalledLoadingCompleteRef.current = true;
      onLoadingComplete?.(params);
    },
    [onLoadingComplete]
  );

  if (!currentSrc) {
    return null;
  }

  return (
    <Image
      key={imageKeyRef.current}
      src={currentSrc}
      alt={buildImageAlt(alt)}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      loading={loading}
      quality={quality}
      draggable={draggable}
      unoptimized={shouldBypassOptimization(currentSrc)}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
      {...rest}
    />
  );
}

export default OptimizedImage;

