"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  className,
  disabled,
  required,
  id,
  name,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Initialize input value from prop value
  React.useEffect(() => {
    if (value) {
      setInputValue(value);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Handle input change (manual typing)
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate date format (YYYY-MM-DD)
    if (newValue === "" || /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
      if (onChange) {
        const syntheticEvent = {
          target: {
            name: name || "",
            value: newValue,
          },
        };
        onChange(syntheticEvent);
      }
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    setInputValue(formattedDate);

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || "",
          value: formattedDate,
        },
      };
      onChange(syntheticEvent);
    }

    setOpen(false);
  };

  // Parse date from input value
  const selectedDate = inputValue
    ? (() => {
        try {
          const date = new Date(inputValue + "T00:00:00");
          return isNaN(date.getTime()) ? null : date;
        } catch {
          return null;
        }
      })()
    : null;

  // Get today's date for min date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = min ? new Date(min + "T00:00:00") : today;
  const maxDate = max ? new Date(max + "T00:00:00") : null;

  // Generate calendar days
  const getCalendarDays = () => {
    const year = selectedDate?.getFullYear() || today.getFullYear();
    const month = selectedDate?.getMonth() || today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentMonth = selectedDate?.getMonth() || today.getMonth();
  const currentYear = selectedDate?.getFullYear() || today.getFullYear();

  const navigateMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    const formattedDate = format(newDate, "yyyy-MM-dd");
    setInputValue(formattedDate);
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || "",
          value: formattedDate,
        },
      };
      onChange(syntheticEvent);
    }
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "relative w-full pl-10 pr-8 py-2 text-left cursor-pointer",
            "flex items-center h-10 w-full rounded-md border border-muted-foreground bg-transparent text-xs shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            !inputValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          aria-required={required}
          {...props}
        >
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <span className="block truncate text-sm">
            {inputValue ? (
              format(new Date(inputValue + "T00:00:00"), "PPP")
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputValue("");
                if (onChange) {
                  const syntheticEvent = {
                    target: {
                      name: name || "",
                      value: "",
                    },
                  };
                  onChange(syntheticEvent);
                }
                setOpen(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-sm opacity-70 hover:opacity-100 hover:bg-accent flex items-center justify-center transition-colors"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[9999]"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-3">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(-1)}
            >
              <span className="sr-only">Previous month</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <div className="font-semibold text-sm">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(1)}
            >
              <span className="sr-only">Next month</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground w-8 h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="w-8 h-8" />;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const todayClass = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    "w-8 h-8 text-sm rounded-md transition-colors",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && "hover:bg-accent hover:text-accent-foreground",
                    selected &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    !selected &&
                      !disabled &&
                      todayClass &&
                      "bg-accent/50 font-semibold",
                    !selected && !disabled && !todayClass && "text-foreground"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const todayStr = format(today, "yyyy-MM-dd");
                setInputValue(todayStr);
                if (onChange) {
                  const syntheticEvent = {
                    target: {
                      name: name || "",
                      value: todayStr,
                    },
                  };
                  onChange(syntheticEvent);
                }
                setOpen(false);
              }}
            >
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
