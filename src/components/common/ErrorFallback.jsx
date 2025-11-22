"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Wifi, WifiOff, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorFallback({ error, onRetry, onClear }) {
  const getErrorIcon = () => {
    switch (error?.type) {
      case "network":
        return <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case "not_found":
        return (
          <FileX className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        );
      default:
        return (
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        );
    }
  };

  const getErrorTitle = () => {
    switch (error?.type) {
      case "network":
        return "Connection Error";
      case "not_found":
        return "Chat Not Found";
      case "timeout":
        return "Request Timeout";
      default:
        return "Something went wrong";
    }
  };

  const getErrorDescription = () => {
    switch (error?.type) {
      case "network":
        return "Please check your internet connection and try again.";
      case "not_found":
        return "The chat you're looking for doesn't exist or has been deleted.";
      case "timeout":
        return "The request took too long to complete. Please try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const getRetryButtonText = () => {
    switch (error?.type) {
      case "network":
        return "Retry Connection";
      case "not_found":
        return "Go Back";
      case "timeout":
        return "Try Again";
      default:
        return "Try Again";
    }
  };

  const handleRetry = () => {
    if (error?.type === "not_found") {
      onClear?.();
    } else {
      onRetry?.();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getErrorTitle()}
          </CardTitle>
          <CardDescription>{getErrorDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error?.chatId && (
            <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat ID: {error.chatId}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {getRetryButtonText()}
            </Button>
            {error?.type !== "not_found" && (
              <Button variant="outline" onClick={onClear} className="w-full">
                Clear Error
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
