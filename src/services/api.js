// API Service Layer for AiNDREA
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5012";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRedirecting = false; // Flag to prevent multiple redirects
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const {
      responseType,
      headers: customHeaders,
      onProgress,
      ...restOptions
    } = options;

    // Initialize config with custom headers
    const config = {
      headers: {
        ...customHeaders,
      },
      ...restOptions,
    };

    // Only set Content-Type if body is not FormData
    // FormData automatically sets the correct Content-Type with boundary
    if (
      config.body &&
      !(config.body instanceof FormData) &&
      !config.headers["Content-Type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["auth-token"] = token;
      }
    }

    if (onProgress) {
      config.headers["x-stream-progress"] = "1";
      if (!config.headers["Accept"]) {
        config.headers["Accept"] = "application/x-ndjson";
      }
    }

    const consumeStreamResponse = async (response) => {
      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this browser or endpoint."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalPayload = null;
      let receivedError = false;

      const processLine = (line) => {
        if (!line) return;
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }

        if (!event.type) {
          finalPayload = event;
          return;
        }

        if (event.type === "stage") {
          if (typeof onProgress === "function") {
            onProgress(event.data || {});
          }
        } else if (event.type === "complete") {
          finalPayload = event.data;
        } else if (event.type === "error") {
          finalPayload = event.data || {};
          receivedError = true;
        }
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const rawLine = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            processLine(rawLine);
            if (receivedError) {
              break;
            }
          }
          if (receivedError) {
            break;
          }
        }
        buffer += decoder.decode();
        const trimmed = buffer.trim();
        if (!receivedError && trimmed && !finalPayload) {
          processLine(trimmed);
        }
      } finally {
        reader.releaseLock();
      }

      if (!finalPayload) {
        throw new Error("Stream ended without a completion payload.");
      }

      return { payload: finalPayload, isError: receivedError };
    };

    try {
      const response = await fetch(url, config);

      let data;
      let streamResult = null;

      if (onProgress) {
        streamResult = await consumeStreamResponse(response);
        data = streamResult.payload;
      } else if (responseType === "blob") {
        data = await response.blob();
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = { message: await response.text() };
        }
      }

      if (!response.ok) {
        // Handle specific error cases
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (!onProgress && responseType === "blob" && data) {
          try {
            const text = await data.text();
            if (text) {
              try {
                const parsed = JSON.parse(text);
                errorMessage = parsed?.message || errorMessage;
              } catch {
                errorMessage = text || errorMessage;
              }
            }
          } catch {
            // ignore text parse issues
          }
        } else if (data?.message) {
          errorMessage = data.message;
        }

        if (response.status === 404) {
          console.log("404 error", response);
          errorMessage = "The requested resource was not found";
        } else if (response.status === 401) {
          // Check if this is a login/register endpoint - don't redirect for auth pages
          const isAuthEndpoint =
            endpoint.includes("/login") ||
            endpoint.includes("/register") ||
            endpoint.includes("/forgot-password") ||
            endpoint.includes("/reset-password");

          if (isAuthEndpoint) {
            // For login/register, use the actual error message from the server
            errorMessage = data.message || "Invalid credentials";
          } else {
            // Check if we're in the process of logging out - don't show error
            const isLoggingOut =
              typeof window !== "undefined" &&
              localStorage.getItem("isLoggingOut") === "true";

            if (isLoggingOut) {
              // During logout, return a silent error that won't break the flow
              const silentError = new Error("Session ended");
              silentError.status = 401;
              silentError.endpoint = endpoint;
              silentError.silent = true; // Flag to indicate this is a silent error
              throw silentError;
            } else {
              // For authenticated endpoints, treat as expired session
              errorMessage = "Please log in to continue";

              // Handle authentication expiry - redirect to login immediately
              if (typeof window !== "undefined" && !this.isRedirecting) {
                this.isRedirecting = true; // Set flag to prevent multiple redirects

                // Clear auth token immediately
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Redirect immediately without delay
                window.location.href = "/";
              }
            }
          }
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later";
        } else if (response.status === 503) {
          errorMessage =
            "Service temporarily unavailable. Please try again later";
        } else if (response.status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment and try again";
        }

        // Create a custom error object with more details
        // Skip if we already threw a silent error during logout
        const isLoggingOutCheck =
          typeof window !== "undefined" &&
          localStorage.getItem("isLoggingOut") === "true";
        
        if (response.status === 401 && isLoggingOutCheck) {
          // Error already thrown above, don't create another one
          // Re-throw the silent error that was already thrown
          const silentError = new Error("Session ended");
          silentError.status = 401;
          silentError.endpoint = endpoint;
          silentError.silent = true;
          throw silentError;
        }
        
        const customError = new Error(errorMessage);
        customError.status = response.status;
        customError.endpoint = endpoint;
        customError.timestamp = new Date().toISOString();

        // Show toast for user-facing errors
        // Exclude: authenticated 401 (already handled with redirect), not found errors
        const isAuthEndpoint =
          endpoint.includes("/login") ||
          endpoint.includes("/register") ||
          endpoint.includes("/forgot-password") ||
          endpoint.includes("/reset-password");

        // Check if we're logging out - don't show errors during logout
        const isLoggingOut =
          typeof window !== "undefined" &&
          localStorage.getItem("isLoggingOut") === "true";

        // Don't show toast for 401 errors on authenticated endpoints (redirect will happen)
        // Also don't show toast if we're in the process of logging out
        // Only show toast for 401 on auth endpoints (login/register failures)
        if (isLoggingOut) {
          // Don't show any errors during logout
        } else if (response.status === 401 && !isAuthEndpoint) {
          // Don't show toast, just redirect (already handled above)
        } else if (response.status === 401 && isAuthEndpoint) {
          // Show toast for login/register failures
          toast.error(errorMessage);
        } else if (
          response.status !== 401 &&
          !errorMessage.includes("Chat not found") &&
          !errorMessage.includes("not found")
        ) {
          // Show toast for other errors
          toast.error(errorMessage);
        }

        throw customError;
      }

      if (responseType === "blob") {
        return {
          data,
          headers: response.headers,
          status: response.status,
        };
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);

      // Check if we're logging out - don't show errors during logout
      const isLoggingOut =
        typeof window !== "undefined" &&
        localStorage.getItem("isLoggingOut") === "true";

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(
          "Network error. Please check your connection."
        );
        networkError.type = "network";
        networkError.endpoint = endpoint;
        if (!isLoggingOut) {
          toast.error("Network error. Please check your connection.");
        }
        throw networkError;
      }

      // Handle timeout errors
      if (error.name === "AbortError") {
        const timeoutError = new Error("Request timed out. Please try again.");
        timeoutError.type = "timeout";
        timeoutError.endpoint = endpoint;
        if (!isLoggingOut) {
          toast.error("Request timed out. Please try again.");
        }
        throw timeoutError;
      }

      // Re-throw custom errors as-is
      if (error.status) {
        throw error;
      }

      // Handle unexpected errors
      const unexpectedError = new Error(
        "An unexpected error occurred. Please try again."
      );
      unexpectedError.type = "unexpected";
      unexpectedError.endpoint = endpoint;
      unexpectedError.originalError = error;
      if (!isLoggingOut) {
        toast.error("An unexpected error occurred. Please try again.");
      }
      throw unexpectedError;
    }
  }

  // Authentication methods
  async login(email, password) {
    return this.request("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request("/api/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUserDetails() {
    return this.request("/api/user/details");
  }

  async getUserUsage() {
    return this.request("/api/user/usage");
  }

  async updateUser(userData) {
    return this.request("/api/user/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    return this.request("/api/user/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request("/api/user/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // Chat methods
  async createChat(
    firstMessage,
    title,
    mode = "text",
    context = [],
    files = [],
    variantCount = 1
  ) {
    return this.request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        firstMessage,
        title,
        mode,
        context,
        files,
        variantCount,
      }),
    });
  }

  async getUserChats(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({ page, limit, search });
    return this.request(`/api/chat?${params}`);
  }

  async getChatById(chatId, limit = null, offset = null) {
    let url = `/api/chat/${chatId}`;

    // Add pagination parameters if provided
    if (limit !== null || offset !== null) {
      const params = new URLSearchParams();
      if (limit !== null) params.append("limit", limit);
      if (offset !== null) params.append("offset", offset);
      url += `?${params.toString()}`;
    }

    return this.request(url);
  }

  async sendMessage(
    chatId,
    content,
    mode = "text",
    context = [],
    files = [],
    variantCount = 1,
    forceGenerate = false,
    extraOptions = {}
  ) {
    return this.request(`/api/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
        mode,
        context,
        files,
        variantCount,
        forceGenerate,
      }),
      ...(extraOptions.onProgress
        ? { onProgress: extraOptions.onProgress }
        : {}),
    });
  }

  async sendImageMessage(chatId, content, imageUrl, imageData) {
    return this.request(`/api/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, imageUrl, imageData }),
    });
  }

  // Save message without generating AI response (for image generation)
  async saveMessageOnly(chatId, content, imageUrl, imageData, role = "user") {
    return this.request(`/api/chat/${chatId}/save-message`, {
      method: "POST",
      body: JSON.stringify({ content, imageUrl, imageData, role }),
    });
  }

  async updateChatTitle(chatId, title) {
    return this.request(`/api/chat/${chatId}/title`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  }

  async deleteChat(chatId) {
    return this.request(`/api/chat/${chatId}`, {
      method: "DELETE",
    });
  }

  async searchChats(query) {
    return this.request(`/api/chat/search?query=${encodeURIComponent(query)}`);
  }

  async rateMessage(chatId, messageIndex, thumbsUp, thumbsDown) {
    return this.request(`/api/chat/${chatId}/rate-message`, {
      method: "POST",
      body: JSON.stringify({ messageIndex, thumbsUp, thumbsDown }),
    });
  }

  // Image methods
  async generateImage(
    prompt,
    quality = "standard",
    style = "photographic",
    service = "gemini"
  ) {
    return this.request("/api/image/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, quality, style, service }),
    });
  }

  async getUserImages(
    page = 1,
    limit = 20,
    search = "",
    style = "",
    quality = ""
  ) {
    const params = new URLSearchParams({ page, limit, search, style, quality });
    return this.request(`/api/image?${params}`);
  }

  async getImageById(imageId) {
    return this.request(`/api/image/${imageId}`);
  }

  async updateImage(imageId, updateData) {
    return this.request(`/api/image/${imageId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async deleteImage(imageId) {
    return this.request(`/api/image/${imageId}`, {
      method: "DELETE",
    });
  }

  async searchImages(query) {
    return this.request(`/api/image/search?query=${encodeURIComponent(query)}`);
  }

  async getPublicImages(page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/api/image/public?${params}`);
  }

  // Stripe payment methods
  async createPaymentIntent(cartItemIds, licenseType = "purchase") {
    return this.request("/api/stripe/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ cartItemIds, licenseType }),
    });
  }

  async confirmPayment(paymentIntentId) {
    return this.request("/api/stripe/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getUserLicenses(
    licenseType = null,
    status = null,
    page = 1,
    limit = 20
  ) {
    const params = new URLSearchParams({ page, limit });
    if (licenseType) params.append("licenseType", licenseType);
    if (status) params.append("status", status);
    return this.request(`/api/stripe/licenses?${params}`);
  }

  async downloadAsset(licenseId) {
    return this.request(`/api/stripe/download/${licenseId}`, {
      method: "GET",
      responseType: "blob",
    });
  }

  async repurchaseRentedAsset(licenseId, licenseType = "purchase") {
    return this.request("/api/stripe/repurchase", {
      method: "POST",
      body: JSON.stringify({ licenseId, licenseType }),
    });
  }

  // Transaction history methods
  async getUserTransactions(
    status = null,
    licenseType = null,
    page = 1,
    limit = 20
  ) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    if (licenseType) params.append("licenseType", licenseType);
    return this.request(`/api/stripe/transactions?${params}`);
  }

  async getTransactionById(transactionId) {
    return this.request(`/api/stripe/transaction/${transactionId}`);
  }

  // Invoice methods
  async getInvoiceById(invoiceId) {
    return this.request(`/api/invoice/${invoiceId}`);
  }

  // Image editing methods
  async editImage(chatId, imageFile, prompt, maskData = null) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", prompt);
    if (maskData) {
      formData.append("maskData", maskData);
    }

    return this.request(`/api/chat/${chatId}/edit-image`, {
      method: "POST",
      body: formData,
      // Don't set headers - FormData will set Content-Type automatically
    });
  }

  async generateImageVariation(chatId, imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.request(`/api/chat/${chatId}/generate-variation`, {
      method: "POST",
      body: formData,
      // Don't set headers - FormData will set Content-Type automatically
    });
  }

  // AI Features methods
  async getAIFeatures() {
    return this.request("/api/aifeatures");
  }

  async enableAIFeatures(features) {
    return this.request("/api/aifeatures/enable", {
      method: "POST",
      body: JSON.stringify(features),
    });
  }

  async updateSubscriptionPlan(plan) {
    return this.request("/api/aifeatures/subscription", {
      method: "PUT",
      body: JSON.stringify({ plan }),
    });
  }

  async getUsageStats() {
    return this.request("/api/aifeatures/usage");
  }

  async checkPermission(action) {
    return this.request(`/api/aifeatures/permission/${action}`);
  }

  // Cart methods
  async addToCart(imageUrl, imageData, prompt) {
    return this.request("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ imageUrl, imageData, prompt }),
    });
  }

  async getCart() {
    return this.request("/api/cart");
  }

  async removeFromCart(itemId) {
    return this.request(`/api/cart/remove/${itemId}`, {
      method: "DELETE",
    });
  }

  async clearCart() {
    return this.request("/api/cart/clear", {
      method: "DELETE",
    });
  }

  // Library methods
  async saveToLibrary(imageUrl, imageData, prompt, variantData = null) {
    return this.request("/api/library/save", {
      method: "POST",
      body: JSON.stringify({ imageUrl, imageData, prompt, variantData }),
    });
  }

  async removeFromLibrary(libraryItemId) {
    return this.request(`/api/library/remove/${libraryItemId}`, {
      method: "DELETE",
    });
  }

  async getLibrary(limit = 50, skip = 0) {
    const params = new URLSearchParams({ limit, skip });
    return this.request(`/api/library?${params}`);
  }

  async checkLibraryStatus(imageUrl) {
    return this.request(`/api/library/check?imageUrl=${encodeURIComponent(imageUrl)}`);
  }

  async saveAssetWithCredits({
    imageUrl,
    prompt,
    imageData,
    variantMeta,
    variantNumber,
    chatId,
    messageId,
    assetType = "image",
  }) {
    return this.request("/api/stripe/license-with-credits", {
      method: "POST",
      body: JSON.stringify({
        imageUrl,
        prompt,
        imageData,
        variantMeta,
        variantNumber,
        chatId,
        messageId,
        assetType,
      }),
    });
  }

  // Complaint methods
  async getUserAssets() {
    return this.request("/api/complaint/assets");
  }

  async submitComplaint(formData) {
    // formData should be a FormData object with licenseId, complainType, complainSummary, and optional evidence file
    return this.request("/api/complaint/submit", {
      method: "POST",
      body: formData,
    });
  }

  async getUserComplaints(status = null, limit = 50, skip = 0) {
    const params = new URLSearchParams({ limit, skip });
    if (status) params.append("status", status);
    return this.request(`/api/complaint?${params}`);
  }

  async getComplaintById(complaintId) {
    return this.request(`/api/complaint/${complaintId}`);
  }

  async deleteComplaint(complaintId) {
    return this.request(`/api/complaint/${complaintId}`, {
      method: "DELETE",
    });
  }

  // Brief methods
  async createBrief(briefData) {
    return this.request("/api/brief", {
      method: "POST",
      body: JSON.stringify(briefData),
    });
  }

  async extractBriefDetailsFromChat(chatId) {
    return this.request(`/api/brief/extract-from-chat/${chatId}`);
  }

  async getAllBriefs(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/api/brief?${queryParams}`);
  }

  async getClientBriefs(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/api/brief/client/my-briefs?${queryParams}`);
  }

  async getMyBids(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/api/brief/my-bids?${queryParams}`);
  }

  async getBriefById(briefId) {
    console.log(
      `API: getBriefById called with briefId: ${briefId} (type: ${typeof briefId})`
    );
    return this.request(`/api/brief/${briefId}`);
  }

  async updateBrief(briefId, updateData) {
    return this.request(`/api/brief/${briefId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async deleteBrief(briefId) {
    return this.request(`/api/brief/${briefId}`, {
      method: "DELETE",
    });
  }

  async createBriefPaymentIntent(briefId) {
    return this.request("/api/brief/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ briefId }),
    });
  }

  async confirmBriefPayment(paymentIntentId) {
    return this.request("/api/brief/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async submitBid(briefId, bidData) {
    return this.request(`/api/brief/${briefId}/bids`, {
      method: "POST",
      body: JSON.stringify(bidData),
    });
  }

  async acceptBid(briefId, bidId) {
    return this.request(`/api/brief/${briefId}/bids/${bidId}/accept`, {
      method: "PUT",
    });
  }

  async reviseBid(briefId, bidId, bidData) {
    return this.request(`/api/brief/${briefId}/bids/${bidId}/revise`, {
      method: "PUT",
      body: JSON.stringify(bidData),
    });
  }

  async uploadReferenceFiles(briefId, files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return this.request(`/api/brief/${briefId}/upload`, {
      method: "POST",
      body: formData,
    });
  }

  // Get available creators for selection
  async getAvailableCreators(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    return this.request(
      `/api/brief/available-creators${queryString ? `?${queryString}` : ""}`
    );
  }

  // Select creator for brief
  async selectCreatorForBrief(briefId, creatorId) {
    return this.request(`/api/brief/${briefId}/select-creator`, {
      method: "PUT",
      body: JSON.stringify({ creatorId }),
    });
  }

  // Remove creator selection (make open to all)
  async removeCreatorSelection(briefId) {
    return this.request(`/api/brief/${briefId}/select-creator`, {
      method: "DELETE",
    });
  }

  // Link chat to brief
  async linkChatToBrief(briefId, chatId) {
    return this.request(`/api/brief/${briefId}/link-chat`, {
      method: "POST",
      body: JSON.stringify({ chatId }),
    });
  }

  // Get brief chat messages
  async getBriefChat(briefId) {
    return this.request(`/api/brief/${briefId}/chat`);
  }

  // Unlink chat from brief
  async unlinkChatFromBrief(briefId) {
    return this.request(`/api/brief/${briefId}/unlink-chat`, {
      method: "DELETE",
    });
  }

  // Get enhanced bids for a brief (with filtering and sorting)
  async getBriefBids(briefId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    return this.request(
      `/api/brief/${briefId}/bids${query ? `?${query}` : ""}`
    );
  }

  // Get single bid details
  async getBidDetails(briefId, bidId) {
    return this.request(`/api/brief/${briefId}/bids/${bidId}`);
  }

  // Request bid revision
  async requestBidRevision(briefId, bidId, requirements = "") {
    return this.request(`/api/brief/${briefId}/bids/${bidId}/request-revision`, {
      method: "PUT",
      body: JSON.stringify({ requirements }),
    });
  }

  // Reject a bid
  async rejectBid(briefId, bidId, rejectionReason = null) {
    return this.request(`/api/brief/${briefId}/bids/${bidId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    });
  }

  // Revision methods
  async requestRevision(briefId, revisionData) {
    return this.request(`/api/brief/${briefId}/revisions`, {
      method: "POST",
      body: JSON.stringify(revisionData),
    });
  }

  async uploadRevisionFile(briefId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request(`/api/brief/${briefId}/revisions/upload`, {
      method: "POST",
      body: formData,
    });
  }

  async getRevisions(briefId) {
    return this.request(`/api/brief/${briefId}/revisions`);
  }

  async acceptRevision(briefId, revisionId) {
    return this.request(
      `/api/brief/${briefId}/revisions/${revisionId}/accept`,
      {
        method: "PUT",
      }
    );
  }

  async rejectRevision(briefId, revisionId, feedback) {
    return this.request(
      `/api/brief/${briefId}/revisions/${revisionId}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({ feedback }),
      }
    );
  }

  async getRevisionHistory(briefId) {
    return this.request(`/api/brief/${briefId}/revision-history`);
  }

  async markBriefCompleted(briefId) {
    return this.request(`/api/brief/${briefId}/complete`, {
      method: "PUT",
    });
  }

  // Wallet methods
  async getWalletBalance() {
    return this.request("/api/wallet/balance");
  }

  async getWalletHistory(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/api/wallet/history?${queryParams}`);
  }

  // Send message in brief conversation thread
  async sendBriefMessage(briefId, content, attachments = [], bidderId = null) {
    return this.request(`/api/brief/${briefId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, attachments, bidderId }),
    });
  }

  // Get all messages in brief conversation thread
  async getBriefMessages(briefId, bidderId = null) {
    const queryParam = bidderId ? `?bidderId=${bidderId}` : "";
    return this.request(`/api/brief/${briefId}/messages${queryParam}`);
  }

  // Upload attachment for brief message
  async uploadBriefAttachment(briefId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request(`/api/brief/${briefId}/messages/upload`, {
      method: "POST",
      body: formData,
    });
  }

  // ==================== CONVERSATION METHODS ====================

  // Get all conversations for the current user
  async getConversations(page = 1, limit = 20) {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    return this.request(`/api/conversation?${queryParams.toString()}`, {
      method: "GET",
    });
  }

  // Get conversation by ID
  async getConversationById(conversationId) {
    return this.request(`/api/conversation/${conversationId}`, {
      method: "GET",
    });
  }

  // Get paginated messages for a conversation
  async getConversationMessages(conversationId, page = 1, limit = 20) {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    return this.request(
      `/api/conversation/${conversationId}/messages?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  }

  // Send message in conversation
  async sendConversationMessage(conversationId, content, attachments = []) {
    return this.request(`/api/conversation/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
        attachments,
      }),
    });
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId) {
    return this.request(`/api/conversation/${conversationId}/read`, {
      method: "PUT",
    });
  }

  // Upload attachment for conversation
  async uploadConversationAttachment(conversationId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request(`/api/conversation/${conversationId}/attachments`, {
      method: "POST",
      body: formData,
    });
  }

  // Get or create conversation for a brief and user
  async getOrCreateConversation(briefId, userId) {
    return this.request(`/api/conversation/brief/${briefId}/user/${userId}`, {
      method: "GET",
    });
  }

  // ==================== NOTIFICATION METHODS ====================

  // Get user notifications
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.unreadOnly) queryParams.append("unreadOnly", params.unreadOnly);

    const queryString = queryParams.toString();
    const endpoint = `/api/notification${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint, {
      method: "GET",
    });
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notification/${notificationId}/read`, {
      method: "PUT",
    });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    return this.request("/api/notification/read-all", {
      method: "PUT",
    });
  }

  // Delete notification
  async deleteNotification(notificationId) {
    return this.request(`/api/notification/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Get all subscription plans
  async getAllPlans() {
    return this.request("/api/subscription/admin/plans", {
      method: "GET",
    });
  }

  // Get current user subscription
  async getCurrentUserSubscription() {
    return this.request("/api/subscription/current", {
      method: "GET",
    });
  }

  // Get single prices (public endpoint)
  async getSinglePrices() {
    return this.request("/api/singleprice", {
      method: "GET",
    });
  }

  // Get single price by asset type
  async getSinglePriceByType(assetType) {
    return this.request(`/api/singleprice/${assetType}`, {
      method: "GET",
    });
  }

  // Get user subscription history (all subscriptions)
  async getUserSubscriptionHistory() {
    return this.request("/api/subscription/history", {
      method: "GET",
    });
  }

  // Cancel current user subscription
  async cancelCurrentSubscription() {
    return this.request("/api/subscription/cancel", {
      method: "POST",
    });
  }

  // Create subscription checkout
  async createSubscriptionCheckout(planId) {
    return this.request("/api/subscription/checkout", {
      method: "POST",
      body: JSON.stringify({ planId }),
    });
  }

  // Helper method to get auth token
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
