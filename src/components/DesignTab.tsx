import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check, ChevronDown, Palette, Image, Video, Type, Square, Circle,
  Sparkles, Eye, Upload, X, Play, Globe, Zap, Hexagon,
  PaintBucket, Droplets, Sun, Moon, Layers, Grid3X3, Wand2, Info,
  LayoutTemplate, Link2,
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
  // Motion — NEW animated effects with real visible movement
  { id: "ocean-waves", label: "Ondas", desc: "Ondas do oceano em movimento", category: "motion" },
  { id: "orbit-circles", label: "Órbitas", desc: "Círculos orbitando em loop", category: "motion" },
  { id: "ripple-rings", label: "Ondulações", desc: "Anéis se expandindo do centro", category: "motion" },
  { id: "morph-blobs", label: "Blobs", desc: "Formas orgânicas que se transformam", category: "motion" },
  { id: "orbit-rings", label: "Anéis Girando", desc: "Anéis concêntricos com pontos orbitando", category: "motion" },
  { id: "neon-lines", label: "Linhas Neon", desc: "Linhas luminosas ondulando", category: "motion" },
  // Light & Sweep
  { id: "gradient-shift-hue", label: "Arco-Íris", desc: "Cores do espectro girando suavemente", category: "gradient" },
  { id: "light-sweep", label: "Varredura", desc: "Feixe de luz varrendo a tela", category: "glow" },
  { id: "breathing-glow", label: "Respiração", desc: "Brilho pulsante como respiração", category: "glow" },
  { id: "conic-spotlight", label: "Holofote Cônico", desc: "Feixe de luz girando do centro", category: "glow" },
  // Particles & Motion
  { id: "rising-particles", label: "Partículas Subindo", desc: "Partículas flutuando para cima", category: "particle" },
  { id: "noise-flicker", label: "Ruído", desc: "Textura granulada com flicker sutil", category: "atmosphere" },
  { id: "diagonal-shimmer", label: "Diagonal", desc: "Listras diagonais deslizando", category: "wave" },
  // Orbs & Layers
  { id: "floating-orbs", label: "Orbes Flutuantes", desc: "Esferas de luz derivando lentamente", category: "glow" },
  { id: "layered-waves", label: "Ondas em Camadas", desc: "4 camadas de ondas paralaxe", category: "motion" },
  { id: "pulse-circles", label: "Círculos Pulsantes", desc: "Ondas concêntricas expandindo", category: "motion" },
  // Premium
  { id: "gradient-aurora-mesh", label: "Aurora Mesh", desc: "Aurora + ondas + brilho combinados", category: "gradient" },
  { id: "stripe-gradient", label: "Stripe", desc: "Gradiente animado estilo Stripe", category: "gradient" },
  { id: "vortex-spin", label: "Vórtex", desc: "Espiral de luz girando lentamente", category: "motion" },
  { id: "liquid-glass", label: "Vidro Líquido", desc: "Formas de vidro líquido orgânicas", category: "motion" },
  { id: "wireframe-globe", label: "Globe", desc: "Globo wireframe 3D girando", category: "motion" },
];

const EFFECT_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "glow", label: "Brilho" },
  { key: "gradient", label: "Gradiente" },
  { key: "particle", label: "Partículas" },
  { key: "wave", label: "Ondas" },
  { key: "tech", label: "Tech" },
  { key: "atmosphere", label: "Atmosfera" },
  { key: "motion", label: "Movimento" },
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
  ["#f6d365", "#fda085"],
  ["#c471f5", "#fa71cd"],
];

const SOLID_COLORS: string[] = [
  "#080612", "#05080f", "#050f05", "#100509", "#020c14", "#0a0010",
  "#111111", "#1a1a2e", "#0f3460", "#1a1a1a", "#0d1b2a", "#1b263b",
];

const ACCENT_COLORS: string[] = [
  "#a855f7", "#ec4899", "#f43f5e", "#f97316", "#f59e0b", "#eab308",
  "#4ade80", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
];

/* ═══════════════════════════════════════════════════════════════════
   Design Packs — one-click complete designs
   ═══════════════════════════════════════════════════════════════════ */
interface DesignPack {
  id: string;
  label: string;
  desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold";
  preview: { bg: string; accent: string; accent2: string };
  config: {
    theme: string;
    design: Partial<DesignConfig>;
  };
}

const PACK_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "animated", label: "Animados" },
  { key: "dark", label: "Dark" },
  { key: "light", label: "Claros" },
  { key: "minimal", label: "Minimal" },
  { key: "bold", label: "Bold" },
];

