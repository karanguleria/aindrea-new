"use client";

import React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordTab({
  passwordData,
  handlePasswordChange,
  handlePasswordSubmit,
  isLoading,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  return (
    <div className="space-y-3 h-full">
      <div>
        <h3 className="text-base font-medium mb-0">Change Password</h3>
        <p className="text-xs text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </div>
      <hr className="my-2 border-border" />
      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4"
        autoComplete="off"
      >
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-xs">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              className="text-sm"
              autoComplete="off"
              data-form-type="other"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-xs">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="text-sm"
              autoComplete="new-password"
              data-form-type="other"
              required
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="text-sm"
              autoComplete="new-password"
              data-form-type="other"
              required
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
