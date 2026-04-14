import React from "react";

/* ── Color conversion ─────────────────────────────── */

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6; else if (max === g) h = ((b - r) / d + 2) / 6; else h = ((r - g) / d + 4) / 6; }
  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l); const f = (n: number) => { const k = (n + h / 30) % 12;
    return Math.round(255 * Math.max(0, Math.min(1, l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Returns relative luminance (0–1). Values > 0.5 are "light". */
export function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns appropriate text/subtext colors for a given background color. */
export function getContrastColors(bgHex: string) {
  const isLight = getLuminance(bgHex) > 0.18;
  const textColor = isLight ? "#111827" : "#f8f5ff";
  const subtextColor = isLight ? "rgba(17,24,39,0.65)" : "rgba(248,245,255,0.80)";
  return { textColor, subtextColor };
}

export function generateHarmony(accentHex: string) {
  const [h, s] = hexToHsl(accentHex);
  const accentLum = getLuminance(accentHex);
  const isLightAccent = accentLum > 0.4;
  const bgL = isLightAccent ? 96 : 3;
  const bgColor = hslToHex(h, Math.min(s * 0.3, 20), bgL);
  const { textColor, subtextColor } = getContrastColors(bgColor);
  return {
    accent2: hslToHex(h + 30, s * 0.9, Math.min(accentLum > 0.5 ? 35 : 55, 70)),
    bgColor,
    cardBg: hslToHex(h, Math.min(s * 0.25, 15), isLightAccent ? 100 : 7),
    cardBorder: `rgba(${parseInt(accentHex.slice(1, 3), 16)},${parseInt(accentHex.slice(3, 5), 16)},${parseInt(accentHex.slice(5, 7), 16)},${isLightAccent ? 0.12 : 0.28})`,
    textColor,
    subtextColor,
  };
}

export function extractColorsFromImage(imgSrc: string): Promise<{ dominant: string; accent: string }> {
  return new Promise((resolve) => {
    const img = new window.Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas"); canvas.width = 50; canvas.height = 50;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0, 50, 50); const data = ctx.getImageData(0, 0, 50, 50).data;
      const cc: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        if (data[i + 3] < 128) continue;
        const key = `${Math.round(data[i] / 32) * 32},${Math.round(data[i + 1] / 32) * 32},${Math.round(data[i + 2] / 32) * 32}`;
        cc[key] = (cc[key] || 0) + 1;
      }
      const sorted = Object.entries(cc).sort((a, b) => b[1] - a[1]);
      const toHex = (s: string) => { const [r, g, b] = s.split(",").map(Number); return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`; };
      resolve({ dominant: sorted[0] ? toHex(sorted[0][0]) : "#a855f7", accent: sorted[1] ? toHex(sorted[1][0]) : "#ec4899" });
    };
    img.onerror = () => resolve({ dominant: "#a855f7", accent: "#ec4899" });
    img.src = imgSrc;
  });
}

export function loadFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link"); link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/* ── Sub-components ───────────────────────────────── */

export function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative w-8 h-8 rounded-lg overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all flex-shrink-0">
        <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        <div className="w-full h-full" style={{ background: value || "#000" }} />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">{label}</p>
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="#000000"
          className="w-full text-[11px] font-mono bg-transparent text-[hsl(var(--dash-text-muted))] border-none outline-none p-0 uppercase" />
      </div>
    </div>
  );
}

export function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[hsl(var(--dash-border-subtle))]/50 bg-[hsl(var(--dash-surface-2))]/40 overflow-hidden">
      <summary className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer select-none hover:bg-[hsl(var(--dash-accent))]/20 transition-colors">
        <span className="text-primary/70 flex-shrink-0">{icon}</span>
        <span className="text-[hsl(var(--dash-text-secondary))] text-[13px] font-semibold flex-1">{title}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-[hsl(var(--dash-text-subtle))] group-open:rotate-180 transition-transform"><polyline points="6 9 12 15 18 9" /></svg>
      </summary>
      <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--dash-border-subtle))]/40">{children}</div>
    </details>
  );
}