const DESIGN_PACKS: DesignPack[] = [
  {
    id: "minimal-clean",
    label: "Minimal",
    desc: "Limpo e moderno",
    category: "minimal",
    preview: { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
    config: {
      theme: "slate",
      design: {
        bgType: "solid", bgColor: "#0c0e12", bgEffect: "",
        buttonShape: "pill", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12,
        fontHeading: "Inter", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: false, profileSize: 88,
        accentColor: "#94a3b8", accentColor2: "#cbd5e1",
      },
    },
  },
  {
    id: "neon-bold",
    label: "Neon",
    desc: "Vibrante e ousado",
    category: "bold",
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: {
      theme: "neon-pink",
      design: {
        bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010",
        buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "Bebas Neue", fontBody: "Space Grotesk",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileSize: 96,
        accentColor: "#ff2d95", accentColor2: "#ff6ec7",
      },
    },
  },
  {
    id: "luxury-dark",
    label: "Luxury",
    desc: "Elegante e sofisticado",
    category: "dark",
    preview: { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
    config: {
      theme: "dark-purple",
      design: {
        bgType: "gradient", bgGradient: ["#080612", "#1a0a2e"] as [string, string], bgGradientDir: "to-b",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14,
        fontHeading: "Playfair Display", fontBody: "Lora",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileSize: 96,
        accentColor: "#a855f7", accentColor2: "#ec4899",
      },
    },
  },
  {
    id: "tech-future",
    label: "Tech",
    desc: "Futurista e digital",
    category: "dark",
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: {
      theme: "midnight",
      design: {
        bgType: "effect", bgEffect: "matrix-grid", bgColor: "#05080f",
        buttonShape: "square", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 6,
        fontHeading: "Space Grotesk", fontBody: "JetBrains Mono",
        profileShape: "hexagon", profileBorder: false, profileSize: 92,
        accentColor: "#60a5fa", accentColor2: "#818cf8",
      },
    },
  },
  {
    id: "nature-organic",
    label: "Nature",
    desc: "Orgânico e natural",
    category: "dark",
    preview: { bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
    config: {
      theme: "forest",
      design: {
        bgType: "gradient", bgGradient: ["#050f05", "#0a2a1a"] as [string, string], bgGradientDir: "to-b",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16,
        fontHeading: "Outfit", fontBody: "Nunito",
        profileShape: "rounded", profileBorder: false, profileSize: 88,
        accentColor: "#4ade80", accentColor2: "#34d399",
      },
    },
  },
  {
    id: "sunset-vibes",
    label: "Sunset",
    desc: "Quente e envolvente",
    category: "animated",
    preview: { bg: "#0f0805", accent: "#f97316", accent2: "#ef4444" },
    config: {
      theme: "sunset",
      design: {
        bgType: "effect", bgEffect: "rising-particles", bgColor: "#0f0805",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12,
        fontHeading: "Poppins", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#f97316", profileSize: 92,
        accentColor: "#f97316", accentColor2: "#ef4444",
      },
    },
  },
  {
    id: "gold-premium",
    label: "Gold",
    desc: "Premium e exclusivo",
    category: "bold",
    preview: { bg: "#0c0a04", accent: "#eab308", accent2: "#d97706" },
    config: {
      theme: "gold",
      design: {
        bgType: "effect", bgEffect: "ambient-glow", bgColor: "#0c0a04",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "DM Serif Display", fontBody: "Manrope",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#eab308", profileSize: 96,
        accentColor: "#eab308", accentColor2: "#d97706",
      },
    },
  },
  {
    id: "ocean-calm",
    label: "Ocean",
    desc: "Calmo e confiante",
    category: "animated",
    preview: { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
    config: {
      theme: "ocean",
      design: {
        bgType: "effect", bgEffect: "layered-waves", bgColor: "#020c14",
        buttonShape: "rounded", buttonFill: "glass", buttonShadow: "sm", buttonRadius: 14,
        fontHeading: "Montserrat", fontBody: "Urbanist",
        profileShape: "circle", profileBorder: false, profileSize: 88,
        accentColor: "#06b6d4", accentColor2: "#22d3ee",
      },
    },
  },
  {
    id: "wine-elegance",
    label: "Wine",
    desc: "Refinado e marcante",
    category: "dark",
    preview: { bg: "#100408", accent: "#be185d", accent2: "#e11d48" },
    config: {
      theme: "wine",
      design: {
        bgType: "gradient", bgGradient: ["#100408", "#200a14"] as [string, string], bgGradientDir: "to-br",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14,
        fontHeading: "Cormorant Garamond", fontBody: "Montserrat",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#be185d", profileSize: 96,
        accentColor: "#be185d", accentColor2: "#e11d48",
      },
    },
  },
  {
    id: "arctic-ice",
    label: "Arctic",
    desc: "Frio e impactante",
    category: "animated",
    preview: { bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc" },
    config: {
      theme: "arctic",
      design: {
        bgType: "effect", bgEffect: "ripple-rings", bgColor: "#050a10",
        buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "Sora", fontBody: "Inter",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#38bdf8", profileSize: 92,
        accentColor: "#38bdf8", accentColor2: "#7dd3fc",
      },
    },
  },
  {
    id: "coral-creative",
    label: "Coral",
    desc: "Criativo e divertido",
    category: "bold",
    preview: { bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6" },
    config: {
      theme: "coral",
      design: {
        bgType: "pattern", bgPattern: "dots", bgColor: "#0f0808",
        buttonShape: "rounded", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16,
        fontHeading: "Righteous", fontBody: "Urbanist",
        profileShape: "rounded", profileBorder: true, profileBorderColor: "#fb923c", profileSize: 88,
        accentColor: "#fb923c", accentColor2: "#f472b6",
      },
    },
  },
  {
    id: "indigo-deep",
    label: "Indigo",
    desc: "Profundo e misterioso",
    category: "animated",
    preview: { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
    config: {
      theme: "indigo",
      design: {
        bgType: "effect", bgEffect: "vortex-spin", bgColor: "#06050f",
        buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14,
        fontHeading: "Plus Jakarta Sans", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: false, profileSize: 92,
        accentColor: "#6366f1", accentColor2: "#a78bfa",
      },
    },
  },
  {
    id: "emerald-pro",
    label: "Emerald",
    desc: "Profissional e clean",
    category: "minimal",
    preview: { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
    config: {
      theme: "emerald",
      design: {
        bgType: "solid", bgColor: "#021a0f", bgEffect: "",
        buttonShape: "rounded", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12,
        fontHeading: "Manrope", fontBody: "Rubik",
        profileShape: "circle", profileBorder: false, profileSize: 88,
        accentColor: "#10b981", accentColor2: "#6ee7b7",
      },
    },
  },
  {
    id: "rose-romantic",
    label: "Rose",
    desc: "Delicado e atraente",
    category: "animated",
    preview: { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
    config: {
      theme: "rose",
      design: {
        bgType: "effect", bgEffect: "floating-orbs", bgColor: "#100509",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12,
        fontHeading: "Dancing Script", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#f43f5e", profileSize: 96,
        accentColor: "#f43f5e", accentColor2: "#fb7185",
      },
    },
  },
  {
    id: "lavender-dream",
    label: "Lavender",
    desc: "Suave e inspirador",
    category: "dark",
    preview: { bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa" },
    config: {
      theme: "lavender",
      design: {
        bgType: "effect", bgEffect: "fog", bgColor: "#0c0a14",
        buttonShape: "soft", buttonFill: "glass", buttonShadow: "sm", buttonRadius: 16,
        fontHeading: "Satisfy", fontBody: "Outfit",
        profileShape: "rounded", profileBorder: false, profileSize: 88,
        accentColor: "#c084fc", accentColor2: "#a78bfa",
      },
    },
  },
  {
    id: "crimson-power",
    label: "Crimson",
    desc: "Forte e poderoso",
    category: "bold",
    preview: { bg: "#120508", accent: "#dc2626", accent2: "#f87171" },
    config: {
      theme: "crimson",
      design: {
        bgType: "effect", bgEffect: "radial-glow", bgColor: "#120508",
        buttonShape: "square", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 6,
        fontHeading: "Bebas Neue", fontBody: "Poppins",
        profileShape: "hexagon", profileBorder: false, profileSize: 96,
        accentColor: "#dc2626", accentColor2: "#f87171",
      },
    },
  },
  /* ── NEW: Animated motion packs ── */
  {
    id: "waves-ocean",
    label: "Ondas",
    desc: "Ondas do oceano em movimento",
    category: "animated",
    preview: { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
    config: {
      theme: "ocean",
      design: {
        bgType: "effect", bgEffect: "ocean-waves", bgColor: "#020c14",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12,
        fontHeading: "Montserrat", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#06b6d4", profileSize: 92,
        accentColor: "#06b6d4", accentColor2: "#22d3ee",
      },
    },
  },
  {
    id: "orbits",
    label: "Órbitas",
    desc: "Círculos girando em loop",
    category: "animated",
    preview: { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
    config: {
      theme: "indigo",
      design: {
        bgType: "effect", bgEffect: "orbit-circles", bgColor: "#06050f",
        buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14,
        fontHeading: "Sora", fontBody: "Inter",
        profileShape: "circle", profileBorder: false, profileSize: 92,
        accentColor: "#6366f1", accentColor2: "#a78bfa",
      },
    },
  },
  {
    id: "blobs-morph",
    label: "Blobs",
    desc: "Formas orgânicas em transformação",
    category: "animated",
    preview: { bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa" },
    config: {
      theme: "lavender",
      design: {
        bgType: "effect", bgEffect: "morph-blobs", bgColor: "#0c0a14",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16,
        fontHeading: "Outfit", fontBody: "Nunito",
        profileShape: "rounded", profileBorder: false, profileSize: 88,
        accentColor: "#c084fc", accentColor2: "#a78bfa",
      },
    },
  },
  {
    id: "rings-orbit",
    label: "Anéis",
    desc: "Anéis girando com pontos orbitais",
    category: "animated",
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: {
      theme: "midnight",
      design: {
        bgType: "effect", bgEffect: "orbit-rings", bgColor: "#05080f",
        buttonShape: "rounded", buttonFill: "outline", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "Space Grotesk", fontBody: "Inter",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#60a5fa", profileSize: 96,
        accentColor: "#60a5fa", accentColor2: "#818cf8",
      },
    },
  },
  {
    id: "neon-flow",
    label: "Neon Flow",
    desc: "Linhas neon ondulando",
    category: "animated",
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: {
      theme: "neon-pink",
      design: {
        bgType: "effect", bgEffect: "neon-lines", bgColor: "#0a0010",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "Bebas Neue", fontBody: "Space Grotesk",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileSize: 96,
        accentColor: "#ff2d95", accentColor2: "#ff6ec7",
      },
    },
  },
  {
    id: "wireframe-globe",
    label: "Globe",
    desc: "Globo wireframe girando",
    category: "animated",
    preview: { bg: "#050810", accent: "#22d3ee", accent2: "#06b6d4" },
    config: {
      theme: "midnight",
      design: {
        bgType: "effect", bgEffect: "wireframe-globe", bgColor: "#050810",
        buttonShape: "rounded", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14,
        fontHeading: "Space Grotesk", fontBody: "Inter",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#22d3ee", profileSize: 92,
        accentColor: "#22d3ee", accentColor2: "#06b6d4",
      },
    },
  },
  /* ── NEW: Light / White / Black theme packs ── */
  {
    id: "clean-white",
    label: "Branco",
    desc: "Clean e luminoso",
    category: "light",
    preview: { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
    config: {
      theme: "white",
      design: {
        bgType: "solid", bgColor: "#f8f9fa", bgEffect: "",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12,
        fontHeading: "Inter", fontBody: "DM Sans",
        profileShape: "circle", profileBorder: false, profileSize: 88,
        accentColor: "#6366f1", accentColor2: "#8b5cf6",
        textColor: "#111827", subtextColor: "rgba(17,24,39,0.65)",
        cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)",
      },
    },
  },
  {
    id: "warm-cream",
    label: "Creme",
    desc: "Quente e acolhedor",
    category: "light",
    preview: { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309" },
    config: {
      theme: "cream",
      design: {
        bgType: "solid", bgColor: "#faf7f2", bgEffect: "",
        buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 14,
        fontHeading: "Playfair Display", fontBody: "Lora",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#d97706", profileSize: 92,
        accentColor: "#d97706", accentColor2: "#b45309",
        textColor: "#1c1917", subtextColor: "rgba(28,25,23,0.60)",
        cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.06)",
      },
    },
  },
  {
    id: "pure-black",
    label: "Preto Puro",
    desc: "Minimalista e contrastante",
    category: "minimal",
    preview: { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0" },
    config: {
      theme: "pure-black",
      design: {
        bgType: "solid", bgColor: "#000000", bgEffect: "",
        buttonShape: "square", buttonFill: "outline", buttonShadow: "none", buttonRadius: 4,
        fontHeading: "Space Grotesk", fontBody: "JetBrains Mono",
        profileShape: "square", profileBorder: true, profileBorderColor: "#ffffff", profileSize: 88,
        accentColor: "#ffffff", accentColor2: "#a0a0a0",
      },
    },
  },
  {
    id: "bold-red",
    label: "Vermelho",
    desc: "Agressivo e chamativo",
    category: "bold",
    preview: { bg: "#0a0000", accent: "#ff3333", accent2: "#ff6666" },
    config: {
      theme: "bold-red",
      design: {
        bgType: "effect", bgEffect: "ripple-rings", bgColor: "#0a0000",
        buttonShape: "pill", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12,
        fontHeading: "Bebas Neue", fontBody: "Poppins",
        profileShape: "circle", profileBorder: true, profileBorderColor: "#ff3333", profileSize: 96,
        accentColor: "#ff3333", accentColor2: "#ff6666",
      },
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Auto Font Pairing — maps heading fonts to ideal body fonts
   ═══════════════════════════════════════════════════════════════════ */
const FONT_PAIRS: Record<string, string> = {
  "Inter": "DM Sans",
  "Poppins": "DM Sans",
  "Montserrat": "Urbanist",
  "Outfit": "Nunito",
  "DM Sans": "Inter",
  "Space Grotesk": "JetBrains Mono",
  "Nunito": "Outfit",
  "Rubik": "Manrope",
  "Manrope": "Rubik",
  "Plus Jakarta Sans": "DM Sans",
  "Urbanist": "Montserrat",
  "Sora": "Inter",
  "Playfair Display": "Lora",
  "Lora": "Playfair Display",
  "Merriweather": "DM Sans",
  "DM Serif Display": "Manrope",
  "Cormorant Garamond": "Montserrat",
  "Bebas Neue": "Space Grotesk",
  "Righteous": "Urbanist",
  "Pacifico": "Poppins",
  "Satisfy": "Outfit",
  "Dancing Script": "DM Sans",
  "JetBrains Mono": "Space Grotesk",
  "Fira Code": "Inter",
};

/* ═══════════════════════════════════════════════════════════════════
   Auto Color Harmony — generates complementary colors from a single accent
   ═══════════════════════════════════════════════════════════════════ */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateHarmony(accentHex: string) {
  const [h, s, l] = hexToHsl(accentHex);
  return {
    accent2: hslToHex(h + 30, s * 0.9, l + 5),        // analogous shift
    bgColor: hslToHex(h, Math.min(s * 0.3, 20), 3),    // very dark version
    cardBg: hslToHex(h, Math.min(s * 0.25, 15), 7),    // slightly lighter
    cardBorder: `rgba(${parseInt(accentHex.slice(1, 3), 16)},${parseInt(accentHex.slice(3, 5), 16)},${parseInt(accentHex.slice(5, 7), 16)},0.28)`,
    textColor: hslToHex(h, Math.min(s * 0.15, 10), 97), // near-white
    subtextColor: `rgba(${parseInt(hslToHex(h, Math.min(s * 0.15, 10), 97).slice(1, 3), 16)},${parseInt(hslToHex(h, Math.min(s * 0.15, 10), 97).slice(3, 5), 16)},${parseInt(hslToHex(h, Math.min(s * 0.15, 10), 97).slice(5, 7), 16)},0.80)`,
  };
}

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
    case "ocean-waves": return { background: `linear-gradient(180deg, transparent 50%, ${a}15 70%, ${a}08 90%, transparent)` };
    case "orbit-circles": return { background: `radial-gradient(circle at 50% 50%, transparent 30%, ${a}10 32%, transparent 34%), radial-gradient(circle at 50% 50%, transparent 45%, ${a}08 47%, transparent 49%)` };
    case "ripple-rings": return { background: `radial-gradient(circle, transparent 20%, ${a}10 22%, transparent 24%), radial-gradient(circle, transparent 35%, ${a}08 37%, transparent 39%)` };
    case "morph-blobs": return { background: `radial-gradient(ellipse at 30% 40%, ${a}20 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, #ec489915 0%, transparent 50%)` };
    case "orbit-rings": return { background: `radial-gradient(circle, transparent 30%, ${a}08 31%, transparent 32%), radial-gradient(circle, transparent 45%, ${a}06 46%, transparent 47%), radial-gradient(circle, transparent 60%, ${a}04 61%, transparent 62%)` };
    case "neon-lines": return { backgroundImage: `linear-gradient(0deg, transparent 45%, ${a}15 50%, transparent 55%), linear-gradient(0deg, transparent 65%, #ec489910 70%, transparent 75%)` };
    case "gradient-shift-hue": return { background: `linear-gradient(135deg, ${a}30, #ec489920, #60a5fa20)` };
    case "light-sweep": return { background: `linear-gradient(90deg, transparent 30%, ${a}20 50%, transparent 70%)` };
    case "breathing-glow": return { background: `radial-gradient(circle at 40% 40%, ${a}25, transparent 60%)` };
    case "conic-spotlight": return { background: `conic-gradient(from 45deg, transparent 0%, ${a}15 10%, transparent 20%)` };
    case "rising-particles": return { background: `radial-gradient(1px 1px at 30% 70%, ${a} 50%, transparent), radial-gradient(2px 2px at 60% 40%, ${a} 50%, transparent), radial-gradient(1px 1px at 80% 60%, ${a} 50%, transparent)` };
    case "noise-flicker": return { background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)` };
    case "diagonal-shimmer": return { background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${a}06 10px, ${a}06 20px)` };
    case "floating-orbs": return { background: `radial-gradient(circle at 30% 30%, ${a}20, transparent 50%), radial-gradient(circle at 70% 70%, #ec489915, transparent 50%)` };
    case "layered-waves": return { background: `linear-gradient(180deg, transparent 40%, ${a}12 60%, ${a}06 80%, transparent)` };
    case "pulse-circles": return { background: `radial-gradient(circle, transparent 25%, ${a}08 27%, transparent 29%), radial-gradient(circle, transparent 40%, ${a}06 42%, transparent 44%)` };
    case "gradient-aurora-mesh": return { background: `linear-gradient(135deg, ${a}15, transparent, ${a}10), radial-gradient(circle at 50% 80%, #ec489910, transparent 50%)` };
    case "stripe-gradient": return { background: `linear-gradient(-45deg, ${a}15, #ec489910, #60a5fa10, ${a}15)` };
    case "vortex-spin": return { background: `conic-gradient(from 0deg, transparent, ${a}10, transparent, ${a}05, transparent)` };
    case "liquid-glass": return { background: `radial-gradient(ellipse at 35% 40%, ${a}18, transparent 50%), radial-gradient(ellipse at 65% 65%, #ec489912, transparent 50%)` };
    case "wireframe-globe": return { background: `radial-gradient(circle, transparent 30%, ${a}08 31%, transparent 32%), radial-gradient(circle, transparent 55%, ${a}06 56%, transparent 57%), linear-gradient(0deg, transparent 48%, ${a}08 49%, ${a}08 51%, transparent 52%), linear-gradient(90deg, transparent 48%, ${a}06 49%, ${a}06 51%, transparent 52%)` };
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

function SectionCard({ title, icon, children, defaultOpen = true, desc, step }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; desc?: string; step?: number;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[hsl(var(--dash-border-subtle))]/60 bg-gradient-to-b from-[hsl(var(--dash-surface-2))]/80 to-[hsl(var(--dash-surface-2))]/40 overflow-hidden backdrop-blur-sm">
      <summary className="flex items-center gap-2.5 px-5 py-4 cursor-pointer select-none hover:bg-[hsl(var(--dash-accent))]/30 transition-colors">
        {step && (
          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0">
            {step}
          </span>
        )}
        <span className="text-primary flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-[hsl(var(--dash-text-secondary))] text-[13px] font-semibold">{title}</span>
          {desc && <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-tight mt-0.5">{desc}</p>}
        </div>
        <ChevronDown size={14} className="text-[hsl(var(--dash-text-subtle))] group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-5 pb-5 space-y-3 border-t border-[hsl(var(--dash-border-subtle))]/60">
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
  const [packFilter, setPackFilter] = useState<string>("all");
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

  /* ── Apply a complete Design Pack ── */
  const applyPack = useCallback((pack: DesignPack) => {
    updateConfig("theme", pack.config.theme);
    const prev = config.design || {};
    updateConfig("design", { ...prev, ...pack.config.design });
    // Load fonts
    if (pack.config.design.fontHeading) loadFont(pack.config.design.fontHeading);
    if (pack.config.design.fontBody) loadFont(pack.config.design.fontBody);
  }, [config.design, updateConfig]);

  /* ── Auto Font Pairing: when heading changes, suggest body ── */
  const applyFontPair = useCallback((headingFont: string) => {
    setDesign("fontHeading", headingFont);
    loadFont(headingFont);
    const paired = FONT_PAIRS[headingFont];
    if (paired) {
      setDesign("fontBody", paired);
      loadFont(paired);
    }
  }, [setDesign]);

  /* ── Auto Color Harmony: generates full palette from 1 color ── */
  const applyAutoHarmony = useCallback((accentHex: string) => {
    const harmony = generateHarmony(accentHex);
    const prev = config.design || {};
    updateConfig("theme", "custom");
    updateConfig("design", {
      ...prev,
      accentColor: accentHex,
      accentColor2: harmony.accent2,
      bgColor: harmony.bgColor,
      cardBg: harmony.cardBg,
      cardBorder: harmony.cardBorder,
      textColor: harmony.textColor,
      subtextColor: harmony.subtextColor,
    });
  }, [config.design, updateConfig]);

  return (
    <div className="space-y-5 pb-28">

      {/* ═══════════ HERO: DESIGN PACKS ═══════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <LayoutTemplate size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-[hsl(var(--dash-text))] font-bold text-lg tracking-tight">Escolha seu estilo</h2>
              <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">1 clique = design completo</p>
            </div>
          </div>
          {config.avatarUrl && (
            <Tooltip text="Gera cores a partir da sua foto">
              <button onClick={autoThemeFromAvatar}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all">
                <Wand2 size={12} /> Auto
              </button>
            </Tooltip>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {PACK_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setPackFilter(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                packFilter === cat.key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] border border-transparent"
              }`}>
              {cat.label}
              {cat.key !== "all" && (
                <span className="ml-1 text-[8px] opacity-60">
                  {DESIGN_PACKS.filter(p => p.category === cat.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pack grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {DESIGN_PACKS.filter(p => packFilter === "all" || p.category === packFilter).map(pack => {
            const isActive = config.theme === pack.config.theme
              && d.fontHeading === (pack.config.design.fontHeading || "Inter")
              && d.bgEffect === (pack.config.design.bgEffect || "");
            return (
              <Tooltip key={pack.id} text={`Aplicar "${pack.label}" — ${pack.desc}`}>
                <button onClick={() => applyPack(pack)}
                  className={`relative rounded-xl overflow-hidden text-left transition-all group w-full ${
                    isActive ? "ring-2 ring-primary scale-[1.02] shadow-lg shadow-primary/20" : "ring-1 ring-white/8 hover:ring-primary/40 hover:scale-[1.01]"
                  }`}>
                  <div className="h-[52px] relative" style={{ background: pack.preview.bg }}>
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${pack.preview.accent}18, transparent 40%, ${pack.preview.accent2}12)` }} />
                    <div className="absolute top-2.5 left-3 w-5 h-5 rounded-full border border-white/20" style={{
                      background: `linear-gradient(135deg, ${pack.preview.accent}40, ${pack.preview.accent2}30)`,
                      borderRadius: pack.config.design.profileShape === "square" ? "4px" : pack.config.design.profileShape === "rounded" ? "6px" : "9999px",
                    }} />
                    <div className="absolute top-3 left-10 space-y-1">
                      <div className="w-12 h-1 rounded-full bg-white/30" />
                      <div className="w-8 h-0.5 rounded-full bg-white/15" />
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 flex gap-1.5">
                      <div className="flex-1 h-3 rounded" style={{
                        borderRadius: pack.config.design.buttonShape === "pill" ? "999px" : pack.config.design.buttonShape === "square" ? "2px" : "4px",
                        background: pack.config.design.buttonFill === "outline" ? "transparent" : `${pack.preview.accent}80`,
                        border: pack.config.design.buttonFill === "outline" ? `1px solid ${pack.preview.accent}60` : "none",
                      }} />
                      <div className="flex-1 h-3 rounded" style={{
                        borderRadius: pack.config.design.buttonShape === "pill" ? "999px" : pack.config.design.buttonShape === "square" ? "2px" : "4px",
                        background: `linear-gradient(135deg, ${pack.preview.accent}50, ${pack.preview.accent2}50)`,
                      }} />
                    </div>
                    <div className="absolute top-2 right-2.5 flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20" style={{ background: pack.preview.accent }} />
                      <div className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20" style={{ background: pack.preview.accent2 }} />
                    </div>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Check size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-2 ${isActive ? "bg-primary/10" : "bg-[hsl(var(--dash-surface-2))]"}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] font-bold ${isActive ? "text-primary" : "text-[hsl(var(--dash-text))]"}`}
                        style={{ fontFamily: `"${pack.config.design.fontHeading}", sans-serif` }}>
                        {pack.label}
                      </p>
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/5 text-[hsl(var(--dash-text-subtle))]">
                        {pack.config.design.bgType === "effect" ? "Animado" : pack.config.design.bgType === "gradient" ? "Degradê" : pack.config.design.bgType === "pattern" ? "Padrão" : "Sólido"}
                      </span>
                    </div>
                    <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] leading-tight mt-0.5">
                      {pack.desc} · {pack.config.design.fontHeading}
                    </p>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* ═══════════ SEPARATOR ═══════════ */}
      <div className="space-y-2">
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--dash-border-subtle))] to-transparent" />
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] text-center">Quer personalizar mais? Ajuste abaixo</p>
      </div>

      {/* ═══════════ QUICK CUSTOMIZE — all collapsed ═══════════ */}

      {/* Quick: Generate palette from 1 color */}
      <SectionCard title="Cores automáticas" icon={<Wand2 size={14} />} defaultOpen={false}
        desc="Escolha 1 cor e gere a paleta completa">
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map(c => (
              <Tooltip key={`auto-${c}`} text={`Gerar paleta a partir de ${c.toUpperCase()}`}>
                <button onClick={() => applyAutoHarmony(c)}
                  className="w-8 h-8 rounded-lg ring-1 ring-white/10 hover:ring-white/40 hover:scale-110 transition-all relative group"
                  style={{ background: c }}>
                  <Wand2 size={10} className="text-white/0 group-hover:text-white/80 transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </button>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative w-8 h-8 rounded-lg overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all flex-shrink-0">
              <input type="color" value={accent} onChange={e => applyAutoHarmony(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <div className="w-full h-full flex items-center justify-center" style={{ background: accent }}>
                <Wand2 size={12} className="text-white/60" />
              </div>
            </label>
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Ou escolha qualquer cor</p>
          </div>
        </div>
      </SectionCard>

      {/* Quick: Background */}
      <SectionCard title="Fundo" icon={<Layers size={14} />} defaultOpen={false} desc="Tipo de fundo e efeitos animados">
        {/* BG Type selector */}
        <div className="flex gap-1.5 pt-2 flex-wrap">
          {([
            { type: "solid" as BgType, icon: <PaintBucket size={12} />, label: "Cor" },
            { type: "gradient" as BgType, icon: <Droplets size={12} />, label: "Degradê" },
            { type: "image" as BgType, icon: <Image size={12} />, label: "Imagem" },
            { type: "video" as BgType, icon: <Video size={12} />, label: "Vídeo" },
            { type: "pattern" as BgType, icon: <Grid3X3 size={12} />, label: "Padrão" },
            { type: "effect" as BgType, icon: <Sparkles size={12} />, label: "Efeito" },
          ]).map(({ type, icon, label }) => (
            <Tooltip key={type} text={label}>
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
            <div className="grid grid-cols-6 gap-2">
              {SOLID_COLORS.map(c => (
                <Tooltip key={c} text={c.toUpperCase()}>
                  <button onClick={() => { setDesign("bgColor", c); updateConfig("theme", "custom"); }}
                    className={`w-8 h-8 rounded-lg ring-1 transition-all hover:scale-110 ${
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

      {/* Quick: Colors */}
      <SectionCard title="Cores" icon={<Palette size={14} />} defaultOpen={false} desc="Ajuste fino das cores">
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.accentColor || currentTheme.accent} onChange={v => { setDesign("accentColor", v); updateConfig("theme", "custom"); }} label="Cor principal" />
            <ColorPicker value={d.accentColor2 || currentTheme.accent2} onChange={v => { setDesign("accentColor2", v); updateConfig("theme", "custom"); }} label="Cor secundária" />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map(c => (
              <Tooltip key={c} text={c.toUpperCase()}>
                <button onClick={() => { setDesign("accentColor", c); updateConfig("theme", "custom"); }}
                  className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                    (d.accentColor || currentTheme.accent) === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/10"
                  }`} style={{ background: c }} />
              </Tooltip>
            ))}
          </div>
          <div className="pt-1 space-y-2">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] font-medium">Refinamento</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker value={d.textColor || "#f8f5ff"} onChange={v => setDesign("textColor", v)} label="Texto" />
              <ColorPicker value={d.subtextColor || "rgba(248,245,255,0.5)"} onChange={v => setDesign("subtextColor", v)} label="Subtexto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker value={d.cardBg || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo card" />
              <ColorPicker value={d.cardBorder || "rgba(168,85,247,0.18)"} onChange={v => setDesign("cardBorder", v)} label="Borda card" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Quick: Buttons */}
      <SectionCard title="Botões" icon={<Square size={14} />} defaultOpen={false} desc="Formato e estilo">
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

      {/* Quick: Typography */}
      <SectionCard title="Tipografia" icon={<Type size={14} />} defaultOpen={false} desc="Fontes — auto-pareamento incluído">
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
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Fonte do título</p>
              <Tooltip text="Ao escolher uma fonte de título, a fonte do corpo é pareada automaticamente">
                <span className="flex items-center gap-1 text-[9px] text-primary/60 font-medium">
                  <Link2 size={9} /> Auto-pair
                </span>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {GOOGLE_FONTS.filter(f => fontFilter === "all" || f.category === fontFilter).map(f => {
                const isActive = d.fontHeading === f.name;
                const pairedBody = FONT_PAIRS[f.name];
                return (
                  <Tooltip key={f.name} text={`Título: "${f.name}"${pairedBody ? ` → Corpo: "${pairedBody}"` : ""}`}>
                    <button onClick={() => applyFontPair(f.name)}
                      className={`px-3 py-2 rounded-xl text-left text-[12px] font-medium transition-all w-full ${
                        isActive ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text))] border border-transparent hover:border-primary/20"
                      }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                      {f.name}
                      {pairedBody && <span className="block text-[8px] mt-0.5 opacity-50">→ {pairedBody}</span>}
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

      {/* Quick: Profile Photo */}
      <SectionCard title="Foto de perfil" icon={<Circle size={14} />} defaultOpen={false} desc="Formato e borda">
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

      {/* Summary */}
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
