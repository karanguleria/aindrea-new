import {
  Send,
  Plus,
  Wrench,
  Pencil,
  Video,
  Volume2,
  Upload,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  Search,
  Globe,
} from "lucide-react";
import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useThemeUtils } from "@/hooks/use-theme-utils";
import { Input } from "@/components/ui/input";

export default function ChatSection() {
  const { isDark } = useThemeUtils();
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      // Handle sending message
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="w-full border-r border-border p-6 overflow-y-auto flex flex-col h-full min-h-[80dvh] lg:min-h-[94dvh]">
      {/* Chat Messages Area - Takes up available space */}
      <div className="flex-1 mb-6 space-y-4 overflow-y-auto">
        {/* Example Message */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border-border border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
            <Image
              className="flex items-center justify-center"
              src={isDark ? "/images/logo.png" : "/images/logo.svg"}
              alt="logo"
              width={30}
              height={30}
            />
          </div>
          <div className="flex-1">
            <div className="border-border border bg-transparent rounded-2xl p-3 ">
              <p className="text-foreground text-sm leading-relaxed mb-3">
                Here are 4 Instagram image options based on your brief—take a
                look! You can edit prompts, license any you like, or license
                them all.
              </p>
              <div className="flex items-center justify-between border-t border-border pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white/10"
                  >
                    <ThumbsUp className="h-4 w-4 text-foreground/70" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white/10"
                  >
                    <ThumbsDown className="h-4 w-4 text-foreground/70" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 text-foreground/70" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full hover:bg-white/10"
                >
                  <ChevronDown className="h-4 w-4 text-foreground/70" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input Form - Stays at bottom */}
      <div className="mt-auto">
        <form className="relative">
          <div className="bg-transparent border border-muted-foreground rounded-4xl p-4">
            {/* Input Area */}
            <div className="mb-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Anything"
                className="h-10 border-none text-foreground placeholder:text-muted-foreground leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg"
              />
            </div>

            {/* Separator */}
            <div className="border-t border-border mb-3" />

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      className="size-10 rounded-full bg-accent text-foreground hover:bg-accent/80 transition-colors"
                      variant="ghost"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52 bg-card rounded-2xl border-border text-foreground py-2 px-3">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Image className="h-4 w-4" />
                      <span>Upload Images</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Upload Assets</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Video className="h-4 w-4" />
                      <span>Upload Video</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      className="size-10 rounded-full bg-accent text-foreground hover:bg-accent/80 transition-colors"
                      variant="ghost"
                    >
                      <Wrench className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52 bg-card rounded-2xl border-border text-foreground py-2 px-3">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Pencil className="h-4 w-4" />
                      <span>Create image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Video className="h-4 w-4" />
                      <span>Create Video</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Volume2 className="h-4 w-4" />
                      <span>Create Audio</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Search className="h-4 w-4" />
                      <span>Deep research</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Globe className="h-4 w-4" />
                      <span>Web search</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                      <Search className="h-4 w-4" />
                      <span>Canvas</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                className="size-11 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
