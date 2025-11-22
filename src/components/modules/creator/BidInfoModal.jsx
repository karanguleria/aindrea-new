import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  History,
  FileText,
  User,
  TrendingUp,
  Award,
} from "lucide-react";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function BidInfoModal({ isOpen, onClose, briefId, userBid }) {
  const router = useRouter();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && briefId) {
      fetchBriefDetails();
    }
  }, [isOpen, briefId]);

  const fetchBriefDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBriefById(briefId);
      if (response.success) {
        setBrief(response.data.brief);
      }
    } catch (error) {
      console.error("Error fetching brief details:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load brief details");
    } finally {
      setLoading(false);
    }
  };

  const getBidStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: "bg-yellow-500 text-white",
        text: "Pending",
        icon: Clock,
      },
      accepted: {
        className: "bg-green-500 text-white",
        text: "Accepted",
        icon: CheckCircle,
      },
      rejected: {
        className: "bg-red-500 text-white",
        text: "Rejected",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.className} text-sm font-medium flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenConversation = async () => {
    if (!brief || !userBid) return;

    try {
      // Extract bidderId - handle both populated and non-populated cases
      const bidderId = userBid.bidderId?._id
        ? userBid.bidderId._id.toString()
        : userBid.bidderId?.toString() || userBid.bidderId;

      // Get or create conversation
      const response = await apiService.getOrCreateConversation(
        brief._id,
        bidderId
      );

      if (response.success) {
        router.push(
          `/creator/conversations?conversationId=${response.data.conversation._id}`
        );
        onClose();
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
  };

  if (!userBid) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-muted-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="h-5 w-5 text-primary" />
            </div>
            Bid Information & Project History
          </DialogTitle>
          <DialogDescription>
            Track your bid status and project progress
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading bid information...
              </p>
            </div>
          ) : (
            <>
              {/* Status Header */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {userBid.status === "accepted" ? (
                      <Award className="h-6 w-6 text-green-500" />
                    ) : userBid.status === "rejected" ? (
                      <XCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getBidStatusBadge(userBid.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Proposed Budget
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(userBid.proposedBudget || 0)}
                  </p>
                </div>
              </div>

              {/* Bid Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget Card */}
                <div className="p-4 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    Proposed Budget
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(userBid.proposedBudget || 0)}
                  </p>
                </div>

                {/* Timeline Card */}
                <div className="p-4 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    Proposed Timeline
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDate(userBid.proposedTimeline)}
                  </p>
                </div>

                {/* Submitted Date */}
                <div className="p-4 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    Bid Submitted
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(userBid.submittedAt)}
                  </p>
                </div>

                {/* Project Status */}
                {brief && (
                  <div className="p-4 rounded-lg border border-border bg-muted-background">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <TrendingUp className="h-4 w-4" />
                      Project Status
                    </div>
                    <Badge
                      className={
                        brief.status === "active"
                          ? "bg-green-500 text-white"
                          : brief.status === "completed"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500 text-white"
                      }
                    >
                      {brief.status}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Proposal */}
              {userBid.proposal && (
                <div className="p-5 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <FileText className="h-4 w-4" />
                    Your Proposal
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {userBid.proposal}
                  </p>
                </div>
              )}

              {/* Portfolio Links */}
              {userBid.portfolioLinks && userBid.portfolioLinks.length > 0 && (
                <div className="p-5 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <ExternalLink className="h-4 w-4" />
                    Portfolio Links
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userBid.portfolioLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Portfolio {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {userBid.status === "rejected" && userBid.rejectionReason && (
                <div className="p-5 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                    <XCircle className="h-5 w-5" />
                    Rejection Reason
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {userBid.rejectionReason}
                  </p>
                </div>
              )}

              {userBid.status === "accepted" && (
                <div className="p-5 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    Congratulations!
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Your bid has been accepted. You can now start working on
                    this project.
                  </p>
                </div>
              )}

              {/* Project History */}
              {brief && (
                <div className="p-5 rounded-lg border border-border bg-muted-background">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                    <History className="h-4 w-4" />
                    Project History
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">
                        Total Bids:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {brief.bidCount || 0}
                      </span>
                    </div>
                    {brief.selectedCreatorId && (
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">
                          Selected Creator:
                        </span>
                        <Badge className="bg-primary text-white">
                          {brief.selectedCreatorId.toString() ===
                          (
                            userBid.bidderId?._id || userBid.bidderId
                          )?.toString()
                            ? "You"
                            : "Another Creator"}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Project Status:
                      </span>
                      <Badge
                        className={
                          brief.status === "active"
                            ? "bg-green-500 text-white"
                            : brief.status === "completed"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                        }
                      >
                        {brief.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleOpenConversation}
                  className="flex items-center gap-2 flex-1"
                  variant="default"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open Conversation
                </Button>
                <Button
                  onClick={() => {
                    router.push(`/creator/brief-details/${briefId}`);
                    onClose();
                  }}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Details
                </Button>
              </div>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
