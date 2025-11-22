import React from "react";
import { Image as ImageIcon, Video, FileText, X } from "lucide-react";

export default function UploadedFilesPreview({ files = [], onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 text-sm"
        >
          {file.type.startsWith("image/") ? (
            <ImageIcon className="h-4 w-4 text-foreground" />
          ) : file.type.startsWith("video/") ? (
            <Video className="h-4 w-4 text-foreground" />
          ) : (
            <FileText className="h-4 w-4 text-foreground" />
          )}
          <span className="text-foreground truncate max-w-[150px]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}


