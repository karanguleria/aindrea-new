import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Plus,
  Wrench,
  Pencil,
  Video,
  Volume2,
  Search,
  Globe,
  Palette,
  Image,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ImageGenerationChat({
  message = "",
  setMessage,
  onGenerateImage,
}) {
  const [localMessage, setLocalMessage] = useState(message);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setLocalMessage(value);
    if (setMessage) {
      setMessage(value);
    }
  };

  const handleImageGeneration = () => {
    if (onGenerateImage && localMessage.trim()) {
      onGenerateImage(localMessage.trim());
      setLocalMessage("");
    }
  };

  return (
    <div className="bg-transparent border border-muted-foreground rounded-4xl p-4">
      {/* Input Area */}
      <div className="mb-3">
        <Input
          value={localMessage}
          onChange={handleMessageChange}
          placeholder="Describe the image you want to generate..."
          className="h-10 border-none leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg bg-card text-foreground"
        />
      </div>

      {/* Separator */}
      <div className="border-t border-muted-foreground mb-3" />

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="size-10 rounded-full text-foreground hover:bg-accent transition-colors"
                variant="ghost"
              >
                <Plus className="h-6 w-6 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 bg-card rounded-2xl border-muted-foreground text-foreground py-2 px-3">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Image className="h-4 w-4" />
                <span>Upload Reference Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Upload Style Reference</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Video className="h-4 w-4" />
                <span>Video to Image</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="size-10 rounded-full text-foreground hover:bg-accent transition-colors"
                variant="ghost"
              >
                <Wrench className="h-6 w-6 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 bg-card rounded-2xl border-muted-foreground text-foreground py-2 px-3">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                <span>Artistic Style</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Image className="h-4 w-4" />
                <span>Photo Realistic</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Palette className="h-4 w-4" />
                <span>Color Palette</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Search className="h-4 w-4" />
                <span>Style Reference</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Globe className="h-4 w-4" />
                <span>Location Based</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Generate Button */}
        <Button
          type="submit"
          size="icon"
          className="size-11 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
          disabled={!localMessage.trim()}
          onClick={handleImageGeneration}
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
