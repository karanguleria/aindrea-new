/**
 * URL helper utilities for extracting chatId from Next.js router
 */

/**
 * Check if current pathname is a chat page
 * @param {string} pathname - Router pathname
 * @returns {boolean} True if pathname is a chat page
 */
export const isChatPage = (pathname) => {
  return pathname === "/dashboard/chat" || pathname === "/creator/chat";
};

/**
 * Check if current pathname is a brief-details or revision-history page
 * @param {string} pathname - Router pathname
 * @returns {boolean} True if pathname is a brief-details or revision-history page
 */
export const isBriefDetailsPage = (pathname) => {
  if (!pathname) return false;
  return (
    pathname.includes("/brief-details/") ||
    pathname.includes("/revision-history/")
  );
};

/**
 * Check if current pathname is a bids detail page
 * @param {string} pathname - Router pathname
 * @returns {boolean} True if pathname is a bids detail page
 */
export const isBidsPage = (pathname) => {
  if (!pathname) return false;
  return pathname.includes("/bids/");
};

/**
 * Extract chatId from Next.js router query
 * @param {Object} router - Next.js router object
 * @returns {string|null} ChatId from URL or null
 */
export const getChatIdFromUrl = (router) => {
  if (!router || !router.isReady) return null;

  const isChatPagePath = isChatPage(router.pathname);
  const isBriefDetailsPath = isBriefDetailsPage(router.pathname);
  const isBidsPagePath = isBidsPage(router.pathname);

  // On chat page, prefer id parameter, otherwise use chatId
  if (isChatPagePath) {
    return router.query.id || router.query.chatId || null;
  }

  // On other pages, use chatId or id (but not on brief-details or bids pages)
  return (
    router.query.chatId ||
    (!isBriefDetailsPath && !isBidsPagePath ? router.query.id : null) ||
    null
  );
};
