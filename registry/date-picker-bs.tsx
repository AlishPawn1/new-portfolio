"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  adToBs,
  bsToAd,
  bsDaysInMonth,
  bsWeekdayOffset,
  bsMonthName,
  formatBsDate,
} from "@/lib/nepali";

interface DatePickerProps {
  value: string; // AD 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  id,
  name,
  required,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const selected = adToBs(value);

  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const bs = adToBs(value) ?? adToBs(new Date().toISOString().slice(0, 10));
    return { year: bs?.year ?? 2080, month: bs?.month ?? 1 };
  });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, []);

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

  const todayBs = useMemo(
    () => adToBs(new Date().toISOString().slice(0, 10)),
    [],
  );

  const daysInMonth = bsDaysInMonth(view.year, view.month);
  const startOffset = bsWeekdayOffset(view.year, view.month);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const yearRange = useMemo(() => {
    const base = todayBs?.year ?? 2080;
    const start = Math.max(1975, base - 15);
    const end = base + 5;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [todayBs]);

  const displayLabel = selected ? formatBsDate(value) : placeholder;

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <input type="hidden" name={name} value={value} required={required} />
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
          <div className="mb-2 flex items-center gap-2">
            <Select
              value={String(view.year)}
              onValueChange={(v) =>
                setView((prev) => ({ ...prev, year: Number(v) }))
              }
              className="flex-1"
            >
              <SelectTrigger className="h-9 px-2 py-1 text-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearRange.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y} BS
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(view.month)}
              onValueChange={(v) =>
                setView((prev) => ({ ...prev, month: Number(v) }))
              }
              className="flex-1"
            >
              <SelectTrigger className="h-9 px-2 py-1 text-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {bsMonthName(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              const adIso = bsToAd({
                year: view.year,
                month: view.month,
                date: day,
              });
              const isSelected =
                selected &&
                selected.year === view.year &&
                selected.month === view.month &&
                selected.date === day;
              const isToday =
                todayBs &&
                todayBs.year === view.year &&
                todayBs.month === view.month &&
                todayBs.date === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (adIso) onChange(adIso);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm text-sm text-zinc-900 transition-colors",
                    isSelected
                      ? "bg-emerald-600 font-semibold text-white"
                      : isToday
                        ? "bg-zinc-100 font-medium text-zinc-900"
                        : "hover:bg-zinc-100",
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
              className="mt-2 w-full border-t border-zinc-200 py-1.5 text-center text-xs text-zinc-500 hover:text-zinc-900"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
