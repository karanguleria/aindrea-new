/**
 * Message formatting utilities for converting between API and frontend formats
 */

/**
 * Formats a single message from API format to frontend format
 * @param {Object} msg - Message from API
 * @returns {Object} Formatted message for frontend
 */
export const formatMessageFromAPI = (msg) => {
  return {
    id: msg._id,
    message: msg.content,
    isUser: msg.role === "user",
    timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    mode: msg.mode || "text",
    imageUrl: msg.imageUrl,
    imageData: msg.imageData,
    imageMeta: msg.imageMeta,
    variants: msg.variants,
    files: msg.files || [],
    feedback: msg.feedback || { thumbsUp: false, thumbsDown: false },
  };
};

/**
 * Formats multiple messages from API format to frontend format
 * @param {Array} messages - Array of messages from API
 * @returns {Array} Array of formatted messages
 */
export const formatMessagesFromAPI = (messages) => {
  if (!Array.isArray(messages)) {
    return [];
  }
  return messages.map(formatMessageFromAPI);
};

/**
 * Cleans action markers from message text for display
 * @param {string} message - Raw message text
 * @returns {string} Cleaned message text
 */
export const formatMessageForDisplay = (message) => {
  if (!message || typeof message !== "string") {
    return "";
  }
  return message
    .replace(/\[AC?TION:(question|generate|text)\]/gi, "")
    .replace(/\[ACITON:(question|generate|text)\]/gi, "")
    .replace(/\[VARIANTS:\d+\]/gi, "")
    .trim();
};

/**
 * Checks if message contains action markers
 * @param {string} message - Message text
 * @returns {boolean} True if message contains action markers
 */
export const containsActionMarkers = (message) => {
  if (!message || typeof message !== "string") {
    return false;
  }
  return /\[(ac?tion|variants):/i.test(message);
};
