import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseModal } from "@/components/ui/base-modal";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DeleteChatModal({
  isOpen,
  onClose,
  onConfirm,
  chatTitle = "this chat",
  isLoading = false,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmTextChange = (e) => {
    const value = e.target.value;
    setConfirmText(value);
    setIsConfirmed(value.toLowerCase() === "delete");
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText("");
      setIsConfirmed(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setIsConfirmed(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Chat"
      description="This action cannot be undone."
      icon={<AlertTriangle className="h-6 w-6" />}
      iconBgColor="bg-red-100 dark:bg-red-900/20"
      iconColor="text-red-600 dark:text-red-400"
      footer={
        <>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Chat
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            Are you sure you want to delete <strong>"{chatTitle}"</strong>? This
            will permanently remove the chat and all its messages.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Type{" "}
            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
              DELETE
            </span>{" "}
            to confirm:
          </label>
          <Input
            value={confirmText}
            onChange={handleConfirmTextChange}
            placeholder=""
            className="font-mono text-left text-foreground mt-3"
            disabled={isLoading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
