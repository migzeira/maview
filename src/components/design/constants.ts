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
  bgImageZoom: number; bgImagePosX: number; bgImagePosY: number;
  textColor: string; subtextColor: string;
  nameColor: string; productTitleColor: string; priceColor: string;
  originalPriceColor: string; descriptionColor: string;
  urgencyBadgeBg: string; urgencyBadgeText: string;
  socialIconStyle: "brand" | "theme" | "custom"; socialIconCustomColor: string;
  cardBg: string; cardBorder: string;
  accentColor: string; accentColor2: string; fontHeading: string; fontBody: string;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: ButtonShadow; buttonRadius: number;
  coverImageUrl: string; coverOverlay: number; coverZoom: number; coverPosX: number; coverPosY: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileGlow: boolean; profileGlowColor: string; profileSize: number;
  textShadow: number; hideWatermark: boolean; layout?: string;
  heroLayout?: "classic" | "hero-banner" | "side-by-side" | "minimal-top" | "full-cover";
  productDisplayStyle?: "callout" | "compact" | "expanded";
}

export interface ThemeDef { id: ThemeId; label: string; bg: string; accent: string; accent2: string; text?: string; sub?: string; card?: string; border?: string; }

export interface DesignTabProps {
  config: { theme: ThemeId; design?: Partial<DesignConfig>; avatarUrl: string; displayName: string; username?: string; products?: any[]; links?: any[]; blocks?: any[] };
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
  stats?: { value: string; label: string }[];
}

