import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Sparkles,
  X,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UploadDropdown from "./chat/UploadDropdown";
import ModeDropdown from "./chat/ModeDropdown";
import UploadedFilesPreview from "./chat/UploadedFilesPreview";
import { useRouter } from "next/router";

export default function Chat({
  message = "",
  setMessage,
  chatMode = "text",
  onSendMessage,
  onGenerateImage,
  onModeChange,
  onEditImage,
}) {
  const [localMessage, setLocalMessage] = useState(message);
  const [selectedMode, setSelectedMode] = useState(chatMode);
  const [autoDetectedMode, setAutoDetectedMode] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Sync local state with message prop
  useEffect(() => {
    setLocalMessage(message);
  }, [message]);

  // Sync selectedMode with chatMode prop
  useEffect(() => {
    setSelectedMode(chatMode);
  }, [chatMode]);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setLocalMessage(value);
    if (setMessage) {
      setMessage(value);
    }

    // Auto-detection disabled - let AI ask questions first
    setAutoDetectedMode(null);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    // Notify parent component about mode change
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const handleFileUpload = (e, fileType = "all") => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // File size limit: 10MB per file
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // Check if any file exceeds the size limit
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      alert(
        `The following file(s) exceed the 10MB size limit: ${fileNames}\nPlease choose smaller files.`
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Process files and create preview data
    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((processedFiles) => {
      setUploadedFiles((prev) => [...prev, ...processedFiles]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileUpload = (fileType) => {
    if (fileInputRef.current) {
      // Set accept attribute based on file type
      if (fileType === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (fileType === "video") {
        fileInputRef.current.accept = "video/*";
      } else {
        fileInputRef.current.accept = "image/*,video/*,.pdf,.doc,.docx,.txt";
      }
      fileInputRef.current.click();
    }
  };

  // Image edit handled inline when 'Edit image' mode selected

  const handleSubmit = () => {
    if (!localMessage.trim() && uploadedFiles.length === 0) return;

    // Check if trying to use disabled modes
    if (selectedMode === "video" || selectedMode === "audio") {
      return;
    }

    const prompt = localMessage.trim();
    const hasUploadedFiles = uploadedFiles.length > 0;
    const hasImageFiles = uploadedFiles.some((file) =>
      file.type.startsWith("image/")
    );

    // IMAGE EDITING MODE: Upload image + text prompt → Edit
    if (selectedMode === "image-edit") {
      if (hasImageFiles && prompt) {
        if (onEditImage) {
          const imageFile = uploadedFiles.find((f) =>
            f.type.startsWith("image/")
          );
          if (!imageFile) return;
          const editData = {
            image: imageFile.file,
            prompt: prompt,
            mask: null,
          };
          onEditImage(editData);
        }
        setLocalMessage("");
        setUploadedFiles([]);
        setSelectedMode("text");
      }
      return;
    }

    // No auto-detection for editing

    // Normal message flow (chat with images, text, etc.)
    // Auto-detection disabled - only use manually selected mode
    const finalMode = selectedMode;

    const messageData = {
      text: prompt,
      files: uploadedFiles,
      mode: finalMode,
    };

    if (finalMode === "image") {
      if (onGenerateImage) {
        onGenerateImage(messageData, finalMode);
      }
    } else {
      if (onSendMessage) {
        onSendMessage(messageData, finalMode);
      }
    }
    setLocalMessage("");
    setUploadedFiles([]);
    setAutoDetectedMode(null);
  };

  const getPlaceholder = () => {
    switch (selectedMode) {
      case "image":
        return "Describe the image you want to generate...";
      case "image-edit":
        return "Upload image + describe edits (e.g., 'change background to sunset')...";
      case "deep-search":
        return "Ask a question for deep research...";
      case "web-search":
        return "Search the web for...";
      case "canvas":
        return "Describe what you want to create on canvas...";
      case "video":
        return "Describe the video you want to create... (Coming Soon)";
      case "audio":
        return "Describe the audio you want to generate... (Coming Soon)";
      default:
        return "Ask Anything (Auto-detects image generation)";
    }
  };

  const getSendIcon = () => {
    switch (selectedMode) {
      case "image":
        return <Sparkles className="h-5 w-5" />;
      case "image-edit":
        return <Palette className="h-5 w-5" />;
      case "deep-search":
        return <Search className="h-5 w-5" />;
      case "web-search":
        return <Globe className="h-5 w-5" />;
      case "canvas":
        return <Palette className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Volume2 className="h-5 w-5" />;
      default:
        return <Send className="h-5 w-5" />;
    }
  };

  const getModeLabel = () => {
    switch (selectedMode) {
      case "image":
        return "Create Image";
      case "image-edit":
        return "Edit Image";
      case "deep-search":
        return "Deep Research";
      case "web-search":
        return "Web Search";
      case "canvas":
        return "Canvas";
      case "video":
        return "Create Video";
      case "audio":
        return "Create Audio";
      default:
        return "Text Chat";
    }
  };

  const getModeIcon = () => {
    switch (selectedMode) {
      case "image":
        return <Pencil className="h-3 w-3" />;
      case "image-edit":
        return <Palette className="h-3 w-3" />;
      case "deep-search":
        return <Search className="h-3 w-3" />;
      case "web-search":
        return <Globe className="h-3 w-3" />;
      case "canvas":
        return <Palette className="h-3 w-3" />;
      case "video":
        return <Video className="h-3 w-3" />;
      case "audio":
        return <Volume2 className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-transparent border border-muted-foreground rounded-4xl px-4 lg:px-6 py-2"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <UploadedFilesPreview files={uploadedFiles} onRemove={removeFile} />
        )}

        {/* Input Area */}
        <div className="mb-1">
          <Input
            value={localMessage}
            onChange={handleMessageChange}
            placeholder={getPlaceholder()}
            className="h-10 border-none leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg bg-card text-foreground"
          />
        </div>

        {/* Separator */}
        <div className="border-t border-muted-foreground mb-2 -mx-4 lg:-mx-6" />

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-1">
            <UploadDropdown onTrigger={triggerFileUpload} />
            <ModeDropdown
              selectedMode={selectedMode}
              onChange={handleModeChange}
            />

            {/* Selected Mode Badge */}
            {selectedMode !== "text" && (
              <Badge
                className="flex items-center gap-1.5 p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full"
                onClick={() => handleModeChange("text")}
              >
                {getModeIcon()}
                <span className="text-xs font-medium">{getModeLabel()}</span>
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            className="size-8 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground disabled:opacity-50 font-semibold shadow-lg"
            disabled={!localMessage.trim()}
            onClick={handleSubmit}
          >
            {getSendIcon()}
          </Button>
        </div>
      </form>
    </>
  );
}
