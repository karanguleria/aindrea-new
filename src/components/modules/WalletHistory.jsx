import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ImageHeader from "./client/ImageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Calendar, FileText, Wallet } from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function WalletHistory({ filters = {} }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getWalletHistory({
        page: pagination.current,
        limit: 20,
        ...filters,
      });
      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to load wallet history");
      }
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load wallet history");
    } finally {
      setLoading(false);
    }
  }, [pagination.current]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <ImageHeader title="Wallet History" buttonText="" />
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <ImageHeader title="Wallet History" buttonText="" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "credit"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      {transaction.briefId && (
                        <p className="text-sm text-muted-foreground">
                          Brief: {transaction.briefId.projectTitle || "N/A"}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "credit"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs mt-1 ${
                        transaction.status === "completed"
                          ? "bg-green-500 text-white"
                          : transaction.status === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
