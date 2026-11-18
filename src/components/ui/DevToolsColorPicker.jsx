import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, Copy, Check, ArrowRightLeft, Sparkles, RefreshCw } from 'lucide-react';

// ==========================================
// COLOR MATH & CONVERSION UTILITIES
// ==========================================

export function rgbToHsv(r, g, b) {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));

  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function toHex(n) {
  const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export function rgbToHex(r, g, b, a = 1) {
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== undefined && a < 0.999) {
    return `${hex}${toHex(Math.round(a * 255))}`;
  }
  return hex;
}

export function parseColor(input) {
  const presets = {
    rose: { r: 244, g: 63, b: 94, a: 1 },
    amber: { r: 245, g: 158, b: 11, a: 1 },
    emerald: { r: 16, g: 185, b: 129, a: 1 },
    blue: { r: 59, g: 130, b: 246, a: 1 },
    purple: { r: 168, g: 85, b: 247, a: 1 },
    coral: { r: 251, g: 113, b: 133, a: 1 },
    red: { r: 239, g: 68, b: 68, a: 1 },
    gold: { r: 234, g: 179, b: 8, a: 1 },
    teal: { r: 20, g: 184, b: 166, a: 1 },
    cyan: { r: 6, g: 182, b: 212, a: 1 },
    pink: { r: 236, g: 72, b: 153, a: 1 },
    darkgreen: { r: 15, g: 46, b: 35, a: 0.85 }
  };

  if (!input) return { r: 244, g: 63, b: 94, a: 1 };
  const str = String(input).trim().toLowerCase();

  if (presets[str]) return presets[str];

  // Hex
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16) || 0,
        g: parseInt(hex.slice(2, 4), 16) || 0,
        b: parseInt(hex.slice(4, 6), 16) || 0,
        a: 1
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16) || 0,
        g: parseInt(hex.slice(2, 4), 16) || 0,
        b: parseInt(hex.slice(4, 6), 16) || 0,
        a: Math.round(((parseInt(hex.slice(6, 8), 16) || 255) / 255) * 100) / 100
      };
    }
  }

  // RGB / RGBA
  if (str.startsWith('rgb')) {
    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return {
        r: Math.min(255, parseInt(parts[0], 10) || 0),
        g: Math.min(255, parseInt(parts[1], 10) || 0),
        b: Math.min(255, parseInt(parts[2], 10) || 0),
        a: parts.length >= 4 ? Math.min(1, Math.max(0, parseFloat(parts[3]) || 1)) : 1
      };
    }
  }

  // Fallback
  return { r: 244, g: 63, b: 94, a: 1 };
}

// Preset Swatches for Quick Access
export const DEVTOOLS_PALETTE_PRESETS = [
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'darkemerald', name: 'Dark Emerald', color: 'rgba(15, 46, 35, 0.85)' },
  { id: 'blue', name: 'Sky Blue', color: '#3b82f6' },
  { id: 'purple', name: 'Purple', color: '#a855f7' },
  { id: 'coral', name: 'Coral Pink', color: '#fb7185' },
  { id: 'cyan', name: 'Cyan Glow', color: '#06b6d4' },
  { id: 'gold', name: 'Gold Flare', color: '#eab308' },
  { id: 'obsidian', name: 'Obsidian', color: '#181e1b' }
];

