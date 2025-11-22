import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  FileText,
} from "lucide-react";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function PaymentHistoryInvoices() {
  const router = useRouter();
  const { transactionId } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get backend URL for images
  const getBackendUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl && typeof window !== "undefined") {
      const currentHost = window.location.hostname;
      if (currentHost.includes("aindrea.ai")) {
        return "https://apis.aindrea.ai";
      }
    }
    return apiUrl || "http://localhost:5012";
  };

  // Create full image URL
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendUrl = getBackendUrl();
    return `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  const getOptimizedItemUrl = (item) => {
    if (!item) return null;
    const candidate =
      item.optimizedUrl ||
      item.imageData?.optimizedUrl ||
      item.variantOptimizedUrl;
    if (!candidate || typeof candidate !== "string") {
      return null;
    }
    return getFullImageUrl(candidate);
  };

  // Fetch transaction details
  const fetchTransaction = async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      const response = await apiService.getTransactionById(transactionId);

      if (response.success) {
        setTransaction(response.data.transaction);
      } else {
        toast.error("Failed to fetch transaction details");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      toast.error("Failed to load transaction details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  // Handle download invoice
  const handleDownloadInvoice = () => {
    if (!transaction) return;

    // Create invoice HTML content
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${transaction.stripePaymentIntentId.slice(-8)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-info h1 {
            margin: 0;
            color: #000;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-info h2 {
            margin: 0;
            color: #666;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          .detail-section h3 {
            margin-bottom: 10px;
            color: #000;
          }
          .detail-item {
            margin-bottom: 5px;
          }
          .detail-label {
            color: #666;
            font-size: 14px;
          }
          .detail-value {
            color: #000;
            font-weight: 500;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .items-table th {
            background-color: #f5f5f5;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #ddd;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .summary {
            margin-left: auto;
            width: 300px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .summary-total {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 18px;
            padding-top: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-completed { background-color: #10b981; color: white; }
          .status-pending { background-color: #f59e0b; color: white; }
          .status-failed { background-color: #ef4444; color: white; }
          .status-refunded { background-color: #6b7280; color: white; }
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>AINDREA.AI</h1>
            <p>Creative AI Platform</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p>#${transaction.stripePaymentIntentId.slice(-8)}</p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="detail-section">
            <h3>Transaction Details</h3>
            <div class="detail-item">
              <div class="detail-label">Transaction ID</div>
              <div class="detail-value">${
                transaction.stripePaymentIntentId
              }</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date</div>
              <div class="detail-value">${formatDate(
                transaction.createdAt
              )}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Payment Method</div>
              <div class="detail-value">${
                transaction.paymentMethod || "Card"
              }</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <span class="status-badge status-${
                  transaction.status
                }">${transaction.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          ${
            transaction.billingDetails
              ? `
          <div class="detail-section">
            <h3>Billing Information</h3>
            ${
              transaction.billingDetails.name
                ? `
            <div class="detail-item">
              <div class="detail-label">Name</div>
              <div class="detail-value">${transaction.billingDetails.name}</div>
            </div>`
                : ""
            }
            ${
              transaction.billingDetails.email
                ? `
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div class="detail-value">${transaction.billingDetails.email}</div>
            </div>`
                : ""
            }
            ${
              transaction.billingDetails.address
                ? `
            <div class="detail-item">
              <div class="detail-label">Address</div>
              <div class="detail-value">
                ${transaction.billingDetails.address.line1 || ""}<br>
                ${transaction.billingDetails.address.city || ""} ${
                    transaction.billingDetails.address.postal_code || ""
                  }<br>
                ${transaction.billingDetails.address.country || ""}
              </div>
            </div>`
                : ""
            }
          </div>
          `
              : ""
          }
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Asset ID</th>
              <th>License Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items
              .map(
                (item) => `
              <tr>
                <td>${item.prompt || "Generated Image"}</td>
                <td>${item.assetId}</td>
                <td>${
                  transaction.licenseType === "purchase" ? "Purchase" : "Rental"
                }</td>
                <td style="text-align: right;">$${item.price.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${transaction.formattedAmount}</span>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <span>$0.00</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total:</span>
            <span>${transaction.formattedAmount}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
          <p>For support, contact support@aindrea.ai</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([invoiceContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${transaction.stripePaymentIntentId.slice(-8)}_${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Invoice downloaded successfully");
  };

  // Handle go back
  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <ImageHeader title="Transaction Invoice" buttonText="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-foreground">
            Loading transaction details...
          </span>
        </div>
      </>
    );
  }

  if (!transaction) {
    return (
      <>
        <ImageHeader title="Transaction Invoice" buttonText="Not Found" />
        <div className="text-center py-20">
          <p className="text-foreground text-lg mb-4">Transaction not found</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <ImageHeader
        title="Transaction Invoice"
        buttonText={`Invoice #${transaction.stripePaymentIntentId.slice(-8)}`}
      />

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          <Button onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>

        {/* Transaction Overview */}
        <Card className={`bg-transparent border border-border rounded-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </label>
                <p className="text-foreground font-mono">
                  {transaction.stripePaymentIntentId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">{getStatusBadge(transaction.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <p className="text-foreground">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount
                </label>
                <p className="text-foreground font-semibold text-lg">
                  {transaction.formattedAmount}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  License Type
                </label>
                <Badge
                  variant={
                    transaction.licenseType === "purchase"
                      ? "default"
                      : "secondary"
                  }
                >
                  {transaction.licenseType === "purchase"
                    ? "Purchase"
                    : "Rental"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </label>
                <p className="text-foreground capitalize">
                  {transaction.paymentMethod}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Purchased */}
        <Card className={`bg-transparent border border-border rounded-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Items Purchased ({transaction.totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.items.map((item, index) => {
                const fullImageUrl = getFullImageUrl(item.imageUrl);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      {fullImageUrl ? (
                        <OptimizedImage
                          optimizedUrl={getOptimizedItemUrl(item)}
                          fallbackUrl={fullImageUrl}
                          alt={item.prompt || "Generated Image"}
                          width={256}
                          height={256}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {item.prompt || "Generated Image"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Asset ID: {item.assetId}
                      </p>
                      {item.licenseStatus && (
                        <Badge variant="outline" className="mt-1">
                          License: {item.licenseStatus}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                      {item.canDownload && (
                        <Badge variant="secondary" className="mt-1">
                          Download Available
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        {transaction.billingDetails && (
          <Card className={`bg-transparent border border-border rounded-lg`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.billingDetails.name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-foreground">
                      {transaction.billingDetails.name}
                    </p>
                  </div>
                )}
                {transaction.billingDetails.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-foreground">
                      {transaction.billingDetails.email}
                    </p>
                  </div>
                )}
                {transaction.billingDetails.address && (
                  <>
                    {transaction.billingDetails.address.line1 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Address
                        </label>
                        <p className="text-foreground">
                          {transaction.billingDetails.address.line1}
                        </p>
                      </div>
                    )}
                    {transaction.billingDetails.address.city && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          City
                        </label>
                        <p className="text-foreground">
                          {transaction.billingDetails.address.city}
                        </p>
                      </div>
                    )}
                    {transaction.billingDetails.address.postal_code && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Postal Code
                        </label>
                        <p className="text-foreground">
                          {transaction.billingDetails.address.postal_code}
                        </p>
                      </div>
                    )}
                    {transaction.billingDetails.address.country && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Country
                        </label>
                        <p className="text-foreground">
                          {transaction.billingDetails.address.country}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Summary */}
        <Card className={`bg-transparent border border-border rounded-lg`}>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">
                  {transaction.formattedAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                <span>Total:</span>
                <span>{transaction.formattedAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
