import { isPlaceholderImage, normalizeImageUrl } from "./imageUrlHelpers";

/**
 * Filter out placeholder images from variants array
 * @param {Array} variants - Array of variant objects or URLs
 * @returns {Array} Filtered array of valid variants
 */
export const filterValidVariants = (variants) => {
  if (!Array.isArray(variants)) {
    return [];
  }
  return variants.filter((variant) => {
    const url = variant?.url || variant;
    return !isPlaceholderImage(url);
  });
};

/**
 * Detect if GPT implied generation but no image arrived
 * @param {string} message - Message text
 * @param {boolean} isUser - Whether message is from user
 * @returns {boolean} True if GPT implied generation
 */
export const detectGptImpliedGeneration = (message, isUser = false) => {
  if (!message || isUser) return false;

  const displayMessage = message
    .replace(/\[AC?TION:(question|generate|text)\]/gi, "")
    .replace(/\[ACITON:(question|generate|text)\]/gi, "")
    .replace(/\[VARIANTS:\d+\]/gi, "")
    .trim();

  if (!displayMessage) return false;

  const lower = displayMessage.toLowerCase();
  const mentionsOutput = /(image|design|visual|variant|version|post)/.test(
    lower
  );

  const strong =
    (/(generating|starting\s+(the\s+)?generation|rendering|render)/.test(
      lower
    ) &&
      mentionsOutput) ||
    (/\b(i\s*(will|'ll))\s*(generate|create|render)\b/.test(lower) &&
      (mentionsOutput ||
        /\b(now|right away|immediately|starting)\b/.test(lower))) ||
    // Implicit working cues with output mention
    (/\b(stand\s*by|working\s+on\s+it|get(ting)?\s+that\s+started|i'll\s+get\s+that\s+started|i'll\s+work\s+on\s+it)\b/.test(
      lower
    ) &&
      mentionsOutput);

  return strong;
};

/**
 * Create a Set of normalized asset URLs from user assets array
 * @param {Array} userAssets - Array of user asset objects
 * @returns {Set} Set of normalized asset URLs
 */
export const createAssetUrlSet = (userAssets) => {
  if (!Array.isArray(userAssets) || userAssets.length === 0) {
    return new Set();
  }

  const set = new Set();
  userAssets.forEach((asset) => {
    const candidate =
      asset?.imageUrl ||
      asset?.assetMetadata?.imageUrl ||
      asset?.assetMetadata?.downloadUrl;
    const normalized = normalizeImageUrl(candidate);
    if (normalized) {
      set.add(normalized);
    }
  });
  return set;
};
