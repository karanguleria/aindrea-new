import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function SubscriptionHistory() {
  const router = useRouter();
  const [subscriptionHistory, setSubscriptionHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSubscriptionHistory();
      if (response.success) {
        setSubscriptionHistory(response.data);
      } else {
        toast.error("Failed to load subscription history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load subscription history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Derive displayable period dates with fallbacks
  const getDisplayPeriod = (item) => {
    // Prefer backend-provided dates
    let start = item.currentPeriodStart
      ? new Date(item.currentPeriodStart)
      : null;
    let end = item.currentPeriodEnd ? new Date(item.currentPeriodEnd) : null;

    // Fallback: use createdAt as anchor and add period length
    if (!start || isNaN(start.getTime())) {
      if (item.createdAt) {
        start = new Date(item.createdAt);
      }
    }

    if ((!end || isNaN(end.getTime())) && start && !isNaN(start.getTime())) {
      const derived = new Date(start);
      // Default monthly = 30 days, yearly = 365 days
      const days = item.billingCycle === "yearly" ? 365 : 30;
      derived.setDate(derived.getDate() + days);
      end = derived;
    }

    return {
      start: start && !isNaN(start.getTime()) ? start : null,
      end: end && !isNaN(end.getTime()) ? end : null,
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Subscription History
          </h1>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : subscriptionHistory ? (
        <div className="flex-1 overflow-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Total Subscriptions
              </div>
              <div className="text-2xl font-bold">
                {subscriptionHistory.total}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-500">
                {subscriptionHistory.active}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-2xl font-bold">
                {formatCurrency(subscriptionHistory.totalSpending || 0)}
              </div>
            </div>
          </div>

          {/* History Table */}
          {subscriptionHistory.history &&
          subscriptionHistory.history.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionHistory.history.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium capitalize">
                        {item.plan}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize`}
                          variant={
                            item.status === "active"
                              ? "default"
                              : item.status === "cancelled"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.billingCycle}
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount || 0)}</TableCell>
                      {(() => {
                        const { start, end } = getDisplayPeriod(item);
                        return (
                          <>
                            <TableCell>{formatDate(start)}</TableCell>
                            <TableCell>{formatDate(end)}</TableCell>
                          </>
                        );
                      })()}
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No subscription history found
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No history data available
        </div>
      )}
    </div>
  );
}
