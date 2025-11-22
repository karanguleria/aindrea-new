import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Clock,
  Tag,
  ExternalLink,
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

const CreatorBriefs = () => {
  const router = useRouter();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch briefs
  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllBriefs({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
        sortBy,
      });

      if (response.success) {
        setBriefs(response.data.briefs);
      } else {
        toast.error("Failed to load briefs");
      }
    } catch (error) {
      console.error("Error fetching briefs:", error);

      // Handle 401 (unauthorized) - user logged out, let API service handle redirect
      if (error.status === 401) {
        return;
      }

      toast.error("Failed to load briefs");
    } finally {
      setLoading(false);
    }
  };

  // Handle bid button click
  const handleBidClick = (briefId) => {
    router.push(`/creator/brief-details/${briefId}`);
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
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-green-500 text-white", text: "Active" },
      paused: { className: "bg-yellow-500 text-white", text: "Paused" },
      completed: { className: "bg-blue-500 text-white", text: "Completed" },
      cancelled: { className: "bg-red-500 text-white", text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.className} text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  // Get user's bid status for a brief
  const getUserBidStatus = (brief) => {
    if (!brief.bids || brief.bids.length === 0) return null;
    const userBid = brief.bids.find(
      (bid) => bid.bidderId === apiService.getUserDetails()?.id
    );
    return userBid;
  };

  // Get bid status badge
  const getBidStatusBadge = (bidStatus) => {
    if (!bidStatus) return null;

    const statusConfig = {
      pending: { className: "bg-yellow-500 text-white", text: "Bid Pending" },
      accepted: { className: "bg-green-500 text-white", text: "Bid Accepted" },
      rejected: { className: "bg-red-500 text-white", text: "Bid Rejected" },
    };

    const config = statusConfig[bidStatus.status] || statusConfig.pending;
    return (
      <Badge className={`${config.className} text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  // Render grid card
  const renderGridCard = (brief) => (
    <Card
      key={brief._id}
      className="border border-border bg-muted-background hover:shadow-lg transition-all duration-200 group"
    >
      <CardContent className="px-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="font-semibold text-foreground text-xl line-clamp-2 mb-3 leading-tight">
                {brief.projectTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                by {brief.clientName} • {formatDate(brief.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {getStatusBadge(brief.status)}
              {getBidStatusBadge(getUserBidStatus(brief))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
            {brief.projectDescription || brief.creativeObjective}
          </p>

          {/* Content Types */}
          {brief.contentTypes && brief.contentTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {brief.contentTypes.slice(0, 3).map((type, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-primary text-white"
                >
                  {type}
                </Badge>
              ))}
              {brief.contentTypes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{brief.contentTypes.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Budget</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(brief.budget)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Deadline</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(brief.deadline)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Bids</span>
                <span className="text-sm font-semibold text-foreground">
                  {brief.bidCount || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Views</span>
                <span className="text-sm font-semibold text-foreground">
                  {brief.views || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={() => handleBidClick(brief._id)}
              className="w-full bg-primary hover:bg-primary/90"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {getUserBidStatus(brief) ? "View Details" : "View & Bid"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render list item
  const renderListItem = (brief) => (
    <Card
      key={brief._id}
      className="border border-border bg-muted-background hover:shadow-md transition-all duration-200 group"
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Title and Description */}
          <div className="col-span-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {brief.projectTitle}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {brief.projectDescription || brief.creativeObjective}
              </p>
              <p className="text-muted-foreground text-sm">
                by {brief.clientName} • {formatDate(brief.createdAt)}
              </p>
              {brief.contentTypes && brief.contentTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {brief.contentTypes
                    .split(",")
                    .slice(0, 2)
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-primary text-white"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  {brief.contentTypes.split(",").length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{brief.contentTypes.split(",").length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-foreground">
                  {formatCurrency(brief.budget)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(brief.deadline)}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{brief.bidCount || 0} bids</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{brief.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="col-span-2">
            <div className="flex flex-wrap gap-1 justify-center">
              {getStatusBadge(brief.status)}
              {getBidStatusBadge(getUserBidStatus(brief))}
            </div>
          </div>

          {/* Action */}
          <div className="col-span-2 flex gap-1 justify-end">
            <Button
              onClick={() => handleBidClick(brief._id)}
              size="sm"
              className="hover:bg-primary/5 hover:border-primary/50 transition-colors"
              variant="outline"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleBidClick(brief._id)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {getUserBidStatus(brief) ? "View" : "Bid"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    fetchBriefs();
  }, [statusFilter, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBriefs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Available Briefs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find projects to bid on and grow your portfolio
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search briefs..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-input text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
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
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("paused")}>
                Paused
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-foreground w-full sm:w-auto"
              >
                <List className="h-4 w-4" />
                {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "budget_high" ? "Budget: High" : "Budget: Low"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("budget_high")}>
                Budget: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("budget_low")}>
                Budget: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="text-foreground"
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Items Count */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground">
          {briefs.length} Briefs
        </h3>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-foreground">Loading briefs...</span>
        </div>
      ) : briefs.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No briefs found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new
            briefs.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefs.map((brief) => renderGridCard(brief))}
        </div>
      ) : (
        <div className="space-y-4">
          {briefs.map((brief) => renderListItem(brief))}
        </div>
      )}
    </div>
  );
};

export default CreatorBriefs;
