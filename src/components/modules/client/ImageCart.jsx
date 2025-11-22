import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageHeader from "./ImageHeader";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function ImageCart() {
  const { isDark } = useThemeUtils();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get backend URL
  const getBackendUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // On production, try to detect from window location
    if (!apiUrl && typeof window !== "undefined") {
      const currentHost = window.location.hostname;
      // If on production domain, use production API
      if (currentHost.includes("aindrea.ai")) {
        return "https://apis.aindrea.ai";
      }
    }

    return apiUrl || "http://localhost:5012";
  };

  // Create full image URL if imageUrl is a relative path
  const getFullImageUrl = (url) => {
    if (!url) {
      return null;
    }


    // If it's already a full URL (starts with http), return as is
    if (url.startsWith("http")) {
      return url;
    }

    // If it's a relative path, prepend the backend URL
    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
    return fullUrl;
  };

  const getOptimizedImageUrl = (item) => {
    const candidate =
      item?.imageData?.optimizedUrl ||
      item?.optimizedUrl ||
      item?.variantOptimizedUrl;

    if (!candidate || typeof candidate !== "string") {
      return null;
    }

    return getFullImageUrl(candidate);
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCart();
      const items = response.data?.items || [];

      setCartItems(items);
    } catch (error) {
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [router.asPath]); // Re-fetch when route changes (including when navigating to this page)

  // Listen for custom cart update event
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Also refresh cart when page becomes visible (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCart();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleRemoveFromCart = async (itemId) => {
    try {
      await apiService.removeFromCart(itemId);
      toast.success("Item removed from cart");
      fetchCart(); // Refresh cart
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = (itemId = null) => {
    // Detect if we're in creator or client context
    const isCreator = router.pathname.startsWith("/creator");
    const checkoutPath = isCreator
      ? "/creator/stripe-payment-checkout"
      : "/dashboard/stripe-payment-checkout";

    // Preserve query parameters
    const queryParams = new URLSearchParams(window.location.search);

    // If itemId is provided, add it to query params for single item checkout
    if (itemId) {
      queryParams.set("itemId", itemId);
    } else {
      // Remove itemId if checking out all items
      queryParams.delete("itemId");
    }

    const redirectPath = queryParams.toString()
      ? `${checkoutPath}?${queryParams.toString()}`
      : checkoutPath;

    router.push(redirectPath);
  };

  return (
    <>
      <ImageHeader
        title={"Image Selection Canvas"}
        buttonText={`Cart (${cartItems.length})`}
      />
      <div className="p-6 space-y-10 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading cart...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground text-lg mb-2">Your cart is empty</p>
            <p className="text-muted-foreground text-sm">
              Generate images in chat and add them to your cart!
            </p>
          </div>
        ) : (
          <>
            {/* Header Message */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full border-border border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
                <Image
                  className="flex items-center justify-center"
                  src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                  alt="logo"
                  width={30}
                  height={30}
                />
              </div>
              <div className="flex-1">
                <div className="border-border bg-transparent border rounded-2xl p-3">
                  <p className="text-foreground text-sm leading-relaxed mb-3">
                    Here are your selected images from the cart. You can review,
                    edit, or license any of them!
                  </p>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-medium">
                        Total: $
                        {cartItems
                          .reduce((sum, item) => sum + (item.price || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleCheckout()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cartItems.map((item, index) => {
                const fullImageUrl = getFullImageUrl(item.imageUrl);
                return (
                  <div key={item._id || index} className="flex justify-center">
                    <div className="relative group">
                      <ProtectedImage
                        className="relative w-full max-w-md overflow-hidden border-2 border-teal-500 rounded-lg"
                        imageUrl={fullImageUrl}
                        allowPurchases={true}
                      >
                        <div className="w-full h-auto flex items-center justify-center bg-muted">
                          {fullImageUrl ? (
                            <OptimizedImage
                              optimizedUrl={getOptimizedImageUrl(item)}
                              fallbackUrl={fullImageUrl}
                              alt={item.prompt || "Cart image"}
                              width={1024}
                              height={1024}
                              className="w-full h-auto object-cover transition-all duration-300 group-hover:blur-sm group-hover:scale-105"
                              draggable={false}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                return false;
                              }}
                            />
                          ) : (
                            <p className="text-muted-foreground">
                              No image URL
                            </p>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40 pointer-events-none" />

                        {/* Price Badge - Top Left (Only on Hover) */}
                        <div className="absolute top-3 left-3 bg-white rounded-md px-3 py-1.5 shadow-lg z-50 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                          <span className="text-primary font-bold text-sm">
                            ${(item.price || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Remove Button - Top Right (Only on Hover) */}
                        <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                          <button
                            onClick={() => handleRemoveFromCart(item._id)}
                            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Buy Icon - Bottom Left (Only on Hover) */}
                        <div className="absolute bottom-3 left-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                          <button
                            onClick={() => handleCheckout(item._id)}
                            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-all hover:bg-primary/90 hover:scale-125 shadow-lg"
                            title="Buy this image"
                          >
                            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                          </button>
                        </div>
                      </ProtectedImage>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Message */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full border-border border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
                <Image
                  className="flex items-center justify-center"
                  src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                  alt="logo"
                  width={30}
                  height={30}
                />
              </div>
              <div className="flex-1">
                <div className="border-border bg-transparent border rounded-2xl p-3">
                  <p className="text-foreground text-sm leading-relaxed">
                    Ready to proceed? Click the button above to continue with
                    your selection!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
