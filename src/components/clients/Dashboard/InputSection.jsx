import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Music, Volume2, Plus } from "lucide-react";

export function InputSection() {
  return (
    <div className="w-full">
      <div className="relative">
        <div className=" backdrop-blur-sm border border-white/20 rounded-[28px] p-5">
          <div className="px-2">
            <Input
              placeholder="e.g. 'Produce a 30-sec brand teaser video'"
              className="h-12 w-full border-none text-white/90 placeholder:text-white/60  leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="border-t border-white/20 my-3" />

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                className="size-10 rounded-full bg-white/15 text-white/80 hover:bg-white/25 hover:text-white shadow-sm"
                variant="ghost"
              >
                <Music className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="size-10 rounded-full bg-white/15 text-white/80 hover:bg-white/25 hover:text-white shadow-sm"
                variant="ghost"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="size-10 rounded-full bg-white/15 text-white/80 hover:bg-white/25 hover:text-white shadow-sm"
                variant="ghost"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <Button
              type="submit"
              size="icon"
              className="size-11 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
