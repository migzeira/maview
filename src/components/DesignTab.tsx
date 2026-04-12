import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check, ChevronDown, ChevronLeft, ChevronRight, Palette, Image, Video, Type, Square, Circle,
  Sparkles, Upload, X, Play, Layers, Grid3X3, Wand2,
  LayoutTemplate, PaintBucket, Droplets,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */
type ThemeId = string;
type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
type ButtonShape = "rounded" | "pill" | "square" | "soft";
type ButtonFill = "solid" | "outline" | "glass" | "ghost";
type ButtonShadow = "none" | "sm" | "md" | "glow";
type ProfileShape = "circle" | "rounded" | "square" | "hexagon";

interface DesignConfig {
  bgType: BgType; bgColor: string; bgGradient: [string, string]; bgGradientDir: GradientDir;
  bgImageUrl: string; bgVideoUrl: string; bgPattern: string; bgOverlay: number; bgBlur: number; bgEffect: string;
  textColor: string; subtextColor: string; cardBg: string; cardBorder: string;
  accentColor: string; accentColor2: string; fontHeading: string; fontBody: string;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: ButtonShadow; buttonRadius: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileSize: number;
  hideWatermark: boolean; layout?: string;
}

interface ThemeDef { id: ThemeId; label: string; bg: string; accent: string; accent2: string; }

interface DesignTabProps {
  config: { theme: ThemeId; design?: Partial<DesignConfig>; avatarUrl: string; displayName: string; };
  themes: ThemeDef[];
  defaultDesign: DesignConfig;
  updateConfig: (key: string, value: any) => void;
  highlightField?: string | null;
  themeGridRef?: React.RefObject<HTMLDivElement>;
}

/* ═══════════════════════════════════════════════════════════════════
   Reference profiles — showcase creators to inspire
   ═══════════════════════════════════════════════════════════════════ */
interface ReferenceProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  socials: string[];
  links: string[];
  products: { title: string; price: string }[];
}

const REFERENCE_PROFILES: ReferenceProfile[] = [
  {
    name: "Ana Beatriz",
    username: "@anabeatriz",
    bio: "Designer & criadora de conteudo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "tt", "yt"],
    links: ["Meu portfolio", "Agende uma call"],
    products: [{ title: "Ebook Design", price: "R$ 47" }, { title: "Mentoria 1:1", price: "R$ 197" }],
  },
  {
    name: "Lucas Santos",
    username: "@lucassantos",
    bio: "Fitness coach & nutricionista",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "yt"],
    links: ["Treinos online", "WhatsApp"],
    products: [{ title: "Plano 12 semanas", price: "R$ 97" }, { title: "Dieta personalizada", price: "R$ 67" }],
  },
  {
    name: "Camila Rocha",
    username: "@camilarocha",
    bio: "Fotografa & videomaker",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "tt", "pin"],
    links: ["Booking", "Presets Lightroom"],
    products: [{ title: "Pack 50 Presets", price: "R$ 29" }, { title: "Curso de foto", price: "R$ 149" }],
  },
  {
    name: "Pedro Mendes",
    username: "@pedromendes",
    bio: "Dev & criador de SaaS",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    socials: ["gh", "tw", "li"],
    links: ["Newsletter", "Meu SaaS"],
    products: [{ title: "Template Next.js", price: "R$ 79" }, { title: "Consultoria", price: "R$ 297" }],
  },
  {
    name: "Julia Lima",
    username: "@julialima",
    bio: "Artista digital & ilustradora",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "be", "tt"],
    links: ["Loja de prints", "Commissions"],
    products: [{ title: "Pack wallpapers", price: "R$ 19" }, { title: "Ilustracao custom", price: "R$ 350" }],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Design Packs
   ═══════════════════════════════════════════════════════════════════ */
interface DesignPack {
  id: string; label: string; desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold";
  preview: { bg: string; accent: string; accent2: string };
  config: { theme: string; design: Partial<DesignConfig> };
  refIdx: number; // index into REFERENCE_PROFILES
}

