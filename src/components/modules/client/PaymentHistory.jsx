import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Grid3X3,
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
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function PaymentHistory() {
  const router = useRouter();
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserTransactions(
        statusFilter || null,
        licenseTypeFilter || null,
        currentPage,
        10
      );

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, licenseTypeFilter]);

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.stripePaymentIntentId.toLowerCase().includes(searchLower) ||
      transaction.items.some((item) =>
        item.prompt?.toLowerCase().includes(searchLower)
      ) ||
      transaction.formattedAmount.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setSelectedItems(filteredTransactions.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

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

  // Get license type badge
  const getLicenseTypeBadge = (licenseType) => {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          licenseType === "purchase"
            ? "bg-blue-100 text-blue-800"
            : "bg-purple-100 text-purple-800"
        }`}
      >
        {licenseType === "purchase" ? "Purchase" : "Rental"}
      </span>
    );
  };

  // Handle view transaction details
  const handleViewTransaction = (transactionId) => {
    router.push(
      `/dashboard/payment-history-invoices?transactionId=${transactionId}`
    );
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <ImageHeader
        title={"Payment History"}
        buttonText={`${pagination.total || 0} Transactions`}
      />
      <div className="text-foreground">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
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

            {/* License Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between min-w-[160px] border-border bg-transparent text-foreground rounded-lg transition-colors hover:bg-accent/50"
                >
                  <span>
                    {licenseTypeFilter === ""
                      ? "All License Types"
                      : licenseTypeFilter === "purchase"
                      ? "Purchase"
                      : "Rental"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="divide-y divide-border border border-border shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => setLicenseTypeFilter("")}
                  className="rounded-none"
                >
                  All License Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLicenseTypeFilter("purchase")}
                  className="rounded-none"
                >
                  <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                  Purchase
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLicenseTypeFilter("rent")}
                  className="rounded-none"
                >
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Rental
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedAll}
                onCheckedChange={handleSelectAll}
                className="border-border"
              />
              <label className="text-foreground text-sm">Select All</label>
            </div> */}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
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
            <span className="ml-3 text-foreground">
              Loading transactions...
            </span>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="bg-transparent rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent border-border hover:bg-card">
                    {/* <TableHead className="text-foreground">
                      <Checkbox
                        checked={selectedAll}
                        onCheckedChange={handleSelectAll}
                        className="border-border"
                      />
                    </TableHead> */}
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-foreground">Items</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">
                      License Type
                    </TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-border hover:bg-accent"
                      >
                        {/* <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(transaction.id)}
                            onCheckedChange={() =>
                              handleSelectItem(transaction.id)
                            }
                            className="border-border"
                          />
                        </TableCell> */}
                        <TableCell className="text-foreground">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm">
                          {transaction.stripePaymentIntentId.slice(-8)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {transaction.totalItems} item(s)
                            </span>
                            {transaction.items
                              .slice(0, 2)
                              .map((item, index) => (
                                <span
                                  key={index}
                                  className="text-xs text-muted-foreground truncate max-w-32"
                                >
                                  {item.prompt || "Generated Image"}
                                </span>
                              ))}
                            {transaction.items.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{transaction.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">
                          {transaction.formattedAmount}
                        </TableCell>
                        <TableCell>
                          {getLicenseTypeBadge(transaction.licenseType)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleViewTransaction(transaction.id)
                              }
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
