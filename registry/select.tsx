"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  label: string;
  setLabel: (v: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  dropdownPos: { top: number; left: number; width: number } | null;
  updatePosition: () => void;
}

const SelectCtx = React.createContext<SelectContextValue | null>(null);

function useSelect() {
  const ctx = React.useContext(SelectCtx);
  if (!ctx)
    throw new Error("Select compound components must be used within <Select>");
  return ctx;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Select({ value, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <SelectCtx.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange,
        label,
        setLabel,
        triggerRef,
        dropdownPos,
        updatePosition,
      }}
    >
      <div ref={ref} className={cn("relative", className)}>
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

interface SelectTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { open, setOpen, triggerRef, updatePosition } = useSelect();

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => {
        if (!open) updatePosition();
        setOpen(!open);
      }}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2",
        "transition-colors hover:border-zinc-400 text-left",
        className,
      )}
    >
      {children}
      <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-zinc-500" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value, label } = useSelect();

  if (value && label) {
    return <span className={cn("truncate", className)}>{label}</span>;
  }

  return (
    <span className={cn("truncate text-zinc-500", className)}>
      {placeholder || "Select..."}
    </span>
  );
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

function SelectContent({ className, children }: SelectContentProps) {
  const { open, dropdownPos } = useSelect();

  return (
    <div
      className={cn(
        "fixed z-50 max-h-60 overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg",
        !open && "hidden",
        className,
      )}
      style={
        dropdownPos
          ? {
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const { onValueChange, setOpen, setLabel, value: currentValue } = useSelect();
  const isSelected = currentValue === value;
  const itemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && itemRef.current) {
      setLabel(itemRef.current.textContent || "");
    }
  }, [isSelected, setLabel]);

  return (
    <div
      ref={itemRef}
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        setLabel(itemRef.current?.textContent || "");
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm transition-colors",
        isSelected
          ? "bg-zinc-100 font-medium text-zinc-900"
          : "text-zinc-900 hover:bg-zinc-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
