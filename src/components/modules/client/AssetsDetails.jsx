import React, { useState } from "react";
import Image from "next/image";
import ImageHeader from "./ImageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronUp, ChevronDown, Copy, Bell } from "lucide-react";
import WalletConnectionModal from "@/components/Global/Modals/WalletConnectionModal";
import { Button } from "@/components/ui/button";

export default function AssetsDetails() {
  const [creatorNoteExpanded, setCreatorNoteExpanded] = useState(false);
  const [blockchainExpanded, setBlockchainExpanded] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [browseMoreExpanded, setBrowseMoreExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <ImageHeader title="Assets Details" buttonText="Close" />
      <div className="text-foreground">
        <div className="p-5 border border-border rounded-lg mb-5">
          <div className="mb-5">
            <h1 className="lg:text-4xl text-2xl font-bold text-foreground mb-3">
              Example Brief Title
            </h1>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-muted-foreground text-lg">
                    Creator{" "}
                    <span className="text-foreground font-medium">
                      [Account Name]
                    </span>
                  </span>
                  <div className="w-px h-6 bg-border mx-4"></div>
                  <span className="text-foreground/70 text-lg">
                    Format:{" "}
                    <span className="text-foreground font-medium">
                      4K video
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="ml-4">
                    <Copy className="w-4 h-4 text-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-2">
            <div className="mb-4">
              <Image
                src="/images/client/assetsdetails/1.png"
                alt="Main image"
                width={1600}
                height={900}
                className="w-full h-auto object-cover rounded-lg shadow-3xl"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[2, 3, 4, 5].map((index) => (
                <Image
                  key={`asset-detail-${index}`}
                  src={`/images/client/assetsdetails/${index}.png`}
                  alt={`Thumbnail ${index - 1}`}
                  width={512}
                  height={512}
                  className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                />
              ))}
            </div>
          </div>
        </div>
        <Card className="bg-transparent border-border mb-8">
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground font-bold text-xl">
                Brief Details
              </CardTitle>
              <div className="text-right">
                <div className="text-foreground text-sm cursor-pointer  transition-colors">
                  License & Terms
                </div>
                <div className="text-foreground/70 text-xs mt-1">
                  NOTE: When open modal right
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <span className="text-foreground/70 text-sm">Status:</span>
                <div className="text-foreground text-sm font-medium">
                  Delivered
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-foreground/70 text-sm">Deadline:</span>
                <div className="text-foreground text-sm font-medium">
                  Sep 23, 2025
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-foreground/70 text-sm">Tags:</span>
                <div className="text-foreground text-sm">
                  #digital art, #AI-enhanced, #futuristic, #abstract
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-foreground/70 text-sm">
                  License Type:
                </span>
                <div className="text-foreground text-sm">Lorem Ipsum</div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                className="border-border  text-foreground bg-card px-6 py-2"
              >
                Download
              </Button>
              <Button
                className="bg-primary text-primary-foreground px-6 py-2"
                onClick={() => setIsWalletModalOpen(true)}
              >
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className=" mb-8">
          <div className="flex items-center gap-8 mb-4">
            <div className="flex flex-col">
              <button
                className={`text-lg font-medium pb-2 ${
                  activeTab === "details" ? "text-teal-400" : "text-foreground"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <div
                className={`h-0.5 w-full ${
                  activeTab === "details" ? "bg-teal-400" : "bg-card"
                }`}
              ></div>
            </div>
            <div className="flex flex-col">
              <button
                className={`text-lg font-medium pb-2 ${
                  activeTab === "activity" ? "text-teal-400" : "text-foreground"
                }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
              <div
                className={`h-0.5 w-full ${
                  activeTab === "activity" ? "bg-teal-400" : "bg-card"
                }`}
              ></div>
            </div>
          </div>
          <div className="text-foreground/70 text-sm ml-2">
            Dev Note: CSV/JSON export button for activity log.
          </div>
        </div>

        {/* Activity Cards - Show when Activity tab is selected */}
        {activeTab === "activity" && (
          <div className="space-y-4 mb-8">
            {/* Activity Card 1 */}
            <div className=" border border-border rounded-lg p-4 flex items-start gap-4">
              <div className="bg-transparent rounded-full p-2">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">
                  Transferred to Wallet
                </h3>
                <p className="text-foreground/70 text-sm mb-2">
                  Apr 14, 2025 at 5:05 AM
                </p>
                <p className="text-foreground text-sm">
                  "NFT transferred to 0xF2C3...9D4A"
                </p>
              </div>
            </div>

            {/* Activity Card 2 */}
            <div className=" border border-border rounded-lg p-4 flex items-start gap-4">
              <div className="bg-transparent rounded-full p-2">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">
                  Payment Completed
                </h3>
                <p className="text-foreground/70 text-sm mb-2">
                  Apr 15, 2025 at 3:15 PM
                </p>
                <p className="text-foreground text-sm">
                  "Purchased by ClientName – TX ID: 0xAB12...E98F"
                </p>
              </div>
            </div>

            {/* Activity Card 3 */}
            <div className=" border border-border rounded-lg p-4 flex items-start gap-4">
              <div className="bg-transparent rounded-full p-2">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">
                  Final Version Approved
                </h3>
                <p className="text-foreground/70 text-sm mb-2">
                  Apr 14, 2025 at 11:00 AM
                </p>
                <p className="text-foreground text-sm">
                  "Marked as complete by [Client Name]"
                </p>
              </div>
            </div>

            {/* Activity Card 4 */}
            <div className=" border border-border rounded-lg p-4 flex items-start gap-4">
              <div className="bg-transparent rounded-full p-2">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">
                  Updated by Creator
                </h3>
                <p className="text-foreground/70 text-sm mb-2">
                  Apr 13, 2025 at 4:09 PM
                </p>
                <p className="text-foreground text-sm">
                  "Revision uploaded – Version 2"
                </p>
              </div>
            </div>

            {/* Activity Card 5 */}
            <div className=" border border-border rounded-lg p-4 flex items-start gap-4">
              <div className="bg-transparent rounded-full p-2">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">
                  Revision Request Submitted
                </h3>
                <p className="text-foreground/70 text-sm mb-2">
                  Apr 12, 2025 at 10:45 AM
                </p>
                <p className="text-foreground text-sm">
                  "Change request for background animation and text color."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details Content - Show when Details tab is selected */}
        {activeTab === "details" && (
          <>
            <Card
              className={`bg-transparent mb-8 ${
                creatorNoteExpanded ? "border-primary" : "border-border"
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setCreatorNoteExpanded(!creatorNoteExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-xl font-bold ${
                      creatorNoteExpanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Creator's Note
                  </CardTitle>
                  {creatorNoteExpanded ? (
                    <ChevronUp className="h-5 w-5 text-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-foreground" />
                  )}
                </div>
              </CardHeader>
              {creatorNoteExpanded && (
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </CardContent>
              )}
            </Card>
            <Card
              className={`bg-transparent mb-8  ${
                blockchainExpanded ? "border-primary" : "border-border"
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setBlockchainExpanded(!blockchainExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-xl font-bold ${
                      blockchainExpanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Blockchain Details
                  </CardTitle>

                  {blockchainExpanded ? (
                    <ChevronUp className="h-5 w-5 text-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-foreground" />
                  )}
                </div>
              </CardHeader>
              {blockchainExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Contract Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">0xeb13...1bng</span>
                        <svg
                          className="w-4 h-4 text-foreground font-medium"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Token ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">1096</span>
                        <svg
                          className="w-4 h-4 text-foreground font-medium"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Token Standard:</span>
                      <span className="text-foreground">ERC721</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Chain:</span>
                      <span className="text-foreground">Lorem</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            <Card
              className={`bg-transparent mb-8  ${
                seoExpanded ? "border-primary" : "border-border"
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setSeoExpanded(!seoExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-xl font-bold ${
                      seoExpanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    SEO Details
                  </CardTitle>
                  {seoExpanded ? (
                    <ChevronUp className="h-5 w-5 text-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-foreground" />
                  )}
                </div>
              </CardHeader>
              {seoExpanded && (
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </CardContent>
              )}
            </Card>
            <Card
              className={`bg-transparent mb-8  ${
                browseMoreExpanded ? "border-primary" : "border-border"
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setBrowseMoreExpanded(!browseMoreExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-xl font-bold ${
                      browseMoreExpanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Browse More Briefs
                  </CardTitle>
                  {browseMoreExpanded ? (
                    <ChevronUp className="h-5 w-5 text-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-foreground" />
                  )}
                </div>
              </CardHeader>
              {browseMoreExpanded && (
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </CardContent>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
