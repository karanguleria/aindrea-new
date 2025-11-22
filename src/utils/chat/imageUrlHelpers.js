/**
 * Image URL helper utilities for handling image URLs, placeholders, and normalization
 */

/**
 * Get the backend URL from environment or use default
 * @returns {string} Backend URL
 */
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5012";
};

/**
 * Check if image is a placeholder
 * @param {string} url - Image URL to check
 * @returns {boolean} True if URL is a placeholder
 */
export const isPlaceholderImage = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.includes("placeholder.com") || url.includes("via.placeholder");
};

/**
 * Create full image URL if imageUrl is a relative path
 * @param {string|Object} url - Image URL (can be string or object with url property)
 * @returns {string|null} Full image URL or null if invalid
 */
export const getFullImageUrl = (url) => {
  if (!url) return null;

  // Handle if url is an object (from variants)
  if (typeof url === "object" && url.url) {
    url = url.url;
  }

  // Handle if url is an array (shouldn't happen but be safe)
  if (Array.isArray(url)) {
    return null;
  }

  // Ensure url is a string
  if (typeof url !== "string") {
    console.warn("getFullImageUrl received non-string:", typeof url, url);
    return null;
  }

  // If it's already a full URL (starts with http), return as is
  if (url.startsWith("http")) {
    return url;
  }

  // If it's a relative path, prepend the backend URL
  const backendUrl = getBackendUrl();
  return `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
};

/**
 * Normalize image URL by removing query params and hash
 * @param {string} url - Image URL to normalize
 * @returns {string} Normalized URL
 */
export const normalizeImageUrl = (url) => {
  if (!url) return "";
  const absoluteUrl = getFullImageUrl(url);
  if (!absoluteUrl) return "";
  try {
    const parsed = new URL(absoluteUrl);
    parsed.search = "";
    parsed.hash = "";
    return parsed.href;
  } catch (error) {
    return absoluteUrl;
  }
};
