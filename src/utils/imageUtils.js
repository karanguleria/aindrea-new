const DALL_E_HOST = "oaidalleapiprodscus.blob.core.windows.net";
const DIGITAL_OCEAN_HOST = "digitaloceanspaces.com";

const hasValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const getPreferredImageUrl = (optimizedUrl, fallbackUrl) => {
  if (hasValue(optimizedUrl)) {
    return optimizedUrl.trim();
  }
  return fallbackUrl || "";
};

export const shouldBypassOptimization = (url) => {
  if (!hasValue(url)) return false;

  const normalized = url.toLowerCase();

  return (
    normalized.startsWith("data:") ||
    normalized.includes(DALL_E_HOST) ||
    normalized.endsWith(".svg")
  );
};

export const isDigitalOceanUrl = (url) =>
  hasValue(url) && url.includes(DIGITAL_OCEAN_HOST);

export const isDalleUrl = (url) =>
  hasValue(url) && url.includes(DALL_E_HOST);

export const buildImageAlt = (fallbackAlt, fallback = "Generated image") =>
  hasValue(fallbackAlt) ? fallbackAlt : fallback;

export const imageUtils = {
  getPreferredImageUrl,
  shouldBypassOptimization,
  isDigitalOceanUrl,
  isDalleUrl,
  buildImageAlt,
};

export default imageUtils;

