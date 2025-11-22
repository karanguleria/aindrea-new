"use client";

import React from "react";
import { User, Settings, Lock } from "lucide-react";

export default function ProfileModalSidebar({ activeTab, setActiveTab }) {
  const sidebarItems = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "profile", label: "Profile Details", icon: Settings },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="w-64 border-r border-border bg-transparent px-2 py-4 flex-shrink-0">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
