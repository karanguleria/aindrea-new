"use client";

import { useAuth } from "@/contexts/userContext";

/**
 * Hook to check if images should be protected based on user's subscription plan
 * @returns {Object} Protection status and utilities
 */
export function useImageProtection() {
  const { user } = useAuth();

  // Check if user has a paid plan
  const hasPaidPlan = () => {
    if (!user) return false;
    
    // Admin users bypass protection
    if (user.isAdmin === true) return true;
    
    const plan = user?.subscription?.plan;
    // Paid plans: starter, pro, enterprise
    return plan && plan !== "free" && plan !== null && plan !== undefined;
  };

  // Check if user has purchased a specific asset (for future implementation)
  const hasPurchasedAsset = (assetId) => {
    // TODO: Implement asset purchase tracking
    // This would check if user has purchased this specific asset
    return false;
  };

  // Determine if protection should be applied
  const shouldProtect = () => {
    // If user has paid plan, no protection needed
    if (hasPaidPlan()) return false;
    
    // If user has purchased the asset, no protection needed
    // (when purchase tracking is implemented)
    
    // Otherwise, protect the image
    return true;
  };

  return {
    hasPaidPlan: hasPaidPlan(),
    shouldProtect: shouldProtect(),
    isAdmin: user?.isAdmin === true,
    userPlan: user?.subscription?.plan || "free",
  };
}

