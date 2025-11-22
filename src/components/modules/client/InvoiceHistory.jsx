import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Eye,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Package,
  RefreshCw,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function InvoiceHistory() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (statusFilter) params.append("status", statusFilter);
      if (invoiceTypeFilter) params.append("invoiceType", invoiceTypeFilter);

      const response = await apiService.request(`/api/invoice?${params}`, {
        method: "GET",
      });

      if (response.success) {
        setInvoices(response.data.invoices);
        setPagination(response.data.pagination);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast.error("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoice history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter, invoiceTypeFilter]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.stripePaymentIntentId?.toLowerCase().includes(searchLower) ||
      invoice.metadata?.stripeInvoiceId?.toLowerCase().includes(searchLower) ||
      invoice._id?.toString().toLowerCase().includes(searchLower) ||
      invoice.assetItems?.some((item) =>
        item.prompt?.toLowerCase().includes(searchLower)
      ) ||
      invoice.subscriptionDetails?.plan?.toLowerCase().includes(searchLower) ||
      invoice.formattedAmount?.toLowerCase().includes(searchLower)
    );
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        color: "bg-green-600",
        icon: CheckCircle,
        text: "Completed",
      },
      pending: { color: "bg-yellow-600", icon: Clock, text: "Pending" },
      failed: { color: "bg-red-600", icon: XCircle, text: "Failed" },
      refunded: { color: "bg-gray-600", icon: XCircle, text: "Refunded" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Get invoice type badge and icon
  const getInvoiceTypeBadge = (invoiceType) => {
    const configs = {
      asset_purchase: {
        icon: Package,
        color: "bg-blue-100 text-blue-800",
        text: "Asset Purchase",
      },
      subscription: {
        icon: Calendar,
        color: "bg-purple-100 text-purple-800",
        text: "Subscription",
      },
      subscription_renewal: {
        icon: RefreshCw,
        color: "bg-indigo-100 text-indigo-800",
        text: "Subscription Renewal",
      },
    };

    const config = configs[invoiceType] || {
      icon: CreditCard,
      color: "bg-gray-100 text-gray-800",
      text: invoiceType,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Get description for invoice
  const getInvoiceDescription = (invoice) => {
    if (invoice.invoiceType === "asset_purchase") {
      const itemCount = invoice.assetItems?.length || 0;
      return `${itemCount} asset(s)`;
    } else if (
      invoice.invoiceType === "subscription" ||
      invoice.invoiceType === "subscription_renewal"
    ) {
      const plan = invoice.subscriptionDetails?.plan || "Unknown";
      const cycle = invoice.subscriptionDetails?.billingCycle || "monthly";
      return `${plan.charAt(0).toUpperCase() + plan.slice(1)} (${cycle})`;
    }
    return "";
  };

  // Handle view invoice details
  const handleViewInvoice = (invoiceId) => {
    const isCreator = router.pathname.startsWith("/creator");
    const basePath = isCreator ? "/creator" : "/dashboard";
    router.push(`${basePath}/invoice-detail?invoiceId=${invoiceId}`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <ImageHeader
        title={"Payment History"}
        buttonText={`${pagination.total || 0} Invoices`}
      />
      <div className="text-foreground">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Invoice Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between min-w-[180px] border-border bg-transparent text-foreground rounded-lg transition-colors hover:bg-accent/50"
                >
                  <span>
                    {invoiceTypeFilter === ""
                      ? "All Types"
                      : invoiceTypeFilter === "asset_purchase"
                      ? "Asset Purchase"
                      : invoiceTypeFilter === "subscription"
                      ? "Subscription"
                      : "Subscription Renewal"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="divide-y divide-border border border-border shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => setInvoiceTypeFilter("")}
                  className="rounded-none"
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setInvoiceTypeFilter("asset_purchase")}
                  className="rounded-none"
                >
                  <Package className="h-4 w-4 mr-2 text-blue-600" />
                  Asset Purchase
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setInvoiceTypeFilter("subscription")}
                  className="rounded-none"
                >
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setInvoiceTypeFilter("subscription_renewal")}
                  className="rounded-none"
                >
                  <RefreshCw className="h-4 w-4 mr-2 text-indigo-600" />
                  Subscription Renewal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between min-w-[160px] border-border bg-transparent text-foreground rounded-lg transition-colors hover:bg-accent/50"
                >
                  <span>
                    {statusFilter === ""
                      ? "All Status"
                      : statusFilter === "completed"
                      ? "Completed"
                      : statusFilter === "pending"
                      ? "Pending"
                      : statusFilter === "failed"
                      ? "Failed"
                      : "Refunded"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="divide-y divide-border border border-border shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => setStatusFilter("")}
                  className="rounded-none"
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("completed")}
                  className="rounded-none"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("pending")}
                  className="rounded-none"
                >
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("failed")}
                  className="rounded-none"
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("refunded")}
                  className="rounded-none"
                >
                  <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                  Refunded
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground" />
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border bg-transparent text-foreground rounded-lg transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-accent-foreground/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading invoices...</span>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="bg-transparent rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent border-border hover:bg-card">
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">
                      Invoice ID
                    </TableHead>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">
                      Description
                    </TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-foreground"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-border hover:bg-accent"
                      >
                        <TableCell className="text-foreground">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm">
                          {(() => {
                            // For subscription invoices, try to show Stripe invoice ID from metadata
                            if (
                              invoice.invoiceType === "subscription" ||
                              invoice.invoiceType === "subscription_renewal"
                            ) {
                              // Check metadata for Stripe invoice ID
                              if (invoice.metadata?.stripeInvoiceId) {
                                return invoice.metadata.stripeInvoiceId.slice(
                                  -8
                                );
                              }
                              // Fall back to payment intent ID
                              if (invoice.stripePaymentIntentId) {
                                return invoice.stripePaymentIntentId.slice(-8);
                              }
                              // Fall back to subscription ID if available
                              if (invoice.stripeSubscriptionId) {
                                return invoice.stripeSubscriptionId.slice(-8);
                              }
                              // Fall back to MongoDB invoice ID (try both id and _id)
                              if (invoice.id) {
                                return invoice.id.toString().slice(-8);
                              }
                              if (invoice._id) {
                                return invoice._id.toString().slice(-8);
                              }
                              return "N/A";
                            }
                            // For asset purchases, show payment intent ID
                            if (invoice.stripePaymentIntentId) {
                              return invoice.stripePaymentIntentId.slice(-8);
                            }
                            // Fall back to MongoDB invoice ID (try both id and _id)
                            if (invoice.id) {
                              return invoice.id.toString().slice(-8);
                            }
                            if (invoice._id) {
                              return invoice._id.toString().slice(-8);
                            }
                            return "N/A";
                          })()}
                        </TableCell>
                        <TableCell>
                          {getInvoiceTypeBadge(invoice.invoiceType)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getInvoiceDescription(invoice)}
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">
                          {invoice.formattedAmount}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice.id)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-accent text-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-foreground text-sm">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-accent text-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
