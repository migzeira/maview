import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check, ChevronDown, Palette, Image, Video, Type, Square, Circle,
  Sparkles, Eye, Sliders, Upload, X, Play, Globe, Zap, Hexagon,
  PaintBucket, Droplets, Sun, Moon, Layers, Grid3X3, Wand2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   Types — must match DashboardPagina.tsx exactly
   ═══════════════════════════════════════════════════════════════════ */
type ThemeId = string;
type BgType = "solid" | "gradient" | "image" | "video" | "pattern";
type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
type ButtonShape = "rounded" | "pill" | "square" | "soft";
type ButtonFill = "solid" | "outline" | "glass" | "ghost";
type ButtonShadow = "none" | "sm" | "md" | "glow";
type ProfileShape = "circle" | "rounded" | "square" | "hexagon";

interface DesignConfig {
  bgType: BgType;
  bgColor: string;
  bgGradient: [string, string];
  bgGradientDir: GradientDir;
  bgImageUrl: string;
  bgVideoUrl: string;
  bgPattern: string;
  bgOverlay: number;
  bgBlur: number;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  accentColor2: string;
  fontHeading: string;
  fontBody: string;
  buttonShape: ButtonShape;
  buttonFill: ButtonFill;
  buttonShadow: ButtonShadow;
  buttonRadius: number;
  profileShape: ProfileShape;
  profileBorder: boolean;
  profileBorderColor: string;
  profileSize: number;
  hideWatermark: boolean;
}

interface ThemeDef {
  id: ThemeId;
  label: string;
  bg: string;
  accent: string;
  accent2: string;
}

interface DesignTabProps {
  config: {
    theme: ThemeId;
    design?: Partial<DesignConfig>;
    avatarUrl: string;
    displayName: string;
  };
  themes: ThemeDef[];
  defaultDesign: DesignConfig;
  updateConfig: (key: string, value: any) => void;
  highlightField?: string | null;
  themeGridRef?: React.RefObject<HTMLDivElement>;
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */
const BG_PATTERNS: { id: string; label: string }[] = [
  { id: "dots", label: "Pontos" },
  { id: "grid", label: "Grade" },
  { id: "diagonal", label: "Diagonal" },
  { id: "waves", label: "Ondas" },
  { id: "cross", label: "Cruz" },
  { id: "hexagon", label: "Hexágono" },
  { id: "noise", label: "Textura" },
];

const GOOGLE_FONTS = [
  { name: "Inter", category: "sans" },
  { name: "Poppins", category: "sans" },
  { name: "Montserrat", category: "sans" },
  { name: "Outfit", category: "sans" },
  { name: "DM Sans", category: "sans" },
  { name: "Space Grotesk", category: "sans" },
  { name: "Nunito", category: "sans" },
  { name: "Rubik", category: "sans" },
  { name: "Manrope", category: "sans" },
  { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Urbanist", category: "sans" },
  { name: "Sora", category: "sans" },
  { name: "Playfair Display", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "Bebas Neue", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Pacifico", category: "handwriting" },
  { name: "Satisfy", category: "handwriting" },
  { name: "Dancing Script", category: "handwriting" },
  { name: "JetBrains Mono", category: "mono" },
  { name: "Fira Code", category: "mono" },
];

const GRADIENT_PRESETS: [string, string][] = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#ffecd2", "#fcb69f"],
  ["#ff9a9e", "#fecfef"],
  ["#a1c4fd", "#c2e9fb"],
  ["#d4fc79", "#96e6a1"],
  ["#f6d365", "#fda085"],
  ["#89f7fe", "#66a6ff"],
  ["#c471f5", "#fa71cd"],
  ["#48c6ef", "#6f86d6"],
  ["#feada6", "#f5efef"],
  ["#e0c3fc", "#8ec5fc"],
];

const SOLID_COLORS: string[] = [
  "#080612", "#05080f", "#050f05", "#100509", "#0f0a00", "#020c14",
  "#0a0010", "#0c0a14", "#021a0f", "#120508", "#0c0a04", "#0c0e12",
  "#111111", "#1a1a2e", "#16213e", "#0f3460", "#1b1b2f", "#162447",
  "#1f1f38", "#2d132c", "#1a1a1a", "#2c2c2c", "#0d1b2a", "#1b263b",
];

const ACCENT_COLORS: string[] = [
  "#a855f7", "#ec4899", "#60a5fa", "#4ade80", "#f43f5e", "#06b6d4",
  "#f59e0b", "#10b981", "#6366f1", "#f97316", "#14b8a6", "#8b5cf6",
  "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#84cc16", "#e11d48",
  "#dc2626", "#c084fc", "#38bdf8", "#fb923c", "#94a3b8", "#be185d",
];

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

// Extract dominant color from image using canvas
function extractColorsFromImage(imgSrc: string): Promise<{ dominant: string; accent: string }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Simple color quantization
      const colorCounts: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        if (data[i + 3] < 128) continue; // skip transparent
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      const toHex = (s: string) => {
        const [r, g, b] = s.split(",").map(Number);
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      };

      const dominant = sorted[0] ? toHex(sorted[0][0]) : "#a855f7";
      const accent = sorted[1] ? toHex(sorted[1][0]) : "#ec4899";
      resolve({ dominant, accent });
    };
    img.onerror = () => resolve({ dominant: "#a855f7", accent: "#ec4899" });
    img.src = imgSrc;
  });
}

