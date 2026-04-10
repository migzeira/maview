import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe, Instagram, Youtube, Twitter, ShoppingBag,
  Link2, Share2, Check, ShoppingCart, Star,
  ArrowRight, Sparkles, MessageCircle, Quote,
  Clock, Flame, Calendar, Play, ChevronLeft, ChevronRight, X,
} from "lucide-react";

import logoSrc from "@/assets/maview-logo.png";

/* ─── Types ───────────────────────────────────────────────────── */
type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "ocean"
  | "neon-pink" | "sunset" | "lavender" | "emerald" | "crimson" | "arctic"
  | "gold" | "sage" | "coral" | "indigo" | "slate" | "wine"
  | "custom" | string;

type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
type ButtonShape = "rounded" | "pill" | "square" | "soft";
type ButtonFill = "solid" | "outline" | "glass" | "ghost";
type ButtonShadow = "none" | "sm" | "md" | "glow";
type ProfileShape = "circle" | "rounded" | "square" | "hexagon";

interface DesignConfig {
  bgType: BgType; bgColor: string; bgGradient: [string, string];
  bgGradientDir: GradientDir; bgImageUrl: string; bgVideoUrl: string;
  bgPattern: string; bgOverlay: number; bgBlur: number; bgEffect: string;
  textColor: string; subtextColor: string; cardBg: string; cardBorder: string;
  accentColor: string; accentColor2: string;
  fontHeading: string; fontBody: string;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: ButtonShadow; buttonRadius: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileSize: number;
  hideWatermark: boolean;
}

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  emoji: string;
  images?: string[];
  video?: string;
  imageUrl?: string;
  url: string;
  linkType?: "url" | "whatsapp" | "none" | "booking";
  whatsappMsg?: string;
  ctaText?: string;
  badge?: string;
  urgency?: boolean;
  bookingDuration?: number;
  bookingDays?: string[];
  bookingStart?: string;
  bookingEnd?: string;
  bookingChannel?: "whatsapp" | "google" | "calendly" | "external";
  bookingUrl?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
  isSocial?: boolean;
}

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  stars: number;
  avatar: string;
  screenshotUrl?: string;
}

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  theme: ThemeId;
  design?: Partial<DesignConfig>;
  whatsapp?: string;
  links: LinkItem[];
  products: ProductItem[];
  testimonials?: TestimonialItem[];
  stats?: { label: string; value: string }[];
}

