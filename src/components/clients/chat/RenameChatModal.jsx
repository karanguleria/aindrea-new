import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseModal } from "@/components/ui/base-modal";
import { Edit3, Check } from "lucide-react";

export function RenameChatModal({
  isOpen,
  onClose,
  onConfirm,
  currentTitle = "",
  isLoading = false,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
      setError("");
    }
  }, [isOpen, currentTitle]);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setNewTitle(value);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateTitle = (title) => {
    if (!title.trim()) {
      return "Chat title cannot be empty";
    }
    if (title.trim().length < 3) {
      return "Chat title must be at least 3 characters long";
    }
    if (title.trim().length > 100) {
      return "Chat title must be less than 100 characters";
    }
    if (title.trim() === currentTitle) {
      return "New title must be different from current title";
    }
    return null;
  };

  const handleConfirm = () => {
    const trimmedTitle = newTitle.trim();
    const validationError = validateTitle(trimmedTitle);

    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(trimmedTitle);
  };

  const handleClose = () => {
    setNewTitle("");
    setError("");
    onClose();
  };

  const handleKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !error &&
      newTitle.trim() &&
      newTitle.trim() !== currentTitle
    ) {
      handleConfirm();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename Chat"
      description="Give your chat a new name to make it easier to find."
      icon={<Edit3 className="h-6 w-6" />}
      footer={
        <>
          <Button
            onClick={handleConfirm}
            disabled={
              !newTitle.trim() ||
              !!error ||
              newTitle.trim() === currentTitle ||
              isLoading
            }
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Renaming...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Rename Chat
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">
            Current title:
          </label>
          <div className="p-2 mt-1 bg-muted rounded-lg text-sm text-muted-foreground border">
            {currentTitle}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            New title:
          </label>
          <Input
            value={newTitle}
            onChange={handleTitleChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter new chat title..."
            className={
              error ? "border-red-500 focus:border-red-500" : "text-foreground mt-1"
            }
            disabled={isLoading}
            maxLength={100}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-muted-foreground">
            {newTitle.length}/100 characters
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
