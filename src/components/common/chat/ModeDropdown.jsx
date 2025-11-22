import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wrench, MessageSquare, Pencil, Palette, Search, Globe, Video, Volume2 } from "lucide-react";

export default function ModeDropdown({ selectedMode, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          className="size-8 rounded-full text-foreground hover:bg-accent transition-colors"
          variant="ghost"
        >
          <Wrench className="text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 rounded-lg border-muted-foreground text-foreground p-1 flex flex-col gap-1">
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "text" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("text")}>
          <MessageSquare className="h-4 w-4" />
          <span>Text Chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "image" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("image")}>
          <Pencil className="h-4 w-4" />
          <span>Create image</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "image-edit" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("image-edit")}>
          <Palette className="h-4 w-4" />
          <span>Edit image</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "deep-search" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("deep-search")}>
          <Search className="h-4 w-4" />
          <span>Deep research</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "web-search" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("web-search")}>
          <Globe className="h-4 w-4" />
          <span>Web search</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer ${selectedMode === "canvas" ? "bg-accent/50" : ""}`} onClick={() => onChange?.("canvas")}>
          <Palette className="h-4 w-4" />
          <span>Canvas</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer opacity-50 ${selectedMode === "video" ? "bg-accent/50" : ""}`} onClick={() => {}} disabled>
          <Video className="h-4 w-4" />
          <span>Create video</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`flex items-center gap-3 p-2 cursor-pointer opacity-50 ${selectedMode === "audio" ? "bg-accent/50" : ""}`} onClick={() => {}} disabled>
          <Volume2 className="h-4 w-4" />
          <span>Create audio</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


