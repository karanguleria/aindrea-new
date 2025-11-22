import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-border bg-transparent p-1 shadow-sm">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => changeTheme(themeOption.value)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              theme === themeOption.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            }`}
            title={themeOption.label}
          >
            <span className="text-base">{themeOption.icon}</span>
            <span className="hidden sm:inline font-medium">
              {themeOption.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
