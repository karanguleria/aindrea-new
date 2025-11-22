import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ImageHeader from "./ImageHeader";
import BidDetailModal from "./BidDetailModal";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function BidsDetailPage({ briefId }) {
  const router = useRouter();
  const [brief, setBrief] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, accepted, rejected
  const [selectedBids, setSelectedBids] = useState(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [selectedBidForModal, setSelectedBidForModal] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  useEffect(() => {
    if (briefId) {
      fetchBriefDetails();
    }
  }, [briefId]);

  const fetchBriefDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBriefById(briefId);
      if (response.success) {
        setBrief(response.data.brief);
        setBids(response.data.brief.bids || []);
      } else {
        toast.error("Failed to load brief details");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching brief details:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load brief details");
      router.back();
    } finally {
      setLoading(false);
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
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
        className={`${config.className} text-xs font-medium flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const filteredBids = bids.filter((bid) => {
    const matchesSearch =
      bid.bidderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.bidderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.proposal?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleBidSelection = (bidId) => {
    const newSelected = new Set(selectedBids);
    if (newSelected.has(bidId)) {
      newSelected.delete(bidId);
    } else {
      newSelected.add(bidId);
    }
    setSelectedBids(newSelected);
  };

  const handleViewBid = (bid) => {
    setSelectedBidForModal(bid);
    setBidModalOpen(true);
  };

  const handleBidAction = () => {
    // Refresh bids after accept/reject
    fetchBriefDetails();
  };

  const selectedBidsData = Array.from(selectedBids)
    .map((bidId) => bids.find((b) => b._id === bidId))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading bids...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ImageHeader
        title={brief?.projectTitle || "Bids"}
        buttonText={`${bids.length} Total Bids`}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
              variant={compareMode ? "default" : "outline"}
              onClick={() => {
                setCompareMode(!compareMode);
                if (!compareMode) {
                  setSelectedBids(new Set());
                }
              }}
            >
              {compareMode ? "Exit Compare" : "Compare Bids"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or proposal..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-input text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-foreground w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                {statusFilter === "all"
                  ? "All Statuses"
                  : statusFilter.charAt(0).toUpperCase() +
                    statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Statuses
              </DropdownMenuItem>
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
        </div>

        {/* Compare View */}
        {compareMode && selectedBidsData.length > 0 && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Comparing {selectedBidsData.length} Bids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBidsData.map((bid) => (
                  <Card key={bid._id} className="border-2 border-primary">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">
                          {bid.bidderName || "Anonymous"}
                        </h4>
                        {getBidStatusBadge(bid.status)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(bid.proposedBudget || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Timeline
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(bid.proposedTimeline)}
                        </p>
                      </div>
                      {bid.proposal && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Proposal
                          </p>
                          <p className="text-sm text-foreground line-clamp-3">
                            {bid.proposal}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bids List */}
        {filteredBids.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Bids Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No bids have been submitted yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBids.map((bid, index) => {
              const isSelected = selectedBids.has(bid._id);
              const isAccepted = bid.status === "accepted";
              const isRejected = bid.status === "rejected";

              return (
                <Card
                  key={bid._id || index}
                  className={`transition-all h-full flex flex-col ${
                    isSelected && compareMode
                      ? "border-2 border-primary bg-primary/5"
                      : isAccepted
                      ? "border-2 border-green-500 bg-green-50/10"
                      : isRejected
                      ? "border border-red-200 bg-red-50/5"
                      : "border-border"
                  }`}
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {bid.bidderName || "Anonymous"}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{bid.bidderEmail}</span>
                          </p>
                        </div>
                      </div>
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBidSelection(bid._id)}
                          className="h-5 w-5 rounded border-border ml-2 flex-shrink-0"
                        />
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">{getBidStatusBadge(bid.status)}</div>

                    {/* Budget - Prominent */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Proposed Budget
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(bid.proposedBudget || 0)}
                      </p>
                    </div>

                    {/* Timeline & Submitted */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Proposed Timeline
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(bid.proposedTimeline)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Submitted
                        </p>
                        <p className="text-sm text-foreground">
                          {formatDate(bid.submittedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Proposal */}
                    {bid.proposal && (
                      <div className="mb-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Proposal
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                          {bid.proposal}
                        </p>
                      </div>
                    )}

                    {/* Portfolio Links */}
                    {bid.portfolioLinks && bid.portfolioLinks.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Portfolio Links
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bid.portfolioLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Portfolio {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {isRejected && bid.rejectionReason && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                          Rejection Reason
                        </p>
                        <p className="text-sm text-foreground bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                          {bid.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-4 border-t border-border">
                      <Button
                        variant="default"
                        className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90"
                        onClick={() => handleViewBid(bid)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid Detail Modal */}
      <BidDetailModal
        isOpen={bidModalOpen}
        onClose={() => {
          setBidModalOpen(false);
          setSelectedBidForModal(null);
        }}
        bid={selectedBidForModal}
        brief={brief}
        onBidAction={handleBidAction}
        allBids={bids}
      />
    </>
  );
}
