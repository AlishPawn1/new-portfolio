"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adToBs,
  bsToAd,
  bsDaysInMonth,
  bsWeekdayOffset,
  bsMonthName,
} from "@/lib/nepali";

export interface DateRange {
  from: string; // 'YYYY-MM-DD'
  to: string; // 'YYYY-MM-DD'
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  placeholder?: string;
  className?: string;
  min?: string; // 'YYYY-MM-DD'
  id?: string;
}

function toLocalDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  return addDays(d, -day);
}

function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatBsDateValue(date: Date): string {
  const iso = toValue(date);
  const bs = adToBs(iso);
  if (!bs) return formatDisplay(date);
  return `${bs.year} ${bsMonthName(bs.month)} ${bs.date}`;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Preset {
  label: string;
  range: () => DateRange;
}

function buildPresets(today: Date): Preset[] {
  const t = stripTime(today);
  const yesterday = addDays(t, -1);
  const lastWeekAnchor = addDays(t, -7);
  const lastMonthAnchor = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const lastYearAnchor = new Date(t.getFullYear() - 1, 0, 1);

  return [
    { label: "Today", range: () => ({ from: toValue(t), to: toValue(t) }) },
    {
      label: "Yesterday",
      range: () => ({ from: toValue(yesterday), to: toValue(yesterday) }),
    },
    {
      label: "This week",
      range: () => ({
        from: toValue(startOfWeek(t)),
        to: toValue(endOfWeek(t)),
      }),
    },
    {
      label: "Last week",
      range: () => ({
        from: toValue(startOfWeek(lastWeekAnchor)),
        to: toValue(endOfWeek(lastWeekAnchor)),
      }),
    },
    {
      label: "Past two weeks",
      range: () => ({
        from: toValue(addDays(startOfWeek(t), -7)),
        to: toValue(endOfWeek(t)),
      }),
    },
    {
      label: "This month",
      range: () => ({
        from: toValue(startOfMonth(t)),
        to: toValue(endOfMonth(t)),
      }),
    },
    {
      label: "Last month",
      range: () => ({
        from: toValue(startOfMonth(lastMonthAnchor)),
        to: toValue(endOfMonth(lastMonthAnchor)),
      }),
    },
    {
      label: "This year",
      range: () => ({
        from: toValue(startOfYear(t)),
        to: toValue(endOfYear(t)),
      }),
    },
    {
      label: "Last year",
      range: () => ({
        from: toValue(startOfYear(lastYearAnchor)),
        to: toValue(endOfYear(lastYearAnchor)),
      }),
    },
  ];
}

function MonthGrid({
  bsYear,
  bsMonth,
  from,
  to,
  hoverDate,
  minDate,
  onSelect,
  onHover,
  className,
}: {
  bsYear: number;
  bsMonth: number;
  from: Date | null;
  to: Date | null;
  hoverDate: Date | null;
  minDate: Date | null;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
  className?: string;
}) {
  const daysInMonth = bsDaysInMonth(bsYear, bsMonth);
  const startOffset = bsWeekdayOffset(bsYear, bsMonth);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = new Date();

  const effectiveEnd = to ?? hoverDate;

  const monthLabel = `${bsMonthName(bsMonth)} ${bsYear}`;

  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="mb-2 text-center text-sm font-medium text-zinc-900">
        {monthLabel}
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
          const adIso = bsToAd({ year: bsYear, month: bsMonth, date: day });
          if (!adIso) return <div key={`empty-${i}`} />;
          const date = toLocalDate(adIso)!;
          const isDisabled = minDate
            ? stripTime(date) < stripTime(minDate)
            : false;
          const isToday = isSameDay(date, today);
          const isStart = isSameDay(date, from);
          const isEnd = isSameDay(date, to);
          const isBoundary = isStart || isEnd;

          let inRange = false;
          if (from && effectiveEnd) {
            const lo = from < effectiveEnd ? from : effectiveEnd;
            const hi = from < effectiveEnd ? effectiveEnd : from;
            inRange = date >= stripTime(lo) && date <= stripTime(hi);
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onMouseEnter={() => onHover(date)}
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-colors",
                isDisabled && "cursor-not-allowed text-zinc-300",
                !isDisabled &&
                  !isBoundary &&
                  (inRange
                    ? "bg-zinc-100 text-zinc-900"
                    : isToday
                      ? "bg-zinc-100 font-medium text-zinc-900"
                      : "text-zinc-900 hover:bg-zinc-100"),
                isBoundary &&
                  !isDisabled &&
                  "bg-emerald-600 font-semibold text-white hover:bg-emerald-600",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  min,
  id,
}: DateRangePickerProps) {
  const minDate = toLocalDate(min || "");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const bs = adToBs(value.from || new Date().toISOString().slice(0, 10));
    return { year: bs?.year ?? 2080, month: bs?.month ?? 1 };
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [draft, setDraft] = useState<DateRange>(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(720, window.innerWidth - 16);
    let left = Math.min(rect.left, window.innerWidth - width - 8);
    left = Math.max(8, left);

    let top = rect.bottom + 6;
    if (dropdownRef.current) {
      const height = dropdownRef.current.offsetHeight;
      if (top + height > window.innerHeight - 8) {
        top = Math.max(8, rect.top - height - 6);
      }
    }

    setDropdownPos({ top, left });
  }, []);

  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) setDraft(value);
    prevOpen.current = open;
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    const t = window.setTimeout(updatePosition, 0);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
      window.clearTimeout(t);
    };
  }, [open, updatePosition]);

  const from = toLocalDate(draft.from);
  const to = toLocalDate(draft.to);
  const displayFrom = toLocalDate(value.from);
  const displayTo = toLocalDate(value.to);

  const leftView = view;
  const rightView = {
    year: view.month === 12 ? view.year + 1 : view.year,
    month: view.month === 12 ? 1 : view.month + 1,
  };

  const shiftView = useCallback((dir: -1 | 1) => {
    setView((v) => {
      if (dir === -1) {
        return v.month === 1
          ? { year: v.year - 1, month: 12 }
          : { year: v.year, month: v.month - 1 };
      }
      return v.month === 12
        ? { year: v.year + 1, month: 1 }
        : { year: v.year, month: v.month + 1 };
    });
  }, []);

  const presets = useMemo(() => buildPresets(new Date()), []);

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

  function handleSelect(date: Date) {
    if (!from || (from && to)) {
      setDraft({ from: toValue(date), to: "" });
      return;
    }
    let newFrom = from;
    let newTo = date;
    if (date < from) {
      newFrom = date;
      newTo = from;
    }
    const finalRange = { from: toValue(newFrom), to: toValue(newTo) };
    setDraft(finalRange);
    onChange(finalRange);
    setOpen(false);
  }

  function handlePreset(preset: Preset) {
    const range = preset.range();
    setDraft(range);
    onChange(range);
    setOpen(false);
  }

  const displayLabel =
    displayFrom && displayTo
      ? `${formatBsDateValue(displayFrom)} - ${formatBsDateValue(displayTo)}`
      : placeholder;

  function shiftRange(days: number) {
    if (!displayFrom || !displayTo) return;
    const range = {
      from: toValue(addDays(displayFrom, days)),
      to: toValue(addDays(displayTo, days)),
    };
    onChange(range);
  }

  return (
    <div
      className={cn(
        "relative inline-flex w-full items-center gap-2 sm:w-auto",
        className,
      )}
      ref={wrapperRef}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const bs = adToBs(
            value.from || new Date().toISOString().slice(0, 10),
          );
          if (bs) setView({ year: bs.year, month: bs.month });
          setOpen((o) => {
            if (!o) updatePosition();
            return !o;
          });
        }}
        className={cn(
          "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 sm:min-w-56 sm:flex-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2",
          "transition-colors hover:border-zinc-400",
        )}
      >
        <Calendar className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className={cn("truncate", !displayFrom && "text-zinc-500")}>
          {displayLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={() => shiftRange(-1)}
        className="flex h-10 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-100"
        aria-label="Shift range back"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => shiftRange(1)}
        className="flex h-10 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-100"
        aria-label="Shift range forward"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {open && dropdownPos && (
        <div
          ref={dropdownRef}
          className="fixed z-50 flex w-[min(720px,calc(100vw-16px))] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="hidden w-40 shrink-0 border-r border-zinc-200 py-2 sm:block">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p)}
                className="w-full px-4 py-1.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-3">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => shiftView(-1)}
                className="shrink-0 rounded-sm p-1 text-zinc-600 hover:bg-zinc-100"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <MonthGrid
                bsYear={leftView.year}
                bsMonth={leftView.month}
                from={from}
                to={to}
                hoverDate={hoverDate}
                minDate={minDate}
                onSelect={handleSelect}
                onHover={setHoverDate}
              />
              <MonthGrid
                bsYear={rightView.year}
                bsMonth={rightView.month}
                from={from}
                to={to}
                hoverDate={hoverDate}
                minDate={minDate}
                onSelect={handleSelect}
                onHover={setHoverDate}
                className="hidden md:block"
              />

              <button
                type="button"
                onClick={() => shiftView(1)}
                className="shrink-0 rounded-sm p-1 text-zinc-600 hover:bg-zinc-100"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {from && (
              <button
                type="button"
                onClick={() => {
                  onChange({ from: "", to: "" });
                  setDraft({ from: "", to: "" });
                  setOpen(false);
                }}
                className="mt-3 w-full border-t border-zinc-200 py-1.5 text-center text-xs text-zinc-500 hover:text-zinc-900"
              >
                Clear range
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
