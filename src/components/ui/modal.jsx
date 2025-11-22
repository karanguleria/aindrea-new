import * as React from "react";
import { cn } from "@/lib/utils";

const Modal = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-8",
      className
    )}
    {...props}
  />
));
Modal.displayName = "Modal";

const ModalOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-sm", className)}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

const ModalContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 w-full max-w-md mx-auto bg-background border border-border rounded-2xl shadow-2xl",
      className
    )}
    {...props}
  />
));
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold text-white", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-400", className)} {...props} />
));
ModalDescription.displayName = "ModalDescription";

const ModalBody = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-3 p-6 pt-4", className)}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
};
