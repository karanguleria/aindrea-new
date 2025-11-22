import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Clock,
  FileText,
  Download,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Share2,
  Copy,
  MapPin,
  Briefcase,
  ExternalLink,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useRouter } from "next/router";
import BriefChatSection from "./BriefChatSection";
import ChatLinker from "./ChatLinker";
import BidderProfileCard from "./BidderProfileCard";

export default function BriefDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [updatingCreator, setUpdatingCreator] = useState(false);
  const [linkedChatId, setLinkedChatId] = useState(null);
  const [acceptBidModalOpen, setAcceptBidModalOpen] = useState(false);
  const [rejectBidModalOpen, setRejectBidModalOpen] = useState(false);
  const [selectedBidForAction, setSelectedBidForAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch brief details
  const fetchBriefDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiService.getBriefById(id);

      if (response.success) {
        setBrief(response.data.brief);
        setBids(response.data.brief.bids || []);
      } else {
        toast.error("Failed to load brief details");
        router.push("/dashboard/briefs");
      }
    } catch (error) {
      console.error("Error fetching brief details:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        // Don't show error toast, API service will handle redirect
        return;
      }

      toast.error(`Failed to load brief details: ${error.message}`);
      router.push("/dashboard/briefs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefDetails();
  }, [id]);

  // Fetch selected creator details when brief loads
  useEffect(() => {
    if (brief?.selectedCreatorId) {
      const fetchCreator = async () => {
        try {
          const response = await apiService.getAvailableCreators({
            page: 1,
            limit: 100,
          });
          if (response.success) {
            const creator = response.data.creators.find(
              (c) => c._id === brief.selectedCreatorId
            );
            if (creator) {
              setSelectedCreator(creator);
            }
          }
        } catch (error) {
          console.error("Error fetching creator:", error);
        }
      };
      fetchCreator();
    } else {
      setSelectedCreator(null);
    }
  }, [brief?.selectedCreatorId]);

  // Set linked chat ID when brief loads
  useEffect(() => {
    if (brief?.chatId) {
      setLinkedChatId(brief.chatId);
    } else {
      setLinkedChatId(null);
    }
  }, [brief?.chatId]);

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        variant: "secondary",
        className: "bg-gray-500 text-white",
        text: "Draft",
      },
      active: {
        variant: "default",
        className: "bg-green-500 text-white",
        text: "Active",
      },
      paused: {
        variant: "secondary",
        className: "bg-yellow-500 text-white",
        text: "Paused",
      },
      completed: {
        variant: "outline",
        className: "bg-blue-500 text-white",
        text: "Completed",
      },
      cancelled: {
        variant: "destructive",
        className: "bg-red-500 text-white",
        text: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge
        variant={config.variant}
        className={`${config.className} text-xs font-medium`}
      >
        {config.text}
      </Badge>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentConfig = {
      pending: {
        variant: "secondary",
        className: "bg-yellow-500 text-white",
        text: "Pending Payment",
      },
      paid: {
        variant: "default",
        className: "bg-green-500 text-white",
        text: "Paid",
      },
      held_in_escrow: {
        variant: "default",
        className: "bg-blue-500 text-white",
        text: "Held in Escrow",
      },
      released: {
        variant: "outline",
        className: "bg-purple-500 text-white",
        text: "Released",
      },
      refunded: {
        variant: "destructive",
        className: "bg-red-500 text-white",
        text: "Refunded",
      },
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.pending;
    return (
      <Badge
        variant={config.variant}
        className={`${config.className} text-xs font-medium`}
      >
        {config.text}
      </Badge>
    );
  };

  // Handle bid acceptance
  const handleOpenAcceptModal = (bid) => {
    setSelectedBidForAction(bid);
    setAcceptBidModalOpen(true);
  };

  const handleAcceptBid = async () => {
    if (!selectedBidForAction || !id) return;

    try {
      setProcessingAction(true);
      const response = await apiService.acceptBid(id, selectedBidForAction._id);
      if (response.success) {
        toast.success("Bid accepted successfully!");
        setAcceptBidModalOpen(false);
        setSelectedBidForAction(null);
        fetchBriefDetails(); // Refresh data
      } else {
        toast.error("Failed to accept bid");
      }
    } catch (error) {
      console.error("Error accepting bid:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to accept bid");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle bid rejection
  const handleOpenRejectModal = (bid) => {
    setSelectedBidForAction(bid);
    setRejectionReason("");
    setRejectBidModalOpen(true);
  };

  const handleRejectBid = async () => {
    if (!selectedBidForAction || !id) return;

    try {
      setProcessingAction(true);
      const response = await apiService.rejectBid(
        id,
        selectedBidForAction._id,
        rejectionReason || null
      );
      if (response.success) {
        toast.success("Bid rejected successfully");
        setRejectBidModalOpen(false);
        setSelectedBidForAction(null);
        setRejectionReason("");
        fetchBriefDetails(); // Refresh data
      } else {
        toast.error("Failed to reject bid");
      }
    } catch (error) {
      console.error("Error rejecting bid:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to reject bid");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle brief deletion
  const handleDeleteBrief = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this brief? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await apiService.deleteBrief(id);
      if (response.success) {
        toast.success("Brief deleted successfully!");
        router.push("/dashboard/briefs");
      } else {
        toast.error("Failed to delete brief");
      }
    } catch (error) {
      console.error("Error deleting brief:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to delete brief");
    }
  };

  // Copy brief link
  const copyBriefLink = () => {
    const link = `${window.location.origin}/briefs/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Brief link copied to clipboard!");
  };

  // Handle creator selection update
  const handleUpdateCreatorSelection = async (creatorId) => {
    if (brief.paymentStatus !== "pending") {
      toast.error("Cannot change creator selection after payment is processed");
      return;
    }

    setUpdatingCreator(true);
    try {
      let response;
      if (creatorId) {
        response = await apiService.selectCreatorForBrief(brief._id, creatorId);
      } else {
        response = await apiService.removeCreatorSelection(brief._id);
      }

      if (response.success) {
        toast.success(
          creatorId
            ? "Creator selected successfully"
            : "Brief is now open to all creators"
        );
        fetchBriefDetails(); // Refresh brief data
      } else {
        toast.error("Failed to update creator selection");
      }
    } catch (error) {
      console.error("Error updating creator selection:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to update creator selection");
    } finally {
      setUpdatingCreator(false);
    }
  };

  // Handle chat linking
  const handleChatLinked = (chatId) => {
    setLinkedChatId(chatId);
    fetchBriefDetails(); // Refresh to get updated brief
  };

  // Handle chat unlinking
  const handleChatUnlinked = () => {
    setLinkedChatId(null);
    fetchBriefDetails(); // Refresh to get updated brief
  };

  if (loading) {
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
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Brief Not Found
          </h3>
          <p className="text-muted-foreground mb-6">
            The brief you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/dashboard/briefs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Briefs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ImageHeader
        title={brief.projectTitle}
        buttonText={`${bids.length} Bids`}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/revision-history/${id}`)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Revision History
              {brief.revisions && brief.revisions.length > 0 && (
                <span className="ml-1">({brief.revisions.length})</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={copyBriefLink}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            {brief.paymentStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/edit-brief/${id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/dashboard/brief-stripe-payment-checkout?briefId=${id}`
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Make Payment
                </Button>
              </>
            )}
            {brief.status === "in_progress" && (
              <Button
                variant="default"
                onClick={async () => {
                  if (
                    !confirm(
                      "Are you sure you want to mark this brief as completed? Payment will be released to the creator."
                    )
                  )
                    return;

                  try {
                    const response = await apiService.markBriefCompleted(id);
                    if (response.success) {
                      toast.success("Brief marked as completed successfully!");
                      fetchBriefDetails();
                    } else {
                      toast.error("Failed to mark brief as completed");
                    }
                  } catch (error) {
                    console.error("Error marking brief as completed:", error);
                    if (error.status === 401) {
                      return;
                    }
                    toast.error("Failed to mark brief as completed");
                  }
                }}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </Button>
            )}
            {brief.paymentStatus === "pending" && (
              <Button
                variant="destructive"
                onClick={handleDeleteBrief}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {brief.projectTitle}
                  </CardTitle>
                  <div className="flex gap-2">
                    {getStatusBadge(brief.status)}
                    {getPaymentStatusBadge(brief.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Project Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {brief.creativeObjective}
                  </p>
                </div>

                {brief.requiredSkills && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Required Skills
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {brief.requiredSkills}
                    </p>
                  </div>
                )}

                {brief.deliverables && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Expected Deliverables
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {brief.deliverables}
                    </p>
                  </div>
                )}

                {brief.tags && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {brief.tags.split(",").map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-primary text-white"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Types */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Content Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brief.contentTypes?.rent && (
                      <Badge variant="outline" className="text-xs">
                        Rent
                      </Badge>
                    )}
                    {brief.contentTypes?.buy && (
                      <Badge variant="outline" className="text-xs">
                        Buy
                      </Badge>
                    )}
                    {brief.contentTypes?.commission && (
                      <Badge variant="outline" className="text-xs">
                        Commission
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Reference Files */}
                {brief.referenceFiles && brief.referenceFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Reference Materials
                    </h3>
                    <div className="space-y-2">
                      {brief.referenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Context Section */}
            {brief.chatId ? (
              <BriefChatSection
                briefId={brief._id}
                chatId={brief.chatId}
                isClient={true}
                onChatLinked={handleChatLinked}
                onChatUnlinked={handleChatUnlinked}
              />
            ) : (
              brief.paymentStatus === "pending" && (
                <Card className="border-border py-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Chat Context (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Link a chat conversation to this brief so creators can
                        see what you were trying to create.
                      </p>
                      <ChatLinker
                        briefId={brief._id}
                        onChatLinked={handleChatLinked}
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Bids Section */}
            <Card className="hover:shadow-md transition-shadow gap-2 py-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Bids ({bids.length})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/bids/${id}`)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Show Bids
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length > 0 ? (
                  <div className="space-y-2">
                    {bids.slice(0, 3).map((bid, index) => (
                      <>
                        <Separator />
                        <div
                          key={bid._id || index}
                          className="flex items-center justify-between p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {bid.bidderName || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${bid.proposedBudget?.toLocaleString() || 0}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              bid.status === "accepted"
                                ? "bg-green-500 text-white"
                                : bid.status === "rejected"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            }
                          >
                            {bid.status}
                          </Badge>
                        </div>
                      </>
                    ))}
                    {bids.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{bids.length - 3} more bids
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bids submitted yet
                  </p>
                )}
              </CardContent>
            </Card>
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
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Budget
                    </span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    ${brief.budget.toLocaleString()}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Deadline
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(brief.deadline).toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Bids
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {bids.length}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Views
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {brief.views || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Created
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(brief.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-foreground">{brief.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-foreground">{brief.clientEmail}</p>
                </div>
              </CardContent>
            </Card>

            {/* Creator Selection */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Creator Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {brief.selectedCreatorId && selectedCreator ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {selectedCreator.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {selectedCreator.fullName}
                        </h4>
                        {selectedCreator.jobTitle && (
                          <p className="text-sm text-muted-foreground">
                            {selectedCreator.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedCreator.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {selectedCreator.location}
                      </div>
                    )}
                    {selectedCreator.primaryDiscipline &&
                      selectedCreator.primaryDiscipline.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedCreator.primaryDiscipline.map(
                            (skill, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    {selectedCreator.socialLink && (
                      <a
                        href={selectedCreator.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View Portfolio
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {brief.paymentStatus === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateCreatorSelection(null)}
                        disabled={updatingCreator}
                        className="w-full mt-2"
                      >
                        Remove Selection
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className="w-full justify-center py-2"
                    >
                      Open to All Creators
                    </Badge>
                    {brief.paymentStatus === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`/dashboard/edit-brief/${brief._id}`);
                        }}
                        className="w-full"
                      >
                        Select Creator
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Accept Bid Modal */}
      <Dialog open={acceptBidModalOpen} onOpenChange={setAcceptBidModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Accept Bid
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this bid? This action will select
              this creator for your project.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedBidForAction && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Bidder
                  </p>
                  <p className="text-foreground font-semibold">
                    {selectedBidForAction.bidderName || "Anonymous"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Proposed Budget
                  </p>
                  <p className="text-foreground font-semibold text-lg">
                    $
                    {selectedBidForAction.proposedBudget?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Completion Date
                  </p>
                  <p className="text-foreground">
                    {selectedBidForAction.proposedTimeline
                      ? new Date(
                          selectedBidForAction.proposedTimeline
                        ).toLocaleDateString()
                      : selectedBidForAction.proposedTimeline || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAcceptBidModalOpen(false);
                setSelectedBidForAction(null);
              }}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptBid}
              disabled={processingAction}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {processingAction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Bid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Bid Modal */}
      <Dialog open={rejectBidModalOpen} onOpenChange={setRejectBidModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject Bid
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this bid? This action cannot be
              undone. You can optionally provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedBidForAction && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Bidder
                  </p>
                  <p className="text-foreground font-semibold">
                    {selectedBidForAction.bidderName || "Anonymous"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="rejectionReason">
                    Rejection Reason (Optional)
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Provide a reason for rejecting this bid (optional)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This reason will be shared with the creator to help them
                    improve future bids.
                  </p>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectBidModalOpen(false);
                setSelectedBidForAction(null);
                setRejectionReason("");
              }}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectBid}
              disabled={processingAction}
              variant="destructive"
            >
              {processingAction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Bid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