// Load Google Font
function loadFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════ */

function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative w-8 h-8 rounded-lg overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all flex-shrink-0">
        <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        <div className="w-full h-full" style={{ background: value || "#000" }} />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">{label}</p>
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="w-full text-[11px] font-mono bg-transparent text-[hsl(var(--dash-text-muted))] border-none outline-none p-0 uppercase" />
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 overflow-hidden shadow-sm">
      <summary className="flex items-center gap-2 p-4 cursor-pointer select-none hover:bg-[hsl(var(--dash-accent))]/30 transition-colors">
        <span className="text-primary">{icon}</span>
        <span className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex-1">{title}</span>
        <ChevronDown size={14} className="text-[hsl(var(--dash-text-subtle))] group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--dash-border-subtle))]">
        {children}
      </div>
    </details>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main DesignTab component
   ═══════════════════════════════════════════════════════════════════ */
export default function DesignTab({ config, themes, defaultDesign, updateConfig, highlightField, themeGridRef }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design };
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];
  const [fontFilter, setFontFilter] = useState<string>("all");
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  // Update design sub-config
  const setDesign = useCallback((key: keyof DesignConfig, value: any) => {
    const prev = config.design || {};
    updateConfig("design", { ...prev, [key]: value });
  }, [config.design, updateConfig]);

  // Load fonts on mount/change
  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  // Auto-theme from avatar
  const autoThemeFromAvatar = useCallback(async () => {
    if (!config.avatarUrl) return;
    const colors = await extractColorsFromImage(config.avatarUrl);
    // Darken dominant for background
    const darken = (hex: string) => {
      const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * 0.15) | 0;
      const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * 0.15) | 0;
      const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * 0.15) | 0;
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };
    updateConfig("theme", "custom");
    setDesign("bgColor", darken(colors.dominant));
    setDesign("accentColor", colors.dominant);
    setDesign("accentColor2", colors.accent);
  }, [config.avatarUrl, updateConfig, setDesign]);

  return (
    <div className="space-y-5 pb-24">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-center justify-between">
        <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Visual da Vitrine</h2>
        {config.avatarUrl && (
          <button onClick={autoThemeFromAvatar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-fuchsia-500 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/15 transition-all">
            <Wand2 size={11} /> Auto-tema da foto
          </button>
        )}
      </div>

      {/* ═══════════ SECTION 1: Theme Presets ═══════════ */}
      <SectionCard title="Temas prontos" icon={<Palette size={14} />}>
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] pt-2 -mb-1">
          Escolha um tema base — depois personalize cada detalhe abaixo
        </p>
        <div ref={themeGridRef} className={`grid grid-cols-3 gap-2 pt-2 rounded-xl transition-all duration-300 ${
          highlightField === "theme" ? "ring-2 ring-primary p-1 shadow-[0_0_18px_rgba(139,92,246,0.45)]" : ""
        }`}>
          {themes.filter(t => t.id !== "custom").map(theme => {
            const isActive = config.theme === theme.id;
            return (
              <button key={theme.id} onClick={() => updateConfig("theme", theme.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  isActive ? "border-primary shadow-lg scale-[1.02]" : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:scale-[1.01]"
                }`}>
                <div className="h-[60px] p-2 flex flex-col items-center justify-center gap-1"
                  style={{ background: `linear-gradient(160deg, ${theme.bg} 60%, ${theme.accent}20)` }}>
                  <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }} />
                  <div className="w-10 h-1 rounded" style={{ background: theme.accent + "30" }} />
                </div>
                <div className={`px-1.5 py-1 text-center ${isActive ? "bg-primary/10" : "bg-[hsl(var(--dash-surface-2))]"}`}>
                  <p className={`text-[9px] font-medium truncate ${isActive ? "text-primary" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                    {theme.label}
                  </p>
                </div>
                {isActive && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={8} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 2: Background ═══════════ */}
      <SectionCard title="Fundo" icon={<Layers size={14} />}>
        {/* BG Type selector */}
        <div className="flex gap-1.5 pt-2">
          {([
            { type: "solid" as BgType, icon: <PaintBucket size={12} />, label: "Cor" },
            { type: "gradient" as BgType, icon: <Droplets size={12} />, label: "Degradê" },
            { type: "image" as BgType, icon: <Image size={12} />, label: "Imagem" },
            { type: "video" as BgType, icon: <Video size={12} />, label: "Vídeo" },
            { type: "pattern" as BgType, icon: <Grid3X3 size={12} />, label: "Padrão" },
          ]).map(({ type, icon, label }) => (
            <button key={type} onClick={() => setDesign("bgType", type)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-all ${
                d.bgType === type
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
              }`}>
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* BG Type: Solid */}
        {d.bgType === "solid" && (
          <div className="space-y-3">
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor de fundo" />
            <div className="grid grid-cols-8 gap-1.5">
              {SOLID_COLORS.map(c => (
                <button key={c} onClick={() => { setDesign("bgColor", c); updateConfig("theme", "custom"); }}
                  className={`w-full aspect-square rounded-lg ring-1 transition-all hover:scale-110 ${
                    (d.bgColor || currentTheme.bg) === c ? "ring-2 ring-primary scale-110" : "ring-white/10"
                  }`} style={{ background: c }} />
              ))}
            </div>
          </div>
        )}

        {/* BG Type: Gradient */}
        {d.bgType === "gradient" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker value={d.bgGradient[0]} onChange={v => { setDesign("bgGradient", [v, d.bgGradient[1]]); updateConfig("theme", "custom"); }} label="Cor 1" />
              <ColorPicker value={d.bgGradient[1]} onChange={v => { setDesign("bgGradient", [d.bgGradient[0], v]); updateConfig("theme", "custom"); }} label="Cor 2" />
            </div>
            {/* Direction */}
            <div>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Direção</p>
              <div className="grid grid-cols-5 gap-1">
                {(["to-b", "to-r", "to-br", "to-tl", "radial"] as GradientDir[]).map(dir => (
                  <button key={dir} onClick={() => setDesign("bgGradientDir", dir)}
                    className={`p-2 rounded-lg text-[9px] font-medium transition-all ${
                      d.bgGradientDir === dir ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-subtle))] border border-transparent"
                    }`}>
                    {dir === "to-b" ? "↓" : dir === "to-r" ? "→" : dir === "to-br" ? "↘" : dir === "to-tl" ? "↖" : "◎"}
                  </button>
                ))}
              </div>
            </div>
            {/* Gradient presets */}
            <div>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Presets</p>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map(([c1, c2], i) => (
                  <button key={i} onClick={() => { setDesign("bgGradient", [c1, c2]); updateConfig("theme", "custom"); }}
                    className="h-8 rounded-lg ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 transition-all"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BG Type: Image */}
        {d.bgType === "image" && (
          <div className="space-y-3">
            {d.bgImageUrl ? (
              <div className="relative rounded-xl overflow-hidden h-32">
                <img src={d.bgImageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setDesign("bgImageUrl", "")}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => bgImageInputRef.current?.click()}
                className="w-full h-28 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-2 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
                <Upload size={20} />
                <span className="text-[11px] font-medium">Enviar imagem de fundo</span>
                <span className="text-[9px]">JPG, PNG ou WebP</span>
              </button>
            )}
            <input type="file" ref={bgImageInputRef} accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setDesign("bgImageUrl", reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
            <input type="url" className={inputCls} placeholder="Ou cole uma URL de imagem..."
              value={d.bgImageUrl.startsWith("data:") ? "" : d.bgImageUrl}
              onChange={e => setDesign("bgImageUrl", e.target.value)} />

            {/* Overlay */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Escurecimento</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.bgOverlay}%</span>
              </div>
              <input type="range" min={0} max={90} value={d.bgOverlay} onChange={e => setDesign("bgOverlay", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
            {/* Blur */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Desfoque</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.bgBlur}px</span>
              </div>
              <input type="range" min={0} max={20} value={d.bgBlur} onChange={e => setDesign("bgBlur", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
          </div>
        )}

        {/* BG Type: Video */}
        {d.bgType === "video" && (
          <div className="space-y-3">
            {d.bgVideoUrl ? (
              <div className="relative rounded-xl overflow-hidden h-32">
                <video src={d.bgVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                <button onClick={() => setDesign("bgVideoUrl", "")}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => bgVideoInputRef.current?.click()}
                className="w-full h-28 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-2 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
                <Play size={20} />
                <span className="text-[11px] font-medium">Enviar vídeo de fundo</span>
                <span className="text-[9px]">MP4, WebM (máx 10MB) — loop automático</span>
              </button>
            )}
            <input type="file" ref={bgVideoInputRef} accept="video/mp4,video/webm" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file || file.size > 10 * 1024 * 1024) return;
                const reader = new FileReader();
                reader.onload = () => setDesign("bgVideoUrl", reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
            <input type="url" className={inputCls} placeholder="Ou cole uma URL de vídeo..."
              value={d.bgVideoUrl.startsWith("data:") ? "" : d.bgVideoUrl}
              onChange={e => setDesign("bgVideoUrl", e.target.value)} />

            {/* Overlay + Blur (same as image) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Escurecimento</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.bgOverlay}%</span>
              </div>
              <input type="range" min={0} max={90} value={d.bgOverlay} onChange={e => setDesign("bgOverlay", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
          </div>
        )}

        {/* BG Type: Pattern */}
        {d.bgType === "pattern" && (
          <div className="space-y-3">
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor base" />
            <div className="grid grid-cols-4 gap-1.5">
              {BG_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setDesign("bgPattern", p.id)}
                  className={`py-3 rounded-xl text-[10px] font-medium transition-all ${
                    d.bgPattern === p.id
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ═══════════ SECTION 3: Colors ═══════════ */}
      <SectionCard title="Cores" icon={<Palette size={14} />}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.accentColor || currentTheme.accent} onChange={v => { setDesign("accentColor", v); updateConfig("theme", "custom"); }} label="Cor principal" />
            <ColorPicker value={d.accentColor2 || currentTheme.accent2} onChange={v => { setDesign("accentColor2", v); updateConfig("theme", "custom"); }} label="Cor secundária" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.textColor || "#f8f5ff"} onChange={v => setDesign("textColor", v)} label="Texto" />
            <ColorPicker value={d.subtextColor || "rgba(248,245,255,0.5)"} onChange={v => setDesign("subtextColor", v)} label="Subtexto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.cardBg || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo card" />
            <ColorPicker value={d.cardBorder || "rgba(168,85,247,0.18)"} onChange={v => setDesign("cardBorder", v)} label="Borda card" />
          </div>
          {/* Quick accent palette */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Paleta rápida</p>
            <div className="grid grid-cols-8 gap-1.5">
              {ACCENT_COLORS.map(c => (
                <button key={c} onClick={() => { setDesign("accentColor", c); updateConfig("theme", "custom"); }}
                  className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                    (d.accentColor || currentTheme.accent) === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/10"
                  }`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 4: Fonts ═══════════ */}
      <SectionCard title="Tipografia" icon={<Type size={14} />} defaultOpen={false}>
        <div className="space-y-3 pt-2">
          {/* Font filter */}
          <div className="flex gap-1">
            {[
              { key: "all", label: "Todas" },
              { key: "sans", label: "Sans" },
              { key: "serif", label: "Serif" },
              { key: "display", label: "Display" },
              { key: "handwriting", label: "Script" },
              { key: "mono", label: "Mono" },
            ].map(f => (
              <button key={f.key} onClick={() => setFontFilter(f.key)}
                className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                  fontFilter === f.key ? "bg-primary/15 text-primary" : "text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))]"
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Heading font */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Fonte do título</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {GOOGLE_FONTS.filter(f => fontFilter === "all" || f.category === fontFilter).map(f => {
                const isActive = d.fontHeading === f.name;
                return (
                  <button key={f.name} onClick={() => { setDesign("fontHeading", f.name); loadFont(f.name); }}
                    className={`px-3 py-2 rounded-xl text-left text-[12px] font-medium transition-all ${
                      isActive ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text))] border border-transparent hover:border-primary/20"
                    }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body font */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Fonte do corpo</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {GOOGLE_FONTS.filter(f => fontFilter === "all" || f.category === fontFilter).map(f => {
                const isActive = d.fontBody === f.name;
                return (
                  <button key={f.name} onClick={() => { setDesign("fontBody", f.name); loadFont(f.name); }}
                    className={`px-3 py-2 rounded-xl text-left text-[12px] transition-all ${
                      isActive ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text))] border border-transparent hover:border-primary/20"
                    }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
            <p className="text-[14px] font-bold text-[hsl(var(--dash-text))] mb-1" style={{ fontFamily: `"${d.fontHeading}", sans-serif` }}>
              {config.displayName || "Seu Nome"} — Título
            </p>
            <p className="text-[12px] text-[hsl(var(--dash-text-muted))]" style={{ fontFamily: `"${d.fontBody}", sans-serif` }}>
              Este é um preview do texto do corpo com a fonte selecionada.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 5: Button Styles ═══════════ */}
      <SectionCard title="Estilo dos botões" icon={<Square size={14} />} defaultOpen={false}>
        <div className="space-y-4 pt-2">
          {/* Shape */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Formato</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { shape: "rounded" as ButtonShape, label: "Arredondado", radius: "12px" },
                { shape: "pill" as ButtonShape, label: "Pílula", radius: "999px" },
                { shape: "square" as ButtonShape, label: "Quadrado", radius: "0px" },
                { shape: "soft" as ButtonShape, label: "Suave", radius: "8px" },
              ]).map(({ shape, label, radius }) => (
                <button key={shape} onClick={() => setDesign("buttonShape", shape)}
                  className={`py-3 rounded-xl text-[10px] font-medium transition-all ${
                    d.buttonShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                  }`}>
                  <div className="w-12 h-4 mx-auto mb-1.5 bg-current/20 border border-current/30"
                    style={{ borderRadius: radius }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fill */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Preenchimento</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { fill: "solid" as ButtonFill, label: "Sólido" },
                { fill: "outline" as ButtonFill, label: "Contorno" },
                { fill: "glass" as ButtonFill, label: "Vidro" },
                { fill: "ghost" as ButtonFill, label: "Fantasma" },
              ]).map(({ fill, label }) => (
                <button key={fill} onClick={() => setDesign("buttonFill", fill)}
                  className={`py-3 rounded-xl text-[10px] font-medium transition-all ${
                    d.buttonFill === fill ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Sombra</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { shadow: "none" as ButtonShadow, label: "Nenhuma" },
                { shadow: "sm" as ButtonShadow, label: "Leve" },
                { shadow: "md" as ButtonShadow, label: "Média" },
                { shadow: "glow" as ButtonShadow, label: "Brilho" },
              ]).map(({ shadow, label }) => (
                <button key={shadow} onClick={() => setDesign("buttonShadow", shadow)}
                  className={`py-3 rounded-xl text-[10px] font-medium transition-all ${
                    d.buttonShadow === shadow ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Arredondamento</p>
              <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.buttonRadius}px</span>
            </div>
            <input type="range" min={0} max={24} value={d.buttonRadius} onChange={e => setDesign("buttonRadius", +e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
          </div>

          {/* Button preview */}
          <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] space-y-2">
            <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] mb-2">Preview</p>
            {(() => {
              const accent = d.accentColor || currentTheme.accent;
              const radius = d.buttonShape === "pill" ? "999px" : d.buttonShape === "square" ? "0px" : d.buttonShape === "soft" ? "8px" : `${d.buttonRadius}px`;
              const shadow = d.buttonShadow === "glow" ? `0 0 20px ${accent}40` : d.buttonShadow === "md" ? "0 4px 12px rgba(0,0,0,0.3)" : d.buttonShadow === "sm" ? "0 2px 6px rgba(0,0,0,0.2)" : "none";

              const styles: Record<ButtonFill, React.CSSProperties> = {
                solid: { background: accent, color: "#fff", borderRadius: radius, boxShadow: shadow },
                outline: { background: "transparent", color: accent, border: `2px solid ${accent}`, borderRadius: radius, boxShadow: shadow },
                glass: { background: `${accent}20`, color: accent, backdropFilter: "blur(10px)", border: `1px solid ${accent}30`, borderRadius: radius, boxShadow: shadow },
                ghost: { background: "transparent", color: accent, borderRadius: radius, boxShadow: shadow },
              };

              return (
                <button className="w-full py-2.5 px-4 text-[12px] font-semibold transition-all" style={styles[d.buttonFill]}>
                  Exemplo de Botão
                </button>
              );
            })()}
          </div>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 6: Profile Photo ═══════════ */}
      <SectionCard title="Foto de perfil" icon={<Circle size={14} />} defaultOpen={false}>
        <div className="space-y-4 pt-2">
          {/* Shape */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Formato</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { shape: "circle" as ProfileShape, label: "Círculo", cls: "rounded-full" },
                { shape: "rounded" as ProfileShape, label: "Arredondado", cls: "rounded-2xl" },
                { shape: "square" as ProfileShape, label: "Quadrado", cls: "rounded-none" },
                { shape: "hexagon" as ProfileShape, label: "Hexágono", cls: "rounded-full" },
              ]).map(({ shape, label, cls }) => (
                <button key={shape} onClick={() => setDesign("profileShape", shape)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-medium transition-all ${
                    d.profileShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                  }`}>
                  <div className={`w-8 h-8 ${cls} bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/30`}
                    style={shape === "hexagon" ? { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" } : {}} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Tamanho</p>
              <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.profileSize}px</span>
            </div>
            <input type="range" min={64} max={120} value={d.profileSize} onChange={e => setDesign("profileSize", +e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
          </div>

          {/* Border */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Borda colorida</p>
            <button onClick={() => setDesign("profileBorder", !d.profileBorder)}
              className={`relative w-9 h-5 rounded-full transition-colors ${d.profileBorder ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${d.profileBorder ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>

          {d.profileBorder && (
            <ColorPicker value={d.profileBorderColor || d.accentColor || currentTheme.accent}
              onChange={v => setDesign("profileBorderColor", v)} label="Cor da borda" />
          )}
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 7: Current theme summary ═══════════ */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
        <div className="flex gap-1.5">
          {[
            d.bgColor || currentTheme.bg,
            d.accentColor || currentTheme.accent,
            d.accentColor2 || currentTheme.accent2,
          ].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full ring-1 ring-white/10" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[hsl(var(--dash-text))] text-xs font-medium truncate">
            {config.theme === "custom" ? "Tema Personalizado" : `Tema: ${currentTheme.label}`}
          </p>
          <p className="text-[hsl(var(--dash-text-subtle))] text-[10px]">
            {d.fontHeading !== "Inter" ? d.fontHeading : ""}{d.fontHeading !== "Inter" && d.fontBody !== "Inter" ? " + " : ""}{d.fontBody !== "Inter" && d.fontBody !== d.fontHeading ? d.fontBody : ""}{d.fontHeading === "Inter" && d.fontBody === "Inter" ? "Fonte padrão" : ""}
          </p>
        </div>
        <Sparkles size={14} className="text-primary flex-shrink-0" />
      </div>

    </div>
  );
}