/* ─── Themes ──────────────────────────────────────────────────── */
const THEMES: Record<string, {
  bg: string; accent: string; accent2: string;
  card: string; text: string; sub: string; border: string;
}> = {
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
  "white":       { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6", card: "#ffffff", text: "#111827", sub: "rgba(17,24,39,0.65)", border: "rgba(0,0,0,0.08)" },
  "cream":       { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309", card: "#ffffff", text: "#1c1917", sub: "rgba(28,25,23,0.60)", border: "rgba(0,0,0,0.06)" },
  "pure-black":  { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0", card: "#0a0a0a", text: "#ffffff", sub: "rgba(255,255,255,0.70)", border: "rgba(255,255,255,0.12)" },
  "bold-red":    { bg: "#0a0000", accent: "#ff3333", accent2: "#ff6666", card: "#1a0505", text: "#fff5f5", sub: "rgba(255,245,245,0.80)", border: "rgba(255,51,51,0.25)" },
};

/* ─── Background patterns (SVG) ─────────────────────────────── */
const BG_PATTERNS: Record<string, string> = {
  dots: `url("data:image/svg+xml,${encodeURIComponent('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/></svg>')}")`,
  grid: `url("data:image/svg+xml,${encodeURIComponent('<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>')}")`,
  diagonal: `url("data:image/svg+xml,${encodeURIComponent('<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 16L16 0" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>')}")`,
  waves: `url("data:image/svg+xml,${encodeURIComponent('<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/></svg>')}")`,
  cross: `url("data:image/svg+xml,${encodeURIComponent('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0v24M0 12h24" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/></svg>')}")`,
  hexagon: `url("data:image/svg+xml,${encodeURIComponent('<svg width="28" height="49" xmlns="http://www.w3.org/2000/svg"><path d="M14 0L28 12.25L28 36.75L14 49L0 36.75L0 12.25Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>')}")`,
};

/* ─── Gradient direction → CSS ───────────────────────────────── */
const GRAD_DIR: Record<GradientDir, string> = {
  "to-b": "to bottom", "to-t": "to top", "to-r": "to right", "to-l": "to left",
  "to-br": "to bottom right", "to-bl": "to bottom left", "to-tr": "to top right", "to-tl": "to top left",
  "radial": "radial",
};

/* ─── Helpers: compute resolved design values ────────────────── */
function resolveDesign(theme: typeof THEMES["dark-purple"], design?: Partial<DesignConfig>) {
  const d = design || {};
  return {
    bg: d.bgColor || theme.bg,
    accent: d.accentColor || theme.accent,
    accent2: d.accentColor2 || theme.accent2,
    card: d.cardBg || theme.card,
    text: d.textColor || theme.text,
    sub: d.subtextColor || theme.sub,
    border: d.cardBorder || theme.border,
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
    buttonShape: d.buttonShape || "rounded",
    buttonFill: d.buttonFill || "solid",
    buttonShadow: d.buttonShadow || "none",
    buttonRadius: d.buttonRadius ?? 12,
    profileShape: d.profileShape || "circle",
    profileBorder: d.profileBorder ?? true,
    profileBorderColor: d.profileBorderColor || theme.accent,
    profileSize: d.profileSize ?? 88,
    hideWatermark: d.hideWatermark ?? false,
  };
}

function bgCss(rd: ReturnType<typeof resolveDesign>): React.CSSProperties {
  switch (rd.bgType) {
    case "gradient": {
      const dir = rd.bgGradientDir;
      if (dir === "radial") return { background: `radial-gradient(circle, ${rd.bgGradient[0]}, ${rd.bgGradient[1]})` };
      return { background: `linear-gradient(${GRAD_DIR[dir]}, ${rd.bgGradient[0]}, ${rd.bgGradient[1]})` };
    }
    case "image":
    case "video":
      return { background: rd.bg };
    case "pattern":
      return { background: rd.bg };
    default:
      return { background: rd.bg };
  }
}

function profileClip(shape: ProfileShape): string | undefined {
  switch (shape) {
    case "hexagon": return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    default: return undefined;
  }
}

function profileBorderRadius(shape: ProfileShape): string {
  switch (shape) {
    case "circle": return "9999px";
    case "rounded": return "20%";
    case "square": return "8px";
    case "hexagon": return "0px";
  }
}

function buttonBorderRadius(shape: ButtonShape, radius: number): string {
  switch (shape) {
    case "pill": return "9999px";
    case "square": return "4px";
    case "soft": return "12px";
    case "rounded":
    default: return `${radius}px`;
  }
}

function buttonStyles(rd: ReturnType<typeof resolveDesign>, isAccent = false): React.CSSProperties {
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

/* ─── Effect CSS keyframes (injected once) ───────────────────── */
function injectEffectStyles() {
  if (document.getElementById("maview-effect-styles")) return;
  const style = document.createElement("style");
  style.id = "maview-effect-styles";
  style.textContent = `
    @keyframes mv-aurora { 0%,100% { transform: translateX(-20%) rotate(0deg); } 50% { transform: translateX(20%) rotate(3deg); } }
    @keyframes mv-pulse { 0%,100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
    @keyframes mv-float { 0%,100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-15px) translateX(8px); } 66% { transform: translateY(8px) translateX(-5px); } }
    @keyframes mv-drift { 0% { transform: translate(0,0) scale(1); } 25% { transform: translate(10%,5%) scale(1.05); } 50% { transform: translate(-5%,10%) scale(0.95); } 75% { transform: translate(-10%,-5%) scale(1.02); } 100% { transform: translate(0,0) scale(1); } }
    @keyframes mv-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
    @keyframes mv-shimmer { 0% { opacity: 0; } 50% { opacity: 0.6; } 100% { opacity: 0; } }
    @keyframes mv-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes mv-wave { 0% { transform: translateX(0) scaleY(1); } 50% { transform: translateX(-25%) scaleY(1.2); } 100% { transform: translateX(-50%) scaleY(1); } }
    @keyframes mv-fog { 0%,100% { transform: translateX(-10%) scale(1.1); opacity: 0.04; } 50% { transform: translateX(10%) scale(1); opacity: 0.07; } }
    @keyframes mv-orbit { 0% { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); } 100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); } }
    @keyframes mv-ripple { 0% { transform: scale(0.3); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
    @keyframes mv-sway { 0%,100% { transform: translateX(0) scaleX(1); } 25% { transform: translateX(8%) scaleX(1.04); } 75% { transform: translateX(-8%) scaleX(0.96); } }
    @keyframes mv-morph { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 50% { border-radius: 50% 60% 30% 60% / 30% 50% 70% 50%; } 75% { border-radius: 40% 60% 70% 30% / 60% 40% 30% 70%; } }
    @keyframes mv-orbit-ring { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
    .mv-aurora { animation: mv-aurora 12s ease-in-out infinite; }
    .mv-pulse { animation: mv-pulse 4s ease-in-out infinite; }
    .mv-float { animation: mv-float 8s ease-in-out infinite; }
    .mv-drift { animation: mv-drift 20s ease-in-out infinite; }
    .mv-scan { animation: mv-scan 6s linear infinite; }
    .mv-shimmer { animation: mv-shimmer 3s ease-in-out infinite; }
    .mv-gradient-anim { background-size: 200% 200%; animation: mv-gradient 8s ease infinite; }
    .mv-wave { animation: mv-wave 12s linear infinite; }
    .mv-fog { animation: mv-fog 15s ease-in-out infinite; }
    .mv-orbit { animation: mv-orbit var(--orbit-dur, 10s) linear infinite; }
    .mv-ripple { animation: mv-ripple 4s ease-out infinite; }
    .mv-sway { animation: mv-sway 8s ease-in-out infinite; }
    .mv-morph { animation: mv-morph 12s ease-in-out infinite; }
    .mv-orbit-ring { animation: mv-orbit-ring var(--ring-dur, 20s) linear infinite; }
    @keyframes mv-hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
    @keyframes mv-sweep { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
    @keyframes mv-breathe { 0%,100% { transform: scale(1); opacity: 0.12; } 50% { transform: scale(1.15); opacity: 0.25; } }
    @keyframes mv-spin-slow { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes mv-rise { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 50% { opacity: 0.3; } 100% { transform: translateY(-20vh) scale(1); opacity: 0; } }
    @keyframes mv-flicker { 0%,100% { opacity: 0.03; } 10% { opacity: 0.06; } 20% { opacity: 0.02; } 30% { opacity: 0.07; } 50% { opacity: 0.04; } 70% { opacity: 0.06; } 90% { opacity: 0.03; } }
    @keyframes mv-slide-diag { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
    .mv-hue { animation: mv-hue 20s linear infinite; }
    .mv-sweep { animation: mv-sweep 5s ease-in-out infinite; }
    .mv-breathe { animation: mv-breathe 6s ease-in-out infinite; }
    .mv-spin-slow { animation: mv-spin-slow var(--spin-dur, 30s) linear infinite; }
    .mv-rise { animation: mv-rise var(--rise-dur, 8s) ease-in-out infinite; }
    .mv-flicker { animation: mv-flicker 4s steps(1) infinite; }
    .mv-slide-diag { animation: mv-slide-diag 15s linear infinite; background-size: 200% 200%; }
  `;
  document.head.appendChild(style);
}

/* ─── Render bg effect layers ────────────────────────────────── */
function EffectLayer({ effectId, accent, accent2 }: { effectId: string; accent: string; accent2: string }) {
  useEffect(() => { injectEffectStyles(); }, []);

  switch (effectId) {
    case "aurora":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[60%] top-[-10%] left-[-50%] mv-aurora" style={{ background: `linear-gradient(135deg, ${accent}25, transparent 40%, ${accent2}20, transparent 70%, ${accent}15)`, filter: "blur(60px)" }} />
        </div>
      );
    case "aurora-waves":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[40%] bottom-0 left-[-50%] mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, ${accent2}15, transparent)`, filter: "blur(40px)" }} />
          <div className="absolute w-[200%] h-[30%] bottom-[10%] left-[-30%] mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent2}15, ${accent}10, transparent)`, filter: "blur(50px)", animationDelay: "-4s" }} />
        </div>
      );
    case "ambient-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full mv-pulse" style={{ background: `radial-gradient(circle, ${accent}20, transparent 60%)` }} />
        </div>
      );
    case "spotlight":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] mv-pulse" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}30, transparent 70%)` }} />
        </div>
      );
    case "radial-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-pulse" style={{ background: `radial-gradient(circle at 50% 50%, ${accent}18, transparent 60%)` }} />
        </div>
      );
    case "gradient-flow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(45deg, ${accent}20, ${accent2}15, ${accent}20, ${accent2}15)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "gradient-mesh":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute w-[50%] h-[50%] top-[10%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}20, transparent 60%)`, filter: "blur(40px)" }} />
          <div className="absolute w-[50%] h-[50%] bottom-[10%] right-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent2}18, transparent 60%)`, filter: "blur(40px)", animationDelay: "-10s" }} />
        </div>
      );
    case "gradient-shift":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(90deg, ${accent}15, ${accent2}15, #60a5fa15, ${accent}15)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "starfield": {
      // Stable positions using index-based seeding
      const stars = Array.from({ length: 20 }, (_, i) => ({
        w: i % 2 === 0 ? 2 : 1, left: ((i * 47 + 13) % 100), top: ((i * 71 + 7) % 100),
        delay: (i * 0.25) % 5, dur: 2 + (i * 0.2) % 4,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full mv-shimmer" style={{
              width: s.w, height: s.w, left: `${s.left}%`, top: `${s.top}%`,
              background: "white", animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "floating-dots": {
      const dots = Array.from({ length: 8 }, (_, i) => ({
        size: 4 + (i * 3) % 5, left: 10 + ((i * 61 + 11) % 80), top: 10 + ((i * 43 + 17) % 80),
        opacity: 0.15 + (i * 0.02), delay: i * 1, dur: 6 + (i % 3) * 2,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {dots.map((d, i) => (
            <div key={i} className="absolute rounded-full mv-float" style={{
              width: d.size, height: d.size, left: `${d.left}%`, top: `${d.top}%`,
              background: accent, opacity: d.opacity, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "sparkles": {
      const sparks = Array.from({ length: 12 }, (_, i) => ({
        left: ((i * 53 + 19) % 100), top: ((i * 37 + 23) % 100),
        delay: (i * 0.33) % 4, dur: 1.5 + (i * 0.25) % 3,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {sparks.map((s, i) => (
            <div key={i} className="absolute rounded-full mv-shimmer" style={{
              width: 3, height: 3, left: `${s.left}%`, top: `${s.top}%`,
              background: i % 3 === 0 ? "#fcd34d" : accent, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "wave-layers":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[200px] bottom-0 left-0 mv-wave" style={{ background: `linear-gradient(180deg, transparent, ${accent}10)`, borderRadius: "40% 40% 0 0" }} />
          <div className="absolute w-[200%] h-[150px] bottom-0 left-0 mv-wave" style={{ background: `linear-gradient(180deg, transparent, ${accent}06)`, borderRadius: "45% 45% 0 0", animationDelay: "-3s" }} />
        </div>
      );
    case "flow-field":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute h-px mv-drift" style={{
              width: "60%", left: `${-10 + i * 25}%`, top: `${15 + i * 18}%`,
              background: `linear-gradient(90deg, transparent, ${accent}15, transparent)`,
              animationDelay: `${i * -4}s`,
            }} />
          ))}
        </div>
      );
    case "liquid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[60%] h-[60%] top-[20%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(ellipse, ${accent}15, transparent 60%)`, filter: "blur(50px)" }} />
          <div className="absolute w-[50%] h-[50%] bottom-[15%] right-[5%] rounded-full mv-drift" style={{ background: `radial-gradient(ellipse, ${accent2}12, transparent 60%)`, filter: "blur(50px)", animationDelay: "-8s" }} />
        </div>
      );
    case "matrix-grid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      );
    case "pulse-grid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-pulse" style={{ backgroundImage: `radial-gradient(${accent}15 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        </div>
      );
    case "scan-lines":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${accent}05 2px, ${accent}05 4px)` }}>
          <div className="absolute w-full h-[2px] mv-scan" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />
        </div>
      );
    case "fog":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[150%] h-[50%] top-[20%] left-[-25%] mv-fog" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 60%)`, filter: "blur(30px)" }} />
          <div className="absolute w-[150%] h-[40%] bottom-[10%] left-[-10%] mv-fog" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.03), transparent 60%)`, filter: "blur(30px)", animationDelay: "-7s" }} />
        </div>
      );
    case "smoke":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[80%] h-[60%] top-[20%] left-[10%] mv-drift" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 50%)`, filter: "blur(40px)" }} />
        </div>
      );
    case "clouds":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[120%] h-[30%] top-[10%] left-[-10%] mv-drift" style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05), transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.04), transparent 50%)`, filter: "blur(20px)" }} />
          <div className="absolute w-[100%] h-[25%] top-[50%] left-0 mv-drift" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03), transparent 50%)`, filter: "blur(25px)", animationDelay: "-12s" }} />
        </div>
      );
    /* ── NEW: Animated motion effects ── */
    case "ocean-waves":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {[0, 1, 2].map(i => (
            <div key={i} className="absolute w-[250%] left-[-75%] mv-sway" style={{
              height: `${100 + i * 40}px`, bottom: `${i * 25}px`,
              background: `linear-gradient(180deg, transparent, ${accent}${35 - i * 8})`,
              borderRadius: "40% 40% 0 0",
              animationDelay: `${i * -2.5}s`,
              animationDuration: `${7 + i * 2}s`,
            }} />
          ))}
        </div>
      );
    case "orbit-circles": {
      const orbs = [
        { r: 80, size: 12, dur: 8, color: accent, opacity: 0.6 },
        { r: 130, size: 9, dur: 12, color: accent2, opacity: 0.5 },
        { r: 60, size: 7, dur: 6, color: accent, opacity: 0.45 },
        { r: 160, size: 10, dur: 16, color: accent2, opacity: 0.4 },
        { r: 100, size: 8, dur: 10, color: accent, opacity: 0.55 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {orbs.map((o, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 mv-orbit" style={{
              width: o.size, height: o.size, borderRadius: "50%",
              background: o.color, opacity: o.opacity,
              "--orbit-r": `${o.r}px`, "--orbit-dur": `${o.dur}s`,
              animationDelay: `${i * -1.5}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      );
    }
    case "ripple-rings": {
      const rings = [0, 1, 2, 3];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {rings.map(i => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mv-ripple" style={{
              width: 120, height: 120,
              border: `2px solid ${accent}55`,
              animationDelay: `${i * 1}s`,
              animationDuration: "4s",
            }} />
          ))}
        </div>
      );
    }
    case "morph-blobs":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[300px] h-[300px] top-[10%] left-[5%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent}40, transparent 70%)`, filter: "blur(30px)",
          }} />
          <div className="absolute w-[250px] h-[250px] bottom-[15%] right-[5%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent2}35, transparent 70%)`, filter: "blur(30px)",
            animationDelay: "-4s",
          }} />
          <div className="absolute w-[200px] h-[200px] top-[45%] left-[30%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent}12, transparent 70%)`, filter: "blur(50px)",
            animationDelay: "-8s",
          }} />
        </div>
      );
    case "orbit-rings": {
      const ringData = [
        { size: 200, dur: 20, border: accent, opacity: 0.35 },
        { size: 300, dur: 28, border: accent2, opacity: 0.25 },
        { size: 400, dur: 36, border: accent, opacity: 0.18 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {ringData.map((r, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 rounded-full mv-orbit-ring" style={{
              width: r.size, height: r.size,
              border: `1px solid ${r.border}`,
              opacity: r.opacity,
              "--ring-dur": `${r.dur}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            } as React.CSSProperties}>
              {/* Orbiting dot on ring */}
              <div className="absolute rounded-full" style={{
                width: 6, height: 6, top: -3, left: "50%", marginLeft: -3,
                background: r.border, opacity: 0.6,
              }} />
            </div>
          ))}
        </div>
      );
    }
    case "neon-lines": {
      const lines = Array.from({ length: 6 }, (_, i) => ({
        top: 10 + i * 16,
        delay: i * -2,
        dur: 6 + (i % 3) * 2,
        color: i % 2 === 0 ? accent : accent2,
        width: 40 + (i % 3) * 20,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {lines.map((l, i) => (
            <div key={i} className="absolute h-[2px] mv-sway" style={{
              width: `${l.width}%`, left: `${(100 - l.width) / 2}%`, top: `${l.top}%`,
              background: `linear-gradient(90deg, transparent, ${l.color}50, ${l.color}70, ${l.color}50, transparent)`,
              boxShadow: `0 0 12px ${l.color}35`,
              animationDelay: `${l.delay}s`,
              animationDuration: `${l.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "gradient-shift-hue":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] mv-hue">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30, ${accent2}20, ${accent}15)` }} />
        </div>
      );
    case "light-sweep":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute inset-0 mv-sweep" style={{ background: `linear-gradient(90deg, transparent 30%, ${accent}12 50%, transparent 70%)`, width: "50%" }} />
        </div>
      );
    case "breathing-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent}25, transparent 60%)`, filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent2}20, transparent 60%)`, filter: "blur(50px)", animationDelay: "-3s" }} />
        </div>
      );
    case "conic-spotlight": {
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] mv-spin-slow" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${accent}15 10%, transparent 20%, transparent 100%)`, filter: "blur(30px)", "--spin-dur": "12s" } as React.CSSProperties} />
        </div>
      );
    }
    case "rising-particles": {
      const particles = Array.from({ length: 15 }, (_, i) => ({
        left: ((i * 67 + 11) % 100), size: 4 + (i % 4) * 3, dur: 6 + (i * 1.3) % 6, delay: (i * 0.8) % 8,
        color: i % 3 === 0 ? accent2 : accent,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {particles.map((p, i) => (
            <div key={i} className="absolute rounded-full mv-rise" style={{
              width: p.size, height: p.size, left: `${p.left}%`, bottom: 0,
              background: p.color, opacity: 0.5,
              "--rise-dur": `${p.dur}s`, animationDelay: `${p.delay}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      );
    }
    case "noise-flicker":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-flicker" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.08"/></svg>')}")`, backgroundRepeat: "repeat" }} />
        </div>
      );
    case "diagonal-shimmer":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute inset-0 mv-slide-diag" style={{ background: `repeating-linear-gradient(45deg, transparent 0px, transparent 40px, ${accent}06 40px, ${accent}06 80px)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "floating-orbs":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[350px] h-[350px] top-[5%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}45, transparent 60%)`, filter: "blur(50px)" }} />
          <div className="absolute w-[280px] h-[280px] top-[40%] right-[5%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent2}40, transparent 60%)`, filter: "blur(45px)", animationDelay: "-8s" }} />
          <div className="absolute w-[220px] h-[220px] bottom-[10%] left-[25%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}35, transparent 60%)`, filter: "blur(55px)", animationDelay: "-15s" }} />
        </div>
      );
    case "layered-waves":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="absolute w-[250%] left-[-75%] mv-sway" style={{
              height: `${80 + i * 30}px`, bottom: `${i * 20}px`,
              background: `linear-gradient(180deg, transparent, ${i % 2 === 0 ? accent : accent2}${String(30 - i * 5).padStart(2, "0")})`,
              borderRadius: "45% 45% 0 0",
              animationDelay: `${i * -1.8}s`,
              animationDuration: `${6 + i * 1.5}s`,
            }} />
          ))}
        </div>
      );
    case "pulse-circles": {
      const circles = [
        { size: 100, delay: 0, dur: 5 },
        { size: 160, delay: 1.2, dur: 5 },
        { size: 220, delay: 2.4, dur: 5 },
        { size: 280, delay: 3.6, dur: 5 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {circles.map((c, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mv-ripple" style={{
              width: c.size, height: c.size,
              border: `1px solid ${accent}20`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "gradient-aurora-mesh":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[120%] h-[60%] top-[-10%] left-[-10%] mv-aurora" style={{ background: `linear-gradient(120deg, ${accent}18, transparent 30%, ${accent2}15, transparent 60%, ${accent}10)`, filter: "blur(50px)" }} />
          <div className="absolute w-[100%] h-[40%] bottom-[0%] left-0 mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent2}10, ${accent}08, transparent)`, filter: "blur(40px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent}12, transparent 60%)`, filter: "blur(60px)" }} />
        </div>
      );
    case "stripe-gradient":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(-45deg, ${accent}15, ${accent2}12, #60a5fa10, ${accent}15, #ec489910, ${accent2}12)`, backgroundSize: "400% 400%" }} />
        </div>
      );
    case "vortex-spin":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] mv-spin-slow" style={{
            background: `conic-gradient(from 0deg, transparent, ${accent}30, transparent, ${accent2}25, transparent, ${accent}20, transparent)`,
            filter: "blur(25px)",
            "--spin-dur": "25s",
          } as React.CSSProperties} />
        </div>
      );
    case "liquid-glass":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[300px] h-[300px] top-[15%] left-[10%] mv-morph mv-drift" style={{
            background: `radial-gradient(circle, ${accent}18, transparent 60%)`,
            filter: "blur(50px)",
          }} />
          <div className="absolute w-[250px] h-[250px] bottom-[20%] right-[10%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent2}15, transparent 60%)`,
            filter: "blur(45px)", animationDelay: "-6s",
          }} />
        </div>
      );
    default:
      return null;
  }
}

