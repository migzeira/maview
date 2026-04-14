/* ═══════════════════════════════════════════════════════════════════
   Design Tab — Shared Types & Constants
   ═══════════════════════════════════════════════════════════════════ */

export type ThemeId = string;
export type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
export type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
export type ButtonShape = "rounded" | "pill" | "square" | "soft";
export type ButtonFill = "solid" | "outline" | "glass" | "ghost";
export type ButtonShadow = "none" | "sm" | "md" | "glow";
export type ProfileShape = "circle" | "rounded" | "square" | "hexagon";

export interface DesignConfig {
  bgType: BgType; bgColor: string; bgGradient: [string, string]; bgGradientDir: GradientDir;
  bgImageUrl: string; bgVideoUrl: string; bgPattern: string; bgOverlay: number; bgBlur: number; bgEffect: string;
  textColor: string; subtextColor: string; cardBg: string; cardBorder: string;
  accentColor: string; accentColor2: string; fontHeading: string; fontBody: string;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: ButtonShadow; buttonRadius: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileSize: number;
  hideWatermark: boolean; layout?: string;
}

export interface ThemeDef { id: ThemeId; label: string; bg: string; accent: string; accent2: string; }

export interface DesignTabProps {
  config: { theme: ThemeId; design?: Partial<DesignConfig>; avatarUrl: string; displayName: string; username?: string; };
  themes: ThemeDef[];
  defaultDesign: DesignConfig;
  updateConfig: (key: string, value: any) => void;
  onForceSave?: () => Promise<boolean>;
  highlightField?: string | null;
  themeGridRef?: React.RefObject<HTMLDivElement>;
}

/* ── Reference profiles for phone mockups ─────────── */

export interface ReferenceProfile {
  name: string; username: string; bio: string; avatar: string;
  socials: string[]; links: string[]; products: { title: string; price: string }[];
}

export const REFERENCE_PROFILES: ReferenceProfile[] = [
  { name: "Ana Beatriz", username: "@anabeatriz", bio: "Designer & criadora de conteudo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "tt", "yt"], links: ["Meu portfolio", "Agende uma call"],
    products: [{ title: "Ebook Design", price: "R$ 47" }, { title: "Mentoria 1:1", price: "R$ 197" }] },
  { name: "Lucas Santos", username: "@lucassantos", bio: "Fitness coach & nutricionista",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "yt"], links: ["Treinos online", "WhatsApp"],
    products: [{ title: "Plano 12 semanas", price: "R$ 97" }, { title: "Dieta personalizada", price: "R$ 67" }] },
  { name: "Camila Rocha", username: "@camilarocha", bio: "Fotografa & videomaker",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "tt", "pin"], links: ["Booking", "Presets Lightroom"],
    products: [{ title: "Pack 50 Presets", price: "R$ 29" }, { title: "Curso de foto", price: "R$ 149" }] },
  { name: "Pedro Mendes", username: "@pedromendes", bio: "Dev & criador de SaaS",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    socials: ["gh", "tw", "li"], links: ["Newsletter", "Meu SaaS"],
    products: [{ title: "Template Next.js", price: "R$ 79" }, { title: "Consultoria", price: "R$ 297" }] },
  { name: "Julia Lima", username: "@julialima", bio: "Artista digital & ilustradora",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    socials: ["ig", "be", "tt"], links: ["Loja de prints", "Commissions"],
    products: [{ title: "Pack wallpapers", price: "R$ 19" }, { title: "Ilustracao custom", price: "R$ 350" }] },
];

/* ── Design Packs ─────────────────────────────────── */

export interface DesignPack {
  id: string; label: string; desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold";
  preview: { bg: string; accent: string; accent2: string };
  config: { theme: string; design: Partial<DesignConfig> };
  refIdx: number;
}

