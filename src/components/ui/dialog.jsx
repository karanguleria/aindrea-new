import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const Dialog = React.forwardRef(
  ({ open, onOpenChange, children, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    if (!open || !mounted) return null;

    return createPortal(
      <div
        ref={ref}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        {...props}
      >
        {/* Backdrop Overlay */}
        <DialogOverlay onClick={onOpenChange} />
        {children}
      </div>,
      document.body
    );
  }
);
Dialog.displayName = "Dialog";

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-[9999] w-full max-w-md mx-auto bg-muted-background border border-border rounded-2xl shadow-2xl overflow-hidden text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogBody = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4 space-y-4", className)} {...props} />
));
DialogBody.displayName = "DialogBody";

const DialogFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end gap-3 p-6 pt-4 border-t border-border",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
