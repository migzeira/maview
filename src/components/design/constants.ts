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
  coverImage?: string;
  socials: string[]; links: string[];
  products: { title: string; price: string; image?: string }[];
}

const U = (id: string, w = 100, h = 100, crop = "face") =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=${crop}`;

export const REFERENCE_PROFILES: ReferenceProfile[] = [
  /* 0 */ { name: "Ana Beatriz", username: "@anabeatriz", bio: "Designer & criadora de conteudo",
    avatar: U("photo-1494790108377-be9c29b29330"),
    socials: ["ig", "tt", "yt"], links: ["Meu portfolio", "Agende uma call"],
    products: [{ title: "Ebook Design", price: "R$ 47" }, { title: "Mentoria 1:1", price: "R$ 197" }] },
  /* 1 */ { name: "Lucas Santos", username: "@lucassantos", bio: "Fitness coach & nutricionista",
    avatar: U("photo-1507003211169-0a1dd7228f2d"),
    socials: ["ig", "yt"], links: ["Treinos online", "WhatsApp"],
    products: [{ title: "Plano 12 semanas", price: "R$ 97" }, { title: "Dieta personalizada", price: "R$ 67" }] },
  /* 2 */ { name: "Camila Rocha", username: "@camilarocha", bio: "Fotografa & videomaker",
    avatar: U("photo-1438761681033-6461ffad8d80"),
    socials: ["ig", "tt", "pin"], links: ["Booking", "Presets Lightroom"],
    products: [{ title: "Pack 50 Presets", price: "R$ 29" }, { title: "Curso de foto", price: "R$ 149" }] },
  /* 3 */ { name: "Pedro Mendes", username: "@pedromendes", bio: "Dev & criador de SaaS",
    avatar: U("photo-1472099645785-5658abf4ff4e"),
    socials: ["gh", "tw", "li"], links: ["Newsletter", "Meu SaaS"],
    products: [{ title: "Template Next.js", price: "R$ 79" }, { title: "Consultoria", price: "R$ 297" }] },
  /* 4 */ { name: "Julia Lima", username: "@julialima", bio: "Artista digital & ilustradora",
    avatar: U("photo-1534528741775-53994a69daeb"),
    socials: ["ig", "be", "tt"], links: ["Loja de prints", "Commissions"],
    products: [{ title: "Pack wallpapers", price: "R$ 19" }, { title: "Ilustracao custom", price: "R$ 350" }] },

  /* ── Showcase Profiles (Vitrines Prontas) ── */

  /* 5 — Wellness */ { name: "Marina Costa", username: "@marinacosta", bio: "Wellness coach. Yoga, meditacao e vida equilibrada",
    avatar: U("photo-1544005313-94ddf0286df2"),
    coverImage: U("photo-1506126613408-eca07ce68773", 400, 200, "center"),
    socials: ["ig", "tt", "yt"], links: ["Agende uma aula", "Comunidade VIP"],
    products: [
      { title: "Plano Wellness 30d", price: "R$ 90/mes", image: U("photo-1544367567-0f2fcb009e0b", 200, 150, "center") },
      { title: "Meditacao guiada", price: "R$ 29", image: U("photo-1508672019048-805c876b67e2", 200, 150, "center") },
    ] },
  /* 6 — Coach */ { name: "Rafael Torres", username: "@rafaeltorres", bio: "Ajudo voce a crescer nas redes sociais e monetizar",
    avatar: U("photo-1500648767791-00dcc994a43e"),
    coverImage: U("photo-1498050108023-c5249f4df085", 400, 200, "center"),
    socials: ["ig", "tt", "li", "yt"], links: ["Agendar coaching", "Newsletter gratis"],
    products: [
      { title: "Coaching 1:1", price: "R$ 197", image: U("photo-1611162617474-5b21e879e113", 200, 150, "center") },
      { title: "Guia Monetizacao", price: "Gratis", image: U("photo-1460925895917-afdab827c52f", 200, 150, "center") },
    ] },
  /* 7 — Fashion */ { name: "Bianca Oliveira", username: "@biancaoliveira", bio: "Moda, estilo e consultoria de imagem pessoal",
    avatar: U("photo-1531746020798-e6953c6e8e04"),
    coverImage: U("photo-1558618666-fcd25c85f82e", 400, 200, "center"),
    socials: ["ig", "tt", "pin"], links: ["Meu closet", "Parcerias"],
    products: [
      { title: "Consultoria Imagem", price: "R$ 147", image: U("photo-1558171813-01ed3d751f44", 200, 150, "center") },
      { title: "Closet Digital", price: "R$ 39", image: U("photo-1445205170230-053b83016050", 200, 150, "center") },
    ] },
  /* 8 — Fitness */ { name: "Thiago Almeida", username: "@thiagoalmeida", bio: "Personal trainer & coach de transformacao corporal",
    avatar: U("photo-1506794778202-cad84cf45f1d"),
    coverImage: U("photo-1534438327276-14e5300c3a48", 400, 200, "center"),
    socials: ["ig", "yt"], links: ["Treino gratis", "WhatsApp"],
    products: [
      { title: "Plano 12 semanas", price: "R$ 97", image: U("photo-1571019613454-1cb2f99b2d8b", 200, 150, "center") },
      { title: "Dieta + Treino", price: "R$ 147", image: U("photo-1490645935967-10de6ba17061", 200, 150, "center") },
    ] },
  /* 9 — Fotógrafa */ { name: "Isabela Mendes", username: "@isabelamendes", bio: "Fotografa profissional. Retratos, paisagens e presets",
    avatar: U("photo-1580489944761-15a19d654956"),
    coverImage: U("photo-1516035069371-29a1b244cc32", 400, 200, "center"),
    socials: ["ig", "tt", "pin"], links: ["Booking", "Portfolio"],
    products: [
      { title: "Pack 50 Presets", price: "R$ 49", image: U("photo-1452587925148-ce544e77e70d", 200, 150, "center") },
      { title: "Curso Fotografia", price: "R$ 197", image: U("photo-1542038784456-1ea8e935640e", 200, 150, "center") },
    ] },
  /* 10 — Dev */ { name: "Daniel Rocha", username: "@danielrocha", bio: "Desenvolvedor full-stack. Templates, SaaS e mentorias",
    avatar: U("photo-1539571696357-5a69c17a67c6"),
    coverImage: U("photo-1550751827-4bd374c3f58b", 400, 200, "center"),
    socials: ["gh", "tw", "li"], links: ["Newsletter", "GitHub"],
    products: [
      { title: "Template SaaS", price: "R$ 79", image: U("photo-1555066931-4365d14bab8c", 200, 150, "center") },
      { title: "Mentoria Dev", price: "R$ 297", image: U("photo-1517694712202-14dd9538aa97", 200, 150, "center") },
    ] },
  /* 11 — Nutri */ { name: "Luana Ferreira", username: "@luanaferreira", bio: "Nutricionista esportiva. Dietas, receitas e saude",
    avatar: U("photo-1487412720507-e7ab37603c6f"),
    coverImage: U("photo-1490645935967-10de6ba17061", 400, 200, "center"),
    socials: ["ig", "tt", "yt"], links: ["Agendar consulta", "WhatsApp"],
    products: [
      { title: "Plano Alimentar", price: "R$ 67", image: U("photo-1512621776951-a57141f2eefd", 200, 150, "center") },
      { title: "Ebook Receitas Fit", price: "R$ 29", image: U("photo-1495521821757-a1efb6729352", 200, 150, "center") },
    ] },
  /* 12 — Músico */ { name: "Gabriel Santos", username: "@gabrielsantos", bio: "Produtor musical. Beats, mixing e aulas de producao",
    avatar: U("photo-1506277886164-e25aa3f4ef7f"),
    coverImage: U("photo-1598488035139-bdbb2231ce04", 400, 200, "center"),
    socials: ["ig", "tt", "yt", "sc"], links: ["Spotify", "SoundCloud"],
    products: [
      { title: "Beat Pack Premium", price: "R$ 49", image: U("photo-1470225620780-dba8ba36b745", 200, 150, "center") },
      { title: "Aula Producao", price: "R$ 97", image: U("photo-1598653222000-6b7b7a552625", 200, 150, "center") },
    ] },
];

/* ── Design Packs ─────────────────────────────────── */

export interface DesignPack {
  id: string; label: string; desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold" | "showcase";
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

  /* ── Vitrines Prontas (Showcase) ── */

  { id: "showcase-wellness", label: "Wellness", desc: "Yoga, meditacao e bem-estar", category: "showcase", refIdx: 5,
    preview: { bg: "#faf5f0", accent: "#d97706", accent2: "#b45309" },
    config: { theme: "cream", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=800&fit=crop&crop=center", bgOverlay: 40, bgColor: "#faf5f0", buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Outfit", fontBody: "Nunito", profileShape: "circle", profileBorder: true, profileBorderColor: "#d97706", profileSize: 96, accentColor: "#d97706", accentColor2: "#b45309", textColor: "#1c1917", subtextColor: "rgba(28,25,23,0.60)", cardBg: "rgba(255,255,255,0.85)", cardBorder: "rgba(0,0,0,0.08)" } } },
  { id: "showcase-coach", label: "Coach", desc: "Social media e marketing", category: "showcase", refIdx: 6,
    preview: { bg: "#0a0618", accent: "#a855f7", accent2: "#ec4899" },
    config: { theme: "dark-purple", design: { bgType: "effect", bgEffect: "ambient-glow", bgColor: "#0a0618", buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14, fontHeading: "Space Grotesk", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileSize: 96, accentColor: "#a855f7", accentColor2: "#ec4899" } } },
  { id: "showcase-fashion", label: "Fashion", desc: "Moda e consultoria de estilo", category: "showcase", refIdx: 7,
    preview: { bg: "#faf7f2", accent: "#be185d", accent2: "#e11d48" },
    config: { theme: "cream", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=800&fit=crop&crop=center", bgOverlay: 35, bgColor: "#faf7f2", buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#be185d", profileSize: 96, accentColor: "#be185d", accentColor2: "#e11d48", textColor: "#1c1917", subtextColor: "rgba(28,25,23,0.55)", cardBg: "rgba(255,255,255,0.88)", cardBorder: "rgba(0,0,0,0.06)" } } },
  { id: "showcase-fitness", label: "Fitness", desc: "Treino e transformacao", category: "showcase", refIdx: 8,
    preview: { bg: "#080808", accent: "#ef4444", accent2: "#f97316" },
    config: { theme: "crimson", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=800&fit=crop&crop=center", bgOverlay: 60, bgColor: "#080808", buttonShape: "square", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Bebas Neue", fontBody: "Poppins", profileShape: "circle", profileBorder: true, profileBorderColor: "#ef4444", profileSize: 96, accentColor: "#ef4444", accentColor2: "#f97316" } } },
  { id: "showcase-photo", label: "Fotografa", desc: "Fotografia e presets", category: "showcase", refIdx: 9,
    preview: { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
    config: { theme: "white", design: { bgType: "solid", bgColor: "#f8f9fa", bgEffect: "", buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Cormorant Garamond", fontBody: "Montserrat", profileShape: "circle", profileBorder: false, profileSize: 92, accentColor: "#6366f1", accentColor2: "#8b5cf6", textColor: "#111827", subtextColor: "rgba(17,24,39,0.65)", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)" } } },
  { id: "showcase-dev", label: "Developer", desc: "Tech, SaaS e mentorias", category: "showcase", refIdx: 10,
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: { theme: "midnight", design: { bgType: "effect", bgEffect: "matrix-grid", bgColor: "#05080f", buttonShape: "square", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 6, fontHeading: "JetBrains Mono", fontBody: "Space Grotesk", profileShape: "hexagon", profileBorder: false, profileSize: 92, accentColor: "#60a5fa", accentColor2: "#818cf8" } } },
  { id: "showcase-nutri", label: "Nutricao", desc: "Dietas e vida saudavel", category: "showcase", refIdx: 11,
    preview: { bg: "#f0fdf4", accent: "#16a34a", accent2: "#4ade80" },
    config: { theme: "emerald", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=800&fit=crop&crop=center", bgOverlay: 45, bgColor: "#f0fdf4", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 14, fontHeading: "DM Sans", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#16a34a", profileSize: 92, accentColor: "#16a34a", accentColor2: "#4ade80", textColor: "#14532d", subtextColor: "rgba(20,83,45,0.60)", cardBg: "rgba(255,255,255,0.85)", cardBorder: "rgba(0,0,0,0.06)" } } },
  { id: "showcase-music", label: "Produtor", desc: "Musica e beats", category: "showcase", refIdx: 12,
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: { theme: "neon-pink", design: { bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Sora", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileSize: 96, accentColor: "#ff2d95", accentColor2: "#ff6ec7" } } },
];

export const PACK_CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "showcase", label: "Prontas" },
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