const U = (id: string, w = 200, h = 200, crop = "center") =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=${crop}&q=80`;

export const REFERENCE_PROFILES: ReferenceProfile[] = [
  /* 0 — Designer */ { name: "Ana Beatriz", username: "@anabeatriz", bio: "Designer UX/UI & criadora de conteúdo 🎨 | +5.000 alunos | Transformo ideias em experiências digitais",
    avatar: U("photo-1494790108377-be9c29b29330", 300, 300, "face"),
    socials: ["ig", "tt", "yt"], links: ["Meu portfólio →", "Agende uma call →"],
    products: [{ title: "Ebook Design", price: "R$ 47" }, { title: "Mentoria 1:1", price: "R$ 197" }],
    stats: [{ value: "5.2k", label: "alunos" }, { value: "4.9", label: "⭐" }, { value: "50+", label: "projetos" }] },
  /* 1 — Fitness */ { name: "Lucas Santos", username: "@lucassantos", bio: "Personal trainer certificado 💪 | +200 transformações | Treinos online & presencial em SP",
    avatar: U("photo-1507003211169-0a1dd7228f2d", 300, 300, "face"),
    socials: ["ig", "yt"], links: ["Treinos online →", "Fale comigo →"],
    products: [{ title: "Plano 12 semanas", price: "R$ 97" }, { title: "Dieta personalizada", price: "R$ 67" }],
    stats: [{ value: "200+", label: "alunos" }, { value: "4.8", label: "⭐" }, { value: "8", label: "anos" }] },
  /* 2 — Fotógrafa */ { name: "Camila Rocha", username: "@camilarocha", bio: "Fotógrafa & videomaker 📸 | Editoriais, retratos & paisagens | São Paulo",
    avatar: U("photo-1438761681033-6461ffad8d80", 300, 300, "face"),
    socials: ["ig", "tt", "pin"], links: ["Agendar sessão →", "Presets Lightroom →"],
    products: [{ title: "Pack 50 Presets", price: "R$ 29" }, { title: "Curso de foto", price: "R$ 149" }],
    stats: [{ value: "300+", label: "ensaios" }, { value: "5.0", label: "⭐" }, { value: "10+", label: "prêmios" }] },
  /* 3 — Dev */ { name: "Pedro Mendes", username: "@pedromendes", bio: "Dev full-stack & empreendedor 🚀 | Criador de SaaS | Mentorias para devs",
    avatar: U("photo-1472099645785-5658abf4ff4e", 300, 300, "face"),
    socials: ["gh", "tw", "li"], links: ["Newsletter semanal →", "Meu SaaS →"],
    products: [{ title: "Template Next.js", price: "R$ 79" }, { title: "Consultoria", price: "R$ 297" }],
    stats: [{ value: "10k+", label: "newsletter" }, { value: "4.9", label: "⭐" }, { value: "3", label: "SaaS" }] },
  /* 4 — Artista */ { name: "Julia Lima", username: "@julialima", bio: "Artista digital & ilustradora ✨ | Comissões abertas | Prints & wallpapers exclusivos",
    avatar: U("photo-1534528741775-53994a69daeb", 300, 300, "face"),
    socials: ["ig", "be", "tt"], links: ["Loja de prints →", "Encomendar arte →"],
    products: [{ title: "Pack wallpapers", price: "R$ 19" }, { title: "Ilustracao custom", price: "R$ 350" }],
    stats: [{ value: "800+", label: "comissões" }, { value: "5.0", label: "⭐" }, { value: "2M", label: "views" }] },

  /* ── Showcase Profiles (Vitrines Prontas) — fotos reais de rosto ── */

  /* 5 — Wellness */ { name: "Marina Costa", username: "@marinacosta", bio: "Instrutora de Yoga certificada 🧘 | Meditação guiada & bem-estar | Aulas online e presenciais",
    avatar: U("photo-1544005313-94ddf0286df2", 400, 500, "face"),
    coverImage: U("photo-1506126613408-eca07ce68773", 400, 200, "center"),
    socials: ["ig", "tt", "yt"], links: ["Agendar aula →", "Comunidade VIP →"],
    products: [
      { title: "Plano Wellness 30 dias", price: "R$ 90/mês", image: U("photo-1544367567-0f2fcb009e0b", 200, 150, "center") },
      { title: "Meditação guiada premium", price: "R$ 29", image: U("photo-1508672019048-805c876b67e2", 200, 150, "center") },
    ],
    stats: [{ value: "2.3k", label: "alunos" }, { value: "4.9", label: "⭐" }, { value: "6", label: "anos" }] },
  /* 6 — Coach */ { name: "Rafael Torres", username: "@rafaeltorres", bio: "Coach de redes sociais 📱 | +50 marcas atendidas | Estratégias que geram resultado",
    avatar: U("photo-1500648767791-00dcc994a43e", 400, 500, "face"),
    coverImage: U("photo-1498050108023-c5249f4df085", 400, 200, "center"),
    socials: ["ig", "tt", "li", "yt"], links: ["Agendar coaching →", "Newsletter grátis →"],
    products: [
      { title: "Coaching 1:1 exclusivo", price: "R$ 197", image: U("photo-1611162617474-5b21e879e113", 200, 150, "center") },
      { title: "Guia de monetização", price: "Grátis", image: U("photo-1460925895917-afdab827c52f", 200, 150, "center") },
    ],
    stats: [{ value: "50+", label: "marcas" }, { value: "4.8", label: "⭐" }, { value: "R$2M", label: "faturado" }] },
  /* 7 — Fashion */ { name: "Bianca Oliveira", username: "@biancaoliveira", bio: "Consultora de imagem & estilo 👗 | Moda consciente | Personal stylist",
    avatar: U("photo-1524504388940-b1c1722653e1", 400, 500, "face"),
    coverImage: U("photo-1469334031218-e382a71b716b", 400, 200, "center"),
    socials: ["ig", "tt", "pin"], links: ["Meu closet →", "Parcerias →"],
    products: [
      { title: "Consultoria de imagem", price: "R$ 147", image: U("photo-1490481651871-ab68de25d43d", 200, 150, "center") },
      { title: "Closet digital completo", price: "R$ 39", image: U("photo-1445205170230-053b83016050", 200, 150, "center") },
    ],
    stats: [{ value: "180+", label: "clientes" }, { value: "5.0", label: "⭐" }, { value: "8", label: "anos" }] },
  /* 8 — Fitness */ { name: "Thiago Almeida", username: "@thiagoalmeida", bio: "Personal trainer & coach corporal 💪 | +200 alunos transformados | Resultado garantido",
    avatar: U("photo-1568602471122-7832951cc4c5", 400, 500, "face"),
    coverImage: U("photo-1534438327276-14e5300c3a48", 400, 200, "center"),
    socials: ["ig", "yt"], links: ["Treino grátis →", "Fale no WhatsApp →"],
    products: [
      { title: "Plano 12 semanas intensivo", price: "R$ 97", image: U("photo-1571019613454-1cb2f99b2d8b", 200, 150, "center") },
      { title: "Dieta + Treino personalizado", price: "R$ 147", image: U("photo-1490645935967-10de6ba17061", 200, 150, "center") },
    ],
    stats: [{ value: "200+", label: "alunos" }, { value: "4.9", label: "⭐" }, { value: "CREF", label: "ativo" }] },
  /* 9 — Fotógrafa */ { name: "Isabela Mendes", username: "@isabelamendes", bio: "Fotógrafa profissional 📷 | Retratos, ensaios & paisagens | Presets exclusivos",
    avatar: U("photo-1531746020798-e6953c6e8e04", 400, 500, "face"),
    coverImage: U("photo-1516035069371-29a1b244cc32", 400, 200, "center"),
    socials: ["ig", "tt", "pin"], links: ["Agendar ensaio →", "Ver portfólio →"],
    products: [
      { title: "Pack 50 Presets Pro", price: "R$ 49", image: U("photo-1452587925148-ce544e77e70d", 200, 150, "center") },
      { title: "Curso completo de fotografia", price: "R$ 197", image: U("photo-1542038784456-1ea8e935640e", 200, 150, "center") },
    ],
    stats: [{ value: "500+", label: "sessões" }, { value: "5.0", label: "⭐" }, { value: "15+", label: "prêmios" }] },
  /* 10 — Dev */ { name: "Daniel Rocha", username: "@danielrocha", bio: "Desenvolvedor full-stack ⚡ | Templates prontos para SaaS | Mentoria para devs juniores",
    avatar: U("photo-1506794778202-cad84cf45f1d", 400, 500, "face"),
    coverImage: U("photo-1550751827-4bd374c3f58b", 400, 200, "center"),
    socials: ["gh", "tw", "li"], links: ["Newsletter →", "GitHub →"],
    products: [
      { title: "Template SaaS completo", price: "R$ 79", image: U("photo-1555066931-4365d14bab8c", 200, 150, "center") },
      { title: "Mentoria Dev 1:1", price: "R$ 297", image: U("photo-1517694712202-14dd9538aa97", 200, 150, "center") },
    ],
    stats: [{ value: "3k+", label: "devs" }, { value: "4.9", label: "⭐" }, { value: "50+", label: "templates" }] },
  /* 11 — Nutri */ { name: "Luana Ferreira", username: "@luanaferreira", bio: "Nutricionista esportiva 🥗 | Planos alimentares personalizados | Receitas fit exclusivas",
    avatar: U("photo-1487412720507-e7ab37603c6f", 400, 500, "face"),
    coverImage: U("photo-1490645935967-10de6ba17061", 400, 200, "center"),
    socials: ["ig", "tt", "yt"], links: ["Agendar consulta →", "Fale no WhatsApp →"],
    products: [
      { title: "Plano alimentar personalizado", price: "R$ 67", image: U("photo-1512621776951-a57141f2eefd", 200, 150, "center") },
      { title: "Ebook 100 receitas fit", price: "R$ 29", image: U("photo-1495521821757-a1efb6729352", 200, 150, "center") },
    ],
    stats: [{ value: "1.5k", label: "pacientes" }, { value: "4.9", label: "⭐" }, { value: "CRN", label: "ativa" }] },
  /* 12 — Músico */ { name: "Gabriel Santos", username: "@gabrielsantos", bio: "Produtor musical 🎵 | Beats exclusivos & mixing | Aulas de produção musical",
    avatar: U("photo-1539571696357-5a69c17a67c6", 400, 500, "face"),
    coverImage: U("photo-1598488035139-bdbb2231ce04", 400, 200, "center"),
    socials: ["ig", "tt", "yt", "sc"], links: ["Spotify →", "SoundCloud →"],
    products: [
      { title: "Beat Pack Premium exclusivo", price: "R$ 49", image: U("photo-1470225620780-dba8ba36b745", 200, 150, "center") },
      { title: "Aula de produção musical", price: "R$ 97", image: U("photo-1598653222000-6b7b7a552625", 200, 150, "center") },
    ],
    stats: [{ value: "100+", label: "beats" }, { value: "4.8", label: "⭐" }, { value: "500k", label: "plays" }] },
];

/* ── Design Packs ─────────────────────────────────── */

export interface SampleProduct { title: string; price?: string; emoji?: string; }
export interface SampleLink { title: string; type?: "link" | "spotlight"; icon?: string; }

export interface DesignPack {
  id: string; label: string; desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold" | "showcase";
  preview: { bg: string; accent: string; accent2: string };
  config: { theme: string; design: Partial<DesignConfig> };
  refIdx: number;
  /** Sample content for showcase packs — populated when user has no products */
  sampleProducts?: SampleProduct[];
  sampleLinks?: SampleLink[];
}

export const DESIGN_PACKS: DesignPack[] = [
  { id: "pure-black", label: "Preto Puro", desc: "Minimalista e contrastante", category: "minimal", refIdx: 1,
    preview: { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0" },
    config: { theme: "pure-black", design: { bgType: "solid", bgColor: "#000000", bgEffect: "", buttonShape: "square", buttonFill: "outline", buttonShadow: "none", buttonRadius: 4, fontHeading: "Space Grotesk", fontBody: "JetBrains Mono", profileShape: "circle", profileBorder: true, profileBorderColor: "#ffffff", profileGlow: true, profileGlowColor: "#ffffff", profileSize: 88, accentColor: "#ffffff", accentColor2: "#a0a0a0", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.65)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#ffffff", originalPriceColor: "rgba(255,255,255,0.40)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(255,255,255,0.04)", cardBorder: "rgba(255,255,255,0.12)" } } },
  { id: "luxury-dark", label: "Luxury", desc: "Elegante e sofisticado", category: "dark", refIdx: 0,
    preview: { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
    config: { theme: "dark-purple", design: { bgType: "gradient", bgGradient: ["#080612", "#1a0a2e"], bgGradientDir: "to-b", buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileGlow: true, profileGlowColor: "#a855f7", profileSize: 96, accentColor: "#a855f7", accentColor2: "#ec4899", textColor: "#f0e6ff", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#f0e6ff", priceColor: "#c084fc", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(168,85,247,0.06)", cardBorder: "rgba(168,85,247,0.18)" } } },
  { id: "minimal-clean", label: "Minimal", desc: "Limpo e moderno", category: "minimal", refIdx: 4,
    preview: { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
    config: { theme: "slate", design: { bgType: "solid", bgColor: "#0c0e12", bgEffect: "", buttonShape: "pill", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12, fontHeading: "Inter", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#94a3b8", accentColor2: "#cbd5e1", textColor: "#e2e8f0", subtextColor: "rgba(255,255,255,0.50)", nameColor: "#f1f5f9", productTitleColor: "#e2e8f0", priceColor: "#94a3b8", originalPriceColor: "rgba(255,255,255,0.30)", descriptionColor: "rgba(255,255,255,0.45)", cardBg: "rgba(148,163,184,0.05)", cardBorder: "rgba(148,163,184,0.12)" } } },
  { id: "neon-bold", label: "Neon", desc: "Vibrante e ousado", category: "animated", refIdx: 3,
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: { theme: "neon-pink", design: { bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Bebas Neue", fontBody: "Space Grotesk", profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileGlow: true, profileGlowColor: "#ff2d95", profileSize: 96, accentColor: "#ff2d95", accentColor2: "#ff6ec7", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#ff6ec7", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(255,45,149,0.06)", cardBorder: "rgba(255,45,149,0.18)", textShadow: 1 } } },
  { id: "gold-premium", label: "Gold", desc: "Premium e exclusivo", category: "bold", refIdx: 0,
    preview: { bg: "#0c0a04", accent: "#eab308", accent2: "#d97706" },
    config: { theme: "gold", design: { bgType: "effect", bgEffect: "ambient-glow", bgColor: "#0c0a04", buttonShape: "soft", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12, fontHeading: "DM Serif Display", fontBody: "Manrope", profileShape: "circle", profileBorder: true, profileBorderColor: "#eab308", profileGlow: true, profileGlowColor: "#eab308", profileSize: 96, accentColor: "#eab308", accentColor2: "#d97706", textColor: "#fef9c3", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#fef9c3", priceColor: "#fbbf24", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(234,179,8,0.06)", cardBorder: "rgba(234,179,8,0.18)", textShadow: 1 } } },
  { id: "tech-future", label: "Tech", desc: "Futurista e digital", category: "dark", refIdx: 3,
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: { theme: "midnight", design: { bgType: "effect", bgEffect: "matrix-grid", bgColor: "#05080f", buttonShape: "square", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Space Grotesk", fontBody: "JetBrains Mono", profileShape: "circle", profileBorder: false, profileGlow: true, profileGlowColor: "#60a5fa", profileSize: 92, accentColor: "#60a5fa", accentColor2: "#818cf8", textColor: "#e2e8f0", subtextColor: "rgba(255,255,255,0.55)", nameColor: "#ffffff", productTitleColor: "#e2e8f0", priceColor: "#60a5fa", originalPriceColor: "rgba(255,255,255,0.30)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(96,165,250,0.05)", cardBorder: "rgba(96,165,250,0.15)", textShadow: 1 } } },
  { id: "nature-organic", label: "Nature", desc: "Organico e natural", category: "dark", refIdx: 2,
    preview: { bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
    config: { theme: "forest", design: { bgType: "gradient", bgGradient: ["#050f05", "#0a2a1a"], bgGradientDir: "to-b", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16, fontHeading: "Outfit", fontBody: "Nunito", profileShape: "rounded", profileBorder: false, profileGlow: true, profileGlowColor: "#4ade80", profileSize: 88, accentColor: "#4ade80", accentColor2: "#34d399", textColor: "#ecfdf5", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#ecfdf5", priceColor: "#4ade80", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(74,222,128,0.05)", cardBorder: "rgba(74,222,128,0.15)" } } },
  { id: "wine-elegance", label: "Wine", desc: "Refinado e marcante", category: "dark", refIdx: 4,
    preview: { bg: "#100408", accent: "#be185d", accent2: "#e11d48" },
    config: { theme: "wine", design: { bgType: "gradient", bgGradient: ["#100408", "#200a14"], bgGradientDir: "to-br", buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14, fontHeading: "Cormorant Garamond", fontBody: "Montserrat", profileShape: "circle", profileBorder: true, profileBorderColor: "#be185d", profileGlow: true, profileGlowColor: "#be185d", profileSize: 96, accentColor: "#be185d", accentColor2: "#e11d48", textColor: "#fce7f3", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#fce7f3", priceColor: "#f472b6", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(190,24,93,0.06)", cardBorder: "rgba(190,24,93,0.18)" } } },
  { id: "indigo-deep", label: "Indigo", desc: "Profundo e misterioso", category: "animated", refIdx: 3,
    preview: { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
    config: { theme: "indigo", design: { bgType: "effect", bgEffect: "vortex-spin", bgColor: "#06050f", buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14, fontHeading: "Plus Jakarta Sans", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileGlow: true, profileGlowColor: "#6366f1", profileSize: 92, accentColor: "#6366f1", accentColor2: "#a78bfa", textColor: "#e0e7ff", subtextColor: "rgba(255,255,255,0.55)", nameColor: "#ffffff", productTitleColor: "#e0e7ff", priceColor: "#a78bfa", originalPriceColor: "rgba(255,255,255,0.30)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(99,102,241,0.06)", cardBorder: "rgba(99,102,241,0.18)", textShadow: 1 } } },
  { id: "rose-romantic", label: "Rose", desc: "Delicado e atraente", category: "animated", refIdx: 4,
    preview: { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
    config: { theme: "rose", design: { bgType: "effect", bgEffect: "floating-orbs", bgColor: "#100509", buttonShape: "pill", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12, fontHeading: "Dancing Script", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#f43f5e", profileGlow: true, profileGlowColor: "#f43f5e", profileSize: 96, accentColor: "#f43f5e", accentColor2: "#fb7185", textColor: "#fff1f2", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#fff1f2", priceColor: "#fb7185", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(244,63,94,0.06)", cardBorder: "rgba(244,63,94,0.18)", textShadow: 1 } } },
  { id: "coral-creative", label: "Coral", desc: "Criativo e divertido", category: "bold", refIdx: 2,
    preview: { bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6" },
    config: { theme: "coral", design: { bgType: "pattern", bgPattern: "dots", bgColor: "#0f0808", buttonShape: "rounded", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 16, fontHeading: "Righteous", fontBody: "Urbanist", profileShape: "rounded", profileBorder: true, profileBorderColor: "#fb923c", profileGlow: true, profileGlowColor: "#fb923c", profileSize: 88, accentColor: "#fb923c", accentColor2: "#f472b6", textColor: "#fff7ed", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#fff7ed", priceColor: "#fb923c", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(251,146,60,0.06)", cardBorder: "rgba(251,146,60,0.18)" } } },
  { id: "crimson-power", label: "Crimson", desc: "Forte e poderoso", category: "bold", refIdx: 1,
    preview: { bg: "#120508", accent: "#dc2626", accent2: "#f87171" },
    config: { theme: "crimson", design: { bgType: "effect", bgEffect: "radial-glow", bgColor: "#120508", buttonShape: "square", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Bebas Neue", fontBody: "Poppins", profileShape: "circle", profileBorder: false, profileGlow: true, profileGlowColor: "#dc2626", profileSize: 96, accentColor: "#dc2626", accentColor2: "#f87171", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.65)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#f87171", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(220,38,38,0.06)", cardBorder: "rgba(220,38,38,0.18)", textShadow: 1 } } },
  { id: "clean-white", label: "Branco", desc: "Clean e luminoso", category: "light", refIdx: 0,
    preview: { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
    config: { theme: "white", design: { bgType: "solid", bgColor: "#f8f9fa", bgEffect: "", buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Inter", fontBody: "DM Sans", profileShape: "circle", profileBorder: false, profileSize: 88, accentColor: "#6366f1", accentColor2: "#8b5cf6", textColor: "#111827", subtextColor: "#6b7280", nameColor: "#111827", productTitleColor: "#111827", priceColor: "#6366f1", originalPriceColor: "rgba(0,0,0,0.35)", descriptionColor: "#6b7280", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)" } } },
  { id: "warm-cream", label: "Creme", desc: "Quente e acolhedor", category: "light", refIdx: 4,
    preview: { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309" },
    config: { theme: "cream", design: { bgType: "solid", bgColor: "#faf7f2", bgEffect: "", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 14, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#d97706", profileGlow: true, profileGlowColor: "#d97706", profileSize: 92, accentColor: "#d97706", accentColor2: "#b45309", textColor: "#1c1917", subtextColor: "#78716c", nameColor: "#1c1917", productTitleColor: "#1c1917", priceColor: "#d97706", originalPriceColor: "rgba(0,0,0,0.35)", descriptionColor: "#78716c", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.06)" } } },
  { id: "emerald-pro", label: "Emerald", desc: "Profissional e clean", category: "minimal", refIdx: 3,
    preview: { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
    config: { theme: "emerald", design: { bgType: "solid", bgColor: "#021a0f", bgEffect: "", buttonShape: "rounded", buttonFill: "outline", buttonShadow: "none", buttonRadius: 12, fontHeading: "Manrope", fontBody: "Rubik", profileShape: "circle", profileBorder: false, profileGlow: true, profileGlowColor: "#10b981", profileSize: 88, accentColor: "#10b981", accentColor2: "#6ee7b7", textColor: "#ecfdf5", subtextColor: "rgba(255,255,255,0.55)", nameColor: "#ffffff", productTitleColor: "#ecfdf5", priceColor: "#10b981", originalPriceColor: "rgba(255,255,255,0.30)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(16,185,129,0.05)", cardBorder: "rgba(16,185,129,0.12)" } } },

  /* ── Vitrines Prontas (Showcase) ── */

  { id: "showcase-wellness", label: "Wellness", desc: "Yoga, meditacao e bem-estar", category: "showcase", refIdx: 5,
    sampleProducts: [{ title: "Plano Wellness 30 dias", price: "R$ 90/mes", emoji: "🧘" }, { title: "Meditacao guiada", price: "R$ 29", emoji: "🕯️" }],
    sampleLinks: [{ title: "Agende uma aula", type: "spotlight" }, { title: "Comunidade VIP", type: "link" }],
    preview: { bg: "#faf5f0", accent: "#d97706", accent2: "#b45309" },
    config: { theme: "cream", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=800&fit=crop&crop=center", bgOverlay: 50, bgColor: "#faf5f0", buttonShape: "pill", buttonFill: "glass", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Outfit", fontBody: "Nunito", profileShape: "circle", profileBorder: true, profileBorderColor: "#d97706", profileGlow: true, profileGlowColor: "#d97706", profileSize: 96, accentColor: "#d97706", accentColor2: "#b45309", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.80)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#fbbf24", originalPriceColor: "rgba(255,255,255,0.40)", descriptionColor: "rgba(255,255,255,0.70)", cardBg: "rgba(0,0,0,0.40)", cardBorder: "rgba(255,255,255,0.12)", textShadow: 1, heroLayout: "hero-banner", productDisplayStyle: "expanded" } } },
  { id: "showcase-coach", label: "Coach", desc: "Social media e marketing", category: "showcase", refIdx: 6,
    sampleProducts: [{ title: "Coaching 1:1", price: "R$ 197", emoji: "🚀" }, { title: "Guia de Monetizacao", price: "Gratis", emoji: "📖" }],
    sampleLinks: [{ title: "Agendar coaching", type: "spotlight" }, { title: "Newsletter gratis", type: "link" }],
    preview: { bg: "#0a0618", accent: "#a855f7", accent2: "#ec4899" },
    config: { theme: "dark-purple", design: { bgType: "effect", bgEffect: "ambient-glow", bgColor: "#0a0618", coverImageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&crop=center&q=80", buttonShape: "soft", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 14, fontHeading: "Space Grotesk", fontBody: "DM Sans", profileShape: "circle", profileBorder: true, profileBorderColor: "#a855f7", profileGlow: true, profileGlowColor: "#a855f7", profileSize: 96, accentColor: "#a855f7", accentColor2: "#ec4899", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.65)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#c084fc", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.60)", cardBg: "rgba(168,85,247,0.08)", cardBorder: "rgba(168,85,247,0.20)", textShadow: 1, heroLayout: "side-by-side", productDisplayStyle: "callout" } } },
  { id: "showcase-fashion", label: "Fashion", desc: "Moda e consultoria de estilo", category: "showcase", refIdx: 7,
    sampleProducts: [{ title: "Consultoria de Imagem", price: "R$ 147", emoji: "👗" }, { title: "Closet Digital", price: "R$ 39", emoji: "✨" }],
    sampleLinks: [{ title: "Meu closet", type: "spotlight" }, { title: "Parcerias", type: "link" }],
    preview: { bg: "#1a0a14", accent: "#be185d", accent2: "#e11d48" },
    config: { theme: "wine", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop&crop=center", bgOverlay: 55, bgColor: "#1a0a14", buttonShape: "pill", buttonFill: "glass", buttonShadow: "md", buttonRadius: 12, fontHeading: "Playfair Display", fontBody: "Lora", profileShape: "circle", profileBorder: true, profileBorderColor: "#be185d", profileGlow: true, profileGlowColor: "#be185d", profileSize: 96, accentColor: "#be185d", accentColor2: "#e11d48", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.75)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#f472b6", descriptionColor: "rgba(255,255,255,0.65)", originalPriceColor: "rgba(255,255,255,0.45)", cardBg: "rgba(0,0,0,0.45)", cardBorder: "rgba(190,24,93,0.20)", textShadow: 1, heroLayout: "full-cover", productDisplayStyle: "expanded" } } },
  { id: "showcase-fitness", label: "Fitness", desc: "Treino e transformacao", category: "showcase", refIdx: 8,
    sampleProducts: [{ title: "Plano 12 semanas", price: "R$ 97", emoji: "💪" }, { title: "Dieta + Treino", price: "R$ 147", emoji: "🥗" }],
    sampleLinks: [{ title: "Treino gratis", type: "spotlight" }, { title: "WhatsApp", type: "link", icon: "whatsapp" }],
    preview: { bg: "#080808", accent: "#ef4444", accent2: "#f97316" },
    config: { theme: "crimson", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=800&fit=crop&crop=center", bgOverlay: 65, bgColor: "#080808", buttonShape: "square", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 6, fontHeading: "Bebas Neue", fontBody: "Poppins", profileShape: "circle", profileBorder: true, profileBorderColor: "#ef4444", profileGlow: true, profileGlowColor: "#ef4444", profileSize: 96, accentColor: "#ef4444", accentColor2: "#f97316", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.75)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#f87171", originalPriceColor: "rgba(255,255,255,0.40)", descriptionColor: "rgba(255,255,255,0.65)", cardBg: "rgba(0,0,0,0.50)", cardBorder: "rgba(239,68,68,0.20)", textShadow: 1, heroLayout: "hero-banner", productDisplayStyle: "compact" } } },
  { id: "showcase-photo", label: "Fotografa", desc: "Fotografia e presets", category: "showcase", refIdx: 9,
    sampleProducts: [{ title: "Pack 50 Presets", price: "R$ 49", emoji: "📸" }, { title: "Curso de Fotografia", price: "R$ 197", emoji: "🎞️" }],
    sampleLinks: [{ title: "Booking", type: "spotlight" }, { title: "Portfolio", type: "link" }],
    preview: { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
    config: { theme: "white", design: { bgType: "solid", bgColor: "#f8f9fa", bgEffect: "", coverImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=300&fit=crop&crop=center&q=80", buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12, fontHeading: "Cormorant Garamond", fontBody: "Montserrat", profileShape: "circle", profileBorder: true, profileBorderColor: "#6366f1", profileGlow: true, profileGlowColor: "#6366f1", profileSize: 92, accentColor: "#6366f1", accentColor2: "#8b5cf6", textColor: "#111827", subtextColor: "#4b5563", nameColor: "#111827", productTitleColor: "#111827", priceColor: "#6366f1", originalPriceColor: "rgba(0,0,0,0.35)", descriptionColor: "#6b7280", cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)", heroLayout: "classic", productDisplayStyle: "callout" } } },
  { id: "showcase-dev", label: "Developer", desc: "Tech, SaaS e mentorias", category: "showcase", refIdx: 10,
    sampleProducts: [{ title: "Template SaaS", price: "R$ 79", emoji: "💻" }, { title: "Mentoria Dev", price: "R$ 297", emoji: "🧑‍💻" }],
    sampleLinks: [{ title: "Newsletter", type: "spotlight" }, { title: "GitHub", type: "link", icon: "github" }],
    preview: { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
    config: { theme: "midnight", design: { bgType: "effect", bgEffect: "matrix-grid", bgColor: "#05080f", coverImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop&crop=center&q=80", buttonShape: "square", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 6, fontHeading: "JetBrains Mono", fontBody: "Space Grotesk", profileShape: "circle", profileBorder: false, profileGlow: true, profileGlowColor: "#60a5fa", profileSize: 92, accentColor: "#60a5fa", accentColor2: "#818cf8", textColor: "#e2e8f0", subtextColor: "rgba(255,255,255,0.55)", nameColor: "#ffffff", productTitleColor: "#e2e8f0", priceColor: "#60a5fa", originalPriceColor: "rgba(255,255,255,0.30)", descriptionColor: "rgba(255,255,255,0.50)", cardBg: "rgba(96,165,250,0.06)", cardBorder: "rgba(96,165,250,0.15)", textShadow: 1, heroLayout: "minimal-top", productDisplayStyle: "compact" } } },
  { id: "showcase-nutri", label: "Nutricao", desc: "Dietas e vida saudavel", category: "showcase", refIdx: 11,
    sampleProducts: [{ title: "Plano Alimentar", price: "R$ 67", emoji: "🥑" }, { title: "Ebook Receitas Fit", price: "R$ 29", emoji: "📗" }],
    sampleLinks: [{ title: "Agendar consulta", type: "spotlight" }, { title: "WhatsApp", type: "link", icon: "whatsapp" }],
    preview: { bg: "#f0fdf4", accent: "#16a34a", accent2: "#4ade80" },
    config: { theme: "emerald", design: { bgType: "image", bgImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=800&fit=crop&crop=center", bgOverlay: 50, bgColor: "#f0fdf4", buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 14, fontHeading: "DM Sans", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#16a34a", profileGlow: true, profileGlowColor: "#16a34a", profileSize: 92, accentColor: "#16a34a", accentColor2: "#4ade80", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.75)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#4ade80", originalPriceColor: "rgba(255,255,255,0.40)", descriptionColor: "rgba(255,255,255,0.65)", cardBg: "rgba(0,0,0,0.40)", cardBorder: "rgba(22,163,74,0.20)", textShadow: 1, heroLayout: "full-cover", productDisplayStyle: "expanded" } } },
  { id: "showcase-music", label: "Produtor", desc: "Musica e beats", category: "showcase", refIdx: 12,
    sampleProducts: [{ title: "Beat Pack Premium", price: "R$ 49", emoji: "🎵" }, { title: "Aula de Producao", price: "R$ 97", emoji: "🎧" }],
    sampleLinks: [{ title: "Spotify", type: "spotlight", icon: "globe" }, { title: "SoundCloud", type: "link", icon: "globe" }],
    preview: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    config: { theme: "neon-pink", design: { bgType: "effect", bgEffect: "aurora", bgColor: "#0a0010", coverImageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=300&fit=crop&crop=center&q=80", buttonShape: "pill", buttonFill: "glass", buttonShadow: "glow", buttonRadius: 12, fontHeading: "Sora", fontBody: "Inter", profileShape: "circle", profileBorder: true, profileBorderColor: "#ff2d95", profileGlow: true, profileGlowColor: "#ff2d95", profileSize: 96, accentColor: "#ff2d95", accentColor2: "#ff6ec7", textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.60)", nameColor: "#ffffff", productTitleColor: "#ffffff", priceColor: "#ff6ec7", originalPriceColor: "rgba(255,255,255,0.35)", descriptionColor: "rgba(255,255,255,0.55)", cardBg: "rgba(255,45,149,0.08)", cardBorder: "rgba(255,45,149,0.20)", textShadow: 1, heroLayout: "minimal-top", productDisplayStyle: "compact" } } },
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
  /* ── Sans-serif (top do mercado) ── */
  { name: "Inter", category: "sans" }, { name: "Poppins", category: "sans" }, { name: "Montserrat", category: "sans" },
  { name: "Roboto", category: "sans" }, { name: "Open Sans", category: "sans" }, { name: "Lato", category: "sans" },
  { name: "Raleway", category: "sans" }, { name: "Nunito", category: "sans" }, { name: "Quicksand", category: "sans" },
  { name: "Outfit", category: "sans" }, { name: "DM Sans", category: "sans" }, { name: "Space Grotesk", category: "sans" },
  { name: "Rubik", category: "sans" }, { name: "Manrope", category: "sans" }, { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Urbanist", category: "sans" }, { name: "Sora", category: "sans" }, { name: "Lexend", category: "sans" },
  { name: "Work Sans", category: "sans" }, { name: "Figtree", category: "sans" }, { name: "Geologica", category: "sans" },
  /* ── Serif ── */
  { name: "Playfair Display", category: "serif" }, { name: "Lora", category: "serif" }, { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" }, { name: "Cormorant Garamond", category: "serif" },
  { name: "Libre Baskerville", category: "serif" }, { name: "Crimson Text", category: "serif" },
  /* ── Display ── */
  { name: "Bebas Neue", category: "display" }, { name: "Righteous", category: "display" },
  { name: "Oswald", category: "display" }, { name: "Anton", category: "display" }, { name: "Josefin Sans", category: "display" },
  /* ── Handwriting ── */
  { name: "Pacifico", category: "handwriting" }, { name: "Satisfy", category: "handwriting" }, { name: "Dancing Script", category: "handwriting" },
  { name: "Great Vibes", category: "handwriting" }, { name: "Caveat", category: "handwriting" },
  /* ── Mono ── */
  { name: "JetBrains Mono", category: "mono" }, { name: "Fira Code", category: "mono" },
];

/** Top 12 fontes mais populares do mercado — destaque no seletor */
export const PRIMARY_FONTS = [
  "Poppins", "Montserrat", "Inter", "Roboto", "Raleway", "Lato",
  "Playfair Display", "Nunito", "Quicksand", "Outfit", "Oswald", "Open Sans",
];

export const FONT_PAIRS: Record<string, string> = {
  "Inter": "DM Sans", "Poppins": "DM Sans", "Montserrat": "Urbanist", "Outfit": "Nunito",
  "Roboto": "Open Sans", "Open Sans": "Roboto", "Lato": "Merriweather", "Raleway": "Lora",
  "Quicksand": "Nunito", "Lexend": "Inter", "Work Sans": "DM Sans", "Figtree": "Inter",
  "Geologica": "DM Sans", "Libre Baskerville": "Raleway", "Crimson Text": "Lato",
  "Oswald": "Roboto", "Anton": "Poppins", "Josefin Sans": "Quicksand",
  "Great Vibes": "Montserrat", "Caveat": "Nunito",
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
