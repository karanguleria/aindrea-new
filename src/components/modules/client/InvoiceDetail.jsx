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
  Package,
  RefreshCw,
  Building2,
  User,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/router";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function InvoiceDetail() {
  const router = useRouter();
  const { invoiceId } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch invoice details
  const fetchInvoice = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const response = await apiService.getInvoiceById(invoiceId);

      if (response.success) {
        setInvoice(response.data.invoice);
      } else {
        toast.error("Failed to fetch invoice details");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const getOptimizedItemUrl = (item) => {
    if (!item) return null;
    const candidate =
      item.optimizedUrl ||
      item.imageData?.optimizedUrl ||
      item.variantOptimizedUrl;
    if (!candidate || typeof candidate !== "string") {
      return null;
    }
    return candidate;
  };

  // Get invoice type badge
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
      <Badge className={`${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  // Get invoice ID to display
  const getInvoiceDisplayId = () => {
    if (!invoice) return "N/A";

    if (invoice.metadata?.stripeInvoiceId) {
      return invoice.metadata.stripeInvoiceId;
    }
    if (invoice.stripePaymentIntentId) {
      return invoice.stripePaymentIntentId;
    }
    if (invoice.stripeSubscriptionId) {
      return invoice.stripeSubscriptionId;
    }
    if (invoice.id) {
      return invoice.id.toString().slice(-8);
    }
    return "N/A";
  };

  // Handle download invoice
  const handleDownloadInvoice = () => {
    if (!invoice) return;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${getInvoiceDisplayId()}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
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
            font-size: 24px;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-info h2 {
            margin: 0;
            color: #666;
            font-size: 20px;
          }
          .invoice-details {
            margin-bottom: 40px;
          }
          .detail-section {
            margin-bottom: 30px;
          }
          .detail-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            color: #000;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .items-table th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .total-section {
            margin-top: 30px;
            text-align: right;
          }
          .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #000;
          }
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
            <p>#${getInvoiceDisplayId()}</p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="detail-section">
            <h3>Invoice Details</h3>
            <div class="detail-item">
              <span class="detail-label">Invoice ID:</span>
              <span class="detail-value">#${getInvoiceDisplayId()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${invoice.invoiceType || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${invoice.status || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formatDate(invoice.createdAt)}</span>
            </div>
            ${
              invoice.completedAt
                ? `
            <div class="detail-item">
              <span class="detail-label">Completed:</span>
              <span class="detail-value">${formatDate(
                invoice.completedAt
              )}</span>
            </div>
            `
                : ""
            }
          </div>

          ${
            invoice.subscriptionDetails
              ? `
          <div class="detail-section">
            <h3>Subscription Details</h3>
            <div class="detail-item">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">${
                invoice.subscriptionDetails.plan || "N/A"
              }</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Billing Cycle:</span>
              <span class="detail-value">${
                invoice.subscriptionDetails.billingCycle || "N/A"
              }</span>
            </div>
            ${
              invoice.subscriptionDetails.periodStart
                ? `
            <div class="detail-item">
              <span class="detail-label">Period Start:</span>
              <span class="detail-value">${formatDate(
                invoice.subscriptionDetails.periodStart
              )}</span>
            </div>
            `
                : ""
            }
            ${
              invoice.subscriptionDetails.periodEnd
                ? `
            <div class="detail-item">
              <span class="detail-label">Period End:</span>
              <span class="detail-value">${formatDate(
                invoice.subscriptionDetails.periodEnd
              )}</span>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }

          ${
            invoice.assetItems && invoice.assetItems.length > 0
              ? `
          <div class="detail-section">
            <h3>Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>License Type</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.assetItems
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.prompt || "Asset"}</td>
                    <td>${item.licenseType || "N/A"}</td>
                    <td>$${((item.price || 0) / 100).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            invoice.billingDetails
              ? `
          <div class="detail-section">
            <h3>Billing Information</h3>
            ${
              invoice.billingDetails.name
                ? `
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${invoice.billingDetails.name}</span>
            </div>
            `
                : ""
            }
            ${
              invoice.billingDetails.email
                ? `
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${invoice.billingDetails.email}</span>
            </div>
            `
                : ""
            }
            ${
              invoice.billingDetails.address
                ? `
            <div class="detail-item">
              <span class="detail-label">Address:</span>
              <span class="detail-value">
                ${invoice.billingDetails.address.line1 || ""}
                ${
                  invoice.billingDetails.address.city
                    ? `, ${invoice.billingDetails.address.city}`
                    : ""
                }
                ${
                  invoice.billingDetails.address.postal_code
                    ? ` ${invoice.billingDetails.address.postal_code}`
                    : ""
                }
                ${
                  invoice.billingDetails.address.country
                    ? `, ${invoice.billingDetails.address.country}`
                    : ""
                }
              </span>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }
        </div>

        <div class="total-section">
          <div class="detail-item">
            <span class="detail-label" style="font-size: 18px;">Total Amount:</span>
            <span class="total-amount">${
              invoice.formattedAmount ||
              `$${((invoice.amount || 0) / 100).toFixed(2)}`
            } ${invoice.currency?.toUpperCase() || "USD"}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>AINDREA.AI - Creative AI Platform</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <>
        <ImageHeader title="Invoice Details" buttonText="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground">Loading invoice details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <ImageHeader title="Invoice Details" buttonText="Not Found" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground text-lg font-semibold mb-2">
              Invoice not found
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ImageHeader
        title="Invoice Details"
        buttonText={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-foreground hover:text-foreground/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />
      <div className="text-foreground">
        <div className="max-w-4xl mx-auto">
          {/* Invoice Header */}
          <Card className="mb-6 border-border">
            <CardHeader className="border-b border-border">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Invoice Details
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Invoice #{getInvoiceDisplayId()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(invoice.status)}
                  {getInvoiceTypeBadge(invoice.invoiceType)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    Invoice Information
                  </h3>
                  <div className="space-y-3">
                    {getInvoiceDisplayId() &&
                      getInvoiceDisplayId() !== "N/A" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Invoice ID:
                          </span>
                          <span className="font-mono text-sm">
                            {getInvoiceDisplayId()}
                          </span>
                        </div>
                      )}
                    {invoice.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{formatDate(invoice.createdAt)}</span>
                      </div>
                    )}
                    {invoice.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Completed:
                        </span>
                        <span>{formatDate(invoice.completedAt)}</span>
                      </div>
                    )}
                    {invoice.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refunded:</span>
                        <span>{formatDate(invoice.refundedAt)}</span>
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Payment Method:
                        </span>
                        <span className="capitalize">
                          {invoice.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="md:border-l md:border-border md:pl-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    {(invoice.formattedAmount || invoice.amount) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="text-xl font-bold">
                          {invoice.formattedAmount ||
                            `$${((invoice.amount || 0) / 100).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    {invoice.currency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="uppercase">{invoice.currency}</span>
                      </div>
                    )}
                    {invoice.stripePaymentIntentId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Payment Intent:
                        </span>
                        <span className="font-mono text-xs">
                          {invoice.stripePaymentIntentId.slice(-12)}
                        </span>
                      </div>
                    )}
                    {invoice.metadata?.stripeInvoiceId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Stripe Invoice:
                        </span>
                        <span className="font-mono text-xs">
                          {invoice.metadata.stripeInvoiceId.slice(-12)}
                        </span>
                      </div>
                    )}
                    {invoice.stripeSubscriptionId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Subscription ID:
                        </span>
                        <span className="font-mono text-xs">
                          {invoice.stripeSubscriptionId.slice(-12)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          {invoice.subscriptionDetails && (
            <Card className="mb-6 border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      {invoice.subscriptionDetails.plan && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Plan:</span>
                          <Badge className="bg-purple-100 text-purple-800 capitalize">
                            {invoice.subscriptionDetails.plan}
                          </Badge>
                        </div>
                      )}
                      {invoice.subscriptionDetails.billingCycle && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Billing Cycle:
                          </span>
                          <Badge className="bg-indigo-100 text-indigo-800 capitalize">
                            {invoice.subscriptionDetails.billingCycle}
                          </Badge>
                        </div>
                      )}
                      {invoice.subscriptionDetails.periodStart && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Period Start:
                          </span>
                          <span>
                            {formatDate(
                              invoice.subscriptionDetails.periodStart
                            )}
                          </span>
                        </div>
                      )}
                      {invoice.subscriptionDetails.periodEnd && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Period End:
                          </span>
                          <span>
                            {formatDate(invoice.subscriptionDetails.periodEnd)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {invoice.subscriptionDetails.features && (
                    <div className="md:border-l md:border-border md:pl-6">
                      <h4 className="text-sm font-semibold mb-3">Features:</h4>
                      <div className="space-y-2">
                        {invoice.subscriptionDetails.features
                          .maxMonthlyImages && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Monthly Images:
                            </span>
                            <span>
                              {
                                invoice.subscriptionDetails.features
                                  .maxMonthlyImages
                              }
                            </span>
                          </div>
                        )}
                        {invoice.subscriptionDetails.features
                          .maxMonthlyAssets && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Monthly Assets:
                            </span>
                            <span>
                              {
                                invoice.subscriptionDetails.features
                                  .maxMonthlyAssets
                              }
                            </span>
                          </div>
                        )}
                        {invoice.subscriptionDetails.features
                          .prioritySupport && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Priority Support:
                            </span>
                            <span className="text-green-600">Yes</span>
                          </div>
                        )}
                        {invoice.subscriptionDetails.features
                          .commercialLicense && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Commercial License:
                            </span>
                            <span className="text-green-600">Yes</span>
                          </div>
                        )}
                        {invoice.subscriptionDetails.features.apiAccess && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              API Access:
                            </span>
                            <span className="text-green-600">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Asset Items */}
          {invoice.assetItems && invoice.assetItems.length > 0 && (
            <Card className="mb-6 border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Purchased Items ({invoice.assetItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {invoice.assetItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-start gap-4 p-4 border border-border rounded-lg"
                    >
                      {item.imageUrl && (
                        <OptimizedImage
                          optimizedUrl={getOptimizedItemUrl(item)}
                          fallbackUrl={item.imageUrl}
                          alt={item.prompt || "Asset"}
                          width={256}
                          height={256}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        {(item.prompt || item.assetId) && (
                          <h4 className="font-semibold mb-2">
                            {item.prompt || "Asset Item"}
                          </h4>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {item.licenseType && (
                            <div>
                              <span className="text-muted-foreground">
                                License:
                              </span>
                              <span className="ml-2 capitalize">
                                {item.licenseType}
                              </span>
                            </div>
                          )}
                          {(item.price || item.price === 0) && (
                            <div>
                              <span className="text-muted-foreground">
                                Price:
                              </span>
                              <span className="ml-2 font-semibold">
                                ${((item.price || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {item.licenseStatus && (
                            <div>
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <span className="ml-2 capitalize">
                                {item.licenseStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Details */}
          {invoice.billingDetails &&
            (invoice.billingDetails.name ||
              invoice.billingDetails.email ||
              (invoice.billingDetails.address &&
                (invoice.billingDetails.address.line1 ||
                  invoice.billingDetails.address.city ||
                  invoice.billingDetails.address.postal_code ||
                  invoice.billingDetails.address.country))) && (
              <Card className="mb-6 border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {invoice.billingDetails.name && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-semibold">
                            {invoice.billingDetails.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {invoice.billingDetails.email && (
                      <div className="flex items-center gap-3 md:border-l md:border-border md:pl-6">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-semibold">
                            {invoice.billingDetails.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {invoice.billingDetails.address &&
                      (invoice.billingDetails.address.line1 ||
                        invoice.billingDetails.address.city ||
                        invoice.billingDetails.address.postal_code ||
                        invoice.billingDetails.address.country) && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Address
                            </p>
                            <p className="font-semibold">
                              {invoice.billingDetails.address.line1}
                              {invoice.billingDetails.address.city &&
                                `, ${invoice.billingDetails.address.city}`}
                              {invoice.billingDetails.address.postal_code &&
                                ` ${invoice.billingDetails.address.postal_code}`}
                              {invoice.billingDetails.address.country &&
                                `, ${invoice.billingDetails.address.country}`}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Actions */}
          <div className="flex justify-end gap-4 mb-8">
            <Button onClick={handleDownloadInvoice} className="bg-primary">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
