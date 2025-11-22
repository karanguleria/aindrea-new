import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Grid3X3,
  List,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
  X,
} from "lucide-react";
import BidderProfileCard from "./BidderProfileCard";
import BidComparison from "./BidComparison";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function BidsDisplay({
  bids = [],
  briefId,
  onAcceptBid,
  onRejectBid,
  loading = false,
}) {
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "pending", "accepted", "rejected"
  const [sortBy, setSortBy] = useState("date"); // "date", "amount", "status"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBids, setExpandedBids] = useState(new Set());
  const [selectedBids, setSelectedBids] = useState([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  // Filter and sort bids
  const filteredAndSortedBids = useMemo(() => {
    let filtered = [...bids];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((bid) => bid.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bid) =>
          bid.bidderName?.toLowerCase().includes(searchLower) ||
          bid.proposal?.toLowerCase().includes(searchLower) ||
          bid.bidderEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort bids
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "amount":
          comparison =
            (a.proposedBudget || 0) - (b.proposedBudget || 0);
          break;
        case "status":
          const statusOrder = { accepted: 3, pending: 2, rejected: 1 };
          comparison =
            (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
          break;
        case "date":
        default:
          comparison =
            new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
          break;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return filtered;
  }, [bids, statusFilter, sortBy, sortOrder, searchTerm]);

  const toggleExpanded = (bidId) => {
    const newExpanded = new Set(expandedBids);
    if (newExpanded.has(bidId)) {
      newExpanded.delete(bidId);
    } else {
      newExpanded.add(bidId);
    }
    setExpandedBids(newExpanded);
  };

  const toggleBidSelection = (bidId) => {
    setSelectedBids((prev) =>
      prev.includes(bidId)
        ? prev.filter((id) => id !== bidId)
        : [...prev, bidId]
    );
  };

  const handleOpenComparison = () => {
    if (selectedBids.length < 2) {
      toast.error("Please select at least 2 bids to compare");
      return;
    }
    setComparisonOpen(true);
  };

  const handleAcceptBid = async (bidId) => {
    if (onAcceptBid) {
      await onAcceptBid(bidId);
      setSelectedBids([]);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (onRejectBid) {
      await onRejectBid(bidId);
      setSelectedBids((prev) => prev.filter((id) => id !== bidId));
    }
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
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      accepted: {
        label: "Accepted",
        className: "bg-green-500 text-white",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-500 text-white",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-500 text-white",
      },
    };

    const statusConfig = config[status] || config.pending;
    return (
      <Badge variant="secondary" className={`text-xs ${statusConfig.className}`}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading bids...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Bids Yet
        </h3>
        <p className="text-muted-foreground">
          No creators have submitted bids for this brief yet.
        </p>
      </div>
    );
  }

  const comparisonBids = bids.filter((bid) =>
    selectedBids.includes(bid._id?.toString())
  );

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {statusFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Bids
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("accepted")}>
                Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("date");
                  setSortOrder("desc");
                }}
              >
                Date (Newest)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("date");
                  setSortOrder("asc");
                }}
              >
                Date (Oldest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("amount");
                  setSortOrder("asc");
                }}
              >
                Amount (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("amount");
                  setSortOrder("desc");
                }}
              >
                Amount (High to Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Compare Button */}
          {selectedBids.length >= 2 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenComparison}
            >
              Compare ({selectedBids.length})
            </Button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search bids..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 w-full sm:w-64"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedBids.length} of {bids.length} bids
      </div>

      {/* Bids Display */}
      {filteredAndSortedBids.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No bids match your filters</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="space-y-4">
          {filteredAndSortedBids.map((bid, index) => {
            const isExpanded = expandedBids.has(bid._id?.toString());
            const isSelected = selectedBids.includes(bid._id?.toString());
            const isAccepted = bid.status === "accepted";

            return (
              <Card
                key={bid._id || index}
                className={`border-2 transition-all ${
                  isAccepted
                    ? "border-green-500 bg-green-50/10"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    {bid.status === "pending" && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBidSelection(bid._id?.toString())}
                        className="mt-2 h-4 w-4"
                      />
                    )}

                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground text-lg">
                              {bid.bidderName || "Anonymous"}
                            </h4>
                            {getStatusBadge(bid.status)}
                            {isAccepted && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bid.bidderEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(bid.proposedBudget || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(bid.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Bidder Profile (Compact) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <BidderProfileCard
                            bidder={bid.bidderId}
                            bid={bid}
                            briefId={briefId}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              Timeline:
                            </span>
                            <span className="font-medium text-foreground">
                              {bid.proposedTimeline}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Proposal */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-foreground">
                            Proposal
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(bid._id?.toString())}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                More
                              </>
                            )}
                          </Button>
                        </div>
                        <p
                          className={`text-muted-foreground leading-relaxed ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {bid.proposal}
                        </p>
                      </div>

                      {/* Actions */}
                      {bid.status === "pending" && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptBid(bid._id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Bid
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectBid(bid._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedBids.map((bid, index) => {
            const isSelected = selectedBids.includes(bid._id?.toString());
            const isAccepted = bid.status === "accepted";

            return (
              <Card
                key={bid._id || index}
                className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                  isAccepted
                    ? "border-green-500 bg-green-50/10"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() =>
                  bid.status === "pending" &&
                  toggleBidSelection(bid._id?.toString())
                }
              >
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {bid.bidderName || "Anonymous"}
                        </h4>
                        {getStatusBadge(bid.status)}
                      </div>
                    </div>
                    {bid.status === "pending" && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleBidSelection(bid._id?.toString());
                        }}
                        className="h-4 w-4"
                      />
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(bid.proposedBudget || 0)}
                    </p>
                  </div>

                  {/* Bidder Profile (Compact) */}
                  <BidderProfileCard
                    bidder={bid.bidderId}
                    bid={bid}
                    briefId={briefId}
                  />

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium text-foreground">
                      {bid.proposedTimeline}
                    </span>
                  </div>

                  {/* Proposal Preview */}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {bid.proposal}
                    </p>
                  </div>

                  {/* Actions */}
                  {bid.status === "pending" && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptBid(bid._id);
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectBid(bid._id);
                        }}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Submitted Date */}
                  <p className="text-xs text-muted-foreground text-center">
                    {formatDate(bid.submittedAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bid Comparison Modal */}
      <BidComparison
        bids={comparisonBids}
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        onSelectBid={handleAcceptBid}
        briefId={briefId}
      />
    </div>
  );
}

