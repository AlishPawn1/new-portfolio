"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PipetteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorPickerProps {
  children: React.ReactNode;
  defaultValue?: string;
  defaultFormat?: "hex" | "rgb" | "hsl";
  modal?: boolean;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const ColorPickerContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
}>({ value: "#000000", setValue: () => {} });

function useColorPicker() {
  return React.useContext(ColorPickerContext);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function ColorPicker({
  children,
  defaultValue = "#000000",
  modal = false,
  onValueChange,
  onOpenChange,
}: ColorPickerProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <ColorPickerContext.Provider value={{ value, setValue: handleValueChange }}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <ColorPickerContent />
        </PopoverContent>
      </Popover>
    </ColorPickerContext.Provider>
  );
}

export function ColorPickerTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { value } = useColorPicker();
  return (
    <div className="relative inline-flex">
      {children}
      <div
        className="absolute bottom-0 left-1/2 h-1 w-4 -translate-x-1/2 rounded-sm"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}

export function ColorPickerContent({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {children ?? (
        <>
          <ColorPickerArea />
          <div className="flex items-center gap-2">
            <ColorPickerEyeDropper />
            <div className="flex flex-1 flex-col gap-2">
              <ColorPickerHueSlider />
              <ColorPickerAlphaSlider />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerFormatSelect />
            <ColorPickerInput />
          </div>
        </>
      )}
    </div>
  );
}

export function ColorPickerArea() {
  const { value, setValue } = useColorPicker();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const drawColorArea = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw hue gradient (horizontal)
    const hueGrad = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 360; i += 60) {
      hueGrad.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    ctx.fillStyle = hueGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw saturation gradient (vertical)
    const satGrad = ctx.createLinearGradient(0, 0, 0, height);
    satGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    satGrad.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    satGrad.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = satGrad;
    ctx.fillRect(0, 0, width, height);
  }, []);

  useEffect(() => {
    drawColorArea();
  }, [drawColorArea]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const saturation = x / rect.width;
    const lightness = 1 - y / rect.height;
    const hue = 0; // Simplified - full hue range
    const hex = hslToHex(hue, saturation * 100, lightness * 50);
    setValue(hex);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      handlePointerMove(e);
    };
    const handleGlobalPointerUp = () => setIsDragging(false);

    document.addEventListener("pointermove", handleGlobalPointerMove);
    document.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [isDragging]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={200}
        height={150}
        className="w-full cursor-crosshair rounded-md border"
        onPointerDown={handlePointerDown}
      />
    </div>
  );
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function ColorPickerHueSlider() {
  const { value, setValue } = useColorPicker();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleSliderMove(e);
  };

  const handleSliderMove = (e: React.PointerEvent | PointerEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const hue = (x / rect.width) * 360;
    const rgb = hexToRgb(value);
    // Convert RGB to HSL, update hue, convert back
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex = hslToHex(hue, hsl.s, hsl.l);
    setValue(hex);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalPointerMove = (e: PointerEvent) => handleSliderMove(e);
    const handleGlobalPointerUp = () => setIsDragging(false);
    document.addEventListener("pointermove", handleGlobalPointerMove);
    document.addEventListener("pointerup", handleGlobalPointerUp);
    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={sliderRef}
      className="relative h-4 cursor-pointer rounded-full"
      style={{
        background:
          "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" />
    </div>
  );
}

export function ColorPickerAlphaSlider() {
  return (
    <div className="h-4 rounded-full bg-muted" title="Alpha (not implemented)" />
  );
}

export function ColorPickerEyeDropper() {
  const { setValue } = useColorPicker();

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setValue(result.sRGBHex);
    } catch {
      // EyeDropper not supported
    }
  };

  return (
    <Button variant="outline" size="icon-sm" onClick={handleEyeDropper}>
      <PipetteIcon className="h-4 w-4" />
    </Button>
  );
}

export function ColorPickerFormatSelect() {
  return (
    <Select defaultValue="hex">
      <SelectTrigger className="w-16">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hex">HEX</SelectItem>
        <SelectItem value="rgb">RGB</SelectItem>
        <SelectItem value="hsl">HSL</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ColorPickerInput() {
  const { value, setValue } = useColorPicker();

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-8 w-20 font-mono text-xs"
    />
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}