const DESIGN_PACKS: DesignPack[] = [
  { id: "luxury-dark", label: "Luxury", desc: "Elegante e sofisticado", category: "dark", refIdx: 0,
    preview: { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
    config: { theme: "dark-purple", design: { bgType: "gradient", bgGradient: ["#080612", "#1a0a2e"], bgGradientDir: "to-b", buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileSize: 96, accentColor: "#a855f7", accentColor2: "#ec4899" } } },
  { id: "neon-bold", label: "Neon", desc: "Vibrante e ousado", category: "bold", refIdx: 3,
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: { theme: "neon-pink", design: { bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Bebas Neue", fontBody: "Space Grotesk", profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileSize: 96, accentColor: "#ff2d95", accentColor2: "#ff6ec7" } } },
  { id: "minimal-clean", label: "Minimal", desc: "Limpo e moderno", category: "minimal", refIdx: 4,
    preview: { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
    config: { theme: "slate", design: { bgType: "solid", bgColor: "#0c0e12", bgEffect: "", buttonShape: "pill", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12, fontHeading: "Inter", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#94a3b8", accentColor2: "#cbd5e1" } } },
  { id: "ocean-calm", label: "Ocean", desc: "Calmo e confiante", category: "animated", refIdx: 2,
    preview: { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
    config: { theme: "ocean", design: { bgType: "effect", bgEffect: "layered-waves", bgColor: "#020c14", buttonShape: "rounded", buttonFill: "glass", buttonShadow: "sm", buttonRadius: 14, fontHeading: "Montserrat", fontBody: "Urbanist", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#06b6d4", accentColor2: "#22d3ee" } } },
  { id: "sunset-vibes", label: "Sunset", desc: "Quente e envolvente", category: "animated", refIdx: 1,
    preview: { bg: "#0f0805", accent: "#f97316", accent2: "#ef4444" },
    config: { theme: "sunset", design: { bgType: "effect", bgEffect: "rising-particles", bgColor: "#0f0805", buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12, fontHeading: "Poppins", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#f97316", profileSize: 92, accentColor: "#f97316", accentColor2: "#ef4444" } } },
  { id: "gold-premium", label: "Gold", desc: "Premium e exclusivo", category: "bold", refIdx: 0,
    preview: { bg: "#0c0a04", accent: "#eab308", accent2: "#d97706" },
    config: { theme: "gold", design: { bgType: "effect", bgEffect: "ambient-glow", bgColor: "#0c0a04", buttonShape: "soft", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12, fontHeading: "DM Serif Display", fontBody: "Manrope", profileShape: "circle", profileBorder: true, profileBorderColor: "#eab308", profileSize: 96, accentColor: "#eab308", accentColor2: "#d97706" } } },
  { id: "tech-future", label: "Tech", desc: "Futurista e digital", category: "dark", refIdx: 3,
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: { theme: "midnight", design: { bgType: "effect", bgEffect: "matrix-grid", bgColor: "#05080f", buttonShape: "square", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Space Grotesk", fontBody: "JetBrains Mono", profileShape: "hexagon", profileBorder: false, profileSize: 92, accentColor: "#60a5fa", accentColor2: "#818cf8" } } },
  { id: "nature-organic", label: "Nature", desc: "Organico e natural", category: "dark", refIdx: 2,
    preview: { bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
    config: { theme: "forest", design: { bgType: "gradient", bgGradient: ["#050f05", "#0a2a1a"], bgGradientDir: "to-b", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16, fontHeading: "Outfit", fontBody: "Nunito", profileShape: "rounded", profileBorder: false, profileSize: 88, accentColor: "#4ade80", accentColor2: "#34d399" } } },
  { id: "wine-elegance", label: "Wine", desc: "Refinado e marcante", category: "dark", refIdx: 4,
    preview: { bg: "#100408", accent: "#be185d", accent2: "#e11d48" },
    config: { theme: "wine", design: { bgType: "gradient", bgGradient: ["#100408", "#200a14"], bgGradientDir: "to-br", buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14, fontHeading: "Cormorant Garamond", fontBody: "Montserrat", profileShape: "circle", profileBorder: true, profileBorderColor: "#be185d", profileSize: 96, accentColor: "#be185d", accentColor2: "#e11d48" } } },
  { id: "arctic-ice", label: "Arctic", desc: "Frio e impactante", category: "animated", refIdx: 1,
    preview: { bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc" },
    config: { theme: "arctic", design: { bgType: "effect", bgEffect: "ripple-rings", bgColor: "#050a10", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Sora", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#38bdf8", profileSize: 92, accentColor: "#38bdf8", accentColor2: "#7dd3fc" } } },
  { id: "indigo-deep", label: "Indigo", desc: "Profundo e misterioso", category: "animated", refIdx: 3,
    preview: { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
    config: { theme: "indigo", design: { bgType: "effect", bgEffect: "vortex-spin", bgColor: "#06050f", buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14, fontHeading: "Plus Jakarta Sans", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 92, accentColor: "#6366f1", accentColor2: "#a78bfa" } } },
  { id: "rose-romantic", label: "Rose", desc: "Delicado e atraente", category: "animated", refIdx: 4,
    preview: { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
    config: { theme: "rose", design: { bgType: "effect", bgEffect: "floating-orbs", bgColor: "#100509", buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12, fontHeading: "Dancing Script", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#f43f5e", profileSize: 96, accentColor: "#f43f5e", accentColor2: "#fb7185" } } },
  { id: "coral-creative", label: "Coral", desc: "Criativo e divertido", category: "bold", refIdx: 2,
    preview: { bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6" },
    config: { theme: "coral", design: { bgType: "pattern", bgPattern: "dots", bgColor: "#0f0808", buttonShape: "rounded", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16, fontHeading: "Righteous", fontBody: "Urbanist", profileShape: "rounded", profileBorder: true, profileBorderColor: "#fb923c", profileSize: 88, accentColor: "#fb923c", accentColor2: "#f472b6" } } },
  { id: "crimson-power", label: "Crimson", desc: "Forte e poderoso", category: "bold", refIdx: 1,
    preview: { bg: "#120508", accent: "#dc2626", accent2: "#f87171" },
    config: { theme: "crimson", design: { bgType: "effect", bgEffect: "radial-glow", bgColor: "#120508", buttonShape: "square", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Bebas Neue", fontBody: "Poppins", profileShape: "hexagon", profileBorder: false, profileSize: 96, accentColor: "#dc2626", accentColor2: "#f87171" } } },
  { id: "clean-white", label: "Branco", desc: "Clean e luminoso", category: "light", refIdx: 0,
    preview: { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
    config: { theme: "white", design: { bgType: "solid", bgColor: "#f8f9fa", bgEffect: "", buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Inter", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#6366f1", accentColor2: "#8b5cf6", textColor: "#111827", subtextColor: "rgba(17,24,39,0.65)", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)" } } },
  { id: "warm-cream", label: "Creme", desc: "Quente e acolhedor", category: "light", refIdx: 4,
    preview: { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309" },
    config: { theme: "cream", design: { bgType: "solid", bgColor: "#faf7f2", bgEffect: "", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 14, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#d97706", profileSize: 92, accentColor: "#d97706", accentColor2: "#b45309", textColor: "#1c1917", subtextColor: "rgba(28,25,23,0.60)", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.06)" } } },
  { id: "emerald-pro", label: "Emerald", desc: "Profissional e clean", category: "minimal", refIdx: 3,
    preview: { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
    config: { theme: "emerald", design: { bgType: "solid", bgColor: "#021a0f", bgEffect: "", buttonShape: "rounded", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12, fontHeading: "Manrope", fontBody: "Rubik", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#10b981", accentColor2: "#6ee7b7" } } },
  { id: "pure-black", label: "Preto Puro", desc: "Minimalista e contrastante", category: "minimal", refIdx: 1,
    preview: { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0" },
    config: { theme: "pure-black", design: { bgType: "solid", bgColor: "#000000", bgEffect: "", buttonShape: "square", buttonFill: "outline", buttonShadow: "none", buttonRadius: 4, fontHeading: "Space Grotesk", fontBody: "JetBrains Mono", profileShape: "square", profileBorder: true, profileBorderColor: "#ffffff", profileSize: 88, accentColor: "#ffffff", accentColor2: "#a0a0a0" } } },
  { id: "waves-ocean", label: "Ondas", desc: "Ondas em movimento", category: "animated", refIdx: 2,
    preview: { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
    config: { theme: "ocean", design: { bgType: "effect", bgEffect: "ocean-waves", bgColor: "#020c14", buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12, fontHeading: "Montserrat", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#06b6d4", profileSize: 92, accentColor: "#06b6d4", accentColor2: "#22d3ee" } } },
  { id: "wireframe-globe", label: "Globe", desc: "Globo wireframe 3D", category: "animated", refIdx: 3,
    preview: { bg: "#050810", accent: "#22d3ee", accent2: "#06b6d4" },
    config: { theme: "midnight", design: { bgType: "effect", bgEffect: "wireframe-globe", bgColor: "#050810", buttonShape: "rounded", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14, fontHeading: "Space Grotesk", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#22d3ee", profileSize: 92, accentColor: "#22d3ee", accentColor2: "#06b6d4" } } },
];

const PACK_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "animated", label: "Animados" },
  { key: "dark", label: "Dark" },
  { key: "light", label: "Claros" },
  { key: "minimal", label: "Minimal" },
  { key: "bold", label: "Bold" },
];

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */
const BG_PATTERNS = [
  { id: "dots", label: "Pontos" }, { id: "grid", label: "Grade" }, { id: "diagonal", label: "Diagonal" },
  { id: "waves", label: "Ondas" }, { id: "cross", label: "Cruz" }, { id: "hexagon", label: "Hexagono" }, { id: "noise", label: "Textura" },
];

const BG_EFFECTS: { id: string; label: string; category: string }[] = [
  { id: "aurora", label: "Aurora", category: "glow" }, { id: "aurora-waves", label: "Aurora Ondas", category: "glow" },
  { id: "ambient-glow", label: "Brilho Ambiente", category: "glow" }, { id: "spotlight", label: "Holofote", category: "glow" },
  { id: "radial-glow", label: "Brilho Radial", category: "glow" },
  { id: "gradient-flow", label: "Gradiente Fluido", category: "gradient" }, { id: "gradient-mesh", label: "Malha Gradiente", category: "gradient" },
  { id: "gradient-shift", label: "Gradiente Shift", category: "gradient" },
  { id: "starfield", label: "Campo Estelar", category: "particle" }, { id: "floating-dots", label: "Pontos Flutuantes", category: "particle" },
  { id: "sparkles", label: "Brilhos", category: "particle" },
  { id: "wave-layers", label: "Camadas de Onda", category: "wave" }, { id: "flow-field", label: "Campo de Fluxo", category: "wave" },
  { id: "liquid", label: "Liquido", category: "wave" },
  { id: "matrix-grid", label: "Grade Matrix", category: "tech" }, { id: "pulse-grid", label: "Grade Pulsante", category: "tech" },
  { id: "scan-lines", label: "Scan Lines", category: "tech" },
  { id: "fog", label: "Nevoa", category: "atmosphere" }, { id: "smoke", label: "Fumaca", category: "atmosphere" },
  { id: "clouds", label: "Nuvens", category: "atmosphere" },
  { id: "ocean-waves", label: "Ondas", category: "motion" }, { id: "orbit-circles", label: "Orbitas", category: "motion" },
  { id: "ripple-rings", label: "Ondulacoes", category: "motion" }, { id: "morph-blobs", label: "Blobs", category: "motion" },
  { id: "orbit-rings", label: "Aneis", category: "motion" }, { id: "neon-lines", label: "Linhas Neon", category: "motion" },
  { id: "gradient-shift-hue", label: "Arco-Iris", category: "gradient" }, { id: "light-sweep", label: "Varredura", category: "glow" },
  { id: "breathing-glow", label: "Respiracao", category: "glow" }, { id: "conic-spotlight", label: "Holofote Conico", category: "glow" },
  { id: "rising-particles", label: "Particulas", category: "particle" }, { id: "noise-flicker", label: "Ruido", category: "atmosphere" },
  { id: "diagonal-shimmer", label: "Diagonal", category: "wave" },
  { id: "floating-orbs", label: "Orbes", category: "glow" }, { id: "layered-waves", label: "Ondas Camadas", category: "motion" },
  { id: "pulse-circles", label: "Circulos Pulsantes", category: "motion" },
  { id: "gradient-aurora-mesh", label: "Aurora Mesh", category: "gradient" }, { id: "stripe-gradient", label: "Stripe", category: "gradient" },
  { id: "vortex-spin", label: "Vortex", category: "motion" }, { id: "liquid-glass", label: "Vidro Liquido", category: "motion" },
  { id: "wireframe-globe", label: "Globe", category: "motion" },
];

const EFFECT_CATEGORIES = [
  { key: "all", label: "Todos" }, { key: "glow", label: "Brilho" }, { key: "gradient", label: "Gradiente" },
  { key: "particle", label: "Particulas" }, { key: "wave", label: "Ondas" }, { key: "tech", label: "Tech" },
  { key: "atmosphere", label: "Atmosfera" }, { key: "motion", label: "Movimento" },
];

const GOOGLE_FONTS = [
  { name: "Inter", category: "sans" }, { name: "Poppins", category: "sans" }, { name: "Montserrat", category: "sans" },
  { name: "Outfit", category: "sans" }, { name: "DM Sans", category: "sans" }, { name: "Space Grotesk", category: "sans" },
  { name: "Nunito", category: "sans" }, { name: "Rubik", category: "sans" }, { name: "Manrope", category: "sans" },
  { name: "Plus Jakarta Sans", category: "sans" }, { name: "Urbanist", category: "sans" }, { name: "Sora", category: "sans" },
  { name: "Playfair Display", category: "serif" }, { name: "Lora", category: "serif" }, { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" }, { name: "Cormorant Garamond", category: "serif" },
  { name: "Bebas Neue", category: "display" }, { name: "Righteous", category: "display" },
  { name: "Pacifico", category: "handwriting" }, { name: "Satisfy", category: "handwriting" }, { name: "Dancing Script", category: "handwriting" },
  { name: "JetBrains Mono", category: "mono" }, { name: "Fira Code", category: "mono" },
];

const GRADIENT_PRESETS: [string, string][] = [
  ["#667eea", "#764ba2"], ["#f093fb", "#f5576c"], ["#4facfe", "#00f2fe"], ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"], ["#a18cd1", "#fbc2eb"], ["#f6d365", "#fda085"], ["#c471f5", "#fa71cd"],
];

const ACCENT_COLORS = [
  "#a855f7", "#ec4899", "#f43f5e", "#f97316", "#f59e0b", "#eab308",
  "#4ade80", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
];

const SOLID_COLORS = [
  "#080612", "#05080f", "#050f05", "#100509", "#020c14", "#0a0010",
  "#111111", "#1a1a2e", "#0f3460", "#1a1a1a", "#0d1b2a", "#1b263b",
];

const FONT_PAIRS: Record<string, string> = {
  "Inter": "DM Sans", "Poppins": "DM Sans", "Montserrat": "Urbanist", "Outfit": "Nunito",
  "DM Sans": "Inter", "Space Grotesk": "JetBrains Mono", "Nunito": "Outfit", "Rubik": "Manrope",
  "Manrope": "Rubik", "Plus Jakarta Sans": "DM Sans", "Urbanist": "Montserrat", "Sora": "Inter",
  "Playfair Display": "Lora", "Lora": "Playfair Display", "Merriweather": "DM Sans",
  "DM Serif Display": "Manrope", "Cormorant Garamond": "Montserrat", "Bebas Neue": "Space Grotesk",
  "Righteous": "Urbanist", "Pacifico": "Poppins", "Satisfy": "Outfit",
  "Dancing Script": "DM Sans", "JetBrains Mono": "Space Grotesk", "Fira Code": "Inter",
};

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6; else if (max === g) h = ((b - r) / d + 2) / 6; else h = ((r - g) / d + 4) / 6; }
  return [h * 360, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l); const f = (n: number) => { const k = (n + h / 30) % 12;
    return Math.round(255 * Math.max(0, Math.min(1, l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function generateHarmony(accentHex: string) {
  const [h, s, l] = hexToHsl(accentHex);
  const tw = hslToHex(h, Math.min(s * 0.15, 10), 97);
  return { accent2: hslToHex(h + 30, s * 0.9, l + 5), bgColor: hslToHex(h, Math.min(s * 0.3, 20), 3),
    cardBg: hslToHex(h, Math.min(s * 0.25, 15), 7),
    cardBorder: `rgba(${parseInt(accentHex.slice(1, 3), 16)},${parseInt(accentHex.slice(3, 5), 16)},${parseInt(accentHex.slice(5, 7), 16)},0.28)`,
    textColor: tw, subtextColor: `rgba(${parseInt(tw.slice(1, 3), 16)},${parseInt(tw.slice(3, 5), 16)},${parseInt(tw.slice(5, 7), 16)},0.80)` };
}
function extractColorsFromImage(imgSrc: string): Promise<{ dominant: string; accent: string }> {
  return new Promise((resolve) => {
    const img = new window.Image(); img.crossOrigin = "anonymous";
    img.onload = () => { const canvas = document.createElement("canvas"); canvas.width = 50; canvas.height = 50;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0, 50, 50); const data = ctx.getImageData(0, 0, 50, 50).data;
      const cc: Record<string, number> = {}; for (let i = 0; i < data.length; i += 16) { if (data[i + 3] < 128) continue;
        const key = `${Math.round(data[i] / 32) * 32},${Math.round(data[i + 1] / 32) * 32},${Math.round(data[i + 2] / 32) * 32}`; cc[key] = (cc[key] || 0) + 1; }
      const sorted = Object.entries(cc).sort((a, b) => b[1] - a[1]);
      const toHex = (s: string) => { const [r, g, b] = s.split(",").map(Number); return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`; };
      resolve({ dominant: sorted[0] ? toHex(sorted[0][0]) : "#a855f7", accent: sorted[1] ? toHex(sorted[1][0]) : "#ec4899" }); };
    img.onerror = () => resolve({ dominant: "#a855f7", accent: "#ec4899" }); img.src = imgSrc; });
}
function loadFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`; if (document.getElementById(id)) return;
  const link = document.createElement("link"); link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`; document.head.appendChild(link);
}
function getEffectPreviewStyle(effectId: string, a: string): React.CSSProperties {
  a = a || "#a855f7";
  const map: Record<string, React.CSSProperties> = {
    "aurora": { background: `linear-gradient(135deg, ${a}30, transparent, ${a}20)` },
    "ambient-glow": { background: `radial-gradient(circle, ${a}30, transparent 70%)` },
    "gradient-flow": { background: `linear-gradient(45deg, ${a}30, #ec489920, ${a}30)` },
    "starfield": { background: `radial-gradient(1px 1px at 20% 30%, white 50%, transparent), radial-gradient(1px 1px at 70% 60%, white 50%, transparent), #0a0a18` },
    "matrix-grid": { backgroundImage: `linear-gradient(${a}15 1px, transparent 1px), linear-gradient(90deg, ${a}15 1px, transparent 1px)`, backgroundSize: "8px 8px" },
    "ocean-waves": { background: `linear-gradient(180deg, transparent 50%, ${a}15 70%, ${a}08 90%, transparent)` },
    "vortex-spin": { background: `conic-gradient(from 0deg, transparent, ${a}10, transparent, ${a}05, transparent)` },
    "wireframe-globe": { background: `radial-gradient(circle, transparent 30%, ${a}08 31%, transparent 32%), radial-gradient(circle, transparent 55%, ${a}06 56%, transparent 57%)` },
  };
  return map[effectId] || { background: `radial-gradient(circle, ${a}20, transparent 70%)` };
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════ */
function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
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

function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[hsl(var(--dash-border-subtle))]/50 bg-[hsl(var(--dash-surface-2))]/40 overflow-hidden">
      <summary className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer select-none hover:bg-[hsl(var(--dash-accent))]/20 transition-colors">
        <span className="text-primary/70 flex-shrink-0">{icon}</span>
        <span className="text-[hsl(var(--dash-text-secondary))] text-[13px] font-semibold flex-1">{title}</span>
        <ChevronDown size={14} className="text-[hsl(var(--dash-text-subtle))] group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--dash-border-subtle))]/40">{children}</div>
    </details>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rich Phone Mockup — shows a reference profile with real content
   ═══════════════════════════════════════════════════════════════════ */
function PhoneMockup({ pack, isActive, onClick }: { pack: DesignPack; isActive: boolean; onClick: () => void }) {
  const { bg, accent, accent2 } = pack.preview;
  const dd = pack.config.design;
  const ref = REFERENCE_PROFILES[pack.refIdx % REFERENCE_PROFILES.length];
  const isLight = bg.startsWith("#f") || bg.startsWith("#e") || bg === "#ffffff";
  const textC = isLight ? "#111" : "#fff";
  const subC = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)";
  const btnR = dd.buttonShape === "pill" ? "999px" : dd.buttonShape === "square" ? "3px" : "8px";
  const pR = dd.profileShape === "circle" ? "9999px" : dd.profileShape === "rounded" ? "20%" : dd.profileShape === "square" ? "6px" : "0";
  const pClip = dd.profileShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined;

  return (
    <button onClick={onClick} className={`flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-300 ${isActive ? "scale-[1.06]" : "opacity-75 hover:opacity-100 hover:scale-[1.02]"}`} style={{ width: 150 }}>
      {/* Phone frame */}
      <div className={`relative w-[140px] rounded-[22px] overflow-hidden shadow-2xl transition-all duration-300 ${isActive ? "ring-[3px] ring-primary ring-offset-2 ring-offset-[hsl(var(--dash-bg))] shadow-primary/20" : "ring-1 ring-white/10"}`}
        style={{ aspectRatio: "9/17.5" }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: dd.bgType === "gradient" ? `linear-gradient(to bottom, ${(dd.bgGradient as [string, string])?.[0] || bg}, ${(dd.bgGradient as [string, string])?.[1] || bg})` : bg }}>
          {dd.bgEffect && <div className="absolute inset-0 opacity-70" style={getEffectPreviewStyle(dd.bgEffect, accent)} />}
        </div>

        {/* Content with real reference profile */}
        <div className="relative flex flex-col items-center pt-7 pb-3 px-2.5 h-full" style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {/* Avatar */}
          <div className="w-11 h-11 mb-1.5 flex-shrink-0 overflow-hidden" style={{ borderRadius: pR, clipPath: pClip, border: dd.profileBorder ? `2px solid ${dd.profileBorderColor || accent}` : "1px solid rgba(255,255,255,0.1)" }}>
            <img src={ref.avatar} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
          </div>

          {/* Name + bio */}
          <p className="text-[9px] font-bold leading-tight text-center mb-0.5" style={{ color: textC }}>{ref.name}</p>
          <p className="text-[6.5px] leading-tight text-center mb-2" style={{ color: subC }}>{ref.bio}</p>

          {/* Social icons */}
          <div className="flex gap-1 mb-2.5">
            {ref.socials.map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: `${accent}35`, border: `0.5px solid ${accent}50` }} />
            ))}
          </div>

          {/* Links */}
          <div className="w-full space-y-1 mb-2">
            {ref.links.map((link, i) => (
              <div key={i} className="h-[18px] w-full flex items-center justify-center" style={{
                borderRadius: btnR,
                background: dd.buttonFill === "outline" ? "transparent" : dd.buttonFill === "glass" ? `${accent}12` : `${accent}18`,
                border: dd.buttonFill === "outline" ? `0.8px solid ${accent}50` : dd.buttonFill === "glass" ? `0.5px solid ${accent}25` : "none",
                boxShadow: dd.buttonShadow === "glow" ? `0 0 6px ${accent}25` : "none",
              }}>
                <span className="text-[6px] font-medium" style={{ color: dd.buttonFill === "outline" ? accent : textC }}>{link}</span>
              </div>
            ))}
          </div>

          {/* Products */}
          <div className="flex gap-1 w-full mt-auto">
            {ref.products.map((prod, i) => (
              <div key={i} className="flex-1 rounded-lg p-1" style={{ background: `${i === 0 ? accent : accent2}10`, border: `0.5px solid ${i === 0 ? accent : accent2}20` }}>
                <div className="w-full h-5 rounded mb-0.5" style={{ background: `${i === 0 ? accent : accent2}12` }} />
                <p className="text-[5px] font-semibold truncate" style={{ color: textC }}>{prod.title}</p>
                <p className="text-[5px] font-bold" style={{ color: accent }}>{prod.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={`text-[12px] font-bold transition-colors ${isActive ? "text-primary" : "text-[hsl(var(--dash-text))]"}`}
          style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {pack.label}
        </p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main DesignTab — simplified, professional
   ═══════════════════════════════════════════════════════════════════ */
export default function DesignTab({ config, themes, defaultDesign, updateConfig }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design } as DesignConfig;
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];
  const [packFilter, setPackFilter] = useState("all");
  const [effectFilter, setEffectFilter] = useState("all");
  const carouselRef = useRef<HTMLDivElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  const setDesign = useCallback((key: keyof DesignConfig, value: any) => {
    updateConfig("design", { ...(config.design || {}), [key]: value });
  }, [config.design, updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  const accent = d.accentColor || currentTheme.accent;

  const applyPack = useCallback((pack: DesignPack) => {
    updateConfig("theme", pack.config.theme);
    updateConfig("design", { ...(config.design || {}), ...pack.config.design });
    if (pack.config.design.fontHeading) loadFont(pack.config.design.fontHeading);
    if (pack.config.design.fontBody) loadFont(pack.config.design.fontBody);
  }, [config.design, updateConfig]);

  const applyFontPair = useCallback((headingFont: string) => {
    setDesign("fontHeading", headingFont); loadFont(headingFont);
    const paired = FONT_PAIRS[headingFont];
    if (paired) { setDesign("fontBody", paired); loadFont(paired); }
  }, [setDesign]);

  const applyAutoHarmony = useCallback((accentHex: string) => {
    const harmony = generateHarmony(accentHex);
    updateConfig("theme", "custom");
    updateConfig("design", { ...(config.design || {}), accentColor: accentHex, accentColor2: harmony.accent2,
      bgColor: harmony.bgColor, cardBg: harmony.cardBg, cardBorder: harmony.cardBorder,
      textColor: harmony.textColor, subtextColor: harmony.subtextColor });
  }, [config.design, updateConfig]);

  const autoThemeFromAvatar = useCallback(async () => {
    if (!config.avatarUrl) return;
    const colors = await extractColorsFromImage(config.avatarUrl);
    const darken = (hex: string) => {
      const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * 0.15) | 0;
      const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * 0.15) | 0;
      const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * 0.15) | 0;
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };
    updateConfig("theme", "custom"); setDesign("bgColor", darken(colors.dominant));
    setDesign("accentColor", colors.dominant); setDesign("accentColor2", colors.accent);
  }, [config.avatarUrl, updateConfig, setDesign]);

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  const filteredPacks = DESIGN_PACKS.filter(p => packFilter === "all" || p.category === packFilter);

  const isPackActive = (pack: DesignPack) => config.theme === pack.config.theme
    && d.fontHeading === (pack.config.design.fontHeading || "Inter")
    && d.bgEffect === (pack.config.design.bgEffect || "");

  return (
    <div className="space-y-6 pb-28">

      {/* ═══════ 1. TEMPLATE CAROUSEL ═══════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[hsl(var(--dash-text))] font-bold text-[17px] tracking-tight">Escolha seu estilo</h2>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">1 clique = design completo</p>
          </div>
          {config.avatarUrl && (
            <button onClick={autoThemeFromAvatar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all">
              <Wand2 size={12} /> Auto
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PACK_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setPackFilter(cat.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                packFilter === cat.key ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-[hsl(var(--dash-text-muted))] bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <button onClick={() => scrollCarousel("left")}
            className="absolute -left-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))]/90 border border-[hsl(var(--dash-border-subtle))] shadow-lg flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-primary transition-all backdrop-blur-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollCarousel("right")}
            className="absolute -right-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))]/90 border border-[hsl(var(--dash-border-subtle))] shadow-lg flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-primary transition-all backdrop-blur-sm">
            <ChevronRight size={16} />
          </button>

          <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth snap-x" style={{ scrollbarWidth: "none" }}>
            {filteredPacks.map(pack => (
              <div key={pack.id} className="snap-center">
                <PhoneMockup pack={pack} isActive={isPackActive(pack)} onClick={() => applyPack(pack)} />
              </div>
            ))}
          </div>
        </div>

        {/* Active pack name */}
        {(() => {
          const active = filteredPacks.find(p => isPackActive(p));
          return active ? (
            <div className="flex items-center justify-center gap-2 text-[12px]">
              <Check size={12} className="text-primary" />
              <span className="text-[hsl(var(--dash-text-muted))]">Ativo:</span>
              <span className="font-bold text-primary">{active.label}</span>
              <span className="text-[hsl(var(--dash-text-subtle))]">&middot; {active.config.design.fontHeading}</span>
            </div>
          ) : null;
        })()}
      </div>

      {/* ═══════ 2. COLORS — simple ═══════ */}
      <div className="space-y-3">
        <h3 className="text-[hsl(var(--dash-text))] font-bold text-[14px]">Cores</h3>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker value={d.accentColor || currentTheme.accent} onChange={v => { setDesign("accentColor", v); updateConfig("theme", "custom"); }} label="Principal" />
          <ColorPicker value={d.accentColor2 || currentTheme.accent2} onChange={v => { setDesign("accentColor2", v); updateConfig("theme", "custom"); }} label="Secundaria" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ACCENT_COLORS.map(c => (
            <button key={c} onClick={() => applyAutoHarmony(c)} title={c}
              className={`w-6 h-6 rounded-lg transition-all hover:scale-110 ${(d.accentColor || currentTheme.accent) === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/10"}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* ═══════ 3. FONT — simple dropdown style ═══════ */}
      <div className="space-y-3">
        <h3 className="text-[hsl(var(--dash-text))] font-bold text-[14px]">Fonte</h3>
        <div className="grid grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
          {GOOGLE_FONTS.map(f => {
            const isActive = d.fontHeading === f.name;
            return (
              <button key={f.name} onClick={() => applyFontPair(f.name)}
                className={`px-2 py-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                  isActive ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
                }`} style={{ fontFamily: `"${f.name}", sans-serif` }}>
                {f.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
        {/* Live preview */}
        <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
          <p className="text-[14px] font-bold text-[hsl(var(--dash-text))]" style={{ fontFamily: `"${d.fontHeading}", sans-serif` }}>
            {config.displayName || "Seu Nome"}
          </p>
          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-0.5" style={{ fontFamily: `"${d.fontBody}", sans-serif` }}>
            Preview da fonte &middot; {d.fontHeading} + {d.fontBody}
          </p>
        </div>
      </div>

      {/* ═══════ SEPARATOR ═══════ */}
      <div className="relative py-1">
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--dash-border-subtle))] to-transparent" />
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(var(--dash-bg))] px-3 text-[10px] text-[hsl(var(--dash-text-subtle))] font-medium">
          Personalizar mais
        </p>
      </div>

      {/* ═══════ 4. ADVANCED — collapsed sections ═══════ */}

      <Section title="Fundo" icon={<Layers size={14} />}>
        <div className="flex gap-1.5 pt-2 flex-wrap">
          {(["solid", "gradient", "image", "video", "pattern", "effect"] as BgType[]).map(type => (
            <button key={type} onClick={() => setDesign("bgType", type)}
              className={`flex-1 min-w-[50px] py-2 rounded-xl text-[10px] font-medium transition-all ${
                d.bgType === type ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
              }`}>
              {type === "solid" ? "Cor" : type === "gradient" ? "Degrade" : type === "image" ? "Imagem" : type === "video" ? "Video" : type === "pattern" ? "Padrao" : "Efeito"}
            </button>
          ))}
        </div>

        {d.bgType === "solid" && (
          <div className="space-y-3">
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor de fundo" />
            <div className="grid grid-cols-6 gap-2">
              {SOLID_COLORS.map(c => (
                <button key={c} onClick={() => { setDesign("bgColor", c); updateConfig("theme", "custom"); }}
                  className={`w-8 h-8 rounded-lg ring-1 transition-all hover:scale-110 ${(d.bgColor || currentTheme.bg) === c ? "ring-2 ring-primary" : "ring-white/10"}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        )}

        {d.bgType === "gradient" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker value={d.bgGradient[0]} onChange={v => { setDesign("bgGradient", [v, d.bgGradient[1]]); updateConfig("theme", "custom"); }} label="Cor 1" />
              <ColorPicker value={d.bgGradient[1]} onChange={v => { setDesign("bgGradient", [d.bgGradient[0], v]); updateConfig("theme", "custom"); }} label="Cor 2" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {GRADIENT_PRESETS.map(([c1, c2], i) => (
                <button key={i} onClick={() => { setDesign("bgGradient", [c1, c2]); updateConfig("theme", "custom"); }}
                  className="h-7 rounded-lg ring-1 ring-white/10 hover:scale-105 transition-all" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
              ))}
            </div>
          </div>
        )}

        {d.bgType === "image" && (
          <div className="space-y-3">
            {d.bgImageUrl ? (
              <div className="relative rounded-xl overflow-hidden h-28">
                <img src={d.bgImageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setDesign("bgImageUrl", "")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => bgImageInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 transition-all">
                <Upload size={18} /><span className="text-[10px]">Enviar imagem</span>
              </button>
            )}
            <input type="file" ref={bgImageInputRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setDesign("bgImageUrl", r.result as string); r.readAsDataURL(f); e.target.value = ""; }} />
            <input type="url" className={inputCls} placeholder="Ou cole URL..." value={d.bgImageUrl.startsWith("data:") ? "" : d.bgImageUrl} onChange={e => setDesign("bgImageUrl", e.target.value)} />
          </div>
        )}

        {d.bgType === "video" && (
          <div className="space-y-3">
            {d.bgVideoUrl ? (
              <div className="relative rounded-xl overflow-hidden h-28">
                <video src={d.bgVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                <button onClick={() => setDesign("bgVideoUrl", "")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => bgVideoInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 transition-all">
                <Play size={18} /><span className="text-[10px]">Enviar video (max 10MB)</span>
              </button>
            )}
            <input type="file" ref={bgVideoInputRef} accept="video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f || f.size > 10485760) return; const r = new FileReader(); r.onload = () => setDesign("bgVideoUrl", r.result as string); r.readAsDataURL(f); e.target.value = ""; }} />
          </div>
        )}

        {d.bgType === "pattern" && (
          <div className="space-y-3">
            <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => { setDesign("bgColor", v); updateConfig("theme", "custom"); }} label="Cor base" />
            <div className="grid grid-cols-4 gap-1.5">
              {BG_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setDesign("bgPattern", p.id)}
                  className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.bgPattern === p.id ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {d.bgType === "effect" && (
          <div className="space-y-3">
            <div className="flex gap-1 flex-wrap">
              {EFFECT_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setEffectFilter(cat.key)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${effectFilter === cat.key ? "bg-primary/15 text-primary" : "text-[hsl(var(--dash-text-subtle))]"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
              {BG_EFFECTS.filter(e => effectFilter === "all" || e.category === effectFilter).map(effect => (
                <button key={effect.id} onClick={() => { setDesign("bgEffect", effect.id); updateConfig("theme", "custom"); }}
                  className={`py-2 px-1.5 rounded-xl text-[9px] font-medium text-center transition-all ${
                    d.bgEffect === effect.id ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))]"
                  }`}>
                  {effect.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Botoes" icon={<Square size={14} />}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-4 gap-1.5">
            {(["rounded", "pill", "square", "soft"] as ButtonShape[]).map(shape => (
              <button key={shape} onClick={() => setDesign("buttonShape", shape)}
                className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {shape === "rounded" ? "Arredondado" : shape === "pill" ? "Pilula" : shape === "square" ? "Quadrado" : "Suave"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(["solid", "outline", "glass", "ghost"] as ButtonFill[]).map(fill => (
              <button key={fill} onClick={() => setDesign("buttonFill", fill)}
                className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonFill === fill ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {fill === "solid" ? "Solido" : fill === "outline" ? "Contorno" : fill === "glass" ? "Vidro" : "Fantasma"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Foto de perfil" icon={<Circle size={14} />}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-4 gap-1.5">
            {(["circle", "rounded", "square", "hexagon"] as ProfileShape[]).map(shape => (
              <button key={shape} onClick={() => setDesign("profileShape", shape)}
                className={`py-2.5 rounded-xl text-[9px] font-medium transition-all ${d.profileShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {shape === "circle" ? "Circulo" : shape === "rounded" ? "Arredondado" : shape === "square" ? "Quadrado" : "Hexagono"}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Borda colorida</p>
            <button onClick={() => setDesign("profileBorder", !d.profileBorder)}
              className={`relative w-9 h-5 rounded-full transition-colors ${d.profileBorder ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${d.profileBorder ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Cores avancadas" icon={<Palette size={14} />}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.textColor || "#f8f5ff"} onChange={v => setDesign("textColor", v)} label="Texto" />
            <ColorPicker value={d.subtextColor || "rgba(248,245,255,0.5)"} onChange={v => setDesign("subtextColor", v)} label="Subtexto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker value={d.cardBg || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo card" />
            <ColorPicker value={d.cardBorder || "rgba(168,85,247,0.18)"} onChange={v => setDesign("cardBorder", v)} label="Borda card" />
          </div>
        </div>
      </Section>

    </div>
  );
}
