import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  DollarSign,
  Calendar,
  Eye,
  Clock,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  Clock4,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageHeader from "../client/ImageHeader";

const BiddingHistory = () => {
  const router = useRouter();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, accepted, rejected
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch bidding history
  const fetchBiddingHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyBids({
        status: statusFilter === "all" ? undefined : statusFilter,
        sortBy: sortBy === "newest" ? "createdAt" : "createdAt",
        sortOrder: sortBy === "newest" ? "desc" : "asc",
      });

      if (response.success) {
        let filteredBriefs = response.data.briefs || [];

        // Apply search filter
        if (searchTerm) {
          filteredBriefs = filteredBriefs.filter(
            (item) =>
              item.brief.projectTitle
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              item.brief.creativeObjective
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        setBriefs(filteredBriefs);
      } else {
        toast.error("Failed to load bidding history");
      }
    } catch (error) {
      console.error("Error fetching bidding history:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to load bidding history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiddingHistory();
  }, [statusFilter, sortBy]);

  // Handle view brief details
  const handleViewBrief = (briefId) => {
    router.push(`/creator/brief-details/${briefId}`);
  };

  // Handle view revision history
  const handleViewRevisions = (briefId) => {
    router.push(`/creator/revision-history/${briefId}`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get bid status badge
  const getBidStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: "bg-yellow-500 text-white",
        text: "Pending",
        icon: Clock4,
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
      <Badge className={`${config.className} text-xs font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Get brief status badge
  const getBriefStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-blue-500 text-white", text: "Active" },
      in_progress: { className: "bg-purple-500 text-white", text: "In Progress" },
      completed: { className: "bg-green-500 text-white", text: "Completed" },
      cancelled: { className: "bg-red-500 text-white", text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.className} text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  // Render grid card
  const renderGridCard = (item) => {
    const { brief, bid } = item;

    return (
      <Card
        key={brief._id}
        className="h-full bg-background hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
              {brief.projectTitle}
            </CardTitle>
            <div className="flex flex-col gap-1">
              {getBidStatusBadge(bid.status)}
              {getBriefStatusBadge(brief.status)}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Client: {brief.clientName} • {formatDate(brief.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {brief.creativeObjective}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">
                Your Bid: {formatCurrency(bid.proposedBudget)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {bid.proposedTimeline
                  ? formatDate(bid.proposedTimeline)
                  : "Not specified"}
              </span>
            </div>
          </div>

          {bid.message && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {bid.message}
            </p>
          )}

          {bid.status === "rejected" && bid.rejectionReason && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {bid.rejectionReason}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewBrief(brief._id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {bid.status === "accepted" && brief.status === "in_progress" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleViewRevisions(brief._id)}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Revisions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render list item
  const renderListItem = (item) => {
    const { brief, bid } = item;

    return (
      <Card
        key={brief._id}
        className="bg-background hover:shadow-md transition-all duration-200 border-border"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {brief.projectTitle}
                </h3>
                <div className="flex gap-2">
                  {getBidStatusBadge(bid.status)}
                  {getBriefStatusBadge(brief.status)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Client: {brief.clientName} • {formatDate(brief.createdAt)}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {brief.creativeObjective}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Your Bid: {formatCurrency(bid.proposedBudget)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {bid.proposedTimeline
                      ? formatDate(bid.proposedTimeline)
                      : "Not specified"}
                  </span>
                </div>
              </div>
              {bid.message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
                  {bid.message}
                </p>
              )}
              {bid.status === "rejected" && bid.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                  <strong>Rejection Reason:</strong> {bid.rejectionReason}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewBrief(brief._id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              {bid.status === "accepted" && brief.status === "in_progress" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewRevisions(brief._id)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Revisions
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <ImageHeader title="Bidding History" />
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search briefs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Status Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {["all", "pending", "accepted", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    statusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Briefs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bidding history...</p>
            </div>
          </div>
        ) : briefs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "You haven't placed any bids yet."
                  : `No ${statusFilter} bids found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {briefs.map((item) =>
              viewMode === "grid" ? renderGridCard(item) : renderListItem(item)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingHistory;

