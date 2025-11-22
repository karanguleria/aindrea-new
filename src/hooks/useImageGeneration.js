import { useCallback } from "react";
import {
  detectImageGeneration,
  detectVariantCount,
} from "@/utils/chat/promptDetection";

/**
 * Custom hook for image generation detection
 * @param {string} variant - Component variant (e.g., "dashboard", "chat")
 * @returns {Object} Image generation detection functions
 */
export const useImageGeneration = (variant = "dashboard") => {
  const detectGeneration = useCallback(
    (prompt) => {
      return detectImageGeneration(prompt, variant);
    },
    [variant]
  );

  const detectVariants = useCallback((text) => {
    return detectVariantCount(text);
  }, []);

  return {
    detectImageGeneration: detectGeneration,
    detectVariantCount: detectVariants,
  };
};
