import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ImageHeader from "../client/ImageHeader";
import { useAuth } from "@/contexts/userContext";
import BriefChatSection from "../client/BriefChatSection";
import BidInfoModal from "./BidInfoModal";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  Users,
  FileText,
  Tag,
  Upload,
  Send,
  Eye,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  MessageCircle,
  History,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

const CreatorBriefDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routerReady, setRouterReady] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidInfoModalOpen, setBidInfoModalOpen] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [bidForm, setBidForm] = useState({
    proposal: "",
    proposedBudget: "",
    proposedTimeline: "",
    portfolioLinks: "",
  });

  // Fetch brief details
  const fetchBriefDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log(`Fetching brief details for ID: ${id} (type: ${typeof id})`);
      const response = await apiService.getBriefById(id);

      if (response.success) {
        setBrief(response.data.brief);

        // Pre-fill budget and deadline from client's brief
        const briefData = response.data.brief;
        setBidForm((prev) => ({
          ...prev,
          proposedBudget: briefData.budget
            ? briefData.budget.toString()
            : prev.proposedBudget,
          proposedTimeline: briefData.deadline
            ? new Date(briefData.deadline).toISOString().split("T")[0]
            : prev.proposedTimeline,
        }));
      } else {
        toast.error("Failed to load brief details");
        router.push("/creator/briefs");
      }
    } catch (error) {
      console.error("Error fetching brief details:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error(`Failed to load brief details: ${error.message}`);
      router.push("/creator/briefs");
    } finally {
      setLoading(false);
    }
  };

  // Handle bid submission or revision
  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (!brief) return;

    // Validation
    if (!bidForm.proposal.trim()) {
      toast.error("Please provide a proposal");
      return;
    }
    if (!bidForm.proposedBudget || parseFloat(bidForm.proposedBudget) <= 0) {
      toast.error("Please provide a valid budget");
      return;
    }
    if (!bidForm.proposedTimeline) {
      toast.error("Please provide a proposed completion date");
      return;
    }

    try {
      setSubmittingBid(true);

      const portfolioLinks = bidForm.portfolioLinks
        ? bidForm.portfolioLinks
            .split(",")
            .map((link) => link.trim())
            .filter((link) => link)
        : [];

      const bidData = {
        proposal: bidForm.proposal,
        proposedBudget: parseFloat(bidForm.proposedBudget),
        proposedTimeline: bidForm.proposedTimeline,
        portfolioLinks,
      };

      // Check if user has a bid that can be revised
      const userBid = brief.bids.find(
        (bid) => bid.bidderId?._id?.toString() === userId?.toString()
      );

      let response;
      // Check if revising (either explicitly set or bid has revision request)
      if (
        isRevising ||
        (userBid &&
          ((userBid.status === "rejected" && userBid.canBeRevised !== false) ||
            userBid.revisionRequested))
      ) {
        // Revise existing bid (rejected or with revision request)
        if (!userBid || !userBid._id) {
          toast.error("Bid not found for revision");
          setSubmittingBid(false);
          return;
        }
        response = await apiService.reviseBid(id, userBid._id, bidData);
        if (response.success) {
          toast.success("Bid revised successfully!");
        }
      } else {
        // Submit new bid
        response = await apiService.submitBid(id, bidData);
        if (response.success) {
          toast.success("Bid submitted successfully!");
        }
      }

      if (response.success) {
        // Close modal and refresh brief details
        setBidModalOpen(false);
        setIsRevising(false);
        // Reset form
        setBidForm({
          proposal: "",
          proposedBudget: "",
          proposedTimeline: "",
          portfolioLinks: "",
        });
        // Refresh brief details to show updated bid
        await fetchBriefDetails();
      } else {
        toast.error(response.message || "Failed to submit bid");
      }
    } catch (error) {
      console.error("Error submitting bid:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error(`Failed to submit bid: ${error.message}`);
    } finally {
      setSubmittingBid(false);
    }
  };

  // Get current user ID once
  const userId = user?._id || user?.id;

  // Check if user has a bid (regardless of status)
  const hasUserBid = () => {
    if (!brief || !brief.bids || !userId) return false;
    return brief.bids.some(
      (bid) => bid.bidderId?._id?.toString() === userId.toString()
    );
  };

  // Check if user can bid (no bid or bid was rejected)
  const canUserBid = () => {
    if (!brief || !brief.bids || !userId) return true;
    const userBid = brief.bids.find(
      (bid) => bid.bidderId?._id?.toString() === userId.toString()
    );
    if (!userBid) return true; // No bid yet
    return userBid.status === "rejected"; // Can bid again only if rejected
  };

  // Get user's bid
  const getUserBid = () => {
    if (!brief || !brief.bids || !userId) return null;
    console.log(brief.bids, userId);
    return brief.bids.find(
      (bid) => bid.bidderId?._id?.toString() === userId.toString()
    );
  };

  // Format currency
  const formatStatus = (status) => {
    if (!status) return status;
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Wait for router to be ready before fetching
  useEffect(() => {
    if (router.isReady) {
      setRouterReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (routerReady && id) {
      fetchBriefDetails();
    }
  }, [routerReady, id]);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (bidModalOpen && brief) {
      setBidForm((prev) => ({
        ...prev,
        proposedBudget: brief.budget
          ? brief.budget.toString()
          : prev.proposedBudget,
        proposedTimeline: brief.deadline
          ? new Date(brief.deadline).toISOString().split("T")[0]
          : prev.proposedTimeline,
      }));
    }
  }, [bidModalOpen, brief]);

  // Show loading if router is not ready or if id is not available
  if (!routerReady || !id || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading brief details...</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Brief not found</h2>
          <p className="text-gray-600 mb-4">
            The brief you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/creator/briefs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Briefs
          </Button>
        </div>
      </div>
    );
  }

  const userBid = getUserBid();
  const hasBid = hasUserBid();
  const canBid = canUserBid();

  return (
    <>
      <ImageHeader
        title={brief.projectTitle}
        buttonText={`${brief.bidCount || 0} Bids`}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/creator/briefs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Briefs
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant={brief.status === "active" ? "default" : "secondary"}
              className="bg-green-500 text-white"
            >
              {formatStatus(brief.status)}
            </Badge>
            {brief.selectedCreatorId &&
              user &&
              brief.selectedCreatorId.toString() === user._id && (
                <Badge className="bg-primary text-white">
                  Selected for You
                </Badge>
              )}
            <Badge variant="outline">{brief.bidCount || 0} bids</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {brief.creativeObjective || brief.projectDescription}
                </p>
              </CardContent>
            </Card>

            {/* Chat Context Section - Show what client was trying to create */}
            {brief.chatId && (
              <BriefChatSection
                briefId={brief._id}
                chatId={brief.chatId}
                isClient={false}
              />
            )}

            {/* Content Types */}
            {brief.contentTypes && brief.contentTypes.length > 0 && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Content Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {brief.contentTypes.map((type, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-primary text-white"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Required Skills */}
            {brief.requiredSkills && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {brief.requiredSkills}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Deliverables */}
            {brief.deliverables && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Deliverables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {brief.deliverables}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reference Materials */}
            {brief.referenceFiles && brief.referenceFiles.length > 0 && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Reference Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {brief.referenceFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.originalName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {brief.tags && (
              <Card className="py-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {brief.tags.split(",").map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(brief.budget)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <span className="font-semibold">
                    {formatDate(brief.deadline)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Bids</span>
                  </div>
                  <span className="font-semibold">{brief.bidCount || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Views</span>
                  </div>
                  <span className="font-semibold">{brief.views || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Your Bid History */}
            {userBid && (
              <Card className="py-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Your Bid History
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBidInfoModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      Bids Info
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Your Bid</span>
                        <Badge
                          className={`text-xs ${
                            userBid.status === "accepted"
                              ? "bg-green-500 text-white"
                              : userBid.status === "rejected"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {userBid.status}
                        </Badge>
                      </div>
                      <span className="font-semibold text-sm">
                        {formatCurrency(userBid.proposedBudget)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Completion Date
                      </p>
                      <p className="text-sm text-foreground">
                        {userBid.proposedTimeline
                          ? formatDate(userBid.proposedTimeline)
                          : userBid.proposedTimeline || "N/A"}
                      </p>
                    </div>

                    {userBid.proposal && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Proposal
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {userBid.proposal}
                        </p>
                      </div>
                    )}

                    {/* Show revision request if available */}
                    {userBid.revisionRequested && userBid.revisionRequest && (
                      <div className="pt-3 border-t border-border">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Revision Requested
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Requested on:{" "}
                            {new Date(
                              userBid.revisionRequest.requestedAt
                            ).toLocaleDateString()}
                          </p>
                          {userBid.revisionRequest.requirements && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                Client Requirements:
                              </p>
                              <p className="text-sm text-foreground">
                                {userBid.revisionRequest.requirements}
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            // Pre-fill form with existing bid data
                            setBidForm({
                              proposal: userBid.proposal || "",
                              proposedBudget:
                                userBid.proposedBudget?.toString() || "",
                              proposedTimeline: userBid.proposedTimeline
                                ? new Date(userBid.proposedTimeline)
                                    .toISOString()
                                    .split("T")[0]
                                : "",
                              portfolioLinks:
                                userBid.portfolioLinks?.join(", ") || "",
                            });
                            setIsRevising(true);
                            setBidModalOpen(true);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Revise Bid Based on Requirements
                        </Button>
                      </div>
                    )}

                    {/* Show rejection reason if available */}
                    {userBid.status === "rejected" &&
                      userBid.rejectionReason && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-foreground bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            {userBid.rejectionReason.includes(
                              "Another bid was accepted"
                            )
                              ? "This project has been accepted by another creator."
                              : userBid.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Revise Bid Button for Rejected Bids (without revision request) */}
                    {userBid.status === "rejected" &&
                      userBid.canBeRevised !== false &&
                      !userBid.revisionRequested && (
                        <div className="pt-3 border-t border-border">
                          <Button
                            onClick={() => {
                              // Pre-fill form with existing bid data
                              setBidForm({
                                proposal: userBid.proposal || "",
                                proposedBudget:
                                  userBid.proposedBudget?.toString() || "",
                                proposedTimeline: userBid.proposedTimeline
                                  ? new Date(userBid.proposedTimeline)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                portfolioLinks:
                                  userBid.portfolioLinks?.join(", ") || "",
                              });
                              setIsRevising(true);
                              setBidModalOpen(true);
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Revise Bid
                          </Button>
                        </div>
                      )}

                    {/* Revision History Link - Always show if bid is accepted */}
                    {userBid.status === "accepted" && (
                      <div className="pt-3 border-t border-border">
                        <Link
                          href={`/creator/revision-history/${brief._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View Revision History
                        </Link>
                      </div>
                    )}

                    {userBid.portfolioLinks &&
                      userBid.portfolioLinks.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Portfolio Links
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {userBid.portfolioLinks.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Portfolio {linkIndex + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Info */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {brief.clientName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {brief.clientEmail}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bid Button - Only show if user can bid */}
            {canBid && (
              <Button
                onClick={() => setBidModalOpen(true)}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Bid on Project
              </Button>
            )}

            {/* Revision History Button - Only show if bid is accepted or creator is selected */}
            {(userBid?.status === "accepted" ||
              (brief.selectedCreatorId &&
                user &&
                brief.selectedCreatorId.toString() === user._id)) && (
              <Button
                onClick={() => {
                  if (id) {
                    router.push(`/creator/revision-history/${id}`);
                  }
                }}
                className="w-full"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Revision History
                {brief.revisions && brief.revisions.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {brief.revisions.length}
                  </span>
                )}
              </Button>
            )}

            {/* Chat with Client Button - Only show if bid is accepted or creator is selected */}
            {(userBid?.status === "accepted" ||
              (brief.selectedCreatorId &&
                user &&
                brief.selectedCreatorId.toString() === user._id)) && (
              <Button
                onClick={async () => {
                  try {
                    // Get or create conversation with client
                    const response = await apiService.getOrCreateConversation(
                      brief._id,
                      brief.clientId.toString()
                    );

                    if (response.success) {
                      router.push(
                        `/creator/conversations?conversationId=${response.data.conversation._id}`
                      );
                    } else {
                      toast.error("Failed to open conversation");
                    }
                  } catch (error) {
                    console.error("Error opening conversation:", error);
                    if (error.status === 401) {
                      return;
                    }
                    toast.error("Failed to open conversation");
                  }
                }}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Client
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isRevising ? "Revise Your Bid" : "Submit Your Bid"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBidModalOpen(false);
                  setIsRevising(false);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {isRevising
                ? "Update your bid proposal based on the client's feedback. Make sure to address any concerns mentioned in the rejection reason."
                : "Fill out the form below to submit your bid for this project."}
            </DialogDescription>
          </DialogHeader>
          <hr className="border-border" />
          <DialogBody className="text-foreground">
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <Label htmlFor="modal-proposal">Proposal *</Label>
                <Textarea
                  id="modal-proposal"
                  placeholder="Describe your approach and why you're the best fit for this project..."
                  value={bidForm.proposal}
                  onChange={(e) =>
                    setBidForm({ ...bidForm, proposal: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="modal-proposedBudget">Proposed Budget *</Label>
                <Input
                  id="modal-proposedBudget"
                  type="number"
                  placeholder="Enter your proposed budget"
                  value={bidForm.proposedBudget}
                  onChange={(e) =>
                    setBidForm({
                      ...bidForm,
                      proposedBudget: e.target.value,
                    })
                  }
                  min="1"
                  step="0.01"
                  required
                />
                {brief?.budget && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Client's budget: {formatCurrency(brief.budget)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="modal-proposedTimeline">
                  Proposed Completion Date *
                </Label>
                <DatePicker
                  id="modal-proposedTimeline"
                  name="proposedTimeline"
                  value={bidForm.proposedTimeline}
                  onChange={(e) =>
                    setBidForm({
                      ...bidForm,
                      proposedTimeline: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Select completion date"
                  required
                  className="w-full border border-border rounded-lg text-foreground"
                />
                {brief?.deadline && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Client's deadline: {formatDate(brief.deadline)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="modal-portfolioLinks">
                  Portfolio Links (Optional)
                </Label>
                <Textarea
                  id="modal-portfolioLinks"
                  placeholder="Enter portfolio links separated by commas"
                  value={bidForm.portfolioLinks}
                  onChange={(e) =>
                    setBidForm({
                      ...bidForm,
                      portfolioLinks: e.target.value,
                    })
                  }
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple links with commas
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBidModalOpen(false);
                    setIsRevising(false);
                  }}
                  disabled={submittingBid}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingBid}>
                  {submittingBid ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRevising ? "Revising..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {isRevising ? "Revise Bid" : "Submit Bid"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Bid Info Modal */}
      {userBid && (
        <BidInfoModal
          isOpen={bidInfoModalOpen}
          onClose={() => setBidInfoModalOpen(false)}
          briefId={id}
          userBid={userBid}
        />
      )}
    </>
  );
};

export default CreatorBriefDetails;
