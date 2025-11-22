import React, { useState } from "react";
import { BaseModal } from "@/components/ui/base-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const response = await apiService.cancelCurrentSubscription();

      if (response.success) {
        toast.success(
          response.message || "Subscription cancelled successfully"
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(response.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (!subscription) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Subscription"
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Are you sure you want to cancel?
          </h3>
          <p className="text-sm text-muted-foreground">
            Your subscription will be cancelled immediately. You will lose
            access to premium features and be moved to the free plan right away.
          </p>
        </div>

        {/* Subscription Details */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Plan:</span>
            <span className="text-sm font-semibold text-foreground capitalize">
              {subscription.plan}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className="text-sm font-semibold text-foreground capitalize">
              {subscription.status}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Warning:</strong> Cancellation is immediate. All premium
            features will be removed and you will be moved to the free plan
            right away. You can subscribe again at any time.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={cancelling}
            className="flex-1"
          >
            Keep Subscription
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1"
          >
            {cancelling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
