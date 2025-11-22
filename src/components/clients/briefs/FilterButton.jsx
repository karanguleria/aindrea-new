import React from "react";

export default function FilterButton({ label }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-transparent text-foreground border border-border rounded-lg  transition-colors">
      <span>{label}</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}
