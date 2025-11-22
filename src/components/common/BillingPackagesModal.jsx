"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BaseModal } from "@/components/ui/base-modal";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import CancelSubscriptionModal from "./CancelSubscriptionModal";

export default function BillingPackagesModal({ isOpen, onClose }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  const monthlyGenerationsUsed =
    currentSubscription?.usage?.monthlyImagesGenerated ??
    currentSubscription?.usage?.monthlyGenerations ??
    currentSubscription?.usage?.imagesGenerated ??
    0;

  const monthlyGenerationsLimit =
    currentSubscription?.planLimits &&
    typeof currentSubscription.planLimits.maxMonthlyGenerations !== "undefined"
      ? currentSubscription.planLimits.maxMonthlyGenerations
      : null;

  const remainingMonthlyGenerations =
    typeof monthlyGenerationsLimit === "number"
      ? Math.max(monthlyGenerationsLimit - monthlyGenerationsUsed, 0)
      : null;

  const watermarkFreeExportsUsed =
    currentSubscription?.usage?.watermarkFreeExportsUsed ?? 0;

  const watermarkFreeExportsLimit =
    currentSubscription?.planLimits &&
    typeof currentSubscription.planLimits.maxWatermarkFreeExports !==
      "undefined"
      ? currentSubscription.planLimits.maxWatermarkFreeExports
      : null;

  const remainingWatermarkFreeExports =
    typeof watermarkFreeExportsLimit === "number"
      ? Math.max(watermarkFreeExportsLimit - watermarkFreeExportsUsed, 0)
      : null;

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [isOpen]);

  // Check if returning from Stripe checkout success
  useEffect(() => {
    const checkStripeRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionStatus = urlParams.get("subscription");

      if (subscriptionStatus === "success") {
        // Remove the query parameter
        router.replace(router.pathname, undefined, { shallow: true });

        // Fetch current subscription to refresh UI
        // Webhooks handle the actual subscription activation
        await fetchCurrentSubscription();

        toast.success("Subscription activated successfully!", {
          toasterId: "subActiveToast",
        });
      } else if (subscriptionStatus === "cancelled") {
        router.replace(router.pathname, undefined, { shallow: true });
        toast.error("Payment was cancelled");
      }
    };

    checkStripeRedirect();
  }, [router]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllPlans();
      if (response.success) {
        // Filter out inactive plans - only show active plans to users
        const activePlans = response.data.filter(
          (plan) => plan.isActive !== false
        );
        setPlans(activePlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      setLoadingSubscription(true);
      const response = await apiService.getCurrentUserSubscription();
      if (response.success) {
        setCurrentSubscription(response.data);
      }
    } catch (error) {
      console.error("Error fetching current subscription:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handlePurchase = async (plan) => {
    // Prevent purchase if user has active subscription
    if (
      currentSubscription?.status === "active" &&
      currentSubscription?.plan !== "free"
    ) {
      toast.error(
        "You already have an active subscription. Cancel it first to subscribe to a new plan."
      );
      return;
    }

    // Prevent purchase for Enterprise plan
    if (plan.plan.toLowerCase() === "enterprise") {
      toast.error(
        "Enterprise plan requires custom pricing. Please contact us for more information.",
        {
          duration: 5000,
        }
      );
      return;
    }

    try {
      setProcessingPlan(plan._id);

      const response = await apiService.createSubscriptionCheckout(plan._id);

      if (response.success && response.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        const errorMessage =
          response.message || "Failed to create checkout session";
        toast.error(errorMessage);
        setProcessingPlan(null);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Failed to process payment";
      toast.error(errorMessage);
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const handleCancelSuccess = async () => {
    // Refresh current subscription after cancellation
    await fetchCurrentSubscription();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  // Filter plans based on billing cycle and exclude free plan
  const filteredPlans = plans.filter(
    (plan) =>
      plan.billingCycle === selectedBillingCycle &&
      plan.plan.toLowerCase() !== "free"
  );

  // Sort plans in specific order: Starter -> Pro -> Enterprise
  const planOrder = ["starter", "pro", "enterprise"];
  const sortedPlans = filteredPlans
    .filter((plan) => planOrder.includes(plan.plan.toLowerCase()))
    .sort((a, b) => {
      const aIndex = planOrder.indexOf(a.plan.toLowerCase());
      const bIndex = planOrder.indexOf(b.plan.toLowerCase());
      return aIndex - bIndex;
    });

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-6xl"
      noPadding={true}
    >
      <div className="relative">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {currentSubscription?.plan !== "free" &&
              currentSubscription?.status === "active"
                ? "Manage Your Subscription"
                : "Choose Your Plan"}
            </h2>
            <p className="text-muted-foreground text-base">
              {currentSubscription?.plan !== "free" &&
              currentSubscription?.status === "active"
                ? "Upgrade, downgrade, or manage your current plan"
                : "Select the perfect plan for your needs"}
            </p>
          </div>

          {/* Current Subscription Info */}
          {!loadingSubscription && currentSubscription && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                currentSubscription.plan === "free"
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "bg-primary/10 border border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        currentSubscription.plan === "free"
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    />
                    <span className="font-semibold text-foreground capitalize">
                      Current Plan: {currentSubscription.plan}
                    </span>
                    {currentSubscription.plan !== "free" && (
                      <Badge
                        variant={
                          currentSubscription.status === "active"
                            ? "default"
                            : currentSubscription.status === "cancelled"
                            ? "secondary"
                            : "outline"
                        }
                        className="ml-2"
                      >
                        {currentSubscription.status === "active"
                          ? "Active"
                          : currentSubscription.status === "cancelled"
                          ? "Cancelled"
                          : currentSubscription.status}
                      </Badge>
                    )}
                  </div>
                  {currentSubscription.plan === "free" && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Upgrade to unlock more features and remove watermarks
                    </p>
                  )}
                  {currentSubscription.status === "active" && (
                    <>
                      <div className="text-sm text-muted-foreground mb-2 space-y-1">
                        <div>
                          {currentSubscription.currentPeriodStart
                            ? `Started on ${formatDate(
                                currentSubscription.currentPeriodStart
                              )}`
                            : "Started on N/A"}
                        </div>
                        <div>
                          {currentSubscription.currentPeriodEnd
                            ? `Renews on ${formatDate(
                                currentSubscription.currentPeriodEnd
                              )}`
                            : "Active subscription"}
                          {currentSubscription.cancelAtPeriodEnd && (
                            <span className="ml-2 text-orange-500">
                              (Cancelling at period end)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {typeof monthlyGenerationsLimit === "number" ? (
                          <>
                            <div>
                              Image generations:{" "}
                              <span className="font-medium text-foreground">
                                {monthlyGenerationsUsed} /{" "}
                                {monthlyGenerationsLimit}
                              </span>
                            </div>
                            <div>
                              Available this cycle:{" "}
                              <span className="font-medium text-foreground">
                                {remainingMonthlyGenerations}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            Image generations:{" "}
                            <span className="font-medium text-foreground">
                              Unlimited
                            </span>
                          </div>
                        )}
                        {typeof watermarkFreeExportsLimit === "number" ? (
                          <>
                            <div>
                              Watermark-free exports:{" "}
                              <span className="font-medium text-foreground">
                                {watermarkFreeExportsUsed} /{" "}
                                {watermarkFreeExportsLimit}
                              </span>
                            </div>
                            <div>
                              Remaining watermark-free exports:{" "}
                              <span className="font-medium text-foreground">
                                {remainingWatermarkFreeExports}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            Watermark-free exports:{" "}
                            <span className="font-medium text-foreground">
                              Unlimited
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {currentSubscription.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSubscription}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setSelectedBillingCycle("monthly")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  selectedBillingCycle === "monthly"
                    ? "bg-primary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedBillingCycle("yearly")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  selectedBillingCycle === "yearly"
                    ? "bg-primary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="relative bg-muted-background border-2 rounded-2xl p-6 border-border"
                >
                  {/* Header Skeleton */}
                  <div className="text-center mb-6">
                    <Skeleton className="h-8 w-24 mx-auto mb-2" />
                    <div className="flex items-baseline justify-center mb-2">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-4 w-8 ml-2" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-[200px] mx-auto" />
                  </div>

                  {/* Features Skeleton */}
                  <div className="space-y-3 mb-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-0.5" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>

                  {/* Button Skeleton */}
                  <Skeleton className="h-10 w-full" />

                  {/* Cons Skeleton */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No plans available
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {sortedPlans.map((plan) => {
                const isCurrentPlan =
                  currentSubscription?.plan === plan.plan &&
                  (currentSubscription?.status === "active" ||
                    currentSubscription?.subscriptionStatus === "active");
                const isProcessing = processingPlan === plan._id;

                return (
                  <div
                    key={plan._id}
                    className={`relative bg-muted-background border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                      isCurrentPlan
                        ? "border-green-500 ring-2 ring-green-500/20"
                        : plan.isPopular
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500 text-white">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    {/* Popular Badge */}
                    {!isCurrentPlan && plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground capitalize mb-2">
                        {plan.plan}
                      </h3>
                      <div className="flex items-baseline justify-center">
                        {plan.plan.toLowerCase() === "enterprise" ? (
                          <span className="text-4xl font-bold text-foreground">
                            Custom
                          </span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold text-foreground">
                              {formatCurrency(plan.amount)}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              /
                              {selectedBillingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                      )}
                      {plan.plan.toLowerCase() === "enterprise" && (
                        <p className="text-sm text-primary font-medium mt-2">
                          Custom pricing available
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {plan.pros && plan.pros.length > 0 && (
                        <>
                          {plan.pros.slice(0, 3).map((pro, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground">
                                {pro}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {typeof plan.maxMonthlyGenerations === "number"
                        ? `${plan.maxMonthlyGenerations} image generations per month`
                        : "Unlimited image generations per month"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {typeof plan.maxWatermarkFreeExports === "number"
                        ? `${plan.maxWatermarkFreeExports} watermark-free exports per month`
                        : "Unlimited watermark-free exports"}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => !isCurrentPlan && handlePurchase(plan)}
                      disabled={
                        isCurrentPlan ||
                        isProcessing ||
                        plan.plan.toLowerCase() === "enterprise" ||
                        (currentSubscription?.status === "active" &&
                          currentSubscription?.plan !== "free")
                      }
                      className={`w-full ${
                        isCurrentPlan
                          ? "bg-green-500 text-white cursor-default"
                          : currentSubscription?.status === "active" &&
                            currentSubscription?.plan !== "free"
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : plan.plan.toLowerCase() === "enterprise"
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : plan.isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                      title={
                        plan.plan.toLowerCase() === "enterprise"
                          ? "Enterprise plan requires custom pricing. Please contact us."
                          : currentSubscription?.status === "active" &&
                            currentSubscription?.plan !== "free"
                          ? "Cancel your current subscription first"
                          : ""
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Current Plan
                        </>
                      ) : plan.plan.toLowerCase() === "enterprise" ? (
                        "Contact Us"
                      ) : currentSubscription?.status === "active" &&
                        currentSubscription?.plan !== "free" ? (
                        "Cancel Current Plan First"
                      ) : (
                        "Get Started"
                      )}
                    </Button>

                    {/* Cons/Notes */}
                    {plan.cons && plan.cons.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        {plan.cons.map((con, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>All plans include our core features and support</p>
            <p className="mt-1">
              Need help?{" "}
              <button className="text-primary hover:underline">
                Contact us
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Modal */}
      {currentSubscription && currentSubscription.plan !== "free" && (
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          subscription={currentSubscription}
          onSuccess={handleCancelSuccess}
        />
      )}
    </BaseModal>
  );
}
