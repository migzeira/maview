import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check, ChevronDown, Palette, Image, Video, Type, Square, Circle,
  Sparkles, Eye, Sliders, Upload, X, Play, Globe, Zap, Hexagon,
  PaintBucket, Droplets, Sun, Moon, Layers, Grid3X3, Wand2, Info,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   Types — must match DashboardPagina.tsx exactly
   ═══════════════════════════════════════════════════════════════════ */
type ThemeId = string;
type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
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
  bgEffect: string;
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
const BG_PATTERNS: { id: string; label: string; desc: string }[] = [
  { id: "dots", label: "Pontos", desc: "Padrão de pontos delicados" },
  { id: "grid", label: "Grade", desc: "Linhas cruzadas em grade" },
  { id: "diagonal", label: "Diagonal", desc: "Linhas diagonais sutis" },
  { id: "waves", label: "Ondas", desc: "Ondas suaves e orgânicas" },
  { id: "cross", label: "Cruz", desc: "Padrão de cruzes minimalista" },
  { id: "hexagon", label: "Hexágono", desc: "Hexágonos geométricos" },
  { id: "noise", label: "Textura", desc: "Textura granulada sutil" },
];

/* ═══ 21st.dev Animated Background Effects (CSS-only) ═══ */
const BG_EFFECTS: { id: string; label: string; desc: string; category: string }[] = [
  // Aurora / Glow
  { id: "aurora", label: "Aurora", desc: "Luzes do norte animadas", category: "glow" },
  { id: "aurora-waves", label: "Aurora Ondas", desc: "Aurora com ondulação suave", category: "glow" },
  { id: "ambient-glow", label: "Brilho Ambiente", desc: "Brilho radial pulsante", category: "glow" },
  { id: "spotlight", label: "Holofote", desc: "Foco de luz centralizado", category: "glow" },
  { id: "radial-glow", label: "Brilho Radial", desc: "Brilho que se expande do centro", category: "glow" },
  // Gradient animated
  { id: "gradient-flow", label: "Gradiente Fluido", desc: "Gradiente que se move suavemente", category: "gradient" },
  { id: "gradient-mesh", label: "Malha Gradiente", desc: "Gradiente com malha de cores", category: "gradient" },
  { id: "gradient-shift", label: "Gradiente Shift", desc: "Cores que mudam gradualmente", category: "gradient" },
  // Particle / Space
  { id: "starfield", label: "Campo Estelar", desc: "Estrelas piscando suavemente", category: "particle" },
  { id: "floating-dots", label: "Pontos Flutuantes", desc: "Partículas flutuando lentamente", category: "particle" },
  { id: "sparkles", label: "Brilhos", desc: "Brilhos aparecendo e sumindo", category: "particle" },
  // Wave / Flow
  { id: "wave-layers", label: "Camadas de Onda", desc: "Ondas em camadas animadas", category: "wave" },
  { id: "flow-field", label: "Campo de Fluxo", desc: "Linhas fluindo suavemente", category: "wave" },
  { id: "liquid", label: "Líquido", desc: "Efeito líquido orgânico", category: "wave" },
  // Grid / Tech
  { id: "matrix-grid", label: "Grade Matrix", desc: "Grade digital animada", category: "tech" },
  { id: "pulse-grid", label: "Grade Pulsante", desc: "Grade com pulsos luminosos", category: "tech" },
  { id: "scan-lines", label: "Scan Lines", desc: "Linhas de varredura retro", category: "tech" },
  // Atmospheric
  { id: "fog", label: "Névoa", desc: "Névoa suave em movimento", category: "atmosphere" },
  { id: "smoke", label: "Fumaça", desc: "Fumaça lenta e atmosférica", category: "atmosphere" },
  { id: "clouds", label: "Nuvens", desc: "Nuvens passando lentamente", category: "atmosphere" },
];

const EFFECT_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "glow", label: "Brilho" },
  { key: "gradient", label: "Gradiente" },
  { key: "particle", label: "Partículas" },
  { key: "wave", label: "Ondas" },
  { key: "tech", label: "Tech" },
  { key: "atmosphere", label: "Atmosfera" },
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

      const colorCounts: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        if (data[i + 3] < 128) continue;
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

function loadFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/* Get CSS for an effect mini-preview */
function getEffectPreviewStyle(effectId: string, accent: string): React.CSSProperties {
  const a = accent || "#a855f7";
  switch (effectId) {
    case "aurora": return { background: `linear-gradient(135deg, ${a}30, transparent, ${a}20)` };
    case "aurora-waves": return { background: `linear-gradient(180deg, transparent 20%, ${a}25 50%, transparent 80%)` };
    case "ambient-glow": return { background: `radial-gradient(circle at center, ${a}30, transparent 70%)` };
    case "spotlight": return { background: `radial-gradient(ellipse at 50% 30%, ${a}35, transparent 60%)` };
    case "radial-glow": return { background: `radial-gradient(circle, ${a}25, transparent 65%)` };
    case "gradient-flow": return { background: `linear-gradient(45deg, ${a}30, #ec489920, ${a}30)` };
    case "gradient-mesh": return { background: `radial-gradient(at 20% 30%, ${a}25 0%, transparent 50%), radial-gradient(at 80% 70%, #ec489920 0%, transparent 50%)` };
    case "gradient-shift": return { background: `linear-gradient(90deg, ${a}20, #60a5fa20, ${a}20)` };
    case "starfield": return { background: `radial-gradient(1px 1px at 20% 30%, white 50%, transparent), radial-gradient(1px 1px at 70% 60%, white 50%, transparent), radial-gradient(1px 1px at 40% 80%, white 50%, transparent), #0a0a18` };
    case "floating-dots": return { background: `radial-gradient(2px 2px at 25% 25%, ${a}40, transparent), radial-gradient(2px 2px at 75% 45%, ${a}30, transparent), radial-gradient(2px 2px at 50% 75%, ${a}20, transparent)` };
    case "sparkles": return { background: `radial-gradient(1px 1px at 30% 20%, ${a} 50%, transparent), radial-gradient(1px 1px at 60% 50%, #fcd34d 50%, transparent), radial-gradient(1px 1px at 80% 80%, ${a} 50%, transparent)` };
    case "wave-layers": return { background: `linear-gradient(180deg, transparent 40%, ${a}15 60%, ${a}08 80%, transparent)` };
    case "flow-field": return { background: `linear-gradient(135deg, transparent 20%, ${a}10 40%, transparent 60%, ${a}08 80%)` };
    case "liquid": return { background: `radial-gradient(ellipse at 30% 50%, ${a}20 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #ec489915 0%, transparent 60%)` };
    case "matrix-grid": return { backgroundImage: `linear-gradient(${a}15 1px, transparent 1px), linear-gradient(90deg, ${a}15 1px, transparent 1px)`, backgroundSize: "8px 8px" };
    case "pulse-grid": return { backgroundImage: `radial-gradient(${a}30 1px, transparent 1px)`, backgroundSize: "10px 10px" };
    case "scan-lines": return { backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${a}08 2px, ${a}08 4px)` };
    case "fog": return { background: `linear-gradient(135deg, transparent, rgba(255,255,255,0.04) 40%, transparent 70%)` };
    case "smoke": return { background: `radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.05), transparent 60%)` };
    case "clouds": return { background: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.04) 0%, transparent 50%)` };
    default: return {};
  }
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

function SectionCard({ title, icon, children, defaultOpen = true, desc }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; desc?: string;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 overflow-hidden shadow-sm">
      <summary className="flex items-center gap-2 p-4 cursor-pointer select-none hover:bg-[hsl(var(--dash-accent))]/30 transition-colors">
        <span className="text-primary">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold">{title}</span>
          {desc && <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] leading-tight mt-0.5">{desc}</p>}
        </div>
        <ChevronDown size={14} className="text-[hsl(var(--dash-text-subtle))] group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--dash-border-subtle))]">
        {children}
      </div>
    </details>
  );
}