/* ─── Google Font loader ─────────────────────────────────────── */
function loadGoogleFont(font: string) {
  if (!font || font === "Inter") return;
  const id = `gf-${font.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

/* Custom SVG icon components */
const SvgIcon = ({ d, size = 16, className = "" }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d={d} /></svg>
);

const TikTokIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
);
const XIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
);
const DiscordIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z" />
);
const GitHubIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
);
const TwitchIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);
const TelegramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.023c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z" />
);
const FacebookIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
);
const LinkedInIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
);
const PinterestIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <SvgIcon size={size} className={className} d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
);
const ThreadsIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.282-1.592-1.663a8.928 8.928 0 0 1-.108 2.661c-.27 1.28-.862 2.287-1.768 2.992-.89.693-2.04 1.046-3.419 1.046h-.036c-1.66-.014-3.015-.68-3.918-1.928l1.673-1.14c.603.886 1.494 1.07 2.253 1.07h.021c.924-.006 1.633-.301 2.106-.878.367-.448.603-1.065.698-1.834-1.024.187-2.07.204-3.063.034-2.828-.483-4.392-2.334-4.267-5.065.077-1.674.764-3.104 1.934-4.026 1.078-.85 2.467-1.296 4.02-1.293 1.665.01 3.003.591 3.974 1.73.878 1.027 1.37 2.455 1.462 4.243 1.076.525 1.899 1.318 2.397 2.335.716 1.46.829 3.9-.955 5.67-1.836 1.822-4.106 2.632-7.343 2.654zM11.29 8.357c-1.036-.003-1.932.296-2.596.867-.732.628-1.14 1.538-1.188 2.637-.082 1.79.855 3.007 2.664 3.317.703.12 1.464.092 2.263-.084a6.803 6.803 0 0 0-.025-.756c-.09-1.77-.588-3.084-1.48-3.906-.619-.571-1.404-.87-2.333-.87h-.015z"/>
  </svg>
);
const KwaiIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.88 14.12a1 1 0 0 1-1.41 0L12 13.41l-2.47 2.71a1 1 0 0 1-1.41-1.41L10.59 12 8.12 9.29a1 1 0 0 1 1.41-1.41L12 10.59l2.47-2.71a1 1 0 1 1 1.41 1.41L13.41 12l2.47 2.71a1 1 0 0 1 0 1.41z"/>
  </svg>
);

const ICON_MAP: Record<string, any> = {
  globe: Globe, instagram: Instagram, youtube: Youtube,
  twitter: XIcon, tiktok: TikTokIcon, discord: DiscordIcon,
  github: GitHubIcon, twitch: TwitchIcon, telegram: TelegramIcon,
  facebook: FacebookIcon, linkedin: LinkedInIcon, pinterest: PinterestIcon,
  threads: ThreadsIcon, kwai: KwaiIcon, website: Globe,
  shop: ShoppingBag, link: Link2,
};
const getIcon = (val: string) => ICON_MAP[val] || Link2;

/* ─── Mock data ─────────────────────────────────────────────────── */
const MOCK_PROFILES: Record<string, ProfileData> = {
  demo: {
    username: "demo",
    displayName: "Ana Beatriz",
    bio: "Criadora de conteúdo ✨ | Cursos de design e marketing digital | Ajudo criadores a monetizar",
    avatar: "https://i.pravatar.cc/200?img=47",
    theme: "dark-purple",
    whatsapp: "5511999999999",
    stats: [
      { label: "Seguidores", value: "18k" },
      { label: "Produtos",   value: "4"   },
      { label: "Avaliação",  value: "5.0" },
    ],
    products: [
      {
        id: "p1",
        title: "Curso de Design para Criadores",
        description: "Do zero ao profissional em 30 dias",
        price: "R$ 97",
        originalPrice: "R$ 197",
        emoji: "🎨",
        url: "https://exemplo.com",
        badge: "Mais vendido",
        urgency: true,
      },
      {
        id: "p2",
        title: "Ebook: Guia do Criador",
        description: "100 páginas com estratégias reais",
        price: "R$ 29",
        emoji: "📘",
        url: "https://exemplo.com",
      },
      {
        id: "p3",
        title: "Mentoria 1:1",
        description: "1 hora para transformar seu negócio",
        price: "R$ 350",
        emoji: "🎯",
        url: "https://exemplo.com",
        badge: "Só 2 vagas",
        urgency: false,
      },
    ],
    testimonials: [
      {
        name: "Mariana Costa",
        role: "Designer Freelancer",
        text: "O curso mudou minha carreira. Em 3 semanas já estava cobrando o dobro pelos meus projetos.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=12",
      },
      {
        name: "Rafael Souza",
        role: "Criador de Conteúdo",
        text: "Melhor investimento que fiz esse ano. O conteúdo é prático e os resultados vieram rápido.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=33",
      },
      {
        name: "Camila Rocha",
        role: "Empreendedora Digital",
        text: "A mentoria valeu cada centavo. Saí com um plano claro de ação para o meu negócio.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=9",
      },
    ],
    links: [
      { id: "l1", title: "Instagram",   url: "https://instagram.com", icon: "instagram", active: true,  isSocial: true  },
      { id: "l2", title: "YouTube",     url: "https://youtube.com",   icon: "youtube",   active: true,  isSocial: true  },
      { id: "l3", title: "Twitter / X", url: "https://twitter.com",   icon: "twitter",   active: true,  isSocial: true  },
      { id: "l4", title: "Meu Website", url: "https://exemplo.com",   icon: "globe",     active: true,  isSocial: false },
      { id: "l5", title: "Newsletter",  url: "https://exemplo.com",   icon: "link",      active: true,  isSocial: false },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────── */
/*  🔥 SOCIAL PROOF TOAST — nenhum concorrente tem nativo          */
/* ──────────────────────────────────────────────────────────────── */
const PROOF_NAMES = [
  { name: "Juliana S.",  city: "São Paulo" },
  { name: "Pedro M.",    city: "Rio de Janeiro" },
  { name: "Camila R.",   city: "Belo Horizonte" },
  { name: "Lucas T.",    city: "Curitiba" },
  { name: "Aline F.",    city: "Recife" },
  { name: "Rodrigo B.",  city: "Porto Alegre" },
];
const PROOF_TIMES = ["2 min", "5 min", "8 min", "12 min", "17 min", "21 min"];

const SocialProofToast = ({ accent, products }: { accent: string; products?: ProductItem[] }) => {
  const [current, setCurrent] = useState<{ name: string; city: string; product: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Use real product names from the store, fallback to generic
    const productNames = products && products.length > 0
      ? products.map(p => p.title)
      : ["este produto"];

    let idx = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const show = () => {
      const person = PROOF_NAMES[idx % PROOF_NAMES.length];
      setCurrent({
        ...person,
        product: productNames[idx % productNames.length],
        time: PROOF_TIMES[idx % PROOF_TIMES.length],
      });
      setVisible(true);
      idx++;
      setTimeout(() => setVisible(false), 4000);
    };
    const timer = setTimeout(() => {
      show();
      intervalId = setInterval(show, 9000);
    }, 3500);
    return () => { clearTimeout(timer); clearInterval(intervalId); };
  }, [products]);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-50 max-w-[280px] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.88)",
        transition: "opacity 0.28s ease-out, transform 0.28s ease-out",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-md"
        style={{
          background: "rgba(8,5,18,0.95)",
          border: `1px solid ${accent}35`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `${accent}30`, color: accent }}
          >
            {current.name[0]}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#080512] flex items-center justify-center">
            <Check size={7} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-white text-[12px] font-bold leading-snug truncate">
            {current.name}
          </p>
          <p className="text-[11.5px] font-medium leading-snug mt-0.5 truncate" style={{ color: accent }}>
            comprou {current.product}
          </p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            {current.city} · há {current.time}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  ⏱️ COUNTDOWN de urgência                                        */
/* ──────────────────────────────────────────────────────────────── */
const useCountdown = (initialSeconds: number) => {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const countdownSeed = 5400 + Math.floor((Date.now() / 86400000) % 1 * 3600); // fixed per day session

const CountdownBadge = ({ accent }: { accent: string }) => {
  const time = useCountdown(countdownSeed);
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: "rgba(239,68,68,0.25)", color: "#f87171", border: "1px solid rgba(239,68,68,0.40)" }}
    >
      <Clock size={9} /> {time}
    </span>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  👀 VIEWERS — "X pessoas vendo agora"                           */
/* ──────────────────────────────────────────────────────────────── */
const ViewersBadge = ({ accent }: { accent: string }) => {
  const [count, setCount] = useState(() => 12 + Math.floor(Math.random() * 25));
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => Math.max(5, c + Math.floor(Math.random() * 5) - 2));
    }, 8000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: `${accent}cc` }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
      </span>
      {count} pessoas vendo agora
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  Stagger entrance hook                                           */
/* ──────────────────────────────────────────────────────────────── */
const useStagger = (count: number, baseDelay = 180, step = 70) => {
  const [vis, setVis] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVis(v => { const n = [...v]; n[i] = true; return n; }), baseDelay + i * step);
    });
  }, []);
  return vis;
};

/* ──────────────────────────────────────────────────────────────── */
/*  📹 Mini Video Player (inline product card)                       */
/* ──────────────────────────────────────────────────────────────── */
const MiniVideoPlayer = ({ src, accent }: { src: string; accent: string }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group/vid"
      onClick={() => {
        const vid = document.getElementById("mini-vid-" + src.slice(-8)) as HTMLVideoElement;
        if (vid) { if (vid.paused) { vid.play(); setPlaying(true); } else { vid.pause(); setPlaying(false); } }
      }}>
      <video id={"mini-vid-" + src.slice(-8)} src={src} className="w-full h-full object-cover" muted playsInline loop
        onEnded={() => setPlaying(false)} />
      {!playing && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ background: `${accent}40`, border: `2px solid ${accent}80` }}>
            <Play size={18} className="text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  📅 Booking Modal                                                 */
/* ──────────────────────────────────────────────────────────────── */
const WEEKDAY_MAP: Record<number, string> = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const generateTimeSlots = (start: string, end: string, durationMin: number): string[] => {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins + durationMin <= endMins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    mins += durationMin;
  }
  return slots;
};

interface BookingModalProps {
  product: ProductItem;
  whatsapp: string;
  accent: string;
  accent2: string;
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  onClose: () => void;
}

const BookingModal = ({ product, whatsapp, accent, accent2, bg, card, text, sub, border, onClose }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = viewMonth.getDay();
  const availableDays = product.bookingDays || ["seg", "ter", "qua", "qui", "sex"];
  const duration = product.bookingDuration || 60;
  const slots = generateTimeSlots(product.bookingStart || "09:00", product.bookingEnd || "18:00", duration);

  const isDayAvailable = (date: Date) => {
    if (date < today) return false;
    const dayKey = WEEKDAY_MAP[date.getDay()];
    return availableDays.includes(dayKey);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const dateStr = `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;
    const durationLabel = duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 ? duration % 60 + "min" : ""}` : `${duration}min`;
    const channel = product.bookingChannel || "whatsapp";

    if (channel === "google") {
      // Create Google Calendar event URL
      const [h, m] = selectedTime.split(":").map(Number);
      const startDt = new Date(selectedDate);
      startDt.setHours(h, m, 0);
      const endDt = new Date(startDt.getTime() + duration * 60000);
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(product.title)}&dates=${fmt(startDt)}/${fmt(endDt)}&details=${encodeURIComponent(`Agendado via Maview${product.price ? ` — ${product.price}` : ""}`)}`;
      window.open(gcalUrl, "_blank");
      // Also send WhatsApp if configured
      if (whatsapp) {
        const msg = `Olá! Agendei via Google Calendar:\n\n📋 *${product.title}*\n📅 ${dateStr} às ${selectedTime}\n⏱️ Duração: ${durationLabel}${product.price ? `\n💰 ${product.price}` : ""}\n\nConfirmado no calendário!`;
        const phone = whatsapp.replace(/\D/g, "");
        setTimeout(() => window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank"), 500);
      }
    } else {
      // WhatsApp (default)
      const msg = `Olá! Gostaria de agendar:\n\n📋 *${product.title}*\n📅 ${dateStr} às ${selectedTime}\n⏱️ Duração: ${durationLabel}${product.price ? `\n💰 ${product.price}` : ""}\n\nPodemos confirmar?`;
      const phone = whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[380px] rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{ background: card, border: `1px solid ${border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: text }}>Agendar</h3>
            <p className="text-[12px] mt-0.5" style={{ color: sub }}>{product.title}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ background: `${accent}18` }}>
            <X size={14} style={{ color: accent }} />
          </button>
        </div>

        {/* Calendar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMonthOffset(o => Math.max(0, o - 1))}
              disabled={monthOffset === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: `${accent}18` }}>
              <ChevronLeft size={14} style={{ color: accent }} />
            </button>
            <span className="text-[13px] font-bold" style={{ color: text }}>
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button onClick={() => setMonthOffset(o => Math.min(2, o + 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: `${accent}18` }}>
              <ChevronRight size={14} style={{ color: accent }} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold py-1" style={{ color: sub }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1);
              const available = isDayAvailable(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button key={i}
                  onClick={() => { if (available) { setSelectedDate(date); setSelectedTime(null); } }}
                  disabled={!available}
                  className={`w-full aspect-square rounded-lg text-[12px] font-semibold transition-all ${
                    isSelected ? "scale-110" : available ? "hover:scale-105" : "opacity-40 cursor-not-allowed"
                  }`}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, ${accent}, ${accent2})` : available ? `${accent}12` : "transparent",
                    color: isSelected ? "#fff" : text,
                    border: isSelected ? "none" : `1px solid ${available ? `${accent}20` : "transparent"}`,
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="px-5 pb-4 animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[11px] font-bold mb-2" style={{ color: sub }}>
              Horários disponíveis — {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
            </p>
            <div className="flex gap-1.5 flex-wrap max-h-[120px] overflow-y-auto scrollbar-none">
              {slots.map(slot => {
                const isSel = selectedTime === slot;
                return (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${isSel ? "scale-105" : "hover:scale-105"}`}
                    style={{
                      background: isSel ? `linear-gradient(135deg, ${accent}, ${accent2})` : `${accent}12`,
                      color: isSel ? "#fff" : text,
                      border: `1px solid ${isSel ? accent : `${accent}20`}`,
                    }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm */}
        <div className="px-5 pb-5 pt-2">
          <button onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: selectedDate && selectedTime
                ? `linear-gradient(135deg, ${accent}, ${accent2})`
                : `${accent}30`,
              boxShadow: selectedDate && selectedTime ? `0 8px 24px ${accent}40` : "none",
            }}>
            <Calendar size={15} />
            {selectedDate && selectedTime
              ? `Confirmar ${selectedTime} — ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`
              : "Selecione data e horário"
            }
          </button>
          {product.price && (
            <p className="text-center text-[11px] mt-2 font-semibold" style={{ color: accent }}>
              {product.price} · {duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 || ""}` : `${duration}min`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  Main ProfilePage                                                */
/* ──────────────────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [heroVis, setHeroVis]   = useState(false);
  const [bookingProduct, setBookingProduct] = useState<ProductItem | null>(null);

  const productStagger     = useStagger(10, 220, 80);
  const linkStagger        = useStagger(10, 380, 55);
  const testimonialStagger = useStagger(10, 520, 90);

  useEffect(() => {
    setTimeout(() => {
      // strip @ prefix if present (e.g. "@fzandre" → "fzandre")
      const slug = (username?.toLowerCase() || "").replace(/^@/, "");

      // 1️⃣ Try localStorage config saved by DashboardPagina
      try {
        const stored = localStorage.getItem("maview_vitrine_config");
        if (stored) {
          const cfg = JSON.parse(stored);
          // Normalize both sides: strip @ and lowercase
          const cfgSlug = (cfg.username || "").toLowerCase().replace(/^@/, "");
          // match by username OR show owner's own profile
          if (cfgSlug && (cfgSlug === slug || slug === "demo")) {
            // Migrate imageUrl → images for products
            const migratedProducts = (cfg.products || []).map((p: any) => {
              if (!p.images && p.imageUrl) return { ...p, images: [p.imageUrl] };
              if (!p.images) return { ...p, images: [] };
              return p;
            });
            const lsProfile: ProfileData = {
              username: cfg.username?.replace(/^@/, "") || cfg.username,
              displayName: cfg.displayName || cfg.username,
              bio: cfg.bio || "",
              avatar: cfg.avatarUrl || undefined,
              theme: cfg.theme || "dark-purple",
              design: cfg.design || undefined,
              whatsapp: cfg.whatsapp || undefined,
              products: migratedProducts.filter((p: any) => p.active),
              links: (cfg.links || []).filter((l: any) => l.active),
              testimonials: cfg.testimonials || [],
              stats: undefined,
            };
            setProfile(lsProfile);
            setTimeout(() => setHeroVis(true), 80);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fallback to mock
      }

      // 2️⃣ Fallback: mock profiles (demo page)
      const found = MOCK_PROFILES[slug];
      if (found) {
        setProfile(found);
        setTimeout(() => setHeroVis(true), 80);
      } else {
        // 3️⃣ Always show a minimal page with the username — never leave blank
        const minimalProfile: ProfileData = {
          username: slug,
          displayName: slug,
          bio: "",
          theme: "dark-purple",
          links: [],
          products: [],
          testimonials: [],
        };
        setProfile(minimalProfile);
        setTimeout(() => setHeroVis(true), 80);
      }
      setLoading(false);
    }, 320);
  }, [username]);

  /* Resolve design early (before returns) so hooks are stable */
  const baseTheme = profile ? (THEMES[profile.theme] || THEMES["dark-purple"]) : THEMES["dark-purple"];
  const rd = resolveDesign(baseTheme, profile?.design);

  /* Load Google Fonts — must be before early returns */
  useEffect(() => {
    loadGoogleFont(rd.fontHeading);
    loadGoogleFont(rd.fontBody);
  }, [rd.fontHeading, rd.fontBody]);

  /* Dynamic SEO meta tags — updates browser tab + OG tags */
  useEffect(() => {
    if (!profile) return;
    const name = profile.displayName || profile.username;
    const desc = profile.bio || `Vitrine digital de ${name}`;
    document.title = `${name} | Maview`;
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', "content", `${name} | Maview`);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[name="twitter:title"]', "content", `${name} | Maview`);
    setMeta('meta[name="twitter:description"]', "content", desc);
    if (profile.avatar) {
      setMeta('meta[property="og:image"]', "content", profile.avatar);
      setMeta('meta[name="twitter:image"]', "content", profile.avatar);
    }
    return () => { document.title = "Maview — Sua vitrine digital"; };
  }, [profile]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: profile?.displayName, url }); }
      else { await navigator.clipboard.writeText(url); setCopied(true); setCopyToastVisible(true); setTimeout(() => { setCopied(false); setCopyToastVisible(false); }, 2500); }
    } catch { /* user cancelled or clipboard failed */ }
  };

  /* Loading */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080612" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-violet-400 rounded-full animate-spin" />
        <p className="text-white/30 text-xs font-medium">Carregando vitrine…</p>
      </div>
    </div>
  );

  /* Not found */
  if (notFound || !profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080612" }}>
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
      <img src={logoSrc} alt="Maview" className="w-12 h-12 object-contain mb-5 opacity-80" />
      <h1 className="text-white text-2xl font-bold mb-2">Perfil não encontrado</h1>
      <p className="text-white/40 text-sm mb-8">O link <span className="text-violet-400 font-mono">/{username}</span> não existe ainda.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
        <Sparkles size={14} /> Criar minha vitrine grátis
      </Link>
    </div>
  );

  // `rd` and `baseTheme` already computed above early returns
  const t = { bg: rd.bg, accent: rd.accent, accent2: rd.accent2, card: rd.card, text: rd.text, sub: rd.sub, border: rd.border };
  const socialLinks  = profile.links.filter(l => l.active && l.isSocial);
  const regularLinks = profile.links.filter(l => l.active && !l.isSocial);

  /* Hover helpers */
  const onHoverIn  = (el: HTMLElement) => { el.style.borderColor = `${t.accent}55`; el.style.boxShadow = `0 8px 32px ${t.accent}18`; };
  const onHoverOut = (el: HTMLElement) => { el.style.borderColor = t.border; el.style.boxShadow = "none"; };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ ...bgCss(rd), fontFamily: `'${rd.fontBody}', sans-serif` }}>

      {/* ── BG layers: video / image / pattern / overlay ── */}
      {rd.bgType === "video" && rd.bgVideoUrl && (
        <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ filter: rd.bgBlur ? `blur(${rd.bgBlur}px)` : undefined }} src={rd.bgVideoUrl} />
      )}
      {rd.bgType === "image" && rd.bgImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: `url(${rd.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: rd.bgBlur ? `blur(${rd.bgBlur}px)` : undefined }} />
      )}
      {rd.bgType === "pattern" && rd.bgPattern && BG_PATTERNS[rd.bgPattern] && (
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: BG_PATTERNS[rd.bgPattern], backgroundRepeat: "repeat" }} />
      )}
      {/* Effect layer (21st.dev animated backgrounds) */}
      {rd.bgType === "effect" && rd.bgEffect && (
        <EffectLayer effectId={rd.bgEffect} accent={rd.accent} accent2={rd.accent2} />
      )}
      {/* Overlay (for image/video/pattern/effect) */}
      {(rd.bgType === "image" || rd.bgType === "video" || rd.bgType === "pattern" || rd.bgType === "effect") && rd.bgOverlay > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ background: `rgba(0,0,0,${rd.bgOverlay / 100})` }} />
      )}

      {/* ── Ambient BG glow — subtle, only on solid bg ── */}
      {rd.bgType === "solid" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]" aria-hidden>
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px] opacity-10" style={{ background: t.accent }} />
        </div>
      )}

      {/* Social Proof Toast — disabled (too intrusive) */}

      {/* Copy toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${copyToastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
        style={{ background: t.accent, color: "#fff" }}>
        <Check size={14} />
        <span className="text-[13px] font-semibold">Link copiado!</span>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-28 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* ── HERO ── */}
          <div className="flex flex-col items-center mb-7 transition-all duration-500" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? "translateY(0)" : "translateY(12px)" }}>
            {/* Avatar */}
            <div className="relative mb-4">
              {rd.profileBorder && (
                <div className="absolute inset-[-3px] opacity-30 blur-[10px]"
                  style={{
                    background: rd.profileBorderColor || t.accent,
                    borderRadius: profileBorderRadius(rd.profileShape),
                    clipPath: profileClip(rd.profileShape),
                  }} />
              )}
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.displayName}
                    className="relative object-cover z-10"
                    style={{
                      width: rd.profileSize, height: rd.profileSize,
                      borderRadius: profileBorderRadius(rd.profileShape),
                      clipPath: profileClip(rd.profileShape),
                      border: rd.profileBorder ? `2px solid ${rd.profileBorderColor}50` : "none",
                    }} />
                : <div className="relative z-10 flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      width: rd.profileSize, height: rd.profileSize,
                      borderRadius: profileBorderRadius(rd.profileShape),
                      clipPath: profileClip(rd.profileShape),
                      background: t.accent,
                    }}>{(profile.displayName || "?")[0]}</div>
              }
            </div>

            <h1 className="text-[22px] font-extrabold mb-1 text-center tracking-tight" style={{ color: t.text, fontFamily: `'${rd.fontHeading}', sans-serif` }}>{profile.displayName}</h1>
            <p className="text-[13px] font-semibold mb-2" style={{ color: t.accent }}>@{profile.username}</p>
            {profile.bio && <p className="text-[14px] text-center leading-relaxed max-w-[300px] mb-3 line-clamp-3" style={{ color: t.sub, fontFamily: `'${rd.fontBody}', sans-serif` }}>{profile.bio}</p>}

            {/* Viewers badge — social proof */}
            <div className="mb-4">
              <ViewersBadge accent={t.accent} />
            </div>

            {/* Stats */}
            {profile.stats && (
              <div className="flex items-center gap-5 mb-4">
                {profile.stats.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-base font-bold" style={{ color: t.text }}>{value}</span>
                    <span className="text-[10px] font-medium mt-0.5" style={{ color: t.sub }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social + Share */}
            <div className="flex items-center gap-3">
              {socialLinks.length > 0
                ? socialLinks.map(link => {
                    const Icon = getIcon(link.icon);
                    return (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                        style={{ background: `${t.accent}18`, border: `1.5px solid ${t.accent}30` }} title={link.title}>
                        <Icon size={18} style={{ color: t.text }} />
                      </a>
                    );
                  })
                : /* Placeholder social icons when none configured */
                  [
                    { key: "ig", icon: <Instagram size={17} /> },
                    { key: "x", icon: <Twitter size={17} /> },
                    { key: "yt", icon: <Youtube size={17} /> },
                  ].map(s => (
                    <div key={s.key}
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: `${t.accent}12`, border: `1.5px solid ${t.accent}20`, color: `${t.accent}40` }}>
                      {s.icon}
                    </div>
                  ))
              }
              <button onClick={handleShare}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                style={{ background: `${t.accent}18`, border: `1.5px solid ${t.accent}30` }}>
                {copied ? <Check size={17} style={{ color: "#22c55e" }} /> : <Share2 size={17} style={{ color: t.text }} />}
              </button>
            </div>
          </div>

          {/* ── PRODUTOS ── */}
          {profile.products.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={14} style={{ color: t.text, opacity: 0.7 }} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Produtos</span>
              </div>
              <div className="space-y-3">
                {profile.products.map((product, i) => {
                  const isWhatsApp = product.linkType === "whatsapp";
                  const isBooking = product.linkType === "booking";
                  const isNone = product.linkType === "none";
                  const productHref = isWhatsApp && product.url
                    ? `https://wa.me/55${product.url}${product.whatsappMsg ? `?text=${encodeURIComponent(product.whatsappMsg)}` : ""}`
                    : (isNone || isBooking) ? undefined : product.url;
                  const ctaLabel = product.ctaText || (isBooking ? "Agendar" : isWhatsApp ? "WhatsApp" : product.price ? "Comprar" : "Ver mais");
                  const coverImg = product.images?.[0] || product.imageUrl;
                  const hasVideo = !!product.video;

                  // Booking: calendly/external → direct link; whatsapp/google → modal
                  const bookingChannel = product.bookingChannel || "whatsapp";
                  const bookingUsesModal = isBooking && (bookingChannel === "whatsapp" || bookingChannel === "google");
                  const bookingDirectUrl = isBooking && (bookingChannel === "calendly" || bookingChannel === "external") ? product.bookingUrl : undefined;

                  const handleClick = bookingUsesModal
                    ? (e: React.MouseEvent) => { e.preventDefault(); setBookingProduct(product); }
                    : undefined;

                  const Wrapper = (isNone && !isBooking) ? "div"
                    : bookingUsesModal ? "button"
                    : bookingDirectUrl ? "a"
                    : isBooking ? "div" : "a";
                  const wrapperProps = bookingUsesModal
                    ? { onClick: handleClick }
                    : bookingDirectUrl
                      ? { href: bookingDirectUrl, target: "_blank", rel: "noopener noreferrer" }
                    : isNone
                      ? {}
                      : { href: productHref, target: "_blank", rel: "noopener noreferrer" };

                  return (
                    <div key={product.id}
                      className="overflow-hidden"
                      style={{
                        ...buttonStyles(rd),
                        opacity: productStagger[i] ? 1 : 0,
                        transform: productStagger[i] ? "translateY(0)" : "translateY(8px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                      }}
                      onMouseEnter={(e: React.MouseEvent) => onHoverIn(e.currentTarget as HTMLElement)}
                      onMouseLeave={(e: React.MouseEvent) => onHoverOut(e.currentTarget as HTMLElement)}
                    >
                      {/* Mini video (if product has video) */}
                      {hasVideo && (
                        <div className="px-3 pt-3">
                          <MiniVideoPlayer src={product.video!} accent={t.accent} />
                        </div>
                      )}

                      {/* Card body */}
                      <Wrapper {...(wrapperProps as any)}
                        className={`group flex items-center gap-4 w-full px-4 py-3.5 transition-all duration-200 active:scale-[0.97] ${isBooking ? "cursor-pointer text-left" : ""}`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${t.accent}12` }}>
                          {coverImg
                            ? <img src={coverImg} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                            : product.emoji
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-[15px] font-bold leading-snug line-clamp-2" style={{ color: t.text, fontFamily: `'${rd.fontHeading}', sans-serif` }}>{product.title}</p>
                            {/* Auto "Mais vendido" badge on first product */}
                            {i === 0 && profile.products.length > 1 && !product.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5"
                                style={{ background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                                <Flame size={8} /> Mais vendido
                              </span>
                            )}
                            {product.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                                {product.badge}
                              </span>
                            )}
                            {isBooking && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: "rgba(34,197,94,0.20)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}>
                                Agenda online
                              </span>
                            )}
                            {product.urgency && <CountdownBadge accent={t.accent} />}
                          </div>
                          {product.description && <p className="text-[12px] truncate" style={{ color: t.sub }}>{product.description}</p>}
                          {product.price && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[13px] font-bold" style={{ color: t.accent }}>{product.price}</span>
                              {product.originalPrice && <span className="text-[11px] line-through" style={{ color: t.sub }}>{product.originalPrice}</span>}
                            </div>
                          )}
                          {isBooking && (
                            <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: t.sub }}>
                              <Clock size={9} /> {(product.bookingDuration || 60) >= 60 ? `${Math.floor((product.bookingDuration || 60) / 60)}h${(product.bookingDuration || 60) % 60 || ""}` : `${product.bookingDuration}min`}
                              {" · "}
                              {(product.bookingDays || []).length} dias/semana
                            </p>
                          )}
                        </div>
                        {!isNone && (
                          <div className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-lg transition-colors duration-150"
                            style={{
                              borderRadius: buttonBorderRadius(rd.buttonShape, rd.buttonRadius),
                              background: isWhatsApp ? "#25d366" : t.accent,
                              color: "#fff",
                            }}>
                            {isBooking ? <Calendar size={11} /> : isWhatsApp ? <MessageCircle size={11} /> : <ShoppingCart size={11} />} {ctaLabel}
                          </div>
                        )}
                      </Wrapper>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Depoimentos */}
          {profile.testimonials && profile.testimonials.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Depoimentos</span>
              </div>
              <div className="space-y-2.5">
                {profile.testimonials.map((item, i) => (
                  <div key={i}
                    className="px-4 py-4"
                    style={{
                      ...buttonStyles(rd),
                      opacity: testimonialStagger[i] ? 1 : 0,
                      transform: testimonialStagger[i] ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: item.stars }).map((_, s) => (
                        <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-[14px] leading-relaxed mb-3 italic" style={{ color: t.sub }}>
                      "{item.text}"
                    </p>
                    {/* Screenshot do depoimento real */}
                    {item.screenshotUrl && (
                      <img src={item.screenshotUrl} alt="Print do depoimento"
                        className="w-full rounded-lg mb-3 object-contain max-h-48 border border-white/10" loading="lazy" />
                    )}
                    {/* Author */}
                    <div className="flex items-center gap-2.5">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: t.accent }}>
                          {item.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold leading-none" style={{ color: t.text }}>{item.name}</p>
                        {item.role && <p className="text-[11px] mt-0.5" style={{ color: t.sub }}>{item.role}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── LINKS ── */}
          {regularLinks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={14} style={{ color: t.text, opacity: 0.7 }} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Links</span>
              </div>
              <div className="space-y-2">
                {regularLinks.map((link, i) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 w-full px-4 py-4 font-semibold text-[14px] active:scale-[0.98]"
                      style={{
                        ...buttonStyles(rd), color: t.text,
                        opacity: linkStagger[i] ? 1 : 0,
                        transform: linkStagger[i] ? "translateY(0)" : "translateY(6px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                      }}
                      onMouseEnter={e => onHoverIn(e.currentTarget as HTMLElement)}
                      onMouseLeave={e => onHoverOut(e.currentTarget as HTMLElement)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.accent}18` }}>
                        <Icon size={15} style={{ color: t.accent }} />
                      </div>
                      <span className="flex-1 truncate">{link.title}</span>
                      <ArrowRight size={14} style={{ color: t.sub, opacity: 0.75 }} className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 💬 WhatsApp sticky button — enorme no Brasil */}
      {profile.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[72px] right-4 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 group"
          style={{
            background: "#25d366",
            boxShadow: "0 6px 24px rgba(37,211,102,0.40), 0 0 0 3px rgba(37,211,102,0.15)",
            color: "#fff",
          }}
        >
          <span className="relative">
            <MessageCircle size={18} className="fill-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-ping" />
          </span>
          <span className="text-[13px] font-bold">Falar agora</span>
        </a>
      )}

      {/* 📅 Booking Modal */}
      {bookingProduct && profile.whatsapp && (
        <BookingModal
          product={bookingProduct}
          whatsapp={profile.whatsapp}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setBookingProduct(null)}
        />
      )}
      {/* Booking fallback: no whatsapp set — use product.url as whatsapp */}
      {bookingProduct && !profile.whatsapp && bookingProduct.url && (
        <BookingModal
          product={bookingProduct}
          whatsapp={bookingProduct.url}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setBookingProduct(null)}
        />
      )}

      {/* ── Footer ── */}
      {!rd.hideWatermark && (
        <footer className="relative z-10 flex justify-center pb-6">
          <Link to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-opacity duration-150 hover:opacity-80"
            style={{ background: t.card, border: `1px solid ${t.border}` }}
          >
            <img src={logoSrc} alt="Maview" className="w-3.5 h-3.5 object-contain opacity-85" />
            <span className="text-[10px] font-medium" style={{ color: t.sub }}>
              maview.app
            </span>
          </Link>
        </footer>
      )}
    </div>
  );
};

export default ProfilePage;