export function DevToolsColorPicker({
  value,
  onChange,
  onFormatChange,
  presets = DEVTOOLS_PALETTE_PRESETS,
  className = ''
}) {
  // Format state: 'hex' | 'rgba' | 'hsla'
  const [format, setFormat] = useState('rgba');
  const [copied, setCopied] = useState(false);

  // HSV representation
  const [hue, setHue] = useState(158); // 0..360
  const [sat, setSat] = useState(0.67); // 0..1
  const [val, setVal] = useState(0.18); // 0..1
  const [alpha, setAlpha] = useState(0.85); // 0..1

  // Direct manual code input
  const [codeInputValue, setCodeInputValue] = useState('');
  const [isEditingInput, setIsEditingInput] = useState(false);

  // Dragging active states
  const isDraggingSV = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  // Element Refs
  const svAreaRef = useRef(null);
  const hueBarRef = useRef(null);
  const alphaBarRef = useRef(null);

  // Sync internal state from value prop (only if user is not actively typing in input)
  useEffect(() => {
    if (isEditingInput) return;
    const parsed = parseColor(value);
    const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setAlpha(parsed.a !== undefined ? parsed.a : 1);

    // Initial string sync
    if (String(value).trim().startsWith('#')) {
      setFormat('hex');
    } else if (String(value).trim().startsWith('rgb')) {
      setFormat('rgba');
    }
  }, [value, isEditingInput]);

  // Current RGB and string values
  const currentRgb = hsvToRgb(hue, sat, val);
  const currentHsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);

  const formatOutput = useCallback((h, s, v, a, fmt) => {
    const rgb = hsvToRgb(h, s, v);
    if (fmt === 'hex') {
      return rgbToHex(rgb.r, rgb.g, rgb.b, a);
    }
    if (fmt === 'hsla') {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const alphaFormatted = Math.round(a * 100) / 100;
      return alphaFormatted < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaFormatted})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    // Default rgba
    const alphaFormatted = Math.round(a * 100) / 100;
    return alphaFormatted < 1
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaFormatted})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }, []);

  const activeColorString = formatOutput(hue, sat, val, alpha, format);

  // Keep codeInputValue synchronized when not typing
  useEffect(() => {
    if (!isEditingInput) {
      setCodeInputValue(activeColorString);
    }
  }, [activeColorString, isEditingInput]);

  // Notify parent on change
  const triggerChange = useCallback((h, s, v, a, fmt = format) => {
    const str = formatOutput(h, s, v, a, fmt);
    if (onChange) {
      onChange(str);
    }
  }, [format, formatOutput, onChange]);

  // Toggle format cycling
  const cycleFormat = () => {
    const formats = ['hex', 'rgba', 'hsla'];
    const nextIdx = (formats.indexOf(format) + 1) % formats.length;
    const nextFmt = formats[nextIdx];
    setFormat(nextFmt);
    if (onFormatChange) onFormatChange(nextFmt);
    triggerChange(hue, sat, val, alpha, nextFmt);
  };

  // SV Area Handlers
  const handleSVEvent = useCallback((e) => {
    if (!svAreaRef.current) return;
    const rect = svAreaRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const newSat = x / rect.width;
    const newVal = 1 - (y / rect.height);

    setSat(newSat);
    setVal(newVal);
    triggerChange(hue, newSat, newVal, alpha);
  }, [alpha, hue, triggerChange]);

  const onSVStart = (e) => {
    e.preventDefault();
    isDraggingSV.current = true;
    handleSVEvent(e);
  };

  // Hue Slider Handlers
  const handleHueEvent = useCallback((e) => {
    if (!hueBarRef.current) return;
    const rect = hueBarRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientX !== undefined && e.touches[0].clientY !== undefined ? e.touches[0].clientY : e.clientY : e.clientY;

    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const newHue = (y / rect.height) * 360;

    setHue(newHue);
    triggerChange(newHue, sat, val, alpha);
  }, [alpha, sat, triggerChange, val]);

  const onHueStart = (e) => {
    e.preventDefault();
    isDraggingHue.current = true;
    handleHueEvent(e);
  };

  // Alpha Slider Handlers
  const handleAlphaEvent = useCallback((e) => {
    if (!alphaBarRef.current) return;
    const rect = alphaBarRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    // Top is 1.0, Bottom is 0.0
    const newAlpha = Math.round((1 - (y / rect.height)) * 100) / 100;

    setAlpha(newAlpha);
    triggerChange(hue, sat, val, newAlpha);
  }, [hue, sat, triggerChange, val]);

  const onAlphaStart = (e) => {
    e.preventDefault();
    isDraggingAlpha.current = true;
    handleAlphaEvent(e);
  };

  // Global Mouse / Touch Move and Up Listeners
  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (isDraggingSV.current) handleSVEvent(e);
      if (isDraggingHue.current) handleHueEvent(e);
      if (isDraggingAlpha.current) handleAlphaEvent(e);
    };

    const handleGlobalUp = () => {
      isDraggingSV.current = false;
      isDraggingHue.current = false;
      isDraggingAlpha.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [handleSVEvent, handleHueEvent, handleAlphaEvent]);

  // Handle Manual Code Input Change
  const handleCodeInputChange = (e) => {
    const raw = e.target.value;
    setCodeInputValue(raw);
    setIsEditingInput(true);

    const trimmed = raw.trim();
    if (!trimmed) return;

    // Check if valid hex, rgb, rgba, or preset
    const parsed = parseColor(trimmed);
    if (parsed) {
      const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
      if (parsed.a !== undefined) setAlpha(parsed.a);

      if (trimmed.startsWith('#')) setFormat('hex');
      else if (trimmed.startsWith('rgb')) setFormat('rgba');
      else if (trimmed.startsWith('hsl')) setFormat('hsla');

      if (onChange) onChange(trimmed);
    }
  };

  const handleCodeInputBlur = () => {
    setIsEditingInput(false);
    setCodeInputValue(activeColorString);
  };

  // Copy to clipboard
  const copyColor = () => {
    navigator.clipboard.writeText(activeColorString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // EyeDropper API (Chrome/Edge Native)
  const pickScreenColor = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const parsed = parseColor(result.sRGBHex);
          const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
          setHue(hsv.h);
          setSat(hsv.s);
          setVal(hsv.v);
          setAlpha(1);
          setFormat('hex');
          triggerChange(hsv.h, hsv.s, hsv.v, 1, 'hex');
        }
      } catch (err) {
        // User cancelled eyedropper
      }
    }
  };

  // Pure Hue color for SV background
  const pureHueRgb = hsvToRgb(hue, 1, 1);
  const pureHueColor = `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`;
  const opaqueColor = `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`;

  return (
    <div
      className={`select-none rounded-xl bg-[#141b18] border border-[#2b3a32] shadow-2xl overflow-hidden text-gray-100 font-sans ${className}`}
      style={{ minWidth: '310px', maxWidth: '100%' }}
    >
      {/* 1. HEADER BAR: DevTools style with format toggle & copy */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0d1310] border-b border-[#232f28]">
        {/* Swatch & active color string button */}
        <button
          type="button"
          onClick={cycleFormat}
          title="Click to cycle format (HEX / RGBA / HSLA)"
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity text-left cursor-pointer"
        >
          {/* Half-circle preview icon */}
          <div
            className="w-4 h-4 rounded-full border border-white/30 relative overflow-hidden flex-shrink-0 shadow-xs"
            style={{
              background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 50% / 6px 6px'
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: activeColorString }}
            />
          </div>

          {/* Formatted code display */}
          <span className="font-mono text-xs font-semibold text-emerald-300 tracking-wide">
            {activeColorString}
          </span>

          <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-emerald-400 px-1 py-0.2 rounded bg-white/5 border border-white/10 ml-1">
            {format.toUpperCase()}
          </span>
        </button>

        {/* Right side actions: Eyedropper & Copy */}
        <div className="flex items-center gap-1.5">
          {typeof window !== 'undefined' && 'EyeDropper' in window && (
            <button
              type="button"
              onClick={pickScreenColor}
              title="Pick color from screen"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Pipette size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={copyColor}
            title="Copy color code"
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN PALETTE: 2D Saturation-Value box + Vertical Hue & Alpha Sliders */}
      <div className="p-3">
        <div className="flex gap-2.5 h-36">
          {/* 2D SV Palette Canvas */}
          <div
            ref={svAreaRef}
            onMouseDown={onSVStart}
            onTouchStart={onSVStart}
            className="relative flex-grow h-full rounded-md cursor-crosshair overflow-hidden border border-white/10 shadow-inner"
            style={{
              backgroundColor: pureHueColor,
              backgroundImage: `
                linear-gradient(to right, #ffffff, transparent),
                linear-gradient(to top, #000000, transparent)
              `
            }}
          >
            {/* Draggable Circle Handle */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${Math.max(0, Math.min(100, sat * 100))}%`,
                top: `${Math.max(0, Math.min(100, (1 - val) * 100))}%`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.7)',
                backgroundColor: opaqueColor
              }}
            />
          </div>

          {/* Vertical Alpha / Opacity Slider */}
          <div
            ref={alphaBarRef}
            onMouseDown={onAlphaStart}
            onTouchStart={onAlphaStart}
            title={`Opacity: ${Math.round(alpha * 100)}%`}
            className="relative w-3.5 h-full rounded-md cursor-pointer overflow-hidden border border-white/10 shadow-inner flex-shrink-0"
            style={{
              background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 50% / 6px 6px'
            }}
          >
            {/* Alpha gradient overlay: Opaque at top, transparent at bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${opaqueColor} 0%, transparent 100%)`
              }}
            />

            {/* Slider Thumb Handle */}
            <div
              className="absolute left-0 right-0 h-1.5 border-y-2 border-white pointer-events-none transform -translate-y-1/2 shadow-xs"
              style={{
                top: `${Math.max(0, Math.min(100, (1 - alpha) * 100))}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          </div>

          {/* Vertical Hue Rainbow Slider */}
          <div
            ref={hueBarRef}
            onMouseDown={onHueStart}
            onTouchStart={onHueStart}
            title={`Hue: ${Math.round(hue)}°`}
            className="relative w-3.5 h-full rounded-md cursor-pointer overflow-hidden border border-white/10 shadow-inner flex-shrink-0"
            style={{
              background: `linear-gradient(to bottom,
                #ff0000 0%,
                #ffff00 17%,
                #00ff00 33%,
                #00ffff 50%,
                #0000ff 67%,
                #ff00ff 83%,
                #ff0000 100%
              )`
            }}
          >
            {/* Slider Thumb Handle */}
            <div
              className="absolute left-0 right-0 h-1.5 border-y-2 border-white pointer-events-none transform -translate-y-1/2 shadow-xs"
              style={{
                top: `${Math.max(0, Math.min(100, (hue / 360) * 100))}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          </div>
        </div>

        {/* 3. INPUT BAR: Direct text entry + format switcher */}
        <div className="mt-2.5 pt-2 border-t border-[#232f28] flex items-center gap-2">
          {/* Format selector pill */}
          <button
            type="button"
            onClick={cycleFormat}
            title="Switch input format"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1c2621] hover:bg-[#25322c] border border-[#314338] text-[10px] font-bold uppercase tracking-wider text-emerald-400 cursor-pointer transition-colors"
          >
            <span>{format}</span>
            <ArrowRightLeft size={10} className="text-gray-400" />
          </button>

          {/* Direct Code Input Field */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={codeInputValue}
              onChange={handleCodeInputChange}
              onBlur={handleCodeInputBlur}
              placeholder="e.g. #0f2e23, rgba(15, 46, 35, 0.85)"
              className="w-full px-2.5 py-1 text-xs font-mono rounded bg-[#0b100e] border border-[#2b3a32] text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Reset / Default Pill */}
          <button
            type="button"
            onClick={() => {
              const def = parseColor('rose');
              const hsv = rgbToHsv(def.r, def.g, def.b);
              setHue(hsv.h);
              setSat(hsv.s);
              setVal(hsv.v);
              setAlpha(1);
              setFormat('hex');
              triggerChange(hsv.h, hsv.s, hsv.v, 1, 'hex');
            }}
            title="Reset to default theme color"
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* 4. PRESET SWATCHES */}
        {presets && presets.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#232f28]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
              <span>Quick Presets</span>
              <span className="text-[9px] text-gray-500 lowercase">click to apply</span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {presets.map((p) => {
                const parsed = parseColor(p.color);
                const isSelected =
                  Math.abs(parsed.r - currentRgb.r) < 5 &&
                  Math.abs(parsed.g - currentRgb.g) < 5 &&
                  Math.abs(parsed.b - currentRgb.b) < 5;

                return (
                  <button
                    key={p.id || p.color}
                    type="button"
                    onClick={() => {
                      const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
                      setHue(hsv.h);
                      setSat(hsv.s);
                      setVal(hsv.v);
                      const newAlpha = parsed.a !== undefined ? parsed.a : 1;
                      setAlpha(newAlpha);
                      triggerChange(hsv.h, hsv.s, hsv.v, newAlpha);
                    }}
                    title={`${p.name} (${p.color})`}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer relative shadow-xs flex items-center justify-center ${
                      isSelected
                        ? 'scale-115 border-white ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#141b18]'
                        : 'border-white/20 hover:scale-110 hover:border-white/60'
                    }`}
                    style={{ backgroundColor: p.color }}
                  >
                    {isSelected && <Check size={10} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. FOOTER SPEC NOTE: Mimicking the Chrome / VS Code DevTools doc line */}
        <div className="mt-2.5 pt-2 border-t border-[#232f28] text-[10px] text-gray-400 leading-tight">
          <p className="truncate text-gray-300">
            Shorthand property for badge pill background &amp; contrast border.
          </p>
          <p className="text-[9px] text-emerald-400/90 mt-0.5 flex items-center gap-1 font-medium">
            <span>✓</span>
            <span>Live synchronization with Announcement Bar</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DevToolsColorPicker;

