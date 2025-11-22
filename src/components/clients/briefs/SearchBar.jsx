import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

export default function SearchBar() {
  return (
    <div className="relative ">
      <Input
        type="text"
        placeholder="Search"
        className="pl-10 pr-4 h-12 bg-transparent border border-border rounded-lg text-foreground  transition-colors w-72"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
    </div>
  );
}
