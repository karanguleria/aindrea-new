import React, { useState } from "react";
import {
  Upload,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageHeader from "../client/ImageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function SubmitDeliverable() {
  const [isLicensingExpanded, setIsLicensingExpanded] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [isCreativeExpanded, setIsCreativeExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  return (
    <>
      <ImageHeader title="Submit Deliverable" buttonText="Hello" />
      <div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Evolving Creators: A Dynamic NFT Collection
          </h1>
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm sm:text-base">Client [Account Name]</span>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="mb-8">
          <Card className="bg-transparent  border-border">
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-transparent">
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto  flex items-center justify-center">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-foreground">
                        Drag and drop media
                      </p>
                      <p className="text-foreground/60">
                        <span className="text-primary cursor-pointer hover:underline">
                          Browse files
                        </span>
                      </p>
                      <p className="text-sm text-foreground/70">
                        Max size: 50MB
                      </p>
                      <p className="text-sm text-foreground/80">
                        JPG, PNG, GIF, SVG, MP4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="mt-4 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2 text-primary-foreground" />
            Add Media
          </Button>
        </div>

        {/* Brief Overview */}
        <div className="mb-6 sm:mb-8 space-y-4 border-border border rounded-lg p-4 bg-transparent">
          <h2 className="text-lg sm:text-xl text-foreground font-semibold mb-4">
            Brief Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-transparent text-foreground border-border p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-foreground">
                  Status
                </span>
              </div>
              <span className="inline-block bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full text-xs">
                Awaiting Upload
              </span>
            </div>

            <div className="bg-transparent text-foreground border-border p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              <span className="text-foreground">Sep 23, 2025</span>
            </div>

            <div className="bg-transparent text-foreground border-border p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <span className="text-foreground">$2,000.00</span>
            </div>

            <div className="bg-transparent text-foreground border-border p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">
                  #DynamicNFT
                </span>
                <span className="text-xs text-muted-foreground">
                  #AnimatedPortraits
                </span>
                <span className="text-xs text-muted-foreground">#Futurism</span>
                <span className="text-xs text-muted-foreground">
                  #CyberpunkAesthetic
                </span>
                <span className="text-xs text-muted-foreground">
                  #CommunityDriven
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">
            SEO
          </h2>
          <div className="mb-6 sm:mb-8 space-y-4 border-border border rounded-lg p-4 bg-transparent">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                SEO Title
              </label>
              <div className="relative">
                <Input
                  placeholder="Title, Page, Separator, SEO Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="pr-20 text-foreground border-border bg-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs text-foreground/80">
                    {seoTitle.length}/60
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Sparkles className="h-3 w-3 text-foreground" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-foreground/80 mt-1">
                Autogenerate with Co-Pilot
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description
              </label>
              <div className="relative">
                <Textarea
                  placeholder="add description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="pr-20 text-foreground border-border bg-transparent"
                  rows={3}
                />
                <div className="absolute right-2 top-2 flex items-center gap-2">
                  <span className="text-xs text-foreground/80">
                    {metaDescription.length}/160
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Sparkles className="h-3 w-3 text-foreground" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Keywords & Density
              </label>
              <div className="relative">
                <Input
                  placeholder="add keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="pr-10 text-foreground border-border bg-transparent"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <Sparkles className="h-3 w-3 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="bg-transparent text-foreground border-border rounded-lg border">
            <button
              onClick={() => setIsLicensingExpanded(!isLicensingExpanded)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors"
            >
              <h2 className="text-lg sm:text-xl font-semibold">
                Licensing & Pricing
              </h2>
              {isLicensingExpanded ? (
                <ChevronUp className="h-5 w-5 text-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground" />
              )}
            </button>
            {isLicensingExpanded && (
              <div className="px-4 pb-4 space-y-6">
                {/* Content Type Section */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Content Type
                  </h3>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-500 bg-transparent border-border rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-foreground">Rent</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-500 bg-transparent border-border rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-foreground">Buy</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-500 bg-transparent border-border rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-foreground">Commission</span>
                    </label>
                  </div>
                </div>

                {/* Price Section */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Price
                  </h3>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter price"
                      className="w-full text-foreground border-border bg-transparent text-lg py-3"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message to Client */}
          <div className="bg-transparent text-foreground border-border rounded-lg border">
            <button
              onClick={() => setIsMessageExpanded(!isMessageExpanded)}
              className="w-full flex items-center justify-between p-4 text-left  transition-colors"
            >
              <h2 className="text-lg sm:text-xl font-semibold">
                Message to Client
              </h2>
              {isMessageExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {isMessageExpanded && (
              <div className="px-4 pb-4">
                <Textarea
                  placeholder="Add a note for your client here"
                  rows={6}
                  className="w-full text-foreground border-border bg-transparent text-base py-4 px-4 resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <Button className="bg-primary text-primary-foreground px-6 w-full sm:w-auto">
            Submit Deliverable
          </Button>
          <Button
            variant="outline"
            className="border-teal-500 text-teal-500 bg-transparent px-6 w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "details"
                  ? "border-teal-500 text-teal-500"
                  : "border-transparent text-foreground "
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "border-teal-500 text-teal-500"
                  : "border-transparent text-foreground"
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Creative Objective */}
        <div className="bg-transparent text-foreground border-border rounded-lg border">
          <button
            onClick={() => setIsCreativeExpanded(!isCreativeExpanded)}
            className="w-full flex items-center justify-between p-4 text-left  transition-colors"
          >
            <h2 className="text-lg sm:text-xl font-semibold">
              Creative Objective
            </h2>
            {isCreativeExpanded ? (
              <ChevronUp className="h-5 w-5 text-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-foreground" />
            )}
          </button>
          {isCreativeExpanded && (
            <div className="px-4 pb-4">
              <p className="text-foreground/80 leading-relaxed">
                A futuristic NFT series featuring animated, evolving digital
                characters that embody creative Web3 identities. These NFTs
                integrate smart contract interactions, allowing upgrades based
                on holder participation and granting access to exclusive creator
                experiences.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
