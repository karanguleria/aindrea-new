import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import {
  Grid3X3,
  List,
  ChevronDown,
  Calendar,
  FileText,
  Search,
  DollarSign,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Briefs() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch client briefs
  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClientBriefs({
        status: statusFilter === "All Status" ? undefined : statusFilter,
        paymentStatus:
          paymentFilter === "All Payments" ? undefined : paymentFilter,
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

  useEffect(() => {
    fetchBriefs();
  }, [statusFilter, paymentFilter]);

  // Delete brief
  const handleDeleteBrief = async (briefId) => {
    if (!confirm("Are you sure you want to delete this brief?")) return;

    try {
      const response = await apiService.deleteBrief(briefId);

      if (response.success) {
        toast.success("Brief deleted successfully");
        fetchBriefs();
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

  // Filter briefs
  const filteredBriefs = briefs.filter((brief) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      brief.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.creativeObjective
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      brief.tags?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {brief.creativeObjective}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {getStatusBadge(brief.status)}
              {getPaymentStatusBadge(brief.paymentStatus)}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Budget
                </span>
              </div>
              <span className="text-foreground font-bold text-lg">
                ${brief.paymentAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deadline
                </span>
              </div>
              <span className="text-foreground font-semibold">
                {new Date(brief.deadline).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Bids
                </span>
              </div>
              <span className="text-foreground font-semibold">
                {brief.bidCount || 0}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created
                </span>
              </div>
              <span className="text-foreground font-semibold">
                {new Date(brief.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tags */}
          {brief.tags && (
            <div className="flex flex-wrap gap-2">
              {brief.tags
                .split(",")
                .slice(0, 3)
                .map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-primary text-white"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              {brief.tags.split(",").length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{brief.tags.split(",").length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/brief-details/${brief._id}`)
              }
              className="flex-1 hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {brief.paymentStatus === "pending" && (
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  router.push(
                    `/dashboard/brief-stripe-payment-checkout?briefId=${brief._id}`
                  )
                }
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            )}
            {brief.paymentStatus === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/edit-brief/${brief._id}`)
                }
                className="hover:bg-muted transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {brief.paymentStatus === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteBrief(brief._id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListItem = (brief) => (
    <Card
      key={brief._id}
      className="border border-border bg-background hover:shadow-md transition-all duration-200 group"
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {brief.projectTitle}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {brief.creativeObjective}
              </p>
              {brief.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {brief.tags
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
                  {brief.tags.split(",").length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{brief.tags.split(",").length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Budget
                </span>
              </div>
              <span className="text-foreground font-bold text-lg">
                ${brief.paymentAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deadline
                </span>
              </div>
              <span className="text-foreground font-semibold text-sm">
                {new Date(brief.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1 justify-center">
                {getStatusBadge(brief.status)}
                {getPaymentStatusBadge(brief.paymentStatus)}
              </div>
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  {brief.bidCount || 0} bids
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-2 flex gap-1 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/brief-details/${brief._id}`)
              }
              className="hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {brief.paymentStatus === "pending" && (
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  router.push(
                    `/dashboard/brief-stripe-payment-checkout?briefId=${brief._id}`
                  )
                }
                className="bg-primary hover:bg-primary/90"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            )}
            {brief.paymentStatus === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/edit-brief/${brief._id}`)
                }
                className="hover:bg-muted transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {brief.paymentStatus === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteBrief(brief._id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <ImageHeader title={"My Briefs"} buttonText={`${briefs.length} Total`} />

      <div className="text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-lg border border-border transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  {statusFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  Filter by Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => setStatusFilter("All Status")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  Draft
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
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Payment Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-lg border border-border transition-colors">
                  <DollarSign className="w-4 h-4" />
                  {paymentFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  Filter by Payment
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => setPaymentFilter("All Payments")}
                >
                  All Payments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("pending")}>
                  Pending Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("paid")}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPaymentFilter("held_in_escrow")}
                >
                  Held in Escrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("released")}>
                  Released
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("refunded")}>
                  Refunded
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle Buttons */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-cyan-400 text-foreground"
                    : "bg-transparent"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search briefs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 bg-card border border-border rounded-lg text-foreground transition-colors w-72"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Create New Brief Button */}
            <Button
              onClick={() => router.push("/dashboard/create-new-brief")}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Brief
            </Button>
          </div>
        </div>

        {/* Items Count */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-300">
            {filteredBriefs.length} Briefs
          </h3>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading briefs...</span>
          </div>
        ) : filteredBriefs.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {briefs.length === 0 ? "No Briefs Yet" : "No briefs found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {briefs.length === 0
                ? "Create your first project brief to start receiving bids"
                : "Try adjusting your filters or search term"}
            </p>
            {briefs.length === 0 && (
              <Button
                onClick={() => router.push("/dashboard/create-new-brief")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Brief
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBriefs.map(renderGridCard)}
          </div>
        ) : (
          <div className="space-y-3">{filteredBriefs.map(renderListItem)}</div>
        )}
      </div>
    </>
  );
}
