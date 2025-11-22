import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  User,
} from "lucide-react";
import BidderProfileCard from "./BidderProfileCard";

export default function BidComparison({
  bids = [],
  isOpen,
  onClose,
  onSelectBid,
  briefId,
}) {
  if (!isOpen || bids.length === 0) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compare Bids ({bids.length})</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Comparison Grid */}
          <div
            className={`grid gap-4 ${
              bids.length === 2
                ? "grid-cols-2"
                : bids.length === 3
                ? "grid-cols-3"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {bids.map((bid, index) => (
              <Card
                key={bid._id || index}
                className={`border-2 ${
                  bid.status === "accepted"
                    ? "border-green-500 bg-green-50/10"
                    : "border-border"
                }`}
              >
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        Bid #{index + 1}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(bid.status)}`}
                      >
                        {bid.status.charAt(0).toUpperCase() +
                          bid.status.slice(1)}
                      </Badge>
                    </div>
                    {bid.status === "accepted" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <Separator />

                  {/* Bidder Profile */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Bidder
                    </h4>
                    <BidderProfileCard
                      bidder={bid.bidderId}
                      bid={bid}
                    />
                  </div>

                  <Separator />

                  {/* Budget */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Proposed Budget
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(bid.proposedBudget || 0)}
                    </p>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Timeline
                      </h4>
                    </div>
                    <p className="text-foreground">{bid.proposedTimeline}</p>
                  </div>

                  <Separator />

                  {/* Proposal */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Proposal
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {bid.proposal}
                    </p>
                    {bid.proposal && bid.proposal.length > 150 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto mt-1"
                        onClick={() => {
                          // Could expand to show full proposal
                        }}
                      >
                        Read more
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Submitted Date */}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {formatDate(bid.submittedAt)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {bid.status === "pending" && onSelectBid && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => onSelectBid(bid._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept This Bid
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          {bids.length > 1 && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Quick Comparison
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lowest Bid</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(
                        Math.min(...bids.map((b) => b.proposedBudget || 0))
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Highest Bid</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(
                        Math.max(...bids.map((b) => b.proposedBudget || 0))
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Average Bid</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(
                        bids.reduce(
                          (sum, b) => sum + (b.proposedBudget || 0),
                          0
                        ) / bids.length
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Bids</p>
                    <p className="font-semibold text-foreground">
                      {bids.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

