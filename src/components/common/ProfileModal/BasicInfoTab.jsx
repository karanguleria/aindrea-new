"use client";

import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BasicInfoTab({
  basicData,
  handleBasicChange,
  handleBasicSubmit,
  isLoading,
}) {
  return (
    <div className="space-y-3 h-full">
      <div>
        <h3 className="text-base font-medium mb-0">Basic Information</h3>
        <p className="text-xs text-muted-foreground">
          Update your basic account information
        </p>
      </div>
      <hr className="my-2 border-border" />
      <form onSubmit={handleBasicSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={basicData.fullName}
              onChange={(e) => handleBasicChange("fullName", e.target.value)}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={basicData.email}
              onChange={(e) => handleBasicChange("email", e.target.value)}
              className="text-sm"
              required
            />
          </div>
        </div>
      </form>
    </div>
  );
}