/* Tooltip that appears on hover */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a2e] text-white text-[9px] font-medium shadow-xl border border-white/10 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#1a1a2e]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main DesignTab component
   ═══════════════════════════════════════════════════════════════════ */
export default function DesignTab({ config, themes, defaultDesign, updateConfig, highlightField, themeGridRef }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design } as DesignConfig;
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];
  const [fontFilter, setFontFilter] = useState<string>("all");
  const [effectFilter, setEffectFilter] = useState<string>("all");
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  const setDesign = useCallback((key: keyof DesignConfig, value: any) => {
    const prev = config.design || {};
    updateConfig("design", { ...prev, [key]: value });
  }, [config.design, updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  const autoThemeFromAvatar = useCallback(async () => {
    if (!config.avatarUrl) return;
    const colors = await extractColorsFromImage(config.avatarUrl);
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

  const accent = d.accentColor || currentTheme.accent;

  return (
    <div className="space-y-4 pb-24">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Personalizar</h2>
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Ajuste cores, fundo e estilo — tudo reflete ao vivo</p>
        </div>
        {config.avatarUrl && (
          <Tooltip text="Gera cores automaticamente a partir da sua foto de perfil">
            <button onClick={autoThemeFromAvatar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-fuchsia-500 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/15 transition-all">
              <Wand2 size={11} /> Auto-cores
            </button>
          </Tooltip>
        )}
      </div>

      {/* ═══════════ SECTION 1: Colors (most impactful) ═══════════ */}
      <SectionCard title="Cores" icon={<Palette size={14} />} desc="As cores definem a identidade visual — comece por aqui">
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.accentColor || currentTheme.accent} onChange={v => { setDesign("accentColor", v); updateConfig("theme", "custom"); }} label="Cor principal" />
            <ColorPicker value={d.accentColor2 || currentTheme.accent2} onChange={v => { setDesign("accentColor2", v); updateConfig("theme", "custom"); }} label="Cor secundária" />
          </div>
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Paleta rápida</p>
            <div className="grid grid-cols-8 gap-1.5">
              {ACCENT_COLORS.map(c => (
                <Tooltip key={c} text={c.toUpperCase()}>
                  <button onClick={() => { setDesign("accentColor", c); updateConfig("theme", "custom"); }}
                    className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                      (d.accentColor || currentTheme.accent) === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/10"
                    }`} style={{ background: c }} />
                </Tooltip>
              ))}
            </div>
          </div>
          <details className="group">
            <summary className="text-[10px] text-[hsl(var(--dash-text-subtle))] cursor-pointer hover:text-[hsl(var(--dash-text-muted))] transition-colors select-none flex items-center gap-1">
              <ChevronDown size={10} className="group-open:rotate-180 transition-transform" />
              Cores avançadas (textos, cards)
            </summary>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker value={d.textColor || "#f8f5ff"} onChange={v => setDesign("textColor", v)} label="Texto" />
                <ColorPicker value={d.subtextColor || "rgba(248,245,255,0.5)"} onChange={v => setDesign("subtextColor", v)} label="Subtexto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker value={d.cardBg || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo card" />
                <ColorPicker value={d.cardBorder || "rgba(168,85,247,0.18)"} onChange={v => setDesign("cardBorder", v)} label="Borda card" />
              </div>
            </div>
          </details>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 2: Background ═══════════ */}
      <SectionCard title="Fundo" icon={<Layers size={14} />} desc="Cor sólida, degradê, imagem, vídeo, padrão ou efeito animado">
        {/* BG Type selector */}
        <div className="flex gap-1.5 pt-2 flex-wrap">
          {([
            { type: "solid" as BgType, icon: <PaintBucket size={12} />, label: "Cor", tip: "Uma cor sólida de fundo" },
            { type: "gradient" as BgType, icon: <Droplets size={12} />, label: "Degradê", tip: "Duas cores em transição suave" },
            { type: "image" as BgType, icon: <Image size={12} />, label: "Imagem", tip: "Sua imagem como fundo" },
            { type: "video" as BgType, icon: <Video size={12} />, label: "Vídeo", tip: "Vídeo em loop como fundo" },
            { type: "pattern" as BgType, icon: <Grid3X3 size={12} />, label: "Padrão", tip: "Padrões geométricos sutis" },
            { type: "effect" as BgType, icon: <Sparkles size={12} />, label: "Efeito", tip: "Efeitos animados estilo 21st.dev" },
          ]).map(({ type, icon, label, tip }) => (
            <Tooltip key={type} text={tip}>
              <button onClick={() => setDesign("bgType", type)}
                className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-all ${
                  d.bgType === type
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                }`}>
                {icon}
                {label}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* BG Type: Solid */}
        {d.bgType === "solid" && (
          <div className="space-y-3">
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor de fundo" />
            <div className="grid grid-cols-8 gap-1.5">
              {SOLID_COLORS.map(c => (
                <Tooltip key={c} text={c.toUpperCase()}>
                  <button onClick={() => { setDesign("bgColor", c); updateConfig("theme", "custom"); }}
                    className={`w-full aspect-square rounded-lg ring-1 transition-all hover:scale-110 ${
                      (d.bgColor || currentTheme.bg) === c ? "ring-2 ring-primary scale-110" : "ring-white/10"
                    }`} style={{ background: c }} />
                </Tooltip>
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
            <div>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Direção</p>
              <div className="grid grid-cols-5 gap-1">
                {([
                  { dir: "to-b" as GradientDir, icon: "↓", tip: "De cima para baixo" },
                  { dir: "to-r" as GradientDir, icon: "→", tip: "Da esquerda para direita" },
                  { dir: "to-br" as GradientDir, icon: "↘", tip: "Diagonal para baixo-direita" },
                  { dir: "to-tl" as GradientDir, icon: "↖", tip: "Diagonal para cima-esquerda" },
                  { dir: "radial" as GradientDir, icon: "◎", tip: "Do centro para as bordas" },
                ]).map(({ dir, icon, tip }) => (
                  <Tooltip key={dir} text={tip}>
                    <button onClick={() => setDesign("bgGradientDir", dir)}
                      className={`p-2 rounded-lg text-[12px] font-medium transition-all w-full ${
                        d.bgGradientDir === dir ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-subtle))] border border-transparent"
                      }`}>
                      {icon}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Presets de degradê</p>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map(([c1, c2], i) => (
                  <Tooltip key={i} text={`${c1} → ${c2}`}>
                    <button onClick={() => { setDesign("bgGradient", [c1, c2]); updateConfig("theme", "custom"); }}
                      className="h-8 rounded-lg ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 transition-all w-full"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                  </Tooltip>
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Escurecimento</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.bgOverlay}%</span>
              </div>
              <input type="range" min={0} max={90} value={d.bgOverlay} onChange={e => setDesign("bgOverlay", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
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
                <Tooltip key={p.id} text={p.desc}>
                  <button onClick={() => setDesign("bgPattern", p.id)}
                    className={`py-3 rounded-xl text-[10px] font-medium transition-all w-full ${
                      d.bgPattern === p.id
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                    }`}>
                    {p.label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* BG Type: Effect (21st.dev animated backgrounds) */}
        {d.bgType === "effect" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-1">
              <Sparkles size={12} className="text-primary" />
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Efeitos animados inspirados em 21st.dev — escolha um efeito de fundo</p>
            </div>

            {/* Category filter */}
            <div className="flex gap-1 flex-wrap">
              {EFFECT_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setEffectFilter(cat.key)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                    effectFilter === cat.key ? "bg-primary/15 text-primary" : "text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))]"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Effect grid with mini previews */}
            <div className="grid grid-cols-2 gap-2">
              {BG_EFFECTS
                .filter(e => effectFilter === "all" || e.category === effectFilter)
                .map(effect => {
                  const isActive = d.bgEffect === effect.id;
                  return (
                    <button key={effect.id}
                      onClick={() => { setDesign("bgEffect", effect.id); updateConfig("theme", "custom"); }}
                      className={`relative rounded-xl overflow-hidden text-left transition-all ${
                        isActive ? "ring-2 ring-primary scale-[1.02]" : "ring-1 ring-white/10 hover:ring-primary/30 hover:scale-[1.01]"
                      }`}>
                      {/* Mini preview */}
                      <div className="h-[50px] relative" style={{ background: currentTheme.bg }}>
                        <div className="absolute inset-0" style={getEffectPreviewStyle(effect.id, accent)} />
                        {isActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="px-2.5 py-1.5 bg-[hsl(var(--dash-surface-2))]">
                        <p className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                          {effect.label}
                        </p>
                        <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] leading-tight">{effect.desc}</p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Color base for effects */}
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor base do efeito" />

            {/* Overlay for effects */}
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
      </SectionCard>

      {/* ═══════════ SECTION 3: Button Styles ═══════════ */}
      <SectionCard title="Estilo dos botões" icon={<Square size={14} />} desc="Formato, preenchimento e sombra — afeta todos os CTAs">
        <div className="space-y-4 pt-2">
          {/* Shape */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Formato</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { shape: "rounded" as ButtonShape, label: "Arredondado", radius: "12px", tip: "Cantos arredondados com raio customizável" },
                { shape: "pill" as ButtonShape, label: "Pílula", radius: "999px", tip: "Totalmente arredondado como cápsula" },
                { shape: "square" as ButtonShape, label: "Quadrado", radius: "4px", tip: "Cantos quase retos" },
                { shape: "soft" as ButtonShape, label: "Suave", radius: "12px", tip: "Cantos levemente arredondados" },
              ]).map(({ shape, label, radius, tip }) => (
                <Tooltip key={shape} text={tip}>
                  <button onClick={() => setDesign("buttonShape", shape)}
                    className={`py-3 rounded-xl text-[10px] font-medium transition-all w-full ${
                      d.buttonShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                    }`}>
                    <div className="w-12 h-4 mx-auto mb-1.5 border border-current/40"
                      style={{ borderRadius: radius, background: d.buttonShape === shape ? `${accent}20` : "transparent" }} />
                    {label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Fill */}
          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Preenchimento</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { fill: "solid" as ButtonFill, label: "Sólido", tip: "Fundo sólido opaco" },
                { fill: "outline" as ButtonFill, label: "Contorno", tip: "Apenas a borda, sem preenchimento" },
                { fill: "glass" as ButtonFill, label: "Vidro", tip: "Efeito glassmorphism com desfoque" },
                { fill: "ghost" as ButtonFill, label: "Fantasma", tip: "Transparente sem borda" },
              ]).map(({ fill, label, tip }) => (
                <Tooltip key={fill} text={tip}>
                  <button onClick={() => setDesign("buttonFill", fill)}
                    className={`py-3 rounded-xl text-[10px] font-medium transition-all w-full ${
                      d.buttonFill === fill ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                    }`}>
                    {label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Shadow + Radius in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Sombra</p>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { shadow: "none" as ButtonShadow, label: "Sem", tip: "Sem sombra" },
                  { shadow: "sm" as ButtonShadow, label: "Leve", tip: "Sombra sutil" },
                  { shadow: "md" as ButtonShadow, label: "Média", tip: "Sombra mais evidente" },
                  { shadow: "glow" as ButtonShadow, label: "Brilho", tip: "Brilho neon" },
                ]).map(({ shadow, label, tip }) => (
                  <Tooltip key={shadow} text={tip}>
                    <button onClick={() => setDesign("buttonShadow", shadow)}
                      className={`py-2 rounded-lg text-[9px] font-medium transition-all w-full ${
                        d.buttonShadow === shadow ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                      }`}>
                      {label}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Raio</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.buttonRadius}px</span>
              </div>
              <input type="range" min={0} max={24} value={d.buttonRadius} onChange={e => setDesign("buttonRadius", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
          </div>

          {/* Compact button preview */}
          <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] space-y-2">
            <p className="text-[9px] text-[hsl(var(--dash-text-subtle))]">Preview</p>
            {(() => {
              const radius = d.buttonShape === "pill" ? "999px" : d.buttonShape === "square" ? "4px" : d.buttonShape === "soft" ? "12px" : `${d.buttonRadius}px`;
              const shadow = d.buttonShadow === "glow" ? `0 0 20px ${accent}40` : d.buttonShadow === "md" ? "0 4px 12px rgba(0,0,0,0.3)" : d.buttonShadow === "sm" ? "0 2px 6px rgba(0,0,0,0.2)" : "none";
              const accent2 = d.accentColor2 || currentTheme.accent2;
              const styles: Record<ButtonFill, React.CSSProperties> = {
                solid: { background: accent, color: "#fff", borderRadius: radius, boxShadow: shadow },
                outline: { background: "transparent", color: accent, border: `2px solid ${accent}`, borderRadius: radius, boxShadow: shadow },
                glass: { background: `${accent}20`, color: accent, backdropFilter: "blur(10px)", border: `1px solid ${accent}30`, borderRadius: radius, boxShadow: shadow },
                ghost: { background: "transparent", color: accent, borderRadius: radius, boxShadow: shadow },
              };
              return (
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 text-[11px] font-semibold transition-all" style={styles[d.buttonFill]}>
                    {d.buttonFill === "solid" ? "Sólido" : d.buttonFill === "outline" ? "Contorno" : d.buttonFill === "glass" ? "Vidro" : "Fantasma"}
                  </button>
                  <button className="flex-1 py-2 px-3 text-[11px] font-semibold text-white transition-all"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})`, borderRadius: radius, boxShadow: shadow }}>
                    CTA
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 4: Profile Photo ═══════════ */}
      <SectionCard title="Foto de perfil" icon={<Circle size={14} />} defaultOpen={false} desc="Formato, tamanho e borda da foto">
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-4 gap-1.5">
            {([
              { shape: "circle" as ProfileShape, label: "Círculo", cls: "rounded-full", tip: "Formato redondo clássico" },
              { shape: "rounded" as ProfileShape, label: "Arredondado", cls: "rounded-2xl", tip: "Quadrado com cantos arredondados" },
              { shape: "square" as ProfileShape, label: "Quadrado", cls: "rounded-none", tip: "Sem arredondamento" },
              { shape: "hexagon" as ProfileShape, label: "Hexágono", cls: "rounded-full", tip: "Formato hexagonal" },
            ]).map(({ shape, label, cls, tip }) => (
              <Tooltip key={shape} text={tip}>
                <button onClick={() => setDesign("profileShape", shape)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[9px] font-medium transition-all w-full ${
                    d.profileShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                  }`}>
                  <div className={`w-6 h-6 ${cls} bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/30`}
                    style={shape === "hexagon" ? { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" } : {}} />
                  {label}
                </button>
              </Tooltip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Tamanho</p>
                <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">{d.profileSize}px</span>
              </div>
              <input type="range" min={64} max={120} value={d.profileSize} onChange={e => setDesign("profileSize", +e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none bg-[hsl(var(--dash-border))] accent-primary" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Borda colorida</p>
              <Tooltip text={d.profileBorder ? "Desativar borda" : "Ativar borda colorida"}>
                <button onClick={() => setDesign("profileBorder", !d.profileBorder)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${d.profileBorder ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${d.profileBorder ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </Tooltip>
            </div>
          </div>
          {d.profileBorder && (
            <ColorPicker value={d.profileBorderColor || d.accentColor || currentTheme.accent}
              onChange={v => setDesign("profileBorderColor", v)} label="Cor da borda" />
          )}
          {config.avatarUrl && (
            <div className="flex justify-center p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
              <img src={config.avatarUrl} alt="preview" className="object-cover"
                style={{
                  width: d.profileSize, height: d.profileSize,
                  borderRadius: d.profileShape === "circle" ? "9999px" : d.profileShape === "rounded" ? "20%" : d.profileShape === "square" ? "8px" : "0",
                  clipPath: d.profileShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined,
                  border: d.profileBorder ? `2.5px solid ${d.profileBorderColor || accent}60` : "none",
                }} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 5: Typography ═══════════ */}
      <SectionCard title="Tipografia" icon={<Type size={14} />} defaultOpen={false} desc="Fontes do Google Fonts para títulos e corpo">
        <div className="space-y-3 pt-2">
          <div className="flex gap-1 flex-wrap">
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

          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Fonte do título</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {GOOGLE_FONTS.filter(f => fontFilter === "all" || f.category === fontFilter).map(f => {
                const isActive = d.fontHeading === f.name;
                return (
                  <Tooltip key={f.name} text={`Título: "${f.name}" — ${f.category}`}>
                    <button onClick={() => { setDesign("fontHeading", f.name); loadFont(f.name); }}
                      className={`px-3 py-2 rounded-xl text-left text-[12px] font-medium transition-all w-full ${
                        isActive ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text))] border border-transparent hover:border-primary/20"
                      }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                      {f.name}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1.5">Fonte do corpo</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {GOOGLE_FONTS.filter(f => fontFilter === "all" || f.category === fontFilter).map(f => {
                const isActive = d.fontBody === f.name;
                return (
                  <Tooltip key={f.name} text={`Corpo: "${f.name}" — ${f.category}`}>
                    <button onClick={() => { setDesign("fontBody", f.name); loadFont(f.name); }}
                      className={`px-3 py-2 rounded-xl text-left text-[12px] transition-all w-full ${
                        isActive ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text))] border border-transparent hover:border-primary/20"
                      }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                      {f.name}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
            <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] mb-2">Preview ao vivo</p>
            <p className="text-[14px] font-bold text-[hsl(var(--dash-text))] mb-1" style={{ fontFamily: `"${d.fontHeading}", sans-serif` }}>
              {config.displayName || "Seu Nome"} — Título
            </p>
            <p className="text-[12px] text-[hsl(var(--dash-text-muted))]" style={{ fontFamily: `"${d.fontBody}", sans-serif` }}>
              Este é um preview do texto do corpo com a fonte selecionada.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ═══════════ SECTION 6: Theme Presets (quick start) ═══════════ */}
      <SectionCard title="Temas prontos" icon={<Sliders size={14} />} defaultOpen={false} desc="Atalho — aplique um tema base e personalize depois">
        <div ref={themeGridRef} className={`grid grid-cols-4 gap-1.5 pt-2 rounded-xl transition-all duration-300 ${
          highlightField === "theme" ? "ring-2 ring-primary p-1 shadow-[0_0_18px_rgba(139,92,246,0.45)]" : ""
        }`}>
          {themes.filter(t => t.id !== "custom").map(theme => {
            const isActive = config.theme === theme.id;
            return (
              <Tooltip key={theme.id} text={`Tema ${theme.label}`}>
                <button onClick={() => updateConfig("theme", theme.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all w-full ${
                    isActive ? "border-primary shadow-lg scale-[1.02]" : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:scale-[1.01]"
                  }`}>
                  <div className="h-[44px] flex items-center justify-center"
                    style={{ background: `linear-gradient(160deg, ${theme.bg} 60%, ${theme.accent}20)` }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }} />
                  </div>
                  <div className={`px-1 py-0.5 text-center ${isActive ? "bg-primary/10" : "bg-[hsl(var(--dash-surface-2))]"}`}>
                    <p className={`text-[8px] font-medium truncate ${isActive ? "text-primary" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                      {theme.label}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={7} className="text-white" />
                    </div>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══════════ Summary bar ═══════════ */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))]/60 border border-[hsl(var(--dash-border-subtle))]">
        <div className="flex gap-1">
          {[d.bgColor || currentTheme.bg, d.accentColor || currentTheme.accent, d.accentColor2 || currentTheme.accent2].map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-full ring-1 ring-white/10" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[hsl(var(--dash-text))] text-[11px] font-medium truncate">
            {config.theme === "custom" ? "Personalizado" : currentTheme.label}
            {d.fontHeading !== "Inter" ? ` · ${d.fontHeading}` : ""}
            {d.bgType !== "solid" ? ` · ${d.bgType === "gradient" ? "Degradê" : d.bgType === "effect" ? "Efeito" : d.bgType}` : ""}
          </p>
        </div>
      </div>

    </div>
  );
}
