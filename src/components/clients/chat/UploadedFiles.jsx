import React from "react";
import { FileText, Image as ImageIcon, Video } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function UploadedFiles({ files = [], isUser }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {files.map((file, index) => (
        <div key={index}>
          {file.type?.startsWith("image/") && file.data ? (
            <div
              className={`${
                isUser ? "bg-primary-foreground/10" : "bg-muted"
              } rounded-lg p-2`}
            >
              <OptimizedImage
                fallbackUrl={file.data}
                alt={file.name}
                width={512}
                height={512}
                className="max-w-full h-auto rounded max-h-60"
              />
              <div className="flex items-center gap-2 mt-2 text-xs">
                <ImageIcon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground ml-auto">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ) : file.type?.startsWith("video/") && file.data ? (
            <div
              className={`${
                isUser ? "bg-primary-foreground/10" : "bg-muted"
              } rounded-lg p-2`}
            >
              <video
                src={file.data}
                controls
                className="max-w-full h-auto rounded max-h-60"
              />
              <div className="flex items-center gap-2 mt-2 text-xs">
                <Video className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground ml-auto">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 ${
                isUser ? "bg-primary-foreground/10" : "bg-muted"
              } rounded-lg px-3 py-2 text-sm`}
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
