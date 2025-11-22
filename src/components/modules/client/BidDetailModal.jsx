import React, { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  Mail,
  FileText,
  MessageCircle,
  Edit,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function BidDetailModal({
  isOpen,
  onClose,
  bid,
  brief,
  onBidAction,
  allBids = [],
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionRequirements, setRevisionRequirements] = useState("");

  // Get all bids from this creator for this project
  const creatorBidHistory = useMemo(() => {
    if (!bid || !allBids.length) return [];
    const bidderId = bid.bidderId?._id
      ? bid.bidderId._id.toString()
      : bid.bidderId?.toString() || bid.bidderId;

    return allBids.filter((b) => {
      const bBidderId = b.bidderId?._id
        ? b.bidderId._id.toString()
        : b.bidderId?.toString() || b.bidderId;
      return bBidderId === bidderId;
    });
  }, [bid, allBids]);

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

  const handleAcceptBid = async () => {
    if (!bid || !brief) return;

    try {
      setProcessing(true);
      const response = await apiService.acceptBid(brief._id, bid._id);
      if (response.success) {
        toast.success("Bid accepted successfully!");
        onBidAction?.();
        onClose();
      } else {
        toast.error("Failed to accept bid");
      }
    } catch (error) {
      console.error("Error accepting bid:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to accept bid");
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!bid || !brief) return;

    try {
      setProcessing(true);
      const response = await apiService.requestBidRevision(
        brief._id,
        bid._id,
        revisionRequirements || ""
      );
      if (response.success) {
        toast.success("Revision request sent to creator");
        setRevisionRequirements("");
        setShowRevisionDialog(false);
        onBidAction?.();
        onClose();
      } else {
        toast.error("Failed to request revision");
      }
    } catch (error) {
      console.error("Error requesting revision:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to request revision");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectBid = async () => {
    if (!bid || !brief) return;

    try {
      setProcessing(true);
      const response = await apiService.rejectBid(
        brief._id,
        bid._id,
        rejectionReason || null
      );
      if (response.success) {
        toast.success("Bid rejected successfully");
        setRejectionReason("");
        setShowRejectDialog(false);
        onBidAction?.();
        onClose();
      } else {
        toast.error("Failed to reject bid");
      }
    } catch (error) {
      console.error("Error rejecting bid:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to reject bid");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenConversation = async () => {
    if (!bid || !brief) return;

    try {
      const bidderId = bid.bidderId?._id
        ? bid.bidderId._id.toString()
        : bid.bidderId?.toString() || bid.bidderId;

      const response = await apiService.getOrCreateConversation(
        brief._id,
        bidderId
      );

      if (response.success) {
        router.push(
          `/dashboard/conversations?conversationId=${response.data.conversation._id}`
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

  if (!bid) return null;

  const isPending = bid.status === "pending";
  const isAccepted = bid.status === "accepted";
  const isRejected = bid.status === "rejected";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-muted-background">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Bid Details
            </div>
            {getBidStatusBadge(bid.status)}
          </DialogTitle>
          <DialogDescription>
            Review bid information and manage bid status
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Creator Information */}
          <Card className="bg-muted-background border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Creator Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {bid.bidderName || "Anonymous"}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {bid.bidderEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget Card */}
            <Card className="bg-muted-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  Proposed Budget
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(bid.proposedBudget || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="bg-muted-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Proposed Timeline
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(bid.proposedTimeline)}
                </p>
              </CardContent>
            </Card>

            {/* Submitted Date */}
            <Card className="bg-muted-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  Submitted On
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(bid.submittedAt)}
                </p>
              </CardContent>
            </Card>

            {/* Project Status */}
            {brief && (
              <Card className="bg-muted-background border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Proposal */}
          {bid.proposal && (
            <Card className="bg-muted-background border-border">
              <CardContent className="p-4">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proposal
                </h4>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {bid.proposal}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Links */}
          {bid.portfolioLinks && bid.portfolioLinks.length > 0 && (
            <Card className="bg-muted-background border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Portfolio Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {bid.portfolioLinks.map((link, idx) => (
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
              </CardContent>
            </Card>
          )}

          {/* Creator Bid History */}
          {creatorBidHistory.length > 1 && (
            <Card className="bg-muted-background border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Creator's Bid History on This Project (
                  {creatorBidHistory.length} bids)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creatorBidHistory
                    .sort(
                      (a, b) =>
                        new Date(b.submittedAt) - new Date(a.submittedAt)
                    )
                    .map((historyBid, idx) => (
                      <div
                        key={historyBid._id || idx}
                        className={`p-3 rounded-lg border ${
                          historyBid._id === bid._id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted-background"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              Bid #{creatorBidHistory.length - idx}
                            </span>
                            {historyBid._id === bid._id && (
                              <Badge className="bg-primary text-white text-xs">
                                Current
                              </Badge>
                            )}
                            {getBidStatusBadge(historyBid.status)}
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(historyBid.proposedBudget || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {formatDate(historyBid.submittedAt)}
                        </div>
                        {historyBid.proposal && (
                          <p className="text-xs text-foreground mt-2 line-clamp-2">
                            {historyBid.proposal}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {isRejected && bid.rejectionReason && (
            <Card className="bg-muted-background border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  {bid.rejectionReason}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Revision Request Info */}
          {bid.revisionRequested && bid.revisionRequest && (
            <Card className="bg-muted-background border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Revision Requested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Requested on: {formatDate(bid.revisionRequest.requestedAt)}
                </p>
                {bid.revisionRequest.requirements && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Requirements:
                    </p>
                    <p className="text-sm text-foreground bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      {bid.revisionRequest.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isPending && (
              <>
                <Button
                  onClick={handleAcceptBid}
                  disabled={processing}
                  className="flex items-center gap-2 flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  {processing ? "Processing..." : "Accept Bid"}
                </Button>
                <Button
                  onClick={() => setShowRevisionDialog(true)}
                  disabled={processing || bid.revisionRequested}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit className="h-4 w-4" />
                  {bid.revisionRequested
                    ? "Revision Requested"
                    : "Request Revision"}
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                  variant="destructive"
                  className="flex items-center gap-2 flex-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Bid
                </Button>
              </>
            )}
            <Button
              onClick={handleOpenConversation}
              className="flex items-center gap-2 flex-1"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4" />
              Open Conversation
            </Button>
          </div>
        </DialogBody>
      </DialogContent>

      {/* Revision Request Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent className="max-w-md bg-muted-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Request Bid Revision
            </DialogTitle>
            <DialogDescription>
              Request the creator to revise their bid. Provide specific
              requirements or feedback for what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Revision Requirements *
              </label>
              <textarea
                value={revisionRequirements}
                onChange={(e) => setRevisionRequirements(e.target.value)}
                placeholder="Describe what changes you'd like the creator to make (e.g., adjust budget, change timeline, modify proposal, etc.)..."
                className="w-full p-3 border border-border rounded-lg bg-muted-background text-foreground resize-none"
                rows={5}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestRevision}
                disabled={processing || !revisionRequirements.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {processing ? "Sending..." : "Send Revision Request"}
              </Button>
              <Button
                onClick={() => {
                  setShowRevisionDialog(false);
                  setRevisionRequirements("");
                }}
                variant="outline"
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md bg-muted-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject Bid
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this bid? You can optionally
              provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full p-3 border border-border rounded-lg bg-muted-background text-foreground resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRejectBid}
                disabled={processing}
                variant="destructive"
                className="flex-1"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
                variant="outline"
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
