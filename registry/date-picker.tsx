"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: string; // 'YYYY-MM-DD'
  id?: string;
}

function toLocalDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function toValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  min,
  id,
}: DatePickerProps) {
  const minDate = toLocalDate(min || "");
  const [open, setOpen] = useState(false);
  const selected = toLocalDate(value);
  const [monthNav, setMonthNav] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, []);

  const viewDate = useMemo(() => {
    const base = toLocalDate(value) || new Date();
    return new Date(base.getFullYear(), base.getMonth() + monthNav, 1);
  }, [value, monthNav]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(updatePosition, 0);
    return () => window.clearTimeout(t);
  }, [open, updatePosition]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const displayLabel = selected
    ? selected.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : placeholder;

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <button
        type="button"
        id={id}
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => {
            if (!o) updatePosition();
            return !o;
          });
        }}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2",
          "transition-colors hover:border-zinc-400",
        )}
      >
        <Calendar className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className={cn("truncate", !selected && "text-zinc-500")}>
          {displayLabel}
        </span>
      </button>

      {open && dropdownPos && (
        <div
          className="fixed z-50 w-72 rounded-md border border-zinc-200 bg-white p-3 shadow-lg"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthNav((m) => m - 1)}
              className="rounded-sm p-1 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-zinc-900">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => setMonthNav((m) => m + 1)}
              className="rounded-sm p-1 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-medium text-zinc-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const cellDate = new Date(year, month, day);
              const isSelected = selected && isSameDay(cellDate, selected);
              const isToday = isSameDay(cellDate, today);
              const isDisabled = minDate
                ? stripTime(cellDate) < stripTime(minDate)
                : false;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(toValue(cellDate));
                    setMonthNav(0);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm text-sm text-zinc-900 transition-colors",
                    isDisabled && "cursor-not-allowed text-zinc-300",
                    !isDisabled &&
                      (isSelected
                        ? "bg-zinc-900 font-semibold text-white"
                        : isToday
                          ? "bg-zinc-100 font-medium text-zinc-900"
                          : "hover:bg-zinc-100"),
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full border-t border-zinc-200 py-1.5 text-center text-xs text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
