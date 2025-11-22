import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function BriefStripePaymentCheckout() {
  const router = useRouter();
  const { briefId } = router.query;

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  // Fetch brief details
  useEffect(() => {
    const fetchBrief = async () => {
      if (!briefId) return;

      try {
        setLoading(true);
        const response = await apiService.getBriefById(briefId);

        if (response.success) {
          setBrief(response.data.brief);
        } else {
          toast.error("Failed to load brief details");
          router.push("/dashboard/create-new-brief");
        }
      } catch (error) {
        console.error("Error fetching brief:", error);
        toast.error("Failed to load brief details");
        router.push("/dashboard/create-new-brief");
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [briefId, router]);

  // Create payment intent
  const createPaymentIntent = async () => {
    try {
      setPaymentLoading(true);
      const response = await apiService.createBriefPaymentIntent(briefId);

      if (response.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        toast.success("Payment intent created successfully");
      } else {
        toast.error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast.error("Failed to create payment intent");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle payment confirmation
  const handlePayment = async () => {
    if (!paymentIntentId) {
      toast.error("Please create payment intent first");
      return;
    }

    try {
      setPaymentLoading(true);

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await apiService.confirmBriefPayment(paymentIntentId);

      if (response.success) {
        toast.success("Payment confirmed! Brief published successfully");
        router.push("/dashboard/briefs");
      } else {
        toast.error(response.message || "Payment confirmation failed");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(error.message || "Payment confirmation failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <ImageHeader title={"Payment Checkout"} buttonText={"Loading..."} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground">Loading brief details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!brief) {
    return (
      <>
        <ImageHeader title={"Payment Checkout"} buttonText={"Error"} />
        <div className="text-center py-20">
          <p className="text-foreground">Brief not found</p>
          <Button
            onClick={() => router.push("/dashboard/create-new-brief")}
            className="mt-4"
          >
            Create New Brief
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <ImageHeader
        title={"Payment Checkout"}
        buttonText={`$${brief.paymentAmount}`}
      />

      <div className="border border-border rounded-3xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Header with back arrow */}
            <div className="flex items-center gap-3 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Button>
              <h1 className="text-3xl font-bold text-primary">
                Brief Overview
              </h1>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  brief.paymentStatus === "pending" ? "secondary" : "default"
                }
                className={
                  brief.paymentStatus === "pending"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
              >
                {brief.paymentStatus === "pending"
                  ? "Pending Payment"
                  : "Payment Complete"}
              </Badge>
            </div>

            {/* Project Details */}
            <div className="space-y-8">
              {/* Project Title */}
              <div>
                <label className="block text-muted-foreground text-sm font-medium mb-2">
                  Project Title
                </label>
                <p className="text-lg font-bold text-foreground">
                  {brief.projectTitle}
                </p>
              </div>

              {/* Creative Objective */}
              <div>
                <label className="block text-muted-foreground text-sm font-medium mb-2">
                  Creative Objective
                </label>
                <p className="text-foreground leading-relaxed">
                  {brief.creativeObjective}
                </p>
              </div>

              {/* Required Skills */}
              {brief.requiredSkills && (
                <div>
                  <label className="block text-muted-foreground text-sm font-medium mb-2">
                    Required Skills
                  </label>
                  <p className="text-foreground">{brief.requiredSkills}</p>
                </div>
              )}

              {/* Deliverables */}
              {brief.deliverables && (
                <div>
                  <label className="block text-muted-foreground text-sm font-medium mb-2">
                    Deliverables
                  </label>
                  <p className="text-foreground">{brief.deliverables}</p>
                </div>
              )}

              {/* Tags */}
              {brief.tags && (
                <div>
                  <label className="block text-muted-foreground text-sm font-medium mb-2">
                    Tags
                  </label>
                  <p className="text-foreground">{brief.tags}</p>
                </div>
              )}

              {/* Content Types */}
              <div>
                <label className="block text-muted-foreground text-sm font-medium mb-2">
                  Content Types
                </label>
                <div className="flex gap-2">
                  {Object.entries(brief.contentTypes).map(
                    ([type, enabled]) =>
                      enabled && (
                        <Badge
                          key={type}
                          variant="outline"
                          className="capitalize"
                        >
                          {type}
                        </Badge>
                      )
                  )}
                </div>
              </div>

              {/* Budget and Deadline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg text-foreground">Budget (USD):</span>
                  <span className="text-lg font-bold text-foreground">
                    ${brief.paymentAmount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg text-foreground">Deadline:</span>
                  <span className="text-lg font-bold text-foreground">
                    {new Date(brief.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Reference Files */}
              {brief.referenceFiles && brief.referenceFiles.length > 0 && (
                <div>
                  <label className="block text-muted-foreground text-sm font-medium mb-2">
                    Reference Files
                  </label>
                  <div className="space-y-2">
                    {brief.referenceFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span>• {file.name}</span>
                        <span className="text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center mb-6">
              Payment Details
            </h2>

            {/* Payment Summary */}
            <Card className="border border-border bg-transparent text-foreground">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Brief Publishing Fee</span>
                  <span className="font-semibold text-foreground">
                    ${brief.paymentAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Payment will be held in escrow</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>${brief.paymentAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Actions */}
            <div className="space-y-4">
              {!clientSecret ? (
                <Button
                  onClick={createPaymentIntent}
                  disabled={paymentLoading}
                  className="w-full h-14 text-lg font-semibold bg-primary"
                >
                  {paymentLoading ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Creating Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Create Payment Intent
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
                >
                  {paymentLoading ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Payment & Publish Brief
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/edit-brief/${briefId}`)}
                className="w-full"
              >
                Back to Edit Brief
              </Button>
            </div>

            {/* Payment Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Payment will be held in escrow until project completion</p>
              <p>• You can cancel within 24 hours for full refund</p>
              <p>• Brief will be published after successful payment</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
