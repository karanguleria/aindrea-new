import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function WalletBalance() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWalletBalance();
      if (response.success) {
        setBalance(response.data.balance);
        setCurrency(response.data.currency);
      } else {
        toast.error("Failed to load wallet balance");
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(balance)}
            </div>
            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="text-sm text-primary hover:underline"
            >
              View Wallet History →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
