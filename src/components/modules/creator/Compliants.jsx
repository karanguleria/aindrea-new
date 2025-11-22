import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, RefreshCw, History } from "lucide-react";
import ImageHeader from "../client/ImageHeader";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Complaints() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    asset: "",
    complainType: "",
    complainSummary: "",
    evidence: null,
  });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user's assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserAssets();
      if (response.success) {
        setAssets(response.data.assets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    // Validate file size (10MB max)
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (file && !allowedTypes.includes(file.type)) {
      toast.error("Only images (JPEG, PNG, WebP) and PDF files are allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      evidence: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.asset ||
      !formData.complainType ||
      !formData.complainSummary.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare FormData for submission
      const submitData = new FormData();
      submitData.append("licenseId", formData.asset);
      submitData.append("complainType", formData.complainType);
      submitData.append("complainSummary", formData.complainSummary.trim());

      if (formData.evidence) {
        submitData.append("evidence", formData.evidence);
      }

      const response = await apiService.submitComplaint(submitData);

      if (response.success) {
        toast.success("Complaint submitted successfully!");

        // Reset form
        setFormData({
          asset: "",
          complainType: "",
          complainSummary: "",
          evidence: null,
        });

        // Clear file input
        const fileInput = document.getElementById("evidence-upload-creator");
        if (fileInput) fileInput.value = "";

        // Optionally redirect to complaint history after a delay
        setTimeout(() => {
          const isCreator = router.pathname.startsWith("/creator");
          router.push(
            isCreator
              ? "/creator/complaint-history"
              : "/dashboard/complaint-history"
          );
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <ImageHeader title="Complaints" buttonText="Close" />
        <Button
          variant="outline"
          onClick={() => {
            const isCreator = router.pathname.startsWith("/creator");
            router.push(
              isCreator
                ? "/creator/complaint-history"
                : "/dashboard/complaint-history"
            );
          }}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>

      <div className="p-4 sm:p-8 bg-transparent border border-border rounded-3xl text-foreground">
        {/* Form Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Please Complete Report and Submit
          </h1>
          <p className="text-foreground/80 text-sm">
            Once submitted, our team will review and respond promptly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Asset <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.asset}
              onValueChange={(value) => handleInputChange("asset", value)}
              disabled={loading || assets.length === 0}
            >
              <SelectTrigger className="h-12 bg-transparent border-border text-foreground">
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading assets..."
                      : assets.length === 0
                      ? "No assets available"
                      : "Select an asset"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {assets.map((asset) => (
                  <SelectItem
                    key={asset.id}
                    value={asset.id}
                    className="text-foreground"
                  >
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loading && assets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You need to purchase assets before filing a complaint.
              </p>
            )}
          </div>

          {/* Complain Type Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Complain Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.complainType}
              onValueChange={(value) =>
                handleInputChange("complainType", value)
              }
            >
              <SelectTrigger className="h-12 bg-transparent border-border text-foreground">
                <SelectValue placeholder="Select complain type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="quality" className="text-foreground ">
                  Quality Issue
                </SelectItem>
                <SelectItem value="delivery" className="text-foreground ">
                  Delivery Problem
                </SelectItem>
                <SelectItem value="communication" className="text-foreground ">
                  Communication Issue
                </SelectItem>
                <SelectItem value="other" className="text-foreground ">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Complain Summary Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Complain Summary <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.complainSummary}
              onChange={(e) =>
                handleInputChange("complainSummary", e.target.value)
              }
              placeholder="Please describe your complaint in detail..."
              className="min-h-32 bg-transparent border-border text-foreground"
            />
          </div>

          {/* Upload Evidence Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              Upload Evidence{" "}
              <span className="text-foreground/70">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="evidence-upload-creator"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,.pdf,.doc,.docx"
              />
              <div className="h-12 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-transparent hover:border-purple-500 transition-colors">
                <div className="flex items-center space-x-2 text-foreground/70">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Click to upload evidence</span>
                </div>
              </div>
            </div>
            {formData.evidence && (
              <p className="text-sm text-green-400 mt-1">
                Selected: {formData.evidence.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting || loading || assets.length === 0}
              className="w-full h-12 bg-primary text-primary-foreground font-medium text-base"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
