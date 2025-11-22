"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-xl",
  height = "auto",
  fixedHeight = false,
  noPadding = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${maxWidth} ${
          fixedHeight && height !== "auto" ? height : ""
        } max-h-[90vh] z-[10000] my-auto`}
      >
        <Card className="bg-muted-background border-border shadow-2xl h-full flex flex-col gap-0 py-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto ${
              noPadding ? "" : "p-3"
            }`}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 py-3 px-4 border-t border-border flex-shrink-0">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
