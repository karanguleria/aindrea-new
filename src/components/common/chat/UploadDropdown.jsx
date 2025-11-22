import React from "react";
import { Plus, Image as ImageIcon, Video, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function UploadDropdown({ onTrigger }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          className="size-8 rounded-full text-foreground transition-colors"
          variant="ghost"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 rounded-lg border-muted-foreground text-foreground p-1 flex flex-col gap-1">
        <DropdownMenuItem
          className="flex items-center gap-3 p-2 cursor-pointer"
          onClick={() => onTrigger?.("image")}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Upload Images</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-3 p-2 cursor-pointer"
          onClick={() => onTrigger?.("video")}
        >
          <Video className="h-4 w-4" />
          <span>Upload Video</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-3 p-2 cursor-pointer"
          onClick={() => onTrigger?.("all")}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Files</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
