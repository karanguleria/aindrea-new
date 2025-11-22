import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  X,
  Loader2,
  Download,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import ImageHeader from "./ImageHeader";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ProtectedImage } from "@/components/common/ProtectedImage";
import OptimizedImage from "@/components/common/OptimizedImage";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Stripe Elements styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: false,
};

// Checkout Form Component that uses Stripe Elements
function CheckoutForm({ displayItems, licenseType, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatZipCode = (value) => {
    return value.replace(/[^0-9a-zA-Z\s-]/gi, "").substring(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please wait.");
      return;
    }

    if (processingPayment) return;

    // Validate billing details
    if (!formData.cardholderName || formData.cardholderName.trim().length < 3) {
      toast.error("Please enter the cardholder name");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      toast.error("Please enter your address");
      return;
    }

    if (!formData.city || formData.city.trim().length < 2) {
      toast.error("Please enter your city");
      return;
    }

    if (!formData.zipCode || formData.zipCode.trim().length < 3) {
      toast.error("Please enter your ZIP code");
      return;
    }

    if (!formData.country) {
      toast.error("Please select your country");
      return;
    }

    try {
      setProcessingPayment(true);

      // Get selected cart item IDs
      const selectedItemIds = displayItems.map((item) => item._id.toString());

      console.log("🛒 Display items:", displayItems);
      console.log("🎯 Selected item IDs:", selectedItemIds);
      console.log("📄 License type:", licenseType);

      // Create payment intent
      const paymentResponse = await apiService.createPaymentIntent(
        selectedItemIds,
        licenseType
      );

      console.log("💳 Payment response:", paymentResponse);

      if (!paymentResponse.success) {
        throw new Error(
          paymentResponse.message || "Failed to create payment intent"
        );
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe Elements
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentResponse.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.cardholderName,
              email: formData.email,
              address: {
                line1: formData.address,
                city: formData.city,
                postal_code: formData.zipCode,
                country: formData.country,
              },
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        const confirmResponse = await apiService.confirmPayment(
          paymentIntent.id
        );

        if (confirmResponse.success) {
          toast.success(
            `Payment successful! ${confirmResponse.data.totalLicenses} license(s) created.`
          );
          onSuccess();
        } else {
          throw new Error(
            confirmResponse.message || "Failed to confirm payment"
          );
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Calculate total based on displayed items and license type
  const totalAmount = displayItems.reduce((sum, item) => {
    const price = licenseType === "rent" ? item.price * 0.3 : item.price;
    return sum + price;
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Card Details <span className="text-red-500">*</span>
        </label>
        <div className="p-4 border border-border rounded-md bg-background/50">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Cardholder Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Cardholder Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="John Doe"
          value={formData.cardholderName}
          onChange={(e) => handleInputChange("cardholderName", e.target.value)}
          required
          className="h-12 bg-transparent border-border border text-foreground placeholder:text-gray-400"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          className="h-12 bg-transparent border-border border text-foreground placeholder:text-gray-400"
        />
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Billing Address
        </h3>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Street Address *"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            required
            className="h-12 bg-transparent border-border border text-foreground placeholder:text-gray-400"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="City *"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              required
              className="h-12 bg-transparent border-border border text-foreground placeholder:text-gray-400"
            />
            <Input
              type="text"
              placeholder="ZIP Code *"
              value={formData.zipCode}
              onChange={(e) =>
                handleInputChange("zipCode", formatZipCode(e.target.value))
              }
              maxLength="10"
              required
              className="h-12 bg-transparent border-border border text-foreground placeholder:text-gray-400"
            />
          </div>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            required
            className="h-12 w-full px-4 bg-transparent border-border border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" className="bg-background">
              Select Country
            </option>
            <option value="US" className="bg-background">
              United States
            </option>
            <option value="GB" className="bg-background">
              United Kingdom
            </option>
            <option value="CA" className="bg-background">
              Canada
            </option>
            <option value="AU" className="bg-background">
              Australia
            </option>
            <option value="PK" className="bg-background">
              Pakistan
            </option>
            <option value="IN" className="bg-background">
              India
            </option>
            <option value="AE" className="bg-background">
              United Arab Emirates
            </option>
            <option value="SA" className="bg-background">
              Saudi Arabia
            </option>
            <option value="DE" className="bg-background">
              Germany
            </option>
            <option value="FR" className="bg-background">
              France
            </option>
            <option value="IT" className="bg-background">
              Italy
            </option>
            <option value="ES" className="bg-background">
              Spain
            </option>
            <option value="NL" className="bg-background">
              Netherlands
            </option>
            <option value="BE" className="bg-background">
              Belgium
            </option>
            <option value="CH" className="bg-background">
              Switzerland
            </option>
            <option value="SE" className="bg-background">
              Sweden
            </option>
            <option value="NO" className="bg-background">
              Norway
            </option>
            <option value="DK" className="bg-background">
              Denmark
            </option>
            <option value="FI" className="bg-background">
              Finland
            </option>
            <option value="JP" className="bg-background">
              Japan
            </option>
            <option value="CN" className="bg-background">
              China
            </option>
            <option value="KR" className="bg-background">
              South Korea
            </option>
            <option value="SG" className="bg-background">
              Singapore
            </option>
            <option value="HK" className="bg-background">
              Hong Kong
            </option>
            <option value="MY" className="bg-background">
              Malaysia
            </option>
            <option value="TH" className="bg-background">
              Thailand
            </option>
            <option value="ID" className="bg-background">
              Indonesia
            </option>
            <option value="PH" className="bg-background">
              Philippines
            </option>
            <option value="VN" className="bg-background">
              Vietnam
            </option>
            <option value="BD" className="bg-background">
              Bangladesh
            </option>
            <option value="LK" className="bg-background">
              Sri Lanka
            </option>
            <option value="NP" className="bg-background">
              Nepal
            </option>
            <option value="EG" className="bg-background">
              Egypt
            </option>
            <option value="ZA" className="bg-background">
              South Africa
            </option>
            <option value="NG" className="bg-background">
              Nigeria
            </option>
            <option value="KE" className="bg-background">
              Kenya
            </option>
            <option value="BR" className="bg-background">
              Brazil
            </option>
            <option value="MX" className="bg-background">
              Mexico
            </option>
            <option value="AR" className="bg-background">
              Argentina
            </option>
            <option value="CL" className="bg-background">
              Chile
            </option>
            <option value="CO" className="bg-background">
              Colombia
            </option>
            <option value="PE" className="bg-background">
              Peru
            </option>
            <option value="TR" className="bg-background">
              Turkey
            </option>
            <option value="IL" className="bg-background">
              Israel
            </option>
            <option value="RU" className="bg-background">
              Russia
            </option>
            <option value="PL" className="bg-background">
              Poland
            </option>
            <option value="CZ" className="bg-background">
              Czech Republic
            </option>
            <option value="AT" className="bg-background">
              Austria
            </option>
            <option value="IE" className="bg-background">
              Ireland
            </option>
            <option value="NZ" className="bg-background">
              New Zealand
            </option>
          </select>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        type="submit"
        disabled={processingPayment || !stripe}
        className="w-full h-14 text-lg font-semibold bg-primary shadow-lg"
      >
        {processingPayment ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            {licenseType === "rent" ? "Rent" : "Purchase"} Securely - $
            {totalAmount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function StripePaymentCheckout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [licenseType, setLicenseType] = useState("purchase");

  // Get backend URL
  const getBackendUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl && typeof window !== "undefined") {
      const currentHost = window.location.hostname;
      if (currentHost.includes("aindrea.ai")) {
        return "https://apis.aindrea.ai";
      }
    }
    return apiUrl || "http://localhost:5012";
  };

  // Create full image URL
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendUrl = getBackendUrl();
    return `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
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
      setCartItems(response.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Filter cart items based on itemId query param
  const itemId = router.query.itemId;
  const displayItems = itemId
    ? cartItems.filter((item) => item._id === itemId)
    : cartItems;

  const removeImage = async (itemId) => {
    try {
      await apiService.removeFromCart(itemId);
      toast.success("Item removed from cart");
      fetchCart();
      if (router.query.itemId && displayItems.length === 1) {
        handleGoBack();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleGoBack = () => {
    const isCreator = router.pathname.startsWith("/creator");
    const backPath = isCreator
      ? "/creator/image-selection-canvas"
      : "/dashboard/image-selection-canvas";
    router.push(backPath);
  };

  const totalAmount = displayItems.reduce((sum, item) => {
    const price = licenseType === "rent" ? item.price * 0.3 : item.price;
    return sum + price;
  }, 0);

  return (
    <>
      <ImageHeader
        title={"Secure Payment Checkout"}
        buttonText={`${itemId ? "1 Item" : `${displayItems.length} Items`}`}
      />
      <div className="border-border border rounded-3xl p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading checkout...</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground text-lg mb-2">
              {cartItems.length === 0 ? "Your cart is empty" : "Item not found"}
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {cartItems.length === 0
                ? "Add some images to your cart before checkout!"
                : "The selected item may have been removed from your cart."}
            </p>
            <Button onClick={handleGoBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section: Selected Images */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <ArrowLeft
                  onClick={handleGoBack}
                  className="h-5 w-5 text-foreground cursor-pointer hover:text-primary transition-colors"
                />
                <h1 className="text-2xl font-bold text-foreground">
                  {itemId ? "Your Selected Image" : "Your Selected Images"}
                </h1>
              </div>

              <div className="space-y-4">
                {displayItems.map((item, index) => {
                  const fullImageUrl = getFullImageUrl(item.imageUrl);
                  return (
                    <div
                      key={item._id || index}
                      className="relative border-2 border-dashed border-primary rounded-lg p-4"
                    >
                      <button
                        onClick={() => removeImage(item._id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-foreground font-semibold text-lg">
                            Generated Image #{index + 1}
                          </h3>
                          <p className="text-foreground/50 text-sm">
                            Standard License
                          </p>
                          <p className="text-primary font-bold text-lg">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <ProtectedImage
                          className="w-20 h-20 rounded-lg overflow-hidden border border-border"
                          imageUrl={fullImageUrl}
                          allowPurchases={true}
                        >
                          {fullImageUrl ? (
                            <OptimizedImage
                              optimizedUrl={getOptimizedImageUrl(item)}
                              fallbackUrl={fullImageUrl}
                              alt={item.prompt || "Cart image"}
                              width={256}
                              height={256}
                              className="w-full h-full object-cover"
                              draggable={false}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                return false;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-xs text-muted-foreground">
                                No image
                              </span>
                            </div>
                          )}
                        </ProtectedImage>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Section: License & Payment */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                License & Payment
              </h2>

              {/* License Type Selection */}
              <Card className="border border-border bg-transparent">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Choose License Type
                  </h3>
                  <RadioGroup
                    value={licenseType}
                    onValueChange={setLicenseType}
                  >
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg mb-3">
                      <RadioGroupItem
                        value="purchase"
                        id="purchase"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="purchase"
                          className="text-foreground font-medium cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Full Purchase License
                          </div>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Own the asset forever. Commercial use, modification,
                          and unlimited downloads.
                        </p>
                        <p className="text-sm font-medium text-foreground mt-2">
                          $
                          {displayItems
                            .reduce((sum, item) => sum + item.price, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="rent" id="rent" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="rent"
                          className="text-foreground font-medium cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            30-Day Rental License
                          </div>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use for 30 days. Commercial use and modification
                          allowed. Can repurchase later.
                        </p>
                        <p className="text-sm font-medium text-foreground mt-2">
                          ${totalAmount.toFixed(2)} (70% off full price)
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Form with Stripe Elements */}
              <Card className="border border-border bg-transparent text-foreground">
                <CardContent className="p-6">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      displayItems={displayItems}
                      licenseType={licenseType}
                      onSuccess={() => {
                        setTimeout(() => {
                          const isCreator =
                            router.pathname.startsWith("/creator");
                          const historyPath = isCreator
                            ? "/creator/briefs"
                            : "/dashboard/briefs";
                          router.push(historyPath);
                        }, 2000);
                      }}
                      onBack={handleGoBack}
                    />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
