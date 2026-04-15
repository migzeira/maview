import type React from "react";
import type { ThemeDef, DesignConfig, GradientDir, ButtonShape, ButtonFill, ProfileShape } from "@/types/vitrine";

/* ─── Themes ──────────────────────────────────────────────────── */
export const THEMES: Record<string, ThemeDef> = {
  "dark-purple": { bg: "#080612", accent: "#a855f7", accent2: "#ec4899", card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.80)", border: "rgba(168,85,247,0.28)" },
  "midnight":    { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8", card: "#0d1524", text: "#f0f6ff", sub: "rgba(240,246,255,0.80)", border: "rgba(96,165,250,0.28)"   },
  "forest":      { bg: "#050f05", accent: "#4ade80", accent2: "#34d399", card: "#0a1a0a", text: "#f0fff4", sub: "rgba(240,255,244,0.80)", border: "rgba(74,222,128,0.28)"   },
  "rose":        { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185", card: "#1e0912", text: "#fff0f3", sub: "rgba(255,240,243,0.80)", border: "rgba(244,63,94,0.28)"    },
  "amber":       { bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d", card: "#1f1500", text: "#fffbeb", sub: "rgba(255,251,235,0.80)", border: "rgba(245,158,11,0.28)"   },
  "ocean":       { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee", card: "#051e30", text: "#ecfeff", sub: "rgba(236,254,255,0.80)", border: "rgba(6,182,212,0.28)"    },
  "neon-pink":   { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7", card: "#1a0828", text: "#fff0f8", sub: "rgba(255,240,248,0.80)", border: "rgba(255,45,149,0.28)"   },
  "sunset":      { bg: "#0f0805", accent: "#f97316", accent2: "#ef4444", card: "#1f150a", text: "#fff7ed", sub: "rgba(255,247,237,0.80)", border: "rgba(249,115,22,0.28)"   },
  "lavender":    { bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa", card: "#1a1530", text: "#f5f0ff", sub: "rgba(245,240,255,0.80)", border: "rgba(192,132,252,0.28)" },
  "emerald":     { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7", card: "#0a2a1a", text: "#ecfdf5", sub: "rgba(236,253,245,0.80)", border: "rgba(16,185,129,0.28)"  },
  "crimson":     { bg: "#120508", accent: "#dc2626", accent2: "#f87171", card: "#220a10", text: "#fff1f2", sub: "rgba(255,241,242,0.80)", border: "rgba(220,38,38,0.28)"    },
  "arctic":      { bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc", card: "#0c1828", text: "#f0f9ff", sub: "rgba(240,249,255,0.80)", border: "rgba(56,189,248,0.28)"   },
  "gold":        { bg: "#0c0a04", accent: "#eab308", accent2: "#d97706", card: "#1c1808", text: "#fefce8", sub: "rgba(254,252,232,0.80)", border: "rgba(234,179,8,0.28)"    },
  "sage":        { bg: "#080c08", accent: "#84cc16", accent2: "#a3e635", card: "#121a12", text: "#f7fee7", sub: "rgba(247,254,231,0.80)", border: "rgba(132,204,22,0.28)"   },
  "coral":       { bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6", card: "#1f1212", text: "#fff7ed", sub: "rgba(255,247,237,0.80)", border: "rgba(251,146,60,0.28)"   },
  "indigo":      { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa", card: "#100e28", text: "#eef2ff", sub: "rgba(238,242,255,0.80)", border: "rgba(99,102,241,0.28)"   },
  "slate":       { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1", card: "#1a1e28", text: "#f8fafc", sub: "rgba(248,250,252,0.80)", border: "rgba(148,163,184,0.28)" },
  "wine":        { bg: "#100408", accent: "#be185d", accent2: "#e11d48", card: "#200a14", text: "#fff0f6", sub: "rgba(255,240,246,0.80)", border: "rgba(190,24,93,0.28)"    },
  "custom":      { bg: "#080612", accent: "#a855f7", accent2: "#ec4899", card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.80)", border: "rgba(168,85,247,0.28)" },
  "white":       { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6", card: "#ffffff", text: "#111827", sub: "#1f2937", border: "rgba(0,0,0,0.08)" },
  "cream":       { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309", card: "#ffffff", text: "#1c1917", sub: "#292524", border: "rgba(0,0,0,0.06)" },
  "pure-black":  { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0", card: "#0a0a0a", text: "#ffffff", sub: "rgba(255,255,255,0.70)", border: "rgba(255,255,255,0.12)" },
  "bold-red":    { bg: "#0a0000", accent: "#ff3333", accent2: "#ff6666", card: "#1a0505", text: "#fff5f5", sub: "rgba(255,245,245,0.80)", border: "rgba(255,51,51,0.25)" },
};

/* ─── Background patterns (SVG) ─────────────────────────────── */
export const BG_PATTERNS: Record<string, string> = {
  dots: `url("data:image/svg+xml,${encodeURIComponent('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/></svg>')}")`,
  grid: `url("data:image/svg+xml,${encodeURIComponent('<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>')}")`,
  diagonal: `url("data:image/svg+xml,${encodeURIComponent('<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 16L16 0" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>')}")`,
  waves: `url("data:image/svg+xml,${encodeURIComponent('<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/></svg>')}")`,
  cross: `url("data:image/svg+xml,${encodeURIComponent('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0v24M0 12h24" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/></svg>')}")`,
  hexagon: `url("data:image/svg+xml,${encodeURIComponent('<svg width="28" height="49" xmlns="http://www.w3.org/2000/svg"><path d="M14 0L28 12.25L28 36.75L14 49L0 36.75L0 12.25Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>')}")`,
};

/* ─── Gradient direction → CSS ───────────────────────────────── */
export const GRAD_DIR: Record<GradientDir, string> = {
  "to-b": "to bottom", "to-t": "to top", "to-r": "to right", "to-l": "to left",
  "to-br": "to bottom right", "to-bl": "to bottom left", "to-tr": "to top right", "to-tl": "to top left",
  "radial": "radial",
};

/* ─── Resolved design (theme + overrides) ───────────────────── */
export interface ResolvedDesign {
  bg: string; accent: string; accent2: string; card: string; text: string; sub: string; border: string;
  nameColor: string; productTitleColor: string; priceColor: string;
  urgencyBadgeBg: string; urgencyBadgeText: string;
  socialIconStyle: "brand" | "theme" | "custom"; socialIconCustomColor: string;
  fontHeading: string; fontBody: string;
  bgType: string; bgGradient: [string, string]; bgGradientDir: GradientDir;
  bgImageUrl: string; bgVideoUrl: string; bgPattern: string; bgOverlay: number; bgBlur: number; bgEffect: string;
  bgImageZoom: number; bgImagePosX: number; bgImagePosY: number;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: string; buttonRadius: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileSize: number;
  textShadow: boolean;
  hideWatermark: boolean;
}

export function resolveDesign(theme: ThemeDef, design?: Partial<DesignConfig>): ResolvedDesign {
  const d = design || {};
  const base: ResolvedDesign = {
    bg: d.bgColor || theme.bg,
    accent: d.accentColor || theme.accent,
    accent2: d.accentColor2 || theme.accent2,
    card: d.cardBg || theme.card,
    text: d.textColor || theme.text,
    sub: d.subtextColor || theme.sub,
    border: d.cardBorder || theme.border,
    nameColor: d.nameColor || "",           // empty = use text
    productTitleColor: d.productTitleColor || "", // empty = use text
    priceColor: d.priceColor || "",         // empty = use text
    urgencyBadgeBg: d.urgencyBadgeBg || "rgba(239,68,68,0.25)",
    urgencyBadgeText: d.urgencyBadgeText || "#f87171",
    socialIconStyle: d.socialIconStyle || "brand",
    socialIconCustomColor: d.socialIconCustomColor || "",
    fontHeading: d.fontHeading || "Inter",
    fontBody: d.fontBody || "Inter",
    bgType: d.bgType || "solid",
    bgGradient: d.bgGradient || [theme.bg, "#1a0a2e"] as [string, string],
    bgGradientDir: d.bgGradientDir || "to-b",
    bgImageUrl: d.bgImageUrl || "",
    bgVideoUrl: d.bgVideoUrl || "",
    bgPattern: d.bgPattern || "",
    bgOverlay: d.bgOverlay ?? 40,
    bgBlur: d.bgBlur ?? 0,
    bgEffect: d.bgEffect || "",
    bgImageZoom: d.bgImageZoom ?? 100,
    bgImagePosX: d.bgImagePosX ?? 50,
    bgImagePosY: d.bgImagePosY ?? 50,
    buttonShape: d.buttonShape || "rounded",
    buttonFill: d.buttonFill || "solid",
    buttonShadow: d.buttonShadow || "none",
    buttonRadius: d.buttonRadius ?? 12,
    profileShape: d.profileShape || "circle",
    profileBorder: d.profileBorder ?? true,
    profileBorderColor: d.profileBorderColor || theme.accent,
    profileSize: d.profileSize ?? 88,
    textShadow: d.textShadow ?? false,
    hideWatermark: d.hideWatermark ?? false,
  };

  // Auto-contrast: if bg has overlay or is image/effect, auto-adjust text
  // Only override if the user hasn't explicitly set custom text colors
  const userSetTextColor = !!d.textColor;
  const userSetSubColor = !!d.subtextColor;
  if (!userSetTextColor || !userSetSubColor) {
    const auto = autoContrastColors(base);
    if (!userSetTextColor) base.text = auto.text;
    if (!userSetSubColor) base.sub = auto.sub;
  }

  return base;
}

export function bgCss(rd: ResolvedDesign): React.CSSProperties {
  switch (rd.bgType) {
    case "gradient": {
      const dir = rd.bgGradientDir;
      if (dir === "radial") return { background: `radial-gradient(circle, ${rd.bgGradient[0]}, ${rd.bgGradient[1]})` };
      return { background: `linear-gradient(${GRAD_DIR[dir]}, ${rd.bgGradient[0]}, ${rd.bgGradient[1]})` };
    }
    case "image":
    case "video":
    case "pattern":
    default:
      return { background: rd.bg };
  }
}

export function profileClip(shape: ProfileShape): string | undefined {
  switch (shape) {
    case "hexagon": return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    default: return undefined;
  }
}

export function profileBorderRadius(shape: ProfileShape): string {
  switch (shape) {
    case "circle": return "9999px";
    case "rounded": return "20%";
    case "square": return "8px";
    case "hexagon": return "0px";
  }
}

export function buttonBorderRadius(shape: ButtonShape, radius: number): string {
  switch (shape) {
    case "pill": return "9999px";
    case "square": return "4px";
    case "soft": return "12px";
    case "rounded":
    default: return `${radius}px`;
  }
}

export function buttonStyles(rd: ResolvedDesign, isAccent = false): React.CSSProperties {
  const br = buttonBorderRadius(rd.buttonShape, rd.buttonRadius);
  const shadow = rd.buttonShadow === "glow" ? `0 4px 20px ${rd.accent}40`
    : rd.buttonShadow === "md" ? `0 4px 12px rgba(0,0,0,0.3)`
    : rd.buttonShadow === "sm" ? `0 2px 6px rgba(0,0,0,0.2)`
    : "none";

  if (isAccent) {
    return { borderRadius: br, boxShadow: shadow };
  }

  switch (rd.buttonFill) {
    case "outline":
      return { background: "transparent", border: `1.5px solid ${rd.border}`, borderRadius: br, boxShadow: shadow };
    case "glass":
      return { background: `${rd.card}aa`, backdropFilter: "blur(12px)", border: `1px solid ${rd.border}`, borderRadius: br, boxShadow: shadow };
    case "ghost":
      return { background: "transparent", border: "1px solid transparent", borderRadius: br, boxShadow: shadow };
    case "solid":
    default:
      return { background: rd.card, border: `1px solid ${rd.border}`, borderRadius: br, boxShadow: shadow };
  }
}

/* ─── Luminance & auto-contrast ─────────────────────────────── */
/** Parse hex (#rrggbb or #rgb) to [r,g,b] */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

/** Relative luminance (WCAG 2.1) — 0 = black, 1 = white */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Is background considered "light"? (luminance > 0.45) */
export function isLightBackground(bgColor: string): boolean {
  try { return relativeLuminance(bgColor) > 0.45; } catch { return false; }
}

/**
 * Auto-resolve text colors based on effective background brightness.
 * For dark bg → light text; for light bg → dark text.
 * Accounts for overlay darkening on image backgrounds.
 */
export function autoContrastColors(rd: ResolvedDesign): { text: string; sub: string } {
  let effectiveBg = rd.bg;

  // If image/video/pattern/effect with overlay, blend towards black
  if ((rd.bgType === "image" || rd.bgType === "video" || rd.bgType === "pattern" || rd.bgType === "effect") && rd.bgOverlay > 0) {
    // Overlay is rgba(0,0,0,X) — darkens the background
    // If overlay >= 30%, treat as dark regardless of base bg
    if (rd.bgOverlay >= 30) {
      return { text: "#ffffff", sub: "rgba(255,255,255,0.80)" };
    }
  }

  // For gradient, check first color (dominant)
  if (rd.bgType === "gradient" && rd.bgGradient?.[0]) {
    effectiveBg = rd.bgGradient[0];
  }

  const light = isLightBackground(effectiveBg);
  if (light) {
    return { text: "#111827", sub: "#374151" }; // gray-900 / gray-700
  }
  return { text: "#ffffff", sub: "rgba(255,255,255,0.80)" };
}

/* ─── URL sanitizer (blocks javascript: / data: / vbscript:) ── */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) return undefined;
  return trimmed;
}

/* ─── Google Font loader ─────────────────────────────────────── */
export function loadGoogleFont(font: string) {
  if (!font || font === "Inter") return;
  const id = `gf-${font.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}