export const DESIGN_PACKS: DesignPack[] = [
  { id: "pure-black", label: "Preto Puro", desc: "Minimalista e contrastante", category: "minimal", refIdx: 1,
    preview: { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0" },
    config: { theme: "pure-black", design: { bgType: "solid", bgColor: "#000000", bgEffect: "", buttonShape: "square", buttonFill: "outline", buttonShadow: "none", buttonRadius: 4, fontHeading: "Space Grotesk", fontBody: "JetBrains Mono", profileShape: "square", profileBorder: true, profileBorderColor: "#ffffff", profileSize: 88, accentColor: "#ffffff", accentColor2: "#a0a0a0" } } },
  { id: "luxury-dark", label: "Luxury", desc: "Elegante e sofisticado", category: "dark", refIdx: 0,
    preview: { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
    config: { theme: "dark-purple", design: { bgType: "gradient", bgGradient: ["#080612", "#1a0a2e"], bgGradientDir: "to-b", buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileSize: 96, accentColor: "#a855f7", accentColor2: "#ec4899" } } },
  { id: "minimal-clean", label: "Minimal", desc: "Limpo e moderno", category: "minimal", refIdx: 4,
    preview: { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
    config: { theme: "slate", design: { bgType: "solid", bgColor: "#0c0e12", bgEffect: "", buttonShape: "pill", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12, fontHeading: "Inter", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#94a3b8", accentColor2: "#cbd5e1" } } },
  { id: "neon-bold", label: "Neon", desc: "Vibrante e ousado", category: "animated", refIdx: 3,
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: { theme: "neon-pink", design: { bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Bebas Neue", fontBody: "Space Grotesk", profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileSize: 96, accentColor: "#ff2d95", accentColor2: "#ff6ec7" } } },
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
];

export const PACK_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "animated", label: "Animados" },
  { key: "dark", label: "Dark" },
  { key: "light", label: "Claros" },
  { key: "minimal", label: "Minimal" },
  { key: "bold", label: "Bold" },
];

/* ── Background ───────────────────────────────────── */

export const BG_PATTERNS = [
  { id: "dots", label: "Pontos" }, { id: "grid", label: "Grade" }, { id: "diagonal", label: "Diagonal" },
  { id: "waves", label: "Ondas" }, { id: "cross", label: "Cruz" }, { id: "hexagon", label: "Hexagono" }, { id: "noise", label: "Textura" },
];

export const BG_EFFECTS: { id: string; label: string; category: string }[] = [
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

export const EFFECT_CATEGORIES = [
  { key: "all", label: "Todos" }, { key: "glow", label: "Brilho" }, { key: "gradient", label: "Gradiente" },
  { key: "particle", label: "Particulas" }, { key: "wave", label: "Ondas" }, { key: "tech", label: "Tech" },
  { key: "atmosphere", label: "Atmosfera" }, { key: "motion", label: "Movimento" },
];

/* ── Fonts ─────────────────────────────────────────── */

export interface FontDef { name: string; category: "sans" | "serif" | "display" | "handwriting" | "mono"; }

export const GOOGLE_FONTS: FontDef[] = [
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

/** 9 primary fonts — one from each category, most versatile */
export const PRIMARY_FONTS = [
  "Inter", "Poppins", "Montserrat", "Outfit", "DM Sans",
  "Playfair Display", "Bebas Neue", "Dancing Script", "JetBrains Mono",
];

export const FONT_PAIRS: Record<string, string> = {
  "Inter": "DM Sans", "Poppins": "DM Sans", "Montserrat": "Urbanist", "Outfit": "Nunito",
  "DM Sans": "Inter", "Space Grotesk": "JetBrains Mono", "Nunito": "Outfit", "Rubik": "Manrope",
  "Manrope": "Rubik", "Plus Jakarta Sans": "DM Sans", "Urbanist": "Montserrat", "Sora": "Inter",
  "Playfair Display": "Lora", "Lora": "Playfair Display", "Merriweather": "DM Sans",
  "DM Serif Display": "Manrope", "Cormorant Garamond": "Montserrat", "Bebas Neue": "Space Grotesk",
  "Righteous": "Urbanist", "Pacifico": "Poppins", "Satisfy": "Outfit",
  "Dancing Script": "DM Sans", "JetBrains Mono": "Space Grotesk", "Fira Code": "Inter",
};

export const FONT_CATEGORY_LABELS: Record<string, string> = {
  sans: "Sans-serif",
  serif: "Serifadas",
  display: "Display",
  handwriting: "Manuscritas",
  mono: "Mono",
};

/* ── Colors ────────────────────────────────────────── */

export const ACCENT_COLORS = [
  // Row 1 — Roxos & Rosas
  "#a855f7", "#8b5cf6", "#7c3aed", "#6d28d9", "#c084fc", "#ec4899", "#f472b6", "#be185d",
  // Row 2 — Vermelhos & Laranjas
  "#f43f5e", "#ef4444", "#dc2626", "#f97316", "#fb923c", "#f59e0b", "#eab308", "#fbbf24",
  // Row 3 — Verdes
  "#4ade80", "#22c55e", "#16a34a", "#10b981", "#34d399", "#059669", "#84cc16", "#a3e635",
  // Row 4 — Azuis & Cyans
  "#06b6d4", "#22d3ee", "#0ea5e9", "#3b82f6", "#2563eb", "#1d4ed8", "#6366f1", "#818cf8",
  // Row 5 — Neutros & Especiais
  "#000000", "#171717", "#404040", "#737373", "#ffffff", "#f5f5f5", "#fafafa", "#94a3b8",
];

export const SOLID_COLORS = [
  "#000000", "#0a0a0a", "#111111", "#1a1a1a", "#080612", "#05080f",
  "#050f05", "#100509", "#020c14", "#0a0010", "#1a1a2e", "#0f3460",
  "#0d1b2a", "#1b263b", "#1e1b4b", "#312e81",
];

export const GRADIENT_PRESETS: [string, string][] = [
  // Clássicos
  ["#667eea", "#764ba2"], ["#f093fb", "#f5576c"], ["#4facfe", "#00f2fe"], ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"], ["#a18cd1", "#fbc2eb"], ["#f6d365", "#fda085"], ["#c471f5", "#fa71cd"],
  // Modernos
  ["#0f0c29", "#302b63"], ["#200122", "#6f0000"], ["#11998e", "#38ef7d"], ["#fc5c7d", "#6a82fb"],
  ["#2193b0", "#6dd5ed"], ["#ee0979", "#ff6a00"], ["#7f00ff", "#e100ff"], ["#00c6ff", "#0072ff"],
  // Sutis & Elegantes
  ["#141e30", "#243b55"], ["#0f2027", "#2c5364"], ["#1a2a6c", "#b21f1f"], ["#232526", "#414345"],
];
