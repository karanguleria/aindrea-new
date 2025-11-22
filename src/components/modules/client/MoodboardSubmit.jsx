import React, { useState } from "react";
import ImageHeader from "./ImageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, Download, Upload, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function MoodboardSubmit() {
  const [formData, setFormData] = useState({
    projectTitle: "Evolving Creators: A Dynamic NFT Collection",
    creativeObjective:
      "A futuristic NFT series featuring animated, evolving digital characters that embody creative Web3 identities. These NFTs integrate smart contract interactions, allowing upgrades based on holder participation and granting access to exclusive creator experiences.",
    tags: "#DynamicNFT #AnimatedPortraits #Futurism\n#CyberpunkAesthetic #CommunityDriven",
    contentType: {
      rent: false,
      buy: true,
      commission: false,
    },
    budget: "3,500",
    deadline: "July 15, 2025",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContentTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      contentType: {
        ...prev.contentType,
        [type]: !prev.contentType[type],
      },
    }));
  };

  const handleSubmit = () => {
    // Handle form submission logic here
  };

  const handleBack = () => {
    // Handle back navigation logic here
  };

  return (
    <>
      <ImageHeader title="Moodboard Submit" buttonText="Hello" />
      <div className="p-6 border border-border rounded-3xl space-y-5">
        {/* Project Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-base font-semibold">
              Project Title
            </label>
            <HelpCircle className="h-5 w-5 text-foreground" />
          </div>
          <Input
            value={formData.projectTitle}
            onChange={(e) => handleInputChange("projectTitle", e.target.value)}
            className="h-12 bg-transparent border-border border text-foreground text-base"
            placeholder="Enter your project title"
          />
        </div>

        {/* Creative Objective */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-base font-semibold">
              Creative Objective
            </label>
            <HelpCircle className="h-5 w-5 text-foreground" />
          </div>
          <Textarea
            value={formData.creativeObjective}
            onChange={(e) =>
              handleInputChange("creativeObjective", e.target.value)
            }
            className="w-full h-32 px-4 py-3 bg-transparent border-border border rounded-md text-foreground text-base"
            placeholder="Describe your creative objective"
          />
          <div className="flex items-center gap-2 text-primary text-sm cursor-pointer hover:text-purple-300 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download moodboard</span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-base font-semibold">
              Tags
            </label>
            <HelpCircle className="h-5 w-5 text-foreground" />
          </div>
          <Textarea
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            className="w-full h-20 px-4 py-3 bg-transparent border-border border rounded-md text-foreground text-base"
            placeholder="Enter relevant tags"
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <label className="text-foreground text-base font-semibold">
            Content Type
          </label>
          <div className="flex gap-8 mt-4">
            {[
              { key: "rent", label: "Rent" },
              { key: "buy", label: "Buy" },
              { key: "commission", label: "Commission" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Input
                  type="checkbox"
                  checked={formData.contentType[key]}
                  onChange={() => handleContentTypeChange(key)}
                  className="w-5 h-5 text-primary bg-transparent border-border"
                />
                <span className="text-foreground text-base">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Moodboard Upload */}
        <div className="space-y-2 flex justify-between items-center">
          <label className="text-foreground text-base font-semibold">
            Moodboard / Reference Upload{" "}
            <span className="text-foreground/40 font-normal">(optional)</span>
          </label>
          <Button
            variant="outline"
            className="h-12 px-6 bg-transparent border-border text-foreground transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </Button>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-base font-semibold">
              Budget (USD)
            </label>
            <HelpCircle className="h-5 w-5 text-foreground" />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40 text-base">
              $
            </span>
            <Input
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              className="h-12 pl-8 bg-transparent border-border text-foreground text-base"
              placeholder="0"
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-base font-semibold">
              Deadline
            </label>
            <HelpCircle className="h-5 w-5 text-foreground" />
          </div>
          <Input
            value={formData.deadline}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
            className="h-12 bg-transparent border-border  text-foreground text-base"
            placeholder="Select deadline"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-5">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 border-border text-foreground bg-transparent transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Co-Pilot
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 bg-primary text-primary-foreground border-0 transition-colors"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </>
  );
}
